<?php
/**
 * MotorLink — Dynamic Sitemap
 *
 * Outputs a valid sitemap.xml that includes:
 *   • Static public pages (priority / changefreq tuned per page)
 *   • Active car listings    (last-modified = updated_at)
 *   • Active dealer showrooms (last-modified = updated_at)
 *   • Active garages          (last-modified = updated_at)
 *   • Active car-hire company pages (last-modified = updated_at)
 *
 * The static sitemap.xml still exists as a fallback for environments
 * where PHP is unavailable; this file supersedes it when PHP runs.
 *
 * Robots.txt should reference:  Sitemap: https://…/motorlink/sitemap.php
 */

// ── Bootstrap identical to api.php ────────────────────────────────────────
error_reporting(0);
ini_set('display_errors', 0);

$_serverHost = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
$_isLocal    = in_array($_serverHost, ['localhost', '127.0.0.1'])
    || strpos($_serverHost, 'localhost:') === 0
    || strpos($_serverHost, '127.0.0.1:') === 0
    || preg_match('/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/', $_serverHost);

$_defaultDbHost = (!$_isLocal && !empty($_serverHost)) ? 'localhost' : 'promanaged-it.com';

function _sitemap_loadSecrets() {
    $paths = [
        __DIR__ . '/admin/admin-secrets.local.php',
        __DIR__ . '/admin/admin-secrets.example.php',
    ];
    foreach ($paths as $p) {
        if (!file_exists($p)) continue;
        $loaded = require $p;
        if (is_array($loaded)) return $loaded;
    }
    return [];
}

function _sitemap_getDB($defaultHost) {
    static $pdo = null;
    if ($pdo) return $pdo;
    $s = _sitemap_loadSecrets();
    $host = getenv('MOTORLINK_DB_HOST') ?: ($s['MOTORLINK_DB_HOST'] ?? $defaultHost);
    $user = getenv('MOTORLINK_DB_USER') ?: ($s['MOTORLINK_DB_USER'] ?? '');
    $pass = getenv('MOTORLINK_DB_PASS') ?: ($s['MOTORLINK_DB_PASS'] ?? '');
    $name = getenv('MOTORLINK_DB_NAME') ?: ($s['MOTORLINK_DB_NAME'] ?? '');
    $pdo  = new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT            => 5,
    ]);
    return $pdo;
}

// ── Determine canonical base URL ───────────────────────────────────────────
$_proto   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$_baseUrl = rtrim($_proto . '://' . $_serverHost, '/');

// Strip /sitemap.php and any trailing /api/ etc. to get the base path.
$_scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/');
$_baseUrl   = $_baseUrl . $_scriptDir;

// Allow override from site_settings (canonical_site_url)
try {
    $db = _sitemap_getDB($_defaultDbHost);
    $row = $db->query("SELECT setting_value FROM site_settings WHERE setting_key = 'site_url' LIMIT 1")->fetch();
    if ($row && !empty($row['setting_value'])) {
        $_baseUrl = rtrim((string)$row['setting_value'], '/');
    }
} catch (Exception $e) {
    // Proceed with auto-detected URL — non-fatal
}

function _xml($s) {
    return htmlspecialchars((string)$s, ENT_XML1 | ENT_COMPAT, 'UTF-8');
}

function _urlset_entry($loc, $lastmod = null, $changefreq = 'weekly', $priority = '0.5') {
    $lm = $lastmod ? '<lastmod>' . date('Y-m-d', is_numeric($lastmod) ? $lastmod : strtotime($lastmod)) . '</lastmod>' : '';
    return "  <url>\n    <loc>" . _xml($loc) . "</loc>\n    $lm\n    <changefreq>$changefreq</changefreq>\n    <priority>$priority</priority>\n  </url>\n";
}

// ── Static pages ───────────────────────────────────────────────────────────
$staticPages = [
    ['', 'daily', '1.0'],
    ['sell.html', 'weekly', '0.9'],
    ['dealers.html', 'daily', '0.8'],
    ['garages.html', 'daily', '0.8'],
    ['car-hire.html', 'daily', '0.8'],
    ['car-database.html', 'weekly', '0.7'],
    ['login.html', 'monthly', '0.5'],
    ['register.html', 'monthly', '0.5'],
    ['contact.html', 'monthly', '0.4'],
    ['help.html', 'monthly', '0.3'],
    ['safety.html', 'monthly', '0.3'],
    ['terms.html', 'monthly', '0.3'],
    ['cookie-policy.html', 'monthly', '0.2'],
];

// ── Start output ───────────────────────────────────────────────────────────
header('Content-Type: application/xml; charset=utf-8');
header('X-Robots-Tag: noindex'); // The sitemap itself shouldn't be indexed as a page

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

foreach ($staticPages as [$page, $freq, $pri]) {
    $url = $page ? "$_baseUrl/$page" : "$_baseUrl/";
    echo _urlset_entry($url, null, $freq, $pri);
}

// ── Dynamic rows ────────────────────────────────────────────────────────────
try {
    $db = $db ?? _sitemap_getDB($_defaultDbHost);

    // Active car listings
    $stmt = $db->query(
        "SELECT id, COALESCE(updated_at, created_at) AS modified
         FROM car_listings
         WHERE status = 'active'
         ORDER BY modified DESC
         LIMIT 5000"
    );
    while ($r = $stmt->fetch()) {
        echo _urlset_entry("$_baseUrl/car.html?id={$r['id']}", $r['modified'], 'weekly', '0.7');
    }

    // Active dealers (showroom pages)
    $stmt = $db->query(
        "SELECT id, COALESCE(updated_at, created_at) AS modified
         FROM car_dealers
         WHERE status = 'active'
         ORDER BY modified DESC
         LIMIT 500"
    );
    while ($r = $stmt->fetch()) {
        echo _urlset_entry("$_baseUrl/showroom.html?id={$r['id']}", $r['modified'], 'weekly', '0.6');
    }

    // Active garages
    $stmt = $db->query(
        "SELECT id, COALESCE(updated_at, created_at) AS modified
         FROM garages
         WHERE status = 'active'
         ORDER BY modified DESC
         LIMIT 500"
    );
    while ($r = $stmt->fetch()) {
        echo _urlset_entry("$_baseUrl/garages.html?id={$r['id']}", $r['modified'], 'weekly', '0.6');
    }

    // Active car-hire companies
    $stmt = $db->query(
        "SELECT id, COALESCE(updated_at, created_at) AS modified
         FROM car_hire_companies
         WHERE status = 'active'
         ORDER BY modified DESC
         LIMIT 500"
    );
    while ($r = $stmt->fetch()) {
        echo _urlset_entry("$_baseUrl/car-hire-company.html?id={$r['id']}", $r['modified'], 'weekly', '0.6');
    }
} catch (Exception $e) {
    // DB failure: sitemap still valid with just static pages
    echo "  <!-- Dynamic entries unavailable: DB error -->\n";
}

echo '</urlset>' . "\n";
