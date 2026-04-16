<?php
// Quick DB check for van/truck data
$db = new PDO(
    'mysql:host=promanaged-it.com;dbname=p601229_motorlinkmalawi_db;charset=utf8mb4',
    'p601229',
    '2:p2WpmX[0YTs7'
);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "=== car_hire_fleet with new columns ===" . PHP_EOL;
$stmt = $db->query("SELECT id, company_id, vehicle_category, cargo_capacity, event_suitable, is_active, make_name, model_name FROM car_hire_fleet WHERE company_id IN (1,2,3) ORDER BY company_id, id");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    echo "ID:{$r['id']} Company:{$r['company_id']} Cat:{$r['vehicle_category']} Cargo:{$r['cargo_capacity']} Event:{$r['event_suitable']} Active:{$r['is_active']}" . PHP_EOL;
}

echo PHP_EOL . "=== Check column exists ===" . PHP_EOL;
$cols = $db->query("SHOW COLUMNS FROM car_hire_fleet LIKE 'vehicle_category'")->fetchAll(PDO::FETCH_ASSOC);
print_r($cols);

echo PHP_EOL . "=== Vehicles with vehicle_category != 'car' ===" . PHP_EOL;
$stmt2 = $db->query("SELECT id, company_id, vehicle_category, cargo_capacity, event_suitable FROM car_hire_fleet WHERE vehicle_category != 'car'");
$rows2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows2 as $r) {
    echo "ID:{$r['id']} Company:{$r['company_id']} Cat:{$r['vehicle_category']} Cargo:{$r['cargo_capacity']} Event:{$r['event_suitable']}" . PHP_EOL;
}

echo PHP_EOL . "=== is_active check for company 2 ===" . PHP_EOL;
$stmt3 = $db->query("SELECT id, company_id, is_active, vehicle_category FROM car_hire_fleet WHERE company_id = 2");
$rows3 = $stmt3->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows3 as $r) {
    echo "ID:{$r['id']} Active:{$r['is_active']} Cat:{$r['vehicle_category']}" . PHP_EOL;
}
