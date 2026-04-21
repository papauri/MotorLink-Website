<?php
/**
 * backfill_logos.php
 * Re-fetches Google Places photos for businesses seeded by seed_real_businesses.php
 * that don't yet have a logo_url. Uses scripts/_real_business_credentials.csv to map
 * email → place_id, then downloads the Place Photo via streams (works on Windows PHP).
 *
 * Run: php scripts/backfill_logos.php
 */
declare(strict_types=1);
chdir(dirname(__DIR__));
require 'api-common.php';

error_reporting(E_ALL);
ini_set('display_errors', '1');
@ob_end_flush();
ob_implicit_flush(true);

$db = Database::getInstance()->getConnection();
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// ── API key ─────────────────────────────────────────────────────────────────
$apiKey = trim((string)$db->query(
    "SELECT setting_value FROM site_settings WHERE setting_key='google_maps_api_key'"
)->fetchColumn());
if (!$apiKey) die("ERROR: google_maps_api_key missing.\n");

// ── Load email → place_id map from CSV ──────────────────────────────────────
$csv = __DIR__ . '/_real_business_credentials.csv';
if (!is_file($csv)) die("ERROR: $csv not found. Run seed_real_businesses.php first.\n");
$map = [];
if (($fh = fopen($csv, 'r')) !== false) {
    $hdr = fgetcsv($fh);
    while (($row = fgetcsv($fh)) !== false) {
        // columns: user_type,business_name,email,username,phone,city,password,has_logo,place_id
        if (count($row) < 9) continue;
        $email    = $row[2];
        $place_id = $row[8];
        if ($email && $place_id) $map[$email] = $place_id;
    }
    fclose($fh);
}
echo "Loaded " . count($map) . " email→place_id pairs from CSV\n\n";

// ── Helpers ─────────────────────────────────────────────────────────────────
function httpGet(string $url): ?string {
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
    return $body === false ? null : $body;
}

function fetchPhotoRef(string $placeId, string $apiKey): ?string {
    $url = 'https://maps.googleapis.com/maps/api/place/details/json'
         . '?place_id=' . urlencode($placeId)
         . '&fields=photos'
         . '&key=' . urlencode($apiKey);
    $raw = httpGet($url);
    if (!$raw) return null;
    $j = json_decode($raw, true);
    return $j['result']['photos'][0]['photo_reference'] ?? null;
}

function downloadPhoto(string $photoRef, string $apiKey, string $slug): ?string {
    $url = 'https://maps.googleapis.com/maps/api/place/photo'
         . '?maxwidth=600&photo_reference=' . urlencode($photoRef)
         . '&key=' . urlencode($apiKey);
    $body = httpGet($url);
    if (!$body || strlen($body) < 200) return null;

    $sig = substr($body, 0, 4);
    if (substr($sig, 0, 3) === "\xFF\xD8\xFF")       $ext = 'jpg';
    elseif (substr($sig, 0, 4) === "\x89PNG")        $ext = 'png';
    elseif (substr($body, 0, 4) === 'RIFF')          $ext = 'webp';
    else return null;

    $dir = __DIR__ . '/../uploads/business_logos';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);

    $fname = $slug . '_' . substr(md5($photoRef), 0, 8) . '.' . $ext;
    $fpath = $dir . '/' . $fname;
    if (file_put_contents($fpath, $body) === false) return null;
    return 'uploads/business_logos/' . $fname;
}

// ── Iterate active businesses missing logos ─────────────────────────────────
$tables = [
    'dealer'   => ['car_dealers',         'business_name'],
    'garage'   => ['garages',             'name'],
    'car_hire' => ['car_hire_companies',  'business_name'],
];

$updated = 0; $failed = 0; $skipped = 0;

foreach ($tables as $type => [$table, $nameCol]) {
    echo "── $table ─────────────────────────────\n";
    $rows = $db->query("
        SELECT b.id AS biz_id, b.user_id, b.$nameCol AS name, u.email
          FROM $table b
          JOIN users u ON u.id = b.user_id
         WHERE b.status = 'active'
           AND (b.logo_url IS NULL OR b.logo_url = '')
    ")->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as $r) {
        $email = $r['email'];
        if (!isset($map[$email])) { $skipped++; continue; }
        $pid = $map[$email];
        $slug = strtolower(preg_replace('/[^a-z0-9]/i', '', $r['name']));
        if (!$slug) $slug = 'biz';

        $ref = fetchPhotoRef($pid, $apiKey);
        usleep(200000);
        if (!$ref) {
            echo "  - no photo: {$r['name']}\n";
            $failed++;
            continue;
        }

        $path = downloadPhoto($ref, $apiKey, $slug);
        usleep(150000);
        if (!$path) {
            echo "  ! download failed: {$r['name']}\n";
            $failed++;
            continue;
        }

        $db->prepare("UPDATE $table SET logo_url = ? WHERE id = ?")->execute([$path, $r['biz_id']]);
        $db->prepare("UPDATE users  SET profile_image = ? WHERE id = ?")->execute([$path, $r['user_id']]);
        echo "  + {$r['name']} → $path\n";
        $updated++;
    }
}

echo "\nSummary: updated=$updated  failed=$failed  skipped=$skipped\n";

// Counts
foreach ($tables as [$t]) {
    $tot  = $db->query("SELECT COUNT(*) FROM $t WHERE status='active'")->fetchColumn();
    $lgo  = $db->query("SELECT COUNT(*) FROM $t WHERE status='active' AND logo_url IS NOT NULL AND logo_url != ''")->fetchColumn();
    echo str_pad($t, 24) . " $lgo / $tot with logo\n";
}
