<?php
/**
 * scrape_and_enrich.php
 *
 * THREE-PHASE data builder for MotorLink Malawi:
 *
 *  Phase 1 — DISCOVER: Extended Google Places search for businesses
 *                      across all major + secondary Malawi cities/towns.
 *                      Results cached in _scrape_cache.json.
 *
 *  Phase 2 — INSERT:   For each discovered business not already in the DB,
 *                      fetch full Place Details (phone, website, photos),
 *                      scrape website for social media links,
 *                      and insert into users + business table.
 *
 *  Phase 3 — ENRICH:   For existing businesses with missing phone, website,
 *                      or social media links — find via Google Places, scrape
 *                      website, and UPDATE the record in-place.
 *
 * Usage:
 *   php scripts/scrape_and_enrich.php              # Full run
 *   php scripts/scrape_and_enrich.php --refresh    # Force re-discover (ignore cache)
 *   php scripts/scrape_and_enrich.php --insert-only    # Phase 2 only (no enrich)
 *   php scripts/scrape_and_enrich.php --enrich-only    # Phase 3 only (no discover/insert)
 *
 * Safe to run multiple times — skips businesses already present in the DB.
 */

declare(strict_types=1);
chdir(dirname(__DIR__));
require 'api-common.php';

error_reporting(E_ALL);
ini_set('display_errors', '1');
@ob_end_flush();
ob_implicit_flush(true);

$args        = array_slice($argv ?? [], 1);
$doRefresh   = in_array('--refresh', $args, true);
$insertOnly  = in_array('--insert-only', $args, true);
$enrichOnly  = in_array('--enrich-only', $args, true);

// ── DB ───────────────────────────────────────────────────────────────────────
function freshDb(): PDO {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER, DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 30,
        ]
    );
    return $pdo;
}

$db = freshDb();

// ── API KEY ──────────────────────────────────────────────────────────────────
$stmt = $db->prepare("SELECT setting_value FROM site_settings WHERE setting_key = 'google_maps_api_key'");
$stmt->execute();
$apiKey = trim((string)($stmt->fetchColumn() ?: ''));
if (!$apiKey) die("ERROR: google_maps_api_key not in site_settings.\n");
echo "API key loaded.\n\n";

// ── TARGETS ──────────────────────────────────────────────────────────────────
// Expanded targets — more comprehensive coverage than the original 200
$TARGETS = ['dealer' => 180, 'garage' => 140, 'car_hire' => 110];

// ── LOCATIONS ────────────────────────────────────────────────────────────────
$CITIES_PRIMARY = [
    'Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba',
];
$CITIES_SECONDARY = [
    'Kasungu', 'Mangochi', 'Salima', 'Karonga', 'Dedza', 'Balaka',
    'Liwonde', 'Nkhotakota', 'Nkhata Bay', 'Thyolo', 'Mulanje',
    'Rumphi', 'Chitipa', 'Ntcheu', 'Dowa', 'Mchinji',
    'Chiradzulu', 'Phalombe', 'Nsanje', 'Chikwawa',
];

// ── QUERY TEMPLATES ──────────────────────────────────────────────────────────
$QUERY_TEMPLATES = [
    'dealer' => [
        'car dealer in %s Malawi',
        'used car dealer in %s Malawi',
        'car showroom in %s Malawi',
        'auto dealer %s Malawi',
        'vehicle dealer %s Malawi',
        'car sales %s Malawi',
        'Toyota dealer %s Malawi',
        'Japanese cars %s Malawi',
        'car yard %s Malawi',
        'second hand cars %s Malawi',
        'vehicle sales %s Malawi',
        'automobile dealer %s Malawi',
        'car lot %s Malawi',
        'imported vehicles %s Malawi',
        'motor vehicles %s Malawi',
    ],
    'garage' => [
        'auto repair in %s Malawi',
        'car garage in %s Malawi',
        'mechanic in %s Malawi',
        'vehicle service center in %s Malawi',
        'car workshop %s Malawi',
        'auto mechanic %s Malawi',
        'car service %s Malawi',
        'panel beater %s Malawi',
        'car paint shop %s Malawi',
        'tyre shop %s Malawi',
        'exhaust repair %s Malawi',
        'auto electrical %s Malawi',
        'car parts %s Malawi',
        'engine repair %s Malawi',
        'transmission repair %s Malawi',
        'auto spares %s Malawi',
        'car service station %s Malawi',
    ],
    'car_hire' => [
        'car hire in %s Malawi',
        'car rental in %s Malawi',
        'rent a car %s Malawi',
        'vehicle rental %s Malawi',
        'self drive car hire %s Malawi',
        'chauffeur service %s Malawi',
        'airport transfer %s Malawi',
        'wedding car hire %s Malawi',
        'minibus hire %s Malawi',
        'van hire %s Malawi',
        'truck hire %s Malawi',
        'bus hire %s Malawi',
        '4x4 hire Malawi',
        'safari vehicle hire Malawi',
    ],
];

