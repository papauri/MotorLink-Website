<?php
/**
 * seed_real_businesses.php
 * Scrapes real Malawian automotive businesses from Google Places,
 * downloads their Google Photos logos, and seeds BOTH the users table
 * AND the linked business tables (car_dealers / garages / car_hire_companies).
 *
 * Run: php scripts/seed_real_businesses.php
 */
declare(strict_types=1);
chdir(dirname(__DIR__));
require 'api-common.php';

// CLI-friendly error reporting + live output
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('log_errors', '1');
@ob_end_flush();
ob_implicit_flush(true);
set_error_handler(function($no, $msg, $file, $line) {
    fwrite(STDERR, "PHP ERROR [$no] $msg in $file:$line\n");
    return false;
});

$db = Database::getInstance()->getConnection();
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// ── 1. API key from live DB ──────────────────────────────────────────────────
$stmt = $db->prepare("SELECT setting_value FROM site_settings WHERE setting_key = 'google_maps_api_key'");
$stmt->execute();
$apiKey = trim((string)($stmt->fetchColumn() ?: ''));
if (!$apiKey) die("ERROR: google_maps_api_key missing.\n");
echo "API key loaded.\n\n";

// ── 2. Target counts + queries ───────────────────────────────────────────────
$TARGETS = ['dealer' => 80, 'garage' => 60, 'car_hire' => 60]; // total 200

$CITIES_PRIMARY   = ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba'];
$CITIES_SECONDARY = ['Kasungu', 'Mangochi', 'Salima', 'Karonga', 'Dedza', 'Balaka'];

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
    ],
    'garage' => [
        'auto repair in %s Malawi',
        'car garage in %s Malawi',
        'mechanic in %s Malawi',
        'vehicle service center in %s Malawi',
        'car workshop %s Malawi',
        'auto mechanic %s Malawi',
        'car service %s Malawi',
    ],
    'car_hire' => [
        'car hire in %s Malawi',
        'car rental in %s Malawi',
        'rent a car %s Malawi',
        'vehicle rental %s Malawi',
        'self drive car hire %s Malawi',
    ],
];

// ── 3. Load location_id map ──────────────────────────────────────────────────
$LOCATIONS = [];
$DEFAULT_LOCATION_ID = 0;
$stmt = $db->query("SELECT id, name FROM locations WHERE is_active = 1");
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
    $LOCATIONS[strtolower($r['name'])] = (int)$r['id'];
    if (strtolower($r['name']) === 'lilongwe') $DEFAULT_LOCATION_ID = (int)$r['id'];
}
if (!$DEFAULT_LOCATION_ID) $DEFAULT_LOCATION_ID = array_values($LOCATIONS)[0] ?? 1;

// ── 4. Helpers ───────────────────────────────────────────────────────────────
function gGet(string $url): ?array {
    $ctx = stream_context_create(['http' => ['timeout' => 20, 'ignore_errors' => true]]);
    $raw = @file_get_contents($url, false, $ctx);
    return $raw ? json_decode($raw, true) : null;
}

function cityFromAddress(string $addr, array $cities): string {
    foreach ($cities as $c) if (stripos($addr, $c) !== false) return $c;
    return 'Lilongwe';
}

function locationIdFor(string $city, array $LOCATIONS, int $fallback): int {
    return $LOCATIONS[strtolower($city)] ?? $fallback;
}

function uniqueUsername(PDO $db, string $base): string {
    $b = substr(preg_replace('/_+/', '_', preg_replace('/[^a-z0-9]/i', '_', strtolower($base))), 0, 28);
    $b = trim($b, '_') ?: 'biz';
    $u = $b; $i = 2;
    while (true) {
        $s = $db->prepare("SELECT 1 FROM users WHERE username = ?");
        $s->execute([$u]);
        if (!$s->fetchColumn()) return $u;
        $u = $b . '_' . $i++;
        if ($i > 9999) return $b . '_' . substr(md5((string)mt_rand()), 0, 6);
    }
}

