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

function isLocalVinEnvironment() {
    $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    $serverAddr = strtolower((string)($_SERVER['SERVER_ADDR'] ?? ''));

    return strpos($host, 'localhost') !== false
        || strpos($host, '127.0.0.1') !== false
        || $serverAddr === '127.0.0.1'
        || $serverAddr === '::1';
}

function looksLikeSslTrustError($errorText) {
    $msg = strtolower((string)$errorText);
    return strpos($msg, 'ssl certificate') !== false
        || strpos($msg, 'unable to get local issuer certificate') !== false
        || strpos($msg, 'certificate verify failed') !== false;
}

function parseNhtsaJsonResponse($responseBody) {
    $data = json_decode((string)$responseBody, true);
    if (!is_array($data) || !isset($data['Results']) || !is_array($data['Results'])) {
        throw new Exception('NHTSA returned malformed data');
    }
    return $data;
}

function fetchNhtsaJson($url) {
    $allowInsecureRetry = isLocalVinEnvironment();

    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_USERAGENT, 'MotorLink-VIN/2.1');

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        if (!empty($error) && $allowInsecureRetry && looksLikeSslTrustError($error)) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
        }

        curl_close($ch);

        if (!empty($error)) {
            throw new Exception('NHTSA request failed: ' . $error);
        }

        if ($httpCode !== 200 || empty($response)) {
            throw new Exception('NHTSA returned HTTP ' . $httpCode);
        }

        return parseNhtsaJsonResponse($response);
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 20,
            'header' => "User-Agent: MotorLink-VIN/2.1\r\n"
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true
        ]
    ]);

    $response = @file_get_contents($url, false, $context);
    if (($response === false || empty($response)) && $allowInsecureRetry) {
        $insecureContext = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 20,
                'header' => "User-Agent: MotorLink-VIN/2.1\r\n"
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false
            ]
        ]);
        $response = @file_get_contents($url, false, $insecureContext);
    }

    if ($response === false || empty($response)) {
        throw new Exception('NHTSA request failed');
    }

    return parseNhtsaJsonResponse($response);
}

function mapDecodeVinResultsToRow($results) {
    $lookup = [];
    foreach ((array)$results as $entry) {
        $key = trim((string)($entry['Variable'] ?? ''));
        if ($key === '') {
            continue;
        }
        $lookup[$key] = (string)($entry['Value'] ?? '');
    }

    return [
        'Make' => $lookup['Make'] ?? '',
        'Model' => $lookup['Model'] ?? '',
        'ModelYear' => $lookup['Model Year'] ?? '',
        'Trim' => $lookup['Trim'] ?? '',
        'Series' => $lookup['Series'] ?? '',
        'BodyClass' => $lookup['Body Class'] ?? '',
        'VehicleType' => $lookup['Vehicle Type'] ?? '',
        'Manufacturer' => $lookup['Manufacturer Name'] ?? '',
        'PlantCountry' => $lookup['Plant Country'] ?? '',
        'PlantCity' => $lookup['Plant City'] ?? '',
        'EngineCylinders' => $lookup['Engine Number of Cylinders'] ?? '',
        'DisplacementL' => $lookup['Displacement (L)'] ?? '',
        'FuelTypePrimary' => $lookup['Fuel Type - Primary'] ?? '',
        'DriveType' => $lookup['Drive Type'] ?? '',
        'TransmissionStyle' => $lookup['Transmission Style'] ?? '',
        'TransmissionSpeeds' => $lookup['Transmission Speeds'] ?? '',
        'Doors' => $lookup['Doors'] ?? '',
        'GVWR' => $lookup['GVWR'] ?? '',
        'WMI' => $lookup['WMI'] ?? '',
        'ErrorCode' => $lookup['Error Code'] ?? '',
        'ErrorText' => $lookup['Error Text'] ?? ''
    ];
}

function mergeNhtsaRows($primary, $fallback) {
    foreach ((array)$fallback as $key => $value) {
        $primaryValue = isset($primary[$key]) ? trim((string)$primary[$key]) : '';
        $fallbackValue = trim((string)$value);
        if ($primaryValue === '' && $fallbackValue !== '') {
            $primary[$key] = $fallbackValue;
        }
    }
    return $primary;
}

function fetchNhtsaWmiFallback($vin) {
    $wmi = substr((string)$vin, 0, 3);
    if (!preg_match('/^[A-HJ-NPR-Z0-9]{3}$/', $wmi)) {
        return [];
    }

    $url = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeWMI/' . urlencode($wmi) . '?format=json';
    $data = fetchNhtsaJson($url);
    $row = $data['Results'][0] ?? [];

    return [
        'Make' => trim((string)($row['Make'] ?? '')),
        'Manufacturer' => trim((string)($row['ManufacturerName'] ?? '')),
        'VehicleType' => trim((string)($row['VehicleType'] ?? '')),
        'ErrorCode' => trim((string)($row['ErrorCode'] ?? '')),
        'ErrorText' => trim((string)($row['ErrorText'] ?? ''))
    ];
}