// ── LOCATION MAP ─────────────────────────────────────────────────────────────
$LOCATIONS = [];
$DEFAULT_LOCATION_ID = 1;
$stmt = $db->query("SELECT id, name FROM locations WHERE is_active = 1");
foreach ($stmt->fetchAll() as $r) {
    $LOCATIONS[strtolower($r['name'])] = (int)$r['id'];
    if (strtolower($r['name']) === 'lilongwe') $DEFAULT_LOCATION_ID = (int)$r['id'];
}
if (!$DEFAULT_LOCATION_ID) $DEFAULT_LOCATION_ID = array_values($LOCATIONS)[0] ?? 1;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function gGet(string $url): ?array {
    $ctx = stream_context_create([
        'http' => ['timeout' => 20, 'ignore_errors' => true],
        'ssl'  => ['verify_peer' => false, 'verify_peer_name' => false],
    ]);
    $raw = @file_get_contents($url, false, $ctx);
    return $raw ? json_decode($raw, true) : null;
}

function cityFromAddress(string $addr): string {
    global $CITIES_PRIMARY, $CITIES_SECONDARY;
    foreach (array_merge($CITIES_PRIMARY, $CITIES_SECONDARY) as $c) {
        if (stripos($addr, $c) !== false) return $c;
    }
    return 'Lilongwe';
}

function locationIdFor(string $city): int {
    global $LOCATIONS, $DEFAULT_LOCATION_ID;
    return $LOCATIONS[strtolower($city)] ?? $DEFAULT_LOCATION_ID;
}

function uniqueUsername(PDO $db, string $name): string {
    $base = substr(trim(preg_replace('/_+/', '_', preg_replace('/[^a-z0-9]/i', '_', strtolower($name))), '_'), 0, 28) ?: 'biz';
    $u = $base; $i = 2;
    $check = $db->prepare("SELECT 1 FROM users WHERE username = ?");
    while (true) {
        $check->execute([$u]);
        if (!$check->fetchColumn()) return $u;
        $u = substr($base, 0, 25) . '_' . $i++;
        if ($i > 9999) return $base . '_' . substr(md5((string)mt_rand()), 0, 6);
    }
}

function randPwd(int $n = 12): string {
    $chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#';
    $out = '';
    for ($i = 0; $i < $n; $i++) $out .= $chars[random_int(0, strlen($chars) - 1)];
    return $out;
}

/**
 * Download a Google Places photo to uploads/business_logos/.
 * Returns relative path or null on failure.
 */
function downloadPlacePhoto(string $photoRef, string $apiKey, string $slug): ?string {
    $url = 'https://maps.googleapis.com/maps/api/place/photo'
         . '?maxwidth=600&photo_reference=' . urlencode($photoRef)
         . '&key=' . urlencode($apiKey);

    $ctx = stream_context_create([
        'http' => [
            'timeout'         => 25,
            'follow_location' => 1,
            'max_redirects'   => 5,
            'ignore_errors'   => true,
            'user_agent'      => 'MotorLinkMalawi/1.0',
        ],
        'ssl' => ['verify_peer' => false, 'verify_peer_name' => false],
    ]);
    $body = @file_get_contents($url, false, $ctx);
    if ($body === false || strlen($body) < 200) return null;

    $type = '';
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $h) {
            if (stripos($h, 'content-type:') === 0) {
                $type = trim(substr($h, 13));
                break;
            }
        }
    }
    if (!$type || stripos($type, 'image/') !== 0) {
        $sig = substr($body, 0, 4);
        if (substr($sig, 0, 3) === "\xFF\xD8\xFF")  $type = 'image/jpeg';
        elseif ($sig === "\x89PNG")                  $type = 'image/png';
        elseif (substr($body, 0, 4) === 'RIFF')      $type = 'image/webp';
        else return null;
    }

    $ext = stripos($type, 'png') !== false ? 'png' : (stripos($type, 'webp') !== false ? 'webp' : 'jpg');
    $dir = __DIR__ . '/../uploads/business_logos';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
    $fname = $slug . '_' . substr(md5($photoRef), 0, 8) . '.' . $ext;
    if (file_put_contents($dir . '/' . $fname, $body) === false) return null;
    return 'uploads/business_logos/' . $fname;
}

