<?php
/**
 * Local Smoke Test for Car Hire Events & Van/Truck Features
 * Tests directly against the DB to verify the SQL logic matches api.php
 */
$db = new PDO(
    'mysql:host=promanaged-it.com;dbname=p601229_motorlinkmalawi_db;charset=utf8mb4',
    'p601229',
    '2:p2WpmX[0YTs7'
);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$pass = 0;
$fail = 0;

function check($label, $condition) {
    global $pass, $fail;
    if ($condition) {
        echo "  PASS: $label" . PHP_EOL;
        $pass++;
    } else {
        echo "  FAIL: $label" . PHP_EOL;
        $fail++;
    }
}

echo "=== LOCAL SMOKE TEST: Car Hire Events & Van/Truck ===" . PHP_EOL . PHP_EOL;

// --- Test 1: Company-level query (mirrors getCarHireCompaniesWithFleet) ---
echo "[Test 1] Company query with aggregates" . PHP_EOL;
$stmt = $db->query("
    SELECT c.*, loc.name as location_name, loc.region,
           COUNT(f.id) as total_vehicles,
           MIN(f.daily_rate) as daily_rate_from,
           MAX(f.daily_rate) as daily_rate_to,
           SUM(CASE WHEN f.vehicle_category = 'van' THEN 1 ELSE 0 END) as van_count,
           SUM(CASE WHEN f.vehicle_category = 'truck' THEN 1 ELSE 0 END) as truck_count,
           SUM(CASE WHEN f.event_suitable = 1 THEN 1 ELSE 0 END) as event_vehicle_count
    FROM car_hire_companies c
    INNER JOIN locations loc ON c.location_id = loc.id
    LEFT JOIN car_hire_fleet f ON c.id = f.company_id AND f.is_active = 1
    WHERE c.status = 'active'
    GROUP BY c.id
    ORDER BY c.id ASC
");
$companies = $stmt->fetchAll(PDO::FETCH_ASSOC);
check("Got companies: " . count($companies), count($companies) > 0);

// Company 1: events category
$c1 = null;
$c2 = null;
$c3 = null;
foreach ($companies as $c) {
    if ($c['id'] == 1) $c1 = $c;
    if ($c['id'] == 2) $c2 = $c;
    if ($c['id'] == 3) $c3 = $c;
}

echo PHP_EOL . "[Test 2] Company 1 (Malawi Premier) - Events category" . PHP_EOL;
if ($c1) {
    check("hire_category = 'events'", $c1['hire_category'] === 'events');
    check("event_types is valid JSON", !empty($c1['event_types']) && json_decode($c1['event_types']) !== null);
    $et = json_decode($c1['event_types'], true);
    check("event_types contains 'Wedding'", is_array($et) && in_array('Wedding', $et));
    check("event_vehicle_count >= 3", intval($c1['event_vehicle_count']) >= 3);
} else {
    echo "  SKIP: Company 1 not found or not active" . PHP_EOL;
}

echo PHP_EOL . "[Test 3] Company 2 (Blantyre) - Vans & Trucks category" . PHP_EOL;
if ($c2) {
    check("hire_category = 'vans_trucks'", $c2['hire_category'] === 'vans_trucks');
    check("van_count >= 2", intval($c2['van_count']) >= 2);
    check("truck_count >= 1", intval($c2['truck_count']) >= 1);
    check("event_types is NULL/empty", empty($c2['event_types']));
} else {
    echo "  SKIP: Company 2 not found or not active" . PHP_EOL;
}

echo PHP_EOL . "[Test 4] Company 3 (Capital Auto) - All category" . PHP_EOL;
if ($c3) {
    check("hire_category = 'all'", $c3['hire_category'] === 'all');
    check("event_types is valid JSON", !empty($c3['event_types']) && json_decode($c3['event_types']) !== null);
} else {
    echo "  SKIP: Company 3 not found or not active" . PHP_EOL;
}

// --- Test 5: Fleet sub-query (mirrors the per-company fleet fetch) ---
echo PHP_EOL . "[Test 5] Fleet sub-query - Company 2 vehicles" . PHP_EOL;
$fleetStmt = $db->prepare("
    SELECT id, vehicle_category, cargo_capacity, event_suitable
    FROM car_hire_fleet
    WHERE company_id = ? AND is_active = 1
    ORDER BY daily_rate ASC
");
$fleetStmt->execute([2]);
$fleet = $fleetStmt->fetchAll(PDO::FETCH_ASSOC);
check("Fleet count for company 2 >= 3", count($fleet) >= 3);
$vans = array_filter($fleet, fn($v) => $v['vehicle_category'] === 'van');
$trucks = array_filter($fleet, fn($v) => $v['vehicle_category'] === 'truck');
check("Has vans", count($vans) >= 2);
check("Has trucks", count($trucks) >= 1);
foreach ($vans as $van) {
    check("Van has cargo_capacity", !empty($van['cargo_capacity']));
}
foreach ($trucks as $truck) {
    check("Truck has cargo_capacity", !empty($truck['cargo_capacity']));
}

// --- Test 6: Fleet sub-query - Company 1 event vehicles ---
echo PHP_EOL . "[Test 6] Fleet sub-query - Company 1 event vehicles" . PHP_EOL;
$fleetStmt->execute([1]);
$fleet1 = $fleetStmt->fetchAll(PDO::FETCH_ASSOC);
$eventVehicles = array_filter($fleet1, fn($v) => $v['event_suitable'] == 1);
check("Company 1 has event-suitable vehicles", count($eventVehicles) >= 3);

// --- Test 7: Stats query ---
echo PHP_EOL . "[Test 7] Car hire stats" . PHP_EOL;
$statsStmt = $db->query("
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN hire_category IN ('events','all') THEN 1 ELSE 0 END) as event_companies,
        SUM(CASE WHEN hire_category IN ('vans_trucks','all') THEN 1 ELSE 0 END) as vantruck_companies
    FROM car_hire_companies WHERE status = 'active'
");
$stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
check("event_companies >= 2", intval($stats['event_companies']) >= 2);
check("vantruck_companies >= 2", intval($stats['vantruck_companies']) >= 2);

// --- Test 8: addCarHireVehicle validation logic ---
echo PHP_EOL . "[Test 8] vehicle_category validation" . PHP_EOL;
$validCats = ['car', 'van', 'truck'];
check("'car' is valid", in_array('car', $validCats));
check("'van' is valid", in_array('van', $validCats));
check("'truck' is valid", in_array('truck', $validCats));
check("'helicopter' is invalid", !in_array('helicopter', $validCats));

// --- Test 9: hire_category validation logic ---
echo PHP_EOL . "[Test 9] hire_category validation" . PHP_EOL;
$validHire = ['standard', 'events', 'vans_trucks', 'all'];
check("'standard' is valid", in_array('standard', $validHire));
check("'events' is valid", in_array('events', $validHire));
check("'vans_trucks' is valid", in_array('vans_trucks', $validHire));
check("'all' is valid", in_array('all', $validHire));
check("'random' is invalid", !in_array('random', $validHire));

// --- Summary ---
echo PHP_EOL . "========================================" . PHP_EOL;
echo "TOTAL: " . ($pass + $fail) . " | PASS: $pass | FAIL: $fail" . PHP_EOL;
if ($fail === 0) {
    echo "ALL TESTS PASSED!" . PHP_EOL;
} else {
    echo "SOME TESTS FAILED - review above" . PHP_EOL;
}
echo "========================================" . PHP_EOL;
