<?php
/**
 * MotorLink VIN decoder middleware.
 * Free source: NHTSA vPIC API.
 * This file is included by proxy.php and api.php.
 */

function vinField($row, $key, $fallback = 'N/A') {
    $value = isset($row[$key]) ? trim((string)$row[$key]) : '';
    if ($value === '' || $value === '0' || strcasecmp($value, 'Not Applicable') === 0) {
        return $fallback;
    }
    return $value;
}

function fetchNhtsaVinValues($vin) {
    $url = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/' . urlencode($vin) . '?format=json';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_USERAGENT, 'MotorLink-VIN/2.0');

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if (!empty($error)) {
        throw new Exception('NHTSA request failed: ' . $error);
    }

    if ($httpCode !== 200 || empty($response)) {
        throw new Exception('NHTSA returned HTTP ' . $httpCode);
    }

    $data = json_decode($response, true);
    if (!is_array($data) || empty($data['Results']) || !is_array($data['Results'])) {
        throw new Exception('NHTSA returned malformed data');
    }

    return $data['Results'][0] ?? [];
}

function normalizeVinDetails($vin, $raw) {
    $vehicle = [
        'vin' => $vin,
        'make' => vinField($raw, 'Make'),
        'model' => vinField($raw, 'Model'),
        'year' => vinField($raw, 'ModelYear'),
        'trim' => vinField($raw, 'Trim'),
        'series' => vinField($raw, 'Series'),
        'body_class' => vinField($raw, 'BodyClass'),
        'vehicle_type' => vinField($raw, 'VehicleType'),
        'manufacturer' => vinField($raw, 'Manufacturer'),
        'plant_country' => vinField($raw, 'PlantCountry'),
        'plant_city' => vinField($raw, 'PlantCity'),
        'engine_cylinders' => vinField($raw, 'EngineCylinders'),
        'engine_displacement_l' => vinField($raw, 'DisplacementL'),
        'fuel_type' => vinField($raw, 'FuelTypePrimary'),
        'drive_type' => vinField($raw, 'DriveType'),
        'transmission_style' => vinField($raw, 'TransmissionStyle'),
        'transmission_speeds' => vinField($raw, 'TransmissionSpeeds'),
        'doors' => vinField($raw, 'Doors'),
        'gvwr' => vinField($raw, 'GVWR')
    ];

    return [
        'vehicle' => $vehicle,
        'meta' => [
            'provider' => 'NHTSA vPIC',
            'provider_url' => 'https://vpic.nhtsa.dot.gov/api/',
            'timestamp' => date('c')
        ]
    ];
}

function getNhtsaData($db) {
    $endpoint = $_GET['endpoint'] ?? 'decode';
    $vin = strtoupper(trim((string)($_GET['vin'] ?? '')));

    if ($endpoint !== 'decode') {
        sendError('Only decode endpoint is supported for VIN middleware', 400);
    }

    if (!preg_match('/^[A-HJ-NPR-Z0-9]{17}$/', $vin)) {
        sendError('Valid 17-character VIN required', 400);
    }

    try {
        $raw = fetchNhtsaVinValues($vin);
        $decoded = normalizeVinDetails($vin, $raw);

        if (($decoded['vehicle']['make'] ?? 'N/A') === 'N/A' || ($decoded['vehicle']['model'] ?? 'N/A') === 'N/A') {
            sendError('VIN could not be decoded. Please verify the VIN and try again.', 422);
        }

        sendSuccess($decoded);
    } catch (Exception $e) {
        error_log('VIN middleware decode error: ' . $e->getMessage());
        sendError('VIN decode temporarily unavailable. Please try again.', 503);
    }
}