function randPwd(int $n = 12): string {
    $chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#';
    $out = '';
    for ($i = 0; $i < $n; $i++) $out .= $chars[random_int(0, strlen($chars) - 1)];
    return $out;
}

function downloadPlacePhoto(string $photoRef, string $apiKey, string $slug): ?string {
    $url = 'https://maps.googleapis.com/maps/api/place/photo'
         . '?maxwidth=600&photo_reference=' . urlencode($photoRef)
         . '&key=' . urlencode($apiKey);

    // Use stream context (file_get_contents) — consistent with gGet() which works on this env
    $ctx = stream_context_create([
        'http' => [
            'timeout'        => 25,
            'follow_location' => 1,
            'max_redirects'   => 5,
            'ignore_errors'   => true,
            'user_agent'      => 'MotorLinkMalawi/1.0',
        ],
        'ssl' => [
            'verify_peer'      => false,
            'verify_peer_name' => false,
        ],
    ]);
    $body = @file_get_contents($url, false, $ctx);
    if ($body === false || strlen($body) < 200) return null;

    // Determine content-type from response headers
    $type = '';
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $h) {
            if (stripos($h, 'content-type:') === 0) {
                $type = trim(substr($h, 13));
                break;
            }
        }
    }
    if ($type === '' || stripos($type, 'image/') !== 0) {
        // Fallback: sniff magic bytes
        $sig = substr($body, 0, 4);
        if (substr($sig, 0, 3) === "\xFF\xD8\xFF")       $type = 'image/jpeg';
        elseif (substr($sig, 0, 4) === "\x89PNG")        $type = 'image/png';
        elseif (substr($body, 0, 4) === 'RIFF')          $type = 'image/webp';
        else return null;
    }

    $ext = 'jpg';
    if (stripos($type, 'png') !== false)  $ext = 'png';
    if (stripos($type, 'webp') !== false) $ext = 'webp';

    $dir = __DIR__ . '/../uploads/business_logos';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);

    $fname = $slug . '_' . substr(md5($photoRef), 0, 8) . '.' . $ext;
    $fpath = $dir . '/' . $fname;
    $rel   = 'uploads/business_logos/' . $fname;

    if (file_put_contents($fpath, $body) === false) return null;
    return $rel;
}

// ── 5. CLEANUP: wipe old business rows + non-essential users ─────────────────
echo "[1/4] Cleaning up old data...\n";

$protectedEmail = 'johnpaulchirwa@gmail.com';

// Hard-delete previously-seeded test business rows so we can re-insert fresh.
// Their users have emails like biz.*@motorlink.test — linked business rows cascade logically via user_id.
$testEmailPattern = 'biz.%@motorlink.test';
$oldIds = $db->query("SELECT id FROM users WHERE email LIKE " . $db->quote($testEmailPattern))->fetchAll(PDO::FETCH_COLUMN);
if ($oldIds) {
    $in = implode(',', array_map('intval', $oldIds));
    $db->exec("DELETE FROM car_dealers         WHERE user_id IN ($in)");
    $db->exec("DELETE FROM garages             WHERE user_id IN ($in)");
    $db->exec("DELETE FROM car_hire_companies  WHERE user_id IN ($in)");
    $db->exec("DELETE FROM users               WHERE id      IN ($in)");
    echo "  Deleted " . count($oldIds) . " previously-seeded test users + their business rows\n";
}

// Suspend any remaining real business rows and their users (kept for recovery)
$db->exec("UPDATE car_dealers         SET status='suspended' WHERE status != 'suspended'");
$db->exec("UPDATE garages             SET status='suspended' WHERE status != 'suspended'");
$db->exec("UPDATE car_hire_companies  SET status='suspended' WHERE status != 'suspended'");

