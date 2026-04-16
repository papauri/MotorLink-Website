<?php
/**
 * Migration: Add Events & Van/Truck columns to car_hire tables
 * Run once to add new columns + seed test data
 */

$host = 'promanaged-it.com'; // UAT remote
$dbname = 'p601229_motorlinkmalawi_db';
$user = 'p601229';
$pass = '2:p2WpmX[0YTs7';

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "Connected OK\n";

    // ── 1. ALTER car_hire_companies ──────────────────────────
    $cols = [];
    $stmt = $db->query("SHOW COLUMNS FROM car_hire_companies");
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $cols[] = $row['Field'];
    }

    if (!in_array('hire_category', $cols)) {
        $db->exec("ALTER TABLE car_hire_companies ADD COLUMN hire_category VARCHAR(30) NOT NULL DEFAULT 'standard' AFTER description");
        echo "  + car_hire_companies.hire_category\n";
    } else {
        echo "  = car_hire_companies.hire_category already exists\n";
    }

    if (!in_array('event_types', $cols)) {
        $db->exec("ALTER TABLE car_hire_companies ADD COLUMN event_types TEXT NULL AFTER hire_category");
        echo "  + car_hire_companies.event_types\n";
    } else {
        echo "  = car_hire_companies.event_types already exists\n";
    }

    // ── 2. ALTER car_hire_fleet ──────────────────────────────
    $cols2 = [];
    $stmt2 = $db->query("SHOW COLUMNS FROM car_hire_fleet");
    foreach ($stmt2->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $cols2[] = $row['Field'];
    }

    if (!in_array('vehicle_category', $cols2)) {
        $db->exec("ALTER TABLE car_hire_fleet ADD COLUMN vehicle_category VARCHAR(20) NOT NULL DEFAULT 'car' AFTER status");
        echo "  + car_hire_fleet.vehicle_category\n";
    } else {
        echo "  = car_hire_fleet.vehicle_category already exists\n";
    }

    if (!in_array('cargo_capacity', $cols2)) {
        $db->exec("ALTER TABLE car_hire_fleet ADD COLUMN cargo_capacity VARCHAR(100) NULL AFTER vehicle_category");
        echo "  + car_hire_fleet.cargo_capacity\n";
    } else {
        echo "  = car_hire_fleet.cargo_capacity already exists\n";
    }

    if (!in_array('event_suitable', $cols2)) {
        $db->exec("ALTER TABLE car_hire_fleet ADD COLUMN event_suitable TINYINT(1) NOT NULL DEFAULT 0 AFTER cargo_capacity");
        echo "  + car_hire_fleet.event_suitable\n";
    } else {
        echo "  = car_hire_fleet.event_suitable already exists\n";
    }

    echo "\n── Schema migration complete ──\n\n";

    // ── 3. Get existing companies for test data updates ──────
    $companies = $db->query("SELECT id, business_name, vehicle_types, services FROM car_hire_companies WHERE status = 'active' ORDER BY id LIMIT 20")->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($companies) . " active companies\n";

    if (count($companies) >= 2) {
        // Update first company to be an events car hire
        $c1 = $companies[0];
        $db->prepare("UPDATE car_hire_companies SET hire_category = 'events', event_types = ?, vehicle_types = ? WHERE id = ?")
           ->execute([
               json_encode(["Wedding", "Corporate Event", "Funeral", "Birthday Party", "Prom Night", "Airport VIP Transfer"]),
               json_encode(["Sedan", "SUV", "Luxury", "Limousine", "Convertible"]),
               $c1['id']
           ]);
        echo "  Updated '{$c1['business_name']}' → events hire\n";

        // Mark some of their fleet as event_suitable
        $db->prepare("UPDATE car_hire_fleet SET event_suitable = 1 WHERE company_id = ? AND is_active = 1 LIMIT 3")->execute([$c1['id']]);
        echo "  Marked up to 3 vehicles as event_suitable for company {$c1['id']}\n";

        // Update second company to be a van/truck hire
        $c2 = $companies[1];
        $db->prepare("UPDATE car_hire_companies SET hire_category = 'vans_trucks', vehicle_types = ? WHERE id = ?")
           ->execute([
               json_encode(["Van", "Truck", "Pickup", "Flatbed"]),
               $c2['id']
           ]);
        echo "  Updated '{$c2['business_name']}' → vans_trucks hire\n";

        // Check if company 2 has fleet vehicles — if so update them; if not, insert test vehicles
        $fleetCount = $db->prepare("SELECT COUNT(*) FROM car_hire_fleet WHERE company_id = ?");
        $fleetCount->execute([$c2['id']]);
        $fCount = (int)$fleetCount->fetchColumn();

        if ($fCount > 0) {
            $db->prepare("UPDATE car_hire_fleet SET vehicle_category = 'van', cargo_capacity = '800 kg' WHERE company_id = ? AND is_active = 1 LIMIT 2")->execute([$c2['id']]);
            $db->prepare("UPDATE car_hire_fleet SET vehicle_category = 'truck', cargo_capacity = '3 tonnes' WHERE company_id = ? AND is_active = 1 AND vehicle_category = 'car' LIMIT 1")->execute([$c2['id']]);
            echo "  Updated existing fleet for company {$c2['id']} with van/truck categories\n";
        } else {
            // Get company details for denormalized fields
            $compInfo = $db->prepare("SELECT business_name, phone, email, location_id FROM car_hire_companies WHERE id = ?");
            $compInfo->execute([$c2['id']]);
            $ci = $compInfo->fetch(PDO::FETCH_ASSOC);

            // Insert sample van
            $db->prepare("INSERT INTO car_hire_fleet (company_id, company_name, company_phone, company_email, company_location_id, make_name, model_name, vehicle_name, year, transmission, fuel_type, seats, daily_rate, status, vehicle_category, cargo_capacity, is_available, is_active, created_at) VALUES (?, ?, ?, ?, ?, 'Toyota', 'HiAce', '2022 Toyota HiAce', 2022, 'manual', 'diesel', 3, 75000, 'available', 'van', '1200 kg', 1, 1, NOW())")
               ->execute([$c2['id'], $ci['business_name'], $ci['phone'], $ci['email'], $ci['location_id']]);

            // Insert sample truck
            $db->prepare("INSERT INTO car_hire_fleet (company_id, company_name, company_phone, company_email, company_location_id, make_name, model_name, vehicle_name, year, transmission, fuel_type, seats, daily_rate, status, vehicle_category, cargo_capacity, is_available, is_active, created_at) VALUES (?, ?, ?, ?, ?, 'Isuzu', 'FTR', '2021 Isuzu FTR', 2021, 'manual', 'diesel', 3, 120000, 'available', 'truck', '5 tonnes', 1, 1, NOW())")
               ->execute([$c2['id'], $ci['business_name'], $ci['phone'], $ci['email'], $ci['location_id']]);

            // Insert sample pickup
            $db->prepare("INSERT INTO car_hire_fleet (company_id, company_name, company_phone, company_email, company_location_id, make_name, model_name, vehicle_name, year, transmission, fuel_type, seats, daily_rate, status, vehicle_category, cargo_capacity, is_available, is_active, created_at) VALUES (?, ?, ?, ?, ?, 'Toyota', 'Hilux', '2023 Toyota Hilux', 2023, 'automatic', 'diesel', 5, 95000, 'available', 'truck', '1 tonne', 1, 1, NOW())")
               ->execute([$c2['id'], $ci['business_name'], $ci['phone'], $ci['email'], $ci['location_id']]);

            echo "  Inserted 3 sample van/truck fleet vehicles for company {$c2['id']}\n";
        }

        // If there's a 3rd company, make it 'all' (events + van/truck + standard)
        if (count($companies) >= 3) {
            $c3 = $companies[2];
            $db->prepare("UPDATE car_hire_companies SET hire_category = 'all', event_types = ?, vehicle_types = ? WHERE id = ?")
               ->execute([
                   json_encode(["Wedding", "Corporate Event", "Airport Transfer"]),
                   json_encode(["Sedan", "SUV", "Van", "Truck", "Luxury"]),
                   $c3['id']
               ]);
            echo "  Updated '{$c3['business_name']}' → all (full-service)\n";
        }
    }

    echo "\n✅ Migration + test data complete!\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