/**
 * Fetch a business website and extract social media URLs from anchor hrefs,
 * meta tags, and common social widgets.
 *
 * Returns array with keys: facebook, instagram, twitter, linkedin, whatsapp
 */
function extractSocialFromWebsite(string $websiteUrl): array {
    $social = [
        'facebook'  => '',
        'instagram' => '',
        'twitter'   => '',
        'linkedin'  => '',
        'whatsapp'  => '',
    ];
    if (!$websiteUrl) return $social;

    // Normalise
    if (!preg_match('#^https?://#i', $websiteUrl)) $websiteUrl = 'https://' . $websiteUrl;

    $ctx = stream_context_create([
        'http' => [
            'timeout'         => 8,
            'follow_location' => 1,
            'max_redirects'   => 3,
            'ignore_errors'   => true,
            'user_agent'      => 'Mozilla/5.0 (compatible; MotorLinkBot/1.0)',
        ],
        'ssl' => ['verify_peer' => false, 'verify_peer_name' => false],
    ]);

    $html = @file_get_contents($websiteUrl, false, $ctx);
    if (!$html || strlen($html) < 50) return $social;

    // Collect all href values
    preg_match_all('/href=["\']([^"\'#\s]{5,300})["\']/', $html, $m1);
    // Also capture content= and data-url= type attributes
    preg_match_all('/(?:content|data-(?:href|url|link|share-url))=["\']([^"\'#\s]{5,300})["\']/', $html, $m2);

    $candidates = array_merge($m1[1] ?? [], $m2[1] ?? []);

    foreach ($candidates as $raw) {
        $href = html_entity_decode(trim($raw));

        // Facebook
        if (!$social['facebook'] && preg_match('#(?:facebook\.com|fb\.com|fb\.me)/(?!sharer|share|dialog|tr\b|plugins)([^/\?\s&"\']+(?:/[^/\?\s&"\']+)?)#i', $href, $fm)) {
            $clean = 'https://www.facebook.com/' . $fm[1];
            if (!in_array($fm[1], ['pages', 'groups', 'events', 'marketplace', 'watch', 'stories', 'ads', 'help'], true)) {
                $social['facebook'] = $clean;
            }
        }

        // Instagram
        if (!$social['instagram'] && preg_match('#instagram\.com/(?!p/|reel/|explore/)([a-zA-Z0-9_.]{1,60})/?#i', $href, $im)) {
            $social['instagram'] = 'https://www.instagram.com/' . rtrim($im[1], '/');
        }

        // Twitter / X
        if (!$social['twitter'] && preg_match('#(?:twitter\.com|x\.com)/(?!intent/|share|home|search|hashtag)([a-zA-Z0-9_]{1,50})/?#i', $href, $tm)) {
            $social['twitter'] = 'https://twitter.com/' . $tm[1];
        }

        // LinkedIn
        if (!$social['linkedin'] && preg_match('#linkedin\.com/(?:company|in)/([^/\?\s"\'&]{1,80})#i', $href, $lm)) {
            $social['linkedin'] = 'https://www.linkedin.com/' . (stripos($href, '/in/') !== false ? 'in/' : 'company/') . $lm[1];
        }

        // WhatsApp  (wa.me/<number>)
        if (!$social['whatsapp'] && preg_match('#(?:wa\.me|api\.whatsapp\.com/send)[/\?](?:phone=)?(\+?[0-9]{7,15})#i', $href, $wm)) {
            $social['whatsapp'] = 'https://wa.me/' . ltrim($wm[1], '+');
        }
    }

    return $social;
}

/**
 * Try to find an existing business row in car_dealers / garages / car_hire_companies
 * by exact OR near-exact business name. Returns ['table' => ..., 'id' => ...] or null.
 */
function findExistingBusiness(PDO $db, string $name): ?array {
    $tables = [
        ['car_dealers',        'business_name'],
        ['garages',            'name'],
        ['car_hire_companies', 'business_name'],
    ];
    $nameClean = strtolower(preg_replace('/[^a-z0-9\s]/i', '', $name));
    foreach ($tables as [$tbl, $col]) {
        $st = $db->prepare("SELECT id FROM `$tbl` WHERE LOWER(REPLACE(REPLACE(`$col`, '-', ' '), '&', 'and')) LIKE ? LIMIT 1");
        $st->execute(['%' . $nameClean . '%']);
        $id = $st->fetchColumn();
        if ($id) return ['table' => $tbl, 'id' => (int)$id];
    }
    return null;
}