$st = $db->prepare("
    UPDATE users
       SET status = 'suspended'
     WHERE user_type IN ('dealer','garage','car_hire','individual')
       AND email != ?
       AND status != 'suspended'
");
$st->execute([$protectedEmail]);
echo "  Suspended " . $st->rowCount() . " users\n";

$n = $db->exec("DELETE FROM users WHERE email LIKE '%@motorlink.local' AND (user_type = '' OR user_type IS NULL)");
echo "  Removed $n blank-user_type test rows\n";

$db->prepare("UPDATE users SET status='active', email_verified=1 WHERE email = ?")->execute([$protectedEmail]);

// ── 6. DISCOVERY (cached) ────────────────────────────────────────────────────
echo "\n[2/4] Discovering businesses from Google Places...\n";

$cachePath = __DIR__ . '/_places_cache.json';
$collected = ['dealer' => [], 'garage' => [], 'car_hire' => []];

if (file_exists($cachePath) && !in_array('--refresh', $argv ?? [], true)) {
    $cached = json_decode((string)file_get_contents($cachePath), true);
    if (is_array($cached) && isset($cached['dealer'], $cached['garage'], $cached['car_hire'])) {
        $collected = $cached;
        echo "  [cache] Loaded dealer=" . count($collected['dealer']) .
             " garage=" . count($collected['garage']) .
             " car_hire=" . count($collected['car_hire']) . " (pass --refresh to rescrape)\n";
    }
}

if (!array_sum(array_map('count', $collected))) {

$seenPids  = [];
$cityOrder = array_merge($CITIES_PRIMARY, $CITIES_SECONDARY);

foreach ($QUERY_TEMPLATES as $type => $templates) {
    $target = $TARGETS[$type];
    echo "\n  -- $type (target: $target) --\n";

    foreach ($cityOrder as $city) {
        if (count($collected[$type]) >= $target) break;
        foreach ($templates as $tpl) {
            if (count($collected[$type]) >= $target) break;

            $q   = sprintf($tpl, $city);
            $url = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
                 . '?query=' . urlencode($q) . '&key=' . urlencode($apiKey);
            $data = gGet($url);
            if (!$data || ($data['status'] ?? '') !== 'OK') { usleep(300000); continue; }

            foreach ($data['results'] as $p) {
                if (count($collected[$type]) >= $target) break;
                $pid = $p['place_id'] ?? '';
                if (!$pid || isset($seenPids[$pid])) continue;
                $seenPids[$pid] = true;
                $collected[$type][] = [
                    'pid'       => $pid,
                    'name'      => $p['name'] ?? '',
                    'addr'      => $p['formatted_address'] ?? '',
                    'city_hint' => $city,
                ];
            }
            usleep(250000);

            if (!empty($data['next_page_token']) && count($collected[$type]) < $target) {
                sleep(2);
                $url2 = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
                      . '?pagetoken=' . urlencode($data['next_page_token'])
                      . '&key=' . urlencode($apiKey);
                $d2 = gGet($url2);
                if ($d2 && ($d2['status'] ?? '') === 'OK') {
                    foreach ($d2['results'] as $p) {
                        if (count($collected[$type]) >= $target) break;
                        $pid = $p['place_id'] ?? '';
                        if (!$pid || isset($seenPids[$pid])) continue;
                        $seenPids[$pid] = true;
                        $collected[$type][] = [
                            'pid'       => $pid,
                            'name'      => $p['name'] ?? '',
                            'addr'      => $p['formatted_address'] ?? '',
                            'city_hint' => $city,
                        ];
                    }
                }
            }
        }
        echo "    [$city] cumulative: " . count($collected[$type]) . "\n";
    }
    echo "  Total $type: " . count($collected[$type]) . "\n";
}

    file_put_contents($cachePath, json_encode($collected, JSON_PRETTY_PRINT));
    echo "  [cache] Saved to _places_cache.json\n";
}

// ── 7. DETAILS + LOGO + INSERT ───────────────────────────────────────────────
echo "\n[3/4] Fetching details, downloading logos, inserting...\n";

// Refresh DB connection — long discovery phase may have dropped it ("MySQL server has gone away")
// Create a fresh PDO directly (Database singleton has no reset).
$db = new PDO(
    "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
    DB_USER,
    DB_PASS,
    [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_TIMEOUT            => 30,
    ]
);
echo "  [db] Fresh connection established\n";

$csvPath = __DIR__ . '/_real_business_credentials.csv';
$fp = fopen($csvPath, 'w');
fputcsv($fp, ['user_type','business_name','email','username','phone','city','password','has_logo','place_id']);
fputcsv($fp, ['individual','(private seller)','johnpaulchirwa@gmail.com','johnpaulchirwa','','Lilongwe','(existing)','no','']);

$insUserSql = "
    INSERT INTO users
        (username,email,password_hash,full_name,business_name,phone,whatsapp,city,address,
         user_type,status,email_verified,profile_image,bio,created_at)
    VALUES
        (:username,:email,:password_hash,:full_name,:business_name,:phone,:whatsapp,:city,:address,
         :user_type,'active',1,:profile_image,:bio,NOW())
";
$insDealerSql = "
    INSERT INTO car_dealers
        (user_id,business_name,owner_name,email,phone,whatsapp,address,location_id,
         website,description,logo_url,verified,certified,featured,status,created_at)
    VALUES
        (:user_id,:business_name,:owner_name,:email,:phone,:whatsapp,:address,:location_id,
         :website,:description,:logo_url,0,0,0,'active',NOW())
";
$insGarageSql = "
    INSERT INTO garages
        (user_id,name,owner_name,email,phone,whatsapp,address,location_id,
         website,description,logo_url,verified,certified,featured,status,created_at)
    VALUES
        (:user_id,:name,:owner_name,:email,:phone,:whatsapp,:address,:location_id,
         :website,:description,:logo_url,0,0,0,'active',NOW())
";
$insCarHireSql = "
    INSERT INTO car_hire_companies
        (user_id,business_name,owner_name,email,phone,whatsapp,address,location_id,
         website,description,logo_url,hire_category,verified,certified,featured,status,created_at)
    VALUES
        (:user_id,:business_name,:owner_name,:email,:phone,:whatsapp,:address,:location_id,
         :website,:description,:logo_url,'daily_rental',0,0,0,'active',NOW())
";

$insUser    = $db->prepare($insUserSql);
$insDealer  = $db->prepare($insDealerSql);
$insGarage  = $db->prepare($insGarageSql);
$insCarHire = $db->prepare($insCarHireSql);

$totalInserted = 0;
$totalSkipped  = 0;
$totalWithLogo = 0;

foreach ($collected as $type => $list) {
    echo "\n  Processing $type (" . count($list) . ")...\n";
    foreach ($list as $b) {
        $detUrl = 'https://maps.googleapis.com/maps/api/place/details/json'
                . '?place_id=' . urlencode($b['pid'])
                . '&fields=name,formatted_phone_number,international_phone_number,formatted_address,address_components,website,photos'
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
            $city    = cityFromAddress($address, array_merge($CITIES_PRIMARY, $CITIES_SECONDARY));
            if (!empty($r['photos'][0]['photo_reference'])) $photoRef = $r['photos'][0]['photo_reference'];
        }

        $slug     = strtolower(preg_replace('/[^a-z0-9]/i', '', $name));
        $username = uniqueUsername($db, $name);
        $email    = 'biz.' . substr($slug, 0, 20) . '.' . substr($b['pid'], -6) . '@motorlink.test';
        if (strlen($email) > 100) $email = 'biz.' . substr(md5($b['pid']), 0, 18) . '@motorlink.test';

        $logoPath = null;
        if ($photoRef) {
            $logoPath = downloadPlacePhoto($photoRef, $apiKey, $slug ?: 'biz');
            usleep(150000);
        }

        $pwd   = randPwd(12);
        $hash  = password_hash($pwd, PASSWORD_DEFAULT);
        $phone = substr(preg_replace('/[^\d+\-() ]/', '', $phone), 0, 20);
        $addr  = substr($address, 0, 500);
        $city  = substr($city, 0, 50);
        $bio   = $website ? "Website: $website" : '';
        $locId = locationIdFor($city, $LOCATIONS, $DEFAULT_LOCATION_ID);

        // Keep DB connection alive between slow Places / photo calls
        try { $db->query("SELECT 1"); } catch (Throwable $pingErr) {
            echo "    [db] reconnecting...\n";
            $db = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER, DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false, PDO::ATTR_TIMEOUT => 30]
            );
            // Re-prepare statements
            $insUser   = $db->prepare($insUserSql);
            $insDealer = $db->prepare($insDealerSql);
            $insGarage = $db->prepare($insGarageSql);
            $insCarHire = $db->prepare($insCarHireSql);
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
                ':whatsapp'      => $phone,
                ':city'          => $city,
                ':address'       => $addr,
                ':user_type'     => $type,
                ':profile_image' => $logoPath,
                ':bio'           => $bio,
            ]);
            $userId = (int)$db->lastInsertId();

            $common = [
                ':user_id'     => $userId,
                ':owner_name'  => substr($name, 0, 100),
                ':email'       => $email,
                ':phone'       => $phone,
                ':whatsapp'    => $phone,
                ':address'     => $addr,
                ':location_id' => $locId,
                ':website'     => substr($website, 0, 255),
                ':description' => "Listed on MotorLink Malawi." . ($website ? " Visit: $website" : ''),
                ':logo_url'    => $logoPath,
            ];

            if ($type === 'dealer') {
                $insDealer->execute($common + [':business_name' => substr($name, 0, 200)]);
            } elseif ($type === 'garage') {
                $insGarage->execute($common + [':name' => substr($name, 0, 200)]);
            } else {
                $insCarHire->execute($common + [':business_name' => substr($name, 0, 200)]);
            }

            $bizId = (int)$db->lastInsertId();
            $db->prepare("UPDATE users SET business_id = ? WHERE id = ?")->execute([$bizId, $userId]);

            $db->commit();
            $totalInserted++;
            if ($logoPath) $totalWithLogo++;
            fputcsv($fp, [$type, $name, $email, $username, $phone, $city, $pwd, $logoPath ? 'yes' : 'no', $b['pid']]);
            echo sprintf("    + [%s] %s %s\n", $type, $name, $logoPath ? '[LOGO]' : '');
        } catch (PDOException $e) {
            if ($db->inTransaction()) $db->rollBack();
            $totalSkipped++;
            echo "    ! SKIP {$name}: " . $e->getMessage() . "\n";
        }
    }
}

fclose($fp);
@chmod($csvPath, 0600);

// ── 8. Summary ───────────────────────────────────────────────────────────────
echo "\n[4/4] Summary\n";
echo "  Inserted: $totalInserted  |  With logo: $totalWithLogo  |  Skipped: $totalSkipped\n";
echo "  Credentials: scripts/_real_business_credentials.csv\n\n";

$stmt = $db->query("SELECT user_type, COUNT(*) n FROM users WHERE status='active' GROUP BY user_type");
echo "Active users:\n";
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) printf("  %-12s %d\n", $r['user_type'] ?: '(blank)', $r['n']);

echo "\nActive business rows:\n";
foreach (['car_dealers','garages','car_hire_companies'] as $t) {
    $n = $db->query("SELECT COUNT(*) FROM $t WHERE status='active'")->fetchColumn();
    $w = $db->query("SELECT COUNT(*) FROM $t WHERE status='active' AND logo_url IS NOT NULL")->fetchColumn();
    printf("  %-22s %3d active (%3d with logo)\n", $t, $n, $w);
}