function fetchNhtsaVinValues($vin) {
    $extendedUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/' . urlencode($vin) . '?format=json';
    $decodeUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/' . urlencode($vin) . '?format=json';

    $extendedData = fetchNhtsaJson($extendedUrl);
    $primary = $extendedData['Results'][0] ?? [];

    if (!is_array($primary)) {
        $primary = [];
    }

    if (trim((string)($primary['Make'] ?? '')) === '' || trim((string)($primary['Model'] ?? '')) === '') {
        try {
            $decodeData = fetchNhtsaJson($decodeUrl);
            $mapped = mapDecodeVinResultsToRow($decodeData['Results'] ?? []);
            $primary = mergeNhtsaRows($primary, $mapped);
        } catch (Exception $e) {
            error_log('VIN middleware DecodeVin fallback warning: ' . $e->getMessage());
        }

        try {
            $wmiFallback = fetchNhtsaWmiFallback($vin);
            $primary = mergeNhtsaRows($primary, $wmiFallback);
        } catch (Exception $e) {
            error_log('VIN middleware DecodeWMI fallback warning: ' . $e->getMessage());
        }
    }

    return $primary;
}

function normalizeVinDetails($vin, $raw) {
    $nhtsaErrorCode = trim((string)($raw['ErrorCode'] ?? ''));
    $nhtsaErrorText = trim((string)($raw['ErrorText'] ?? ''));

    $vehicle = [
        'vin' => $vin,
        'make' => vinField($raw, 'Make'),
        'model' => vinField($raw, 'Model'),
        'year' => vinField($raw, 'ModelYear'),
        'trim' => vinField($raw, 'Trim'),
        'series' => vinField($raw, 'Series'),
        'series2' => vinField($raw, 'Series2'),
        'body_class' => vinField($raw, 'BodyClass'),
        'vehicle_type' => vinField($raw, 'VehicleType'),
        'doors' => vinField($raw, 'Doors'),
        'gvwr' => vinField($raw, 'GVWR'),
        // Powertrain
        'engine_cylinders' => vinField($raw, 'EngineCylinders'),
        'engine_displacement_l' => vinField($raw, 'DisplacementL'),
        'engine_displacement_cc' => vinField($raw, 'DisplacementCC'),
        'engine_model' => vinField($raw, 'EngineModel'),
        'engine_config' => vinField($raw, 'EngineConfiguration'),
        'valve_train' => vinField($raw, 'ValveTrainDesign'),
        'fuel_type' => vinField($raw, 'FuelTypePrimary'),
        'fuel_injection' => vinField($raw, 'FuelInjectionType'),
        'drive_type' => vinField($raw, 'DriveType'),
        'transmission_style' => vinField($raw, 'TransmissionStyle'),
        'transmission_speeds' => vinField($raw, 'TransmissionSpeeds'),
        'electrification_level' => vinField($raw, 'ElectrificationLevel'),
        // Safety
        'airbag_front' => vinField($raw, 'AirBagLocFront'),
        'airbag_side' => vinField($raw, 'AirBagLocSide'),
        'airbag_curtain' => vinField($raw, 'AirBagLocCurtain'),
        'airbag_knee' => vinField($raw, 'AirBagLocKnee'),
        'seat_belts' => vinField($raw, 'SeatBeltsAll'),
        // Manufacturer & Plant
        'manufacturer' => vinField($raw, 'Manufacturer'),
        'plant_company' => vinField($raw, 'PlantCompanyName'),
        'plant_country' => vinField($raw, 'PlantCountry'),
        'plant_state' => vinField($raw, 'PlantState'),
        'plant_city' => vinField($raw, 'PlantCity'),
        // VIN diagnostics
        'vehicle_descriptor' => vinField($raw, 'VehicleDescriptor'),
        'suggested_vin' => vinField($raw, 'SuggestedVIN'),
        'possible_values' => vinField($raw, 'PossibleValues')
    ];

    $hasMeaningfulData = false;
    foreach (['make', 'model', 'year', 'manufacturer', 'body_class', 'vehicle_type'] as $key) {
        if (!empty($vehicle[$key]) && $vehicle[$key] !== 'N/A') {
            $hasMeaningfulData = true;
            break;
        }
    }

    return [
        'vehicle' => $vehicle,
        'meta' => [
            'provider' => 'NHTSA vPIC',
            'provider_url' => 'https://vpic.nhtsa.dot.gov/api/',
            'timestamp' => date('c'),
            'nhtsa_error_code' => $nhtsaErrorCode,
            'nhtsa_error_text' => $nhtsaErrorText,
            'has_meaningful_data' => $hasMeaningfulData
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

        if (empty($decoded['meta']['has_meaningful_data'])) {
            sendError('VIN could not be decoded. Please verify the VIN and try again.', 422);
        }

        sendSuccess($decoded);
    } catch (Exception $e) {
        error_log('VIN middleware decode error: ' . $e->getMessage());
        sendError('VIN decode temporarily unavailable. Please try again.', 503);
    }
}
