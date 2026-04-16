<?php
// Smoke test for car hire API - new events & van/truck features
$ch = curl_init('https://promanaged-it.com/motorlink/api.php?action=car_hire_companies_with_fleet');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);

if ($data['success']) {
    echo "=== CAR HIRE API SMOKE TEST ===" . PHP_EOL;
    echo "Total companies: " . count($data['companies']) . PHP_EOL;
    foreach ($data['companies'] as $c) {
        echo "---" . PHP_EOL;
        echo "ID: {$c['id']} | {$c['business_name']}" . PHP_EOL;
        echo "  hire_category: " . ($c['hire_category'] ?? 'NULL') . PHP_EOL;
        echo "  event_types: " . ($c['event_types'] ?? 'NULL') . PHP_EOL;
        echo "  van_count: " . ($c['van_count'] ?? '0') . " | truck_count: " . ($c['truck_count'] ?? '0') . PHP_EOL;
        echo "  event_vehicle_count: " . ($c['event_vehicle_count'] ?? '0') . PHP_EOL;
        if (!empty($c['fleet'])) {
            foreach ($c['fleet'] as $v) {
                echo "    Fleet: {$v['vehicle_name']} | category={$v['vehicle_category']} | cargo={$v['cargo_capacity']} | event={$v['event_suitable']}" . PHP_EOL;
            }
        }
    }
} else {
    echo "Error: " . ($data['message'] ?? 'unknown') . PHP_EOL;
    echo "Raw: " . substr($response, 0, 500) . PHP_EOL;
}

// Test stats endpoint
echo PHP_EOL . "=== STATS ===" . PHP_EOL;
$ch2 = curl_init('https://promanaged-it.com/motorlink/api.php?action=car_hire_stats');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
$response2 = curl_exec($ch2);
curl_close($ch2);
$stats = json_decode($response2, true);
if ($stats['success']) {
    print_r($stats['stats']);
} else {
    echo "Stats error: " . ($stats['message'] ?? 'unknown') . PHP_EOL;
}