/**
 * Check if a user row with this email pattern already exists for a place_id.
 */
function pidEmailExists(PDO $db, string $pid): bool {
    $suffix = substr($pid, -6);
    $st = $db->prepare("SELECT 1 FROM users WHERE email LIKE ? LIMIT 1");
    $st->execute(['%.' . $suffix . '@motorlink.test']);
    return (bool)$st->fetchColumn();
}

/**
 * Build a description from available Place data.
 */
function buildDescription(string $name, string $city, string $website, array $social, string $type): string {
    $parts = [];
    if ($city) $parts[] = "Based in $city, Malawi.";
    $soc = array_filter([$social['facebook'] ?? '', $social['instagram'] ?? '', $social['twitter'] ?? '']);
    if ($soc) $parts[] = "Follow us on social media.";
    if ($website) $parts[] = "More info at: $website";
    $typeLabel = match ($type) {
        'dealer'   => 'car dealership',
        'garage'   => 'automotive garage',
        'car_hire' => 'car hire company',
        default    => 'automotive business',
    };
    if (!$parts) return "A $typeLabel in Malawi listed on MotorLink.";
    return implode(' ', $parts);
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 — DISCOVER
// ─────────────────────────────────────────────────────────────────────────────
$cachePath = __DIR__ . '/_scrape_cache.json';
$discovered = ['dealer' => [], 'garage' => [], 'car_hire' => []];

if (!$enrichOnly) {
    echo "=== PHASE 1: DISCOVER ===\n";

    if (!$doRefresh && file_exists($cachePath)) {
        $cached = json_decode((string)file_get_contents($cachePath), true);
        if (is_array($cached) && isset($cached['dealer'], $cached['garage'], $cached['car_hire'])) {
            $discovered = $cached;
            echo "  [cache] dealer=" . count($discovered['dealer'])
               . " garage=" . count($discovered['garage'])
               . " car_hire=" . count($discovered['car_hire'])
               . " (use --refresh to rescrape)\n\n";
        }
    }

    if (!array_sum(array_map('count', $discovered))) {
        $seenPids  = [];
        $cityOrder = array_merge($CITIES_PRIMARY, $CITIES_SECONDARY);

        foreach ($QUERY_TEMPLATES as $type => $templates) {
            $target = $TARGETS[$type];
            echo "\n  -- $type (target: $target) --\n";

            foreach ($cityOrder as $city) {
                if (count($discovered[$type]) >= $target) break;
                foreach ($templates as $tpl) {
                    if (count($discovered[$type]) >= $target) break;

                    $q   = sprintf($tpl, $city);
                    $url = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
                         . '?query=' . urlencode($q) . '&key=' . urlencode($apiKey);
                    $data = gGet($url);
                    if (!$data || ($data['status'] ?? '') !== 'OK') { usleep(300000); continue; }

                    foreach ($data['results'] as $p) {
                        if (count($discovered[$type]) >= $target) break;
                        $pid = $p['place_id'] ?? '';
                        if (!$pid || isset($seenPids[$pid])) continue;
                        $seenPids[$pid] = true;
                        $discovered[$type][] = [
                            'pid'       => $pid,
                            'name'      => $p['name'] ?? '',
                            'addr'      => $p['formatted_address'] ?? '',
                            'city_hint' => $city,
                        ];
                    }
                    usleep(250000);

                    // Paginate
                    if (!empty($data['next_page_token']) && count($discovered[$type]) < $target) {
                        sleep(2);
                        $url2  = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
                               . '?pagetoken=' . urlencode($data['next_page_token'])
                               . '&key=' . urlencode($apiKey);
                        $data2 = gGet($url2);
                        if ($data2 && ($data2['status'] ?? '') === 'OK') {
                            foreach ($data2['results'] as $p) {
                                if (count($discovered[$type]) >= $target) break;
                                $pid = $p['place_id'] ?? '';
                                if (!$pid || isset($seenPids[$pid])) continue;
                                $seenPids[$pid] = true;
                                $discovered[$type][] = [
                                    'pid'       => $pid,
                                    'name'      => $p['name'] ?? '',
                                    'addr'      => $p['formatted_address'] ?? '',
                                    'city_hint' => $city,
                                ];
                            }
                        }
                    }
                }
                echo "    [$city] " . $type . ": " . count($discovered[$type]) . "\n";
            }
            echo "  Total $type: " . count($discovered[$type]) . "\n";
        }

        file_put_contents($cachePath, json_encode($discovered, JSON_PRETTY_PRINT));
        echo "\n  [cache] Saved to _scrape_cache.json\n\n";
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — INSERT NEW BUSINESSES
// ─────────────────────────────────────────────────────────────────────────────
$csvPath = __DIR__ . '/_scrape_credentials.csv';
$csvFp   = fopen($csvPath, 'w');
fputcsv($csvFp, ['type', 'business_name', 'email', 'username', 'phone', 'city',
                 'password', 'website', 'facebook', 'instagram', 'twitter', 'linkedin', 'whatsapp', 'logo', 'place_id']);

$inserted = 0;
$skipped  = 0;
$withLogo = 0;

if (!$enrichOnly) {
    echo "=== PHASE 2: INSERT NEW BUSINESSES ===\n";

    // Reconnect after long discovery phase
    $db = freshDb();

    // Pre-load existing place_id suffixes for fast skip detection
    $existingEmails = $db->query("SELECT email FROM users WHERE email LIKE '%@motorlink.test'")->fetchAll(PDO::FETCH_COLUMN);
    $existingSuffixes = [];
    foreach ($existingEmails as $e) {
        if (preg_match('/\.([a-z0-9]{6})@motorlink\.test$/', $e, $m)) {
            $existingSuffixes[$m[1]] = true;
        }
    }

    $insUserSql = "
        INSERT INTO users
            (username, email, password_hash, full_name, business_name, phone, whatsapp, city, address,
             user_type, status, email_verified, profile_image, bio, created_at)
        VALUES
            (:username, :email, :password_hash, :full_name, :business_name, :phone, :whatsapp, :city, :address,
             :user_type, 'active', 1, :profile_image, :bio, NOW())
    ";

    $insDealerSql = "
        INSERT INTO car_dealers
            (user_id, business_name, owner_name, email, phone, whatsapp, address, location_id,
             website, facebook_url, instagram_url, twitter_url, linkedin_url,
             description, logo_url, verified, certified, featured, status, created_at)
        VALUES
            (:user_id, :business_name, :owner_name, :email, :phone, :whatsapp, :address, :location_id,
             :website, :facebook_url, :instagram_url, :twitter_url, :linkedin_url,
             :description, :logo_url, 0, 0, 0, 'active', NOW())
    ";

    $insGarageSql = "
        INSERT INTO garages
            (user_id, name, owner_name, email, phone, whatsapp, address, location_id,
             website, facebook_url, instagram_url, twitter_url, linkedin_url,
             description, logo_url, verified, certified, featured, status, created_at)
        VALUES
            (:user_id, :name, :owner_name, :email, :phone, :whatsapp, :address, :location_id,
             :website, :facebook_url, :instagram_url, :twitter_url, :linkedin_url,
             :description, :logo_url, 0, 0, 0, 'active', NOW())
    ";

    $insHireSql = "
        INSERT INTO car_hire_companies
            (user_id, business_name, owner_name, email, phone, whatsapp, address, location_id,
             website, facebook_url, instagram_url, twitter_url, linkedin_url,
             hire_category, description, logo_url, verified, certified, featured, status, created_at)
        VALUES
            (:user_id, :business_name, :owner_name, :email, :phone, :whatsapp, :address, :location_id,
             :website, :facebook_url, :instagram_url, :twitter_url, :linkedin_url,
             'standard', :description, :logo_url, 0, 0, 0, 'active', NOW())
    ";

    $insUser   = $db->prepare($insUserSql);
    $insDealer = $db->prepare($insDealerSql);
    $insGarage = $db->prepare($insGarageSql);
    $insHire   = $db->prepare($insHireSql);

    foreach ($discovered as $type => $list) {
        echo "\n  Processing $type (" . count($list) . " candidates)...\n";
        foreach ($list as $b) {
            $pidSuffix = substr($b['pid'], -6);

            // Skip if already seeded in a previous run
            if (isset($existingSuffixes[$pidSuffix])) {
                $skipped++;
                continue;
            }

            // Fetch full Place Details
            $detUrl = 'https://maps.googleapis.com/maps/api/place/details/json'
                    . '?place_id=' . urlencode($b['pid'])
                    . '&fields=name,formatted_phone_number,international_phone_number,formatted_address,website,photos'
                    . '&key=' . urlencode($apiKey);
            $det = gGet($detUrl);
            usleep(200000);

            $name     = $b['name'];
            $phone    = '';
            $address  = $b['addr'];
            $city     = $b['city_hint'];
            $website  = '';
            $photoRef = null;

            if ($det && ($det['status'] ?? '') === 'OK' && isset($det['result'])) {
                $r = $det['result'];
                $phone   = $r['formatted_phone_number'] ?? ($r['international_phone_number'] ?? '');
                $address = $r['formatted_address'] ?? $address;
                $website = $r['website'] ?? '';
                $city    = cityFromAddress($address);
                if (!empty($r['photos'][0]['photo_reference'])) {
                    $photoRef = $r['photos'][0]['photo_reference'];
                }
            }

            // Extract social links from website
            $social = ['facebook' => '', 'instagram' => '', 'twitter' => '', 'linkedin' => '', 'whatsapp' => ''];
            if ($website) {
                $social = extractSocialFromWebsite($website);
                echo "    [social] " . $name . ": fb=" . ($social['facebook'] ? 'yes' : '-')
                   . " ig=" . ($social['instagram'] ? 'yes' : '-')
                   . " tw=" . ($social['twitter'] ? 'yes' : '-') . "\n";
                usleep(500000); // be polite to target websites
            }

            // Download logo
            $slug     = strtolower(preg_replace('/[^a-z0-9]/i', '', $name));
            $logoPath = null;
            if ($photoRef) {
                $logoPath = downloadPlacePhoto($photoRef, $apiKey, $slug ?: 'biz');
                usleep(150000);
            }

            // Sanitise
            $username = uniqueUsername($db, $name);
            $email    = 'biz.' . substr($slug, 0, 20) . '.' . $pidSuffix . '@motorlink.test';
            if (strlen($email) > 100) $email = 'biz.' . substr(md5($b['pid']), 0, 18) . '@motorlink.test';
            $pwd      = randPwd(12);
            $hash     = password_hash($pwd, PASSWORD_DEFAULT);
            $phone    = substr(preg_replace('/[^\d+\-() ]/', '', $phone), 0, 20);
            $addr     = substr($address, 0, 500);
            $city     = substr($city, 0, 50);
            $locId    = locationIdFor($city);
            $desc     = buildDescription($name, $city, $website, $social, $type);

            // Keep DB alive
            try { $db->query("SELECT 1"); } catch (Throwable $e) {
                $db = freshDb();
                $insUser   = $db->prepare($insUserSql);
                $insDealer = $db->prepare($insDealerSql);
                $insGarage = $db->prepare($insGarageSql);
                $insHire   = $db->prepare($insHireSql);
            }

            try {
                $db->beginTransaction();

                $insUser->execute([
                    ':username'      => $username,
                    ':email'         => $email,
                    ':password_hash' => $hash,
                    ':full_name'     => substr($name, 0, 100),
                    ':business_name' => substr($name, 0, 100),
                    ':phone'         => $phone,
                    ':whatsapp'      => $social['whatsapp'] ?: $phone,
                    ':city'          => $city,
                    ':address'       => $addr,
                    ':user_type'     => $type,
                    ':profile_image' => $logoPath,
                    ':bio'           => $website ? "Website: $website" : '',
                ]);
                $userId = (int)$db->lastInsertId();

                $common = [
                    ':user_id'      => $userId,
                    ':owner_name'   => substr($name, 0, 100),
                    ':email'        => $email,
                    ':phone'        => $phone,
                    ':whatsapp'     => $social['whatsapp'] ?: $phone,
                    ':address'      => $addr,
                    ':location_id'  => $locId,
                    ':website'      => substr($website, 0, 255),
                    ':facebook_url' => substr($social['facebook'], 0, 255),
                    ':instagram_url'=> substr($social['instagram'], 0, 255),
                    ':twitter_url'  => substr($social['twitter'], 0, 255),
                    ':linkedin_url' => substr($social['linkedin'], 0, 255),
                    ':description'  => substr($desc, 0, 1000),
                    ':logo_url'     => $logoPath,
                ];

                if ($type === 'dealer') {
                    $insDealer->execute($common + [':business_name' => substr($name, 0, 200)]);
                } elseif ($type === 'garage') {
                    $insGarage->execute($common + [':name' => substr($name, 0, 200)]);
                } else {
                    $insHire->execute($common + [':business_name' => substr($name, 0, 200)]);
                }

                $bizId = (int)$db->lastInsertId();
                $db->prepare("UPDATE users SET business_id = ? WHERE id = ?")->execute([$bizId, $userId]);
                $db->commit();

                $inserted++;
                if ($logoPath) $withLogo++;
                $existingSuffixes[$pidSuffix] = true; // prevent double-insert within same run

                fputcsv($csvFp, [
                    $type, $name, $email, $username, $phone, $city, $pwd,
                    $website, $social['facebook'], $social['instagram'],
                    $social['twitter'], $social['linkedin'], $social['whatsapp'],
                    $logoPath ? 'yes' : 'no', $b['pid'],
                ]);

                echo sprintf("    + [%s] %s%s%s\n",
                    $type, $name,
                    $logoPath ? ' [logo]' : '',
                    ($social['facebook'] || $social['instagram']) ? ' [social]' : ''
                );

            } catch (PDOException $e) {
                if ($db->inTransaction()) $db->rollBack();
                $skipped++;
                echo "    ! SKIP {$name}: " . $e->getMessage() . "\n";
            }
        }
    }

    echo "\n  Inserted: $inserted  |  With logo: $withLogo  |  Skipped/duplicate: $skipped\n";
}

fclose($csvFp);
@chmod($csvPath, 0600);

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3 — ENRICH EXISTING BUSINESSES
// ─────────────────────────────────────────────────────────────────────────────
if (!$insertOnly) {
    echo "\n=== PHASE 3: ENRICH EXISTING RECORDS ===\n";

    $db = freshDb();

    // Tables to enrich and how to identify their city for Places search
    $enrichTables = [
        ['table' => 'car_dealers',        'name_col' => 'business_name', 'type' => 'dealer'],
        ['table' => 'garages',            'name_col' => 'name',          'type' => 'garage'],
        ['table' => 'car_hire_companies', 'name_col' => 'business_name', 'type' => 'car_hire'],
    ];

    $enriched  = 0;
    $enrichSkip = 0;

    foreach ($enrichTables as $et) {
        $tbl     = $et['table'];
        $nameCol = $et['name_col'];

        // Select rows that are missing at least one piece of contact/social data
        $rows = $db->query("
            SELECT id, `$nameCol` AS biz_name, phone, website,
                   facebook_url, instagram_url, twitter_url, linkedin_url,
                   address
            FROM `$tbl`
            WHERE status = 'active'
              AND (
                  (phone IS NULL OR phone = '')
                  OR (facebook_url IS NULL OR facebook_url = '')
                  OR (instagram_url IS NULL OR instagram_url = '')
              )
            ORDER BY id
            LIMIT 500
        ")->fetchAll();

        echo "\n  $tbl: " . count($rows) . " rows need enrichment\n";

        foreach ($rows as $row) {
            $bizId   = (int)$row['id'];
            $bizName = (string)$row['biz_name'];
            $curPhone    = (string)($row['phone'] ?? '');
            $curWebsite  = (string)($row['website'] ?? '');
            $curFacebook = (string)($row['facebook_url'] ?? '');
            $curInstagram= (string)($row['instagram_url'] ?? '');
            $curTwitter  = (string)($row['twitter_url'] ?? '');
            $curLinkedin = (string)($row['linkedin_url'] ?? '');
            $city        = cityFromAddress((string)($row['address'] ?? ''));

            $newPhone   = $curPhone;
            $newWebsite = $curWebsite;
            $newFb      = $curFacebook;
            $newIg      = $curInstagram;
            $newTw      = $curTwitter;
            $newLi      = $curLinkedin;

            // --- Try to get phone via Google Places if missing ---
            if (!$newPhone || !$newWebsite) {
                $q   = $bizName . ' ' . ($city ?: 'Malawi');
                $url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
                     . '?input=' . urlencode($q)
                     . '&inputtype=textquery'
                     . '&fields=place_id'
                     . '&key=' . urlencode($apiKey);
                $found = gGet($url);
                usleep(200000);

                $pid = null;
                if ($found && ($found['status'] ?? '') === 'OK' && !empty($found['candidates'][0]['place_id'])) {
                    $pid = $found['candidates'][0]['place_id'];
                }

                if ($pid) {
                    $detUrl = 'https://maps.googleapis.com/maps/api/place/details/json'
                            . '?place_id=' . urlencode($pid)
                            . '&fields=formatted_phone_number,international_phone_number,website'
                            . '&key=' . urlencode($apiKey);
                    $det = gGet($detUrl);
                    usleep(200000);

                    if ($det && ($det['status'] ?? '') === 'OK' && isset($det['result'])) {
                        $r = $det['result'];
                        if (!$newPhone) {
                            $newPhone = $r['formatted_phone_number'] ?? ($r['international_phone_number'] ?? '');
                            $newPhone = substr(preg_replace('/[^\d+\-() ]/', '', $newPhone), 0, 20);
                        }
                        if (!$newWebsite) {
                            $newWebsite = $r['website'] ?? '';
                        }
                    }
                }
            }

            // --- Scrape website for social if we have a URL and are missing social ---
            $needSocial = !$newFb || !$newIg || !$newTw;
            if ($needSocial && $newWebsite) {
                $soc = extractSocialFromWebsite($newWebsite);
                usleep(500000);
                if (!$newFb && $soc['facebook'])  $newFb = $soc['facebook'];
                if (!$newIg && $soc['instagram']) $newIg = $soc['instagram'];
                if (!$newTw && $soc['twitter'])   $newTw = $soc['twitter'];
                if (!$newLi && $soc['linkedin'])  $newLi = $soc['linkedin'];
            }

            // --- Only UPDATE if something changed ---
            $changed = (
                ($newPhone   !== $curPhone   && $newPhone)   ||
                ($newWebsite !== $curWebsite && $newWebsite) ||
                ($newFb      !== $curFacebook && $newFb)     ||
                ($newIg      !== $curInstagram && $newIg)    ||
                ($newTw      !== $curTwitter  && $newTw)     ||
                ($newLi      !== $curLinkedin && $newLi)
            );

            if ($changed) {
                $fields = [];
                $params = [];
                if ($newPhone   && $newPhone   !== $curPhone)   { $fields[] = 'phone = ?';        $params[] = $newPhone; }
                if ($newWebsite && $newWebsite !== $curWebsite) { $fields[] = 'website = ?';       $params[] = substr($newWebsite, 0, 255); }
                if ($newFb      && $newFb      !== $curFacebook){ $fields[] = 'facebook_url = ?';  $params[] = substr($newFb, 0, 255); }
                if ($newIg      && $newIg      !== $curInstagram){ $fields[] = 'instagram_url = ?'; $params[] = substr($newIg, 0, 255); }
                if ($newTw      && $newTw      !== $curTwitter) { $fields[] = 'twitter_url = ?';   $params[] = substr($newTw, 0, 255); }
                if ($newLi      && $newLi      !== $curLinkedin){ $fields[] = 'linkedin_url = ?';  $params[] = substr($newLi, 0, 255); }

                if ($fields) {
                    $params[] = $bizId;
                    $sql = "UPDATE `$tbl` SET " . implode(', ', $fields) . " WHERE id = ?";
                    try {
                        $db->prepare($sql)->execute($params);
                        $enriched++;
                        echo sprintf("    ~ [%s] %s | phone:%s fb:%s ig:%s tw:%s\n",
                            $tbl, $bizName,
                            $newPhone ? 'y' : '-',
                            $newFb    ? 'y' : '-',
                            $newIg    ? 'y' : '-',
                            $newTw    ? 'y' : '-'
                        );
                    } catch (PDOException $ex) {
                        $enrichSkip++;
                        echo "    ! UPDATE FAIL {$bizName}: " . $ex->getMessage() . "\n";
                    }
                }
            } else {
                $enrichSkip++;
            }

            // Keep DB alive
            try { $db->query("SELECT 1"); } catch (Throwable $e) { $db = freshDb(); }
        }
    }

    echo "\n  Enriched: $enriched  |  Unchanged/no-data: $enrichSkip\n";
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
echo "\n=== SUMMARY ===\n";

$db = freshDb();
foreach (['car_dealers', 'garages', 'car_hire_companies'] as $t) {
    $nc  = $t === 'garages' ? 'name' : 'business_name';
    $tot = $db->query("SELECT COUNT(*) FROM `$t` WHERE status='active'")->fetchColumn();
    $ph  = $db->query("SELECT COUNT(*) FROM `$t` WHERE status='active' AND phone != '' AND phone IS NOT NULL")->fetchColumn();
    $fb  = $db->query("SELECT COUNT(*) FROM `$t` WHERE status='active' AND facebook_url != '' AND facebook_url IS NOT NULL")->fetchColumn();
    $ig  = $db->query("SELECT COUNT(*) FROM `$t` WHERE status='active' AND instagram_url != '' AND instagram_url IS NOT NULL")->fetchColumn();
    $lg  = $db->query("SELECT COUNT(*) FROM `$t` WHERE status='active' AND logo_url IS NOT NULL")->fetchColumn();
    printf("  %-24s %3d active | phone:%3d | fb:%3d | ig:%3d | logo:%3d\n", $t, $tot, $ph, $fb, $ig, $lg);
}

echo "\nCredentials saved to: scripts/_scrape_credentials.csv\n";
echo "Done.\n";
