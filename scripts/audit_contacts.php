<?php
/**
 * audit_contacts.php
 * Audits and cleans test/placeholder contact data from business tables.
 * Run with:  php scripts/audit_contacts.php [--dry-run] [--fix]
 *
 * Modes:
 *   (no flag)   -- print summary counts only
 *   --dry-run   -- print every affected row without touching the DB
 *   --fix       -- actually NULL out the bad email/phone values
 */

require_once __DIR__ . '/../api-common.php';

$mode = 'summary';
foreach ($argv as $arg) {
    if ($arg === '--dry-run') $mode = 'dry';
    if ($arg === '--fix')     $mode = 'fix';
}

// ─── DSN ──────────────────────────────────────────────────────────────────────
$dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    die("DB connection failed: " . $e->getMessage() . "\n");
}

// ─── Patterns for test / placeholder emails ───────────────────────────────────
// Match emails that are clearly internal test seeds, not real business addresses.
$badEmailPatterns = [
    '%@motorlink.%',        // any motorlink domain
    '%motorlink%@%',        // user part contains motorlink
    '%@test.%',
    '%@example.%',
    '%@placeholder.%',
    '%test@%',
    '%noreply@%',
    '%no-reply@%',
    '%dummy@%',
    '%admin@admin.%',
    '%info@motorlink%',
    '%contact@motorlink%',
];

// Patterns for obviously fake phone numbers
$badPhonePatterns = [
    '0000000000',
    '1111111111',
    '1234567890',
    '0123456789',
    '9999999999',
    '+265000%',
    '+2650000%',
    '0999999999',
    '0888888888',
    '0777777777',
    '0111111111',
];

// ─── Tables & columns to audit ───────────────────────────────────────────────
$tables = [
    'car_dealers'      => ['id_col' => 'id', 'name_col' => 'business_name', 'email_col' => 'email', 'phone_col' => 'phone'],
    'garages'          => ['id_col' => 'id', 'name_col' => 'name',          'email_col' => 'email', 'phone_col' => 'phone'],
    'car_hire_companies' => ['id_col' => 'id', 'name_col' => 'business_name', 'email_col' => 'email', 'phone_col' => 'phone'],
];

$totalEmailsFlagged = 0;
$totalPhonesFlagged = 0;

foreach ($tables as $table => $cols) {
    $idCol    = $cols['id_col'];
    $nameCol  = $cols['name_col'];
    $emailCol = $cols['email_col'];
    $phoneCol = $cols['phone_col'];

    // ── Build email WHERE clause ──────────────────────────────────────────────
    $emailWhereParts = [];
    foreach ($badEmailPatterns as $p) {
        $emailWhereParts[] = "$emailCol LIKE ?";
    }
    $emailWhere = implode(' OR ', $emailWhereParts);

    $emailStmt = $pdo->prepare(
        "SELECT $idCol AS id, $nameCol AS name, $emailCol AS email
         FROM $table
         WHERE $emailCol IS NOT NULL AND $emailCol != '' AND ($emailWhere)
         ORDER BY id"
    );
    $emailStmt->execute($badEmailPatterns);
    $emailRows = $emailStmt->fetchAll();

    // ── Build phone WHERE clause ──────────────────────────────────────────────
    $phoneWhereParts = [];
    $phoneBindValues = [];
    foreach ($badPhonePatterns as $p) {
        if (strpos($p, '%') !== false) {
            $phoneWhereParts[] = "$phoneCol LIKE ?";
        } else {
            $phoneWhereParts[] = "REPLACE(REPLACE($phoneCol,' ',''),'-','') = ?";
        }
        $phoneBindValues[] = $p;
    }
    $phoneWhere = implode(' OR ', $phoneWhereParts);

    $phoneStmt = $pdo->prepare(
        "SELECT $idCol AS id, $nameCol AS name, $phoneCol AS phone
         FROM $table
         WHERE $phoneCol IS NOT NULL AND $phoneCol != '' AND ($phoneWhere)
         ORDER BY id"
    );
    $phoneStmt->execute($phoneBindValues);
    $phoneRows = $phoneStmt->fetchAll();

    $emailCount = count($emailRows);
    $phoneCount = count($phoneRows);
    $totalEmailsFlagged += $emailCount;
    $totalPhonesFlagged += $phoneCount;

    echo "\n========== $table ==========\n";
    echo "  Flagged emails : $emailCount\n";
    echo "  Flagged phones : $phoneCount\n";

    if ($mode === 'dry' || $mode === 'fix') {
        if ($emailCount > 0) {
            echo "\n  [EMAIL] Flagged rows:\n";
            foreach ($emailRows as $row) {
                echo "    ID #{$row['id']} — {$row['name']}\n";
                echo "      email: {$row['email']}\n";
            }
        }
        if ($phoneCount > 0) {
            echo "\n  [PHONE] Flagged rows:\n";
            foreach ($phoneRows as $row) {
                echo "    ID #{$row['id']} — {$row['name']}\n";
                echo "      phone: {$row['phone']}\n";
            }
        }
    }

    if ($mode === 'fix') {
        $pdo->beginTransaction();
        try {
            if ($emailCount > 0) {
                $ids = array_column($emailRows, 'id');
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $pdo->prepare("UPDATE $table SET $emailCol = NULL WHERE $idCol IN ($placeholders)")
                    ->execute($ids);
                echo "\n  -> Cleared $emailCount email(s) in $table\n";
            }
            if ($phoneCount > 0) {
                $ids = array_column($phoneRows, 'id');
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $pdo->prepare("UPDATE $table SET $phoneCol = NULL WHERE $idCol IN ($placeholders)")
                    ->execute($ids);
                echo "  -> Cleared $phoneCount phone(s) in $table\n";
            }
            $pdo->commit();
        } catch (PDOException $e) {
            $pdo->rollBack();
            echo "  ERROR: " . $e->getMessage() . "\n";
        }
    }
}

echo "\n==================================\n";
echo "Total flagged emails : $totalEmailsFlagged\n";
echo "Total flagged phones : $totalPhonesFlagged\n";
echo "Mode                 : $mode\n";
if ($mode === 'summary') {
    echo "\nRe-run with --dry-run to see individual rows.\n";
    echo "Re-run with --fix to clear bad values from the live DB.\n";
}
echo "==================================\n\n";
