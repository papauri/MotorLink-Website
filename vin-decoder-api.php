<?php
/**
 * MotorLink VIN Decoder API test
 * Separate API endpoint for VIN decoding functionality
 */

// This file is included by proxy.php after api-common.php
// Function definitions only - routing is handled in proxy.php

/**
 * Proxy for NHTSA Vehicle API - Completely free, government-run, no API key required
 * Documentation: https://vpic.nhtsa.dot.gov/api/
 * Base URL: https://vpic.nhtsa.dot.gov/api/vehicles
 * This API provides make/model/year data and can decode VINs
 */
function getNhtsaData($db) {
    $endpoint = $_GET['endpoint'] ?? 'makes'; // makes, models, years, specs, decode
    $vin = $_GET['vin'] ?? '';
    $make = $_GET['make'] ?? '';
    $model = $_GET['model'] ?? '';
    $year = $_GET['year'] ?? '';
    
    // Handle VIN decoding endpoint
    if ($endpoint === 'decode' || !empty($vin)) {
        if (empty($vin) || strlen($vin) !== 17) {
            sendError('Valid 17-character VIN required', 400);
        }
        
        // NHTSA VIN Decode endpoint - returns comprehensive vehicle information
        $url = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/' . urlencode($vin) . '?format=json';
        
        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_USERAGENT, 'MotorLink/1.0');
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($error) {
                error_log("NHTSA VIN decode error: " . $error);
                sendError('VIN decode error: ' . $error, 500);
            }
            
            if ($httpCode !== 200) {
                error_log("NHTSA VIN decode returned HTTP " . $httpCode . " for VIN: " . $vin);
                sendError('VIN decode failed. HTTP ' . $httpCode, $httpCode);
            }
            
            $data = json_decode($response, true);
            
            if ($data === null || !isset($data['Results']) || !is_array($data['Results'])) {
                error_log("NHTSA VIN decode returned invalid JSON");
                sendError('Invalid response from NHTSA', 500);
            }
            
            // Convert NHTSA Results array (Variable/Value pairs) to associative array
            // NHTSA returns: {Results: [{Variable: "Make", Value: "TOYOTA"}, ...]}
            $decodedData = [];
            foreach ($data['Results'] as $result) {
                if (isset($result['Variable']) && isset($result['Value'])) {
                    $variable = $result['Variable'];
                    $value = $result['Value'];
                    // Only include fields with actual values (exclude empty, null, "Not Applicable")
                    if ($value !== null && $value !== '' && $value !== 'Not Applicable' && $value !== 'Not Applicable.') {
                        $decodedData[$variable] = $value;
                    }
                }
            }
            
            // Add the raw results array as well for comprehensive access
            $decodedData['_raw_results'] = $data['Results'];
            $decodedData['vin'] = $vin;
            
            // Return ALL available data from NHTSA
            echo json_encode($decodedData, JSON_PRETTY_PRINT);
            exit();
        } catch (Exception $e) {
            error_log("NHTSA VIN decode exception: " . $e->getMessage());
            sendError('VIN decode failed: ' . $e->getMessage(), 500);
        }
    }
    
    // NHTSA base URL
    $baseUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles';
    
    // Build URL based on endpoint
    $url = '';
    
    switch ($endpoint) {
        case 'makes':
            // Get all makes for a specific year (use current year)
            $currentYear = date('Y');
            $url = $baseUrl . '/GetMakesForVehicleType/car?format=json';
            break;
            
        case 'models':
            // Get models for a make and year
            if (empty($make)) {
                sendError('Make parameter required for models endpoint', 400);
            }
            $yearParam = $year ? $year : date('Y');
            $url = $baseUrl . '/GetModelsForMake/' . urlencode($make) . '?format=json';
            if ($year) {
                $url .= '&year=' . urlencode($year);
            }
            break;
            
        case 'years':
            // Get available years for a make/model
            if (empty($make) || empty($model)) {
                sendError('Make and model parameters required for years endpoint', 400);
            }
            // NHTSA doesn't have a direct years endpoint, return common years
            $currentYear = (int)date('Y');
            $years = [];
            for ($y = $currentYear; $y >= 1990; $y--) {
                $years[] = $y;
            }
            echo json_encode(['Years' => $years]);
            exit();
            
        case 'specs':
            // NHTSA doesn't provide detailed specs directly, but we can use VIN decoding
            // For now, return empty and suggest using VIN decoder
            echo json_encode(['Trims' => []]);
            exit();
            
        default:
            sendError('Invalid endpoint. Use: makes, models, years, specs, or decode (with vin parameter)', 400);
    }
    
    try {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_USERAGENT, 'MotorLink/1.0');
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            error_log("NHTSA error: " . $error . " for URL: " . $url);
            sendError('NHTSA error: ' . $error, 500);
        }
        
        if ($httpCode !== 200) {
            error_log("NHTSA returned HTTP " . $httpCode . " for URL: " . $url);
            echo json_encode([]);
            exit();
        }
        
        $data = json_decode($response, true);
        
        if ($data === null) {
            error_log("NHTSA returned invalid JSON: " . substr($response, 0, 200));
            echo json_encode([]);
            exit();
        }
        
        if ($endpoint === 'makes') {
            // Format makes response - NHTSA returns {Results: [{Make_ID, Make_Name}, ...]}
            $formatted = [];
            $results = isset($data['Results']) ? $data['Results'] : [];
            
            if (is_array($results)) {
                foreach ($results as $makeItem) {
                    if (is_array($makeItem) && isset($makeItem['Make_Name'])) {
                        $formatted[] = [
                            'make' => $makeItem['Make_Name'],
                            'make_display' => $makeItem['Make_Name'],
                            'make_id' => isset($makeItem['Make_ID']) ? (string)$makeItem['Make_ID'] : strtolower(str_replace([' ', '-'], '_', $makeItem['Make_Name']))
                        ];
                    }
                }
            }
            echo json_encode(['Makes' => $formatted]);
        } else if ($endpoint === 'models') {
            // Format models response - NHTSA returns {Results: [{Make_ID, Make_Name, Model_ID, Model_Name}, ...]}
            $formatted = [];
            $results = isset($data['Results']) ? $data['Results'] : [];
            
            if (is_array($results)) {
                foreach ($results as $modelItem) {
                    if (is_array($modelItem) && isset($modelItem['Model_Name'])) {
                        $formatted[] = [
                            'model_name' => $modelItem['Model_Name'],
                            'model_id' => isset($modelItem['Model_ID']) ? (string)$modelItem['Model_ID'] : strtolower(str_replace([' ', '-'], '_', $modelItem['Model_Name'])),
                            'model_year' => $year ? (string)$year : '',
                            'make' => $make
                        ];
                    }
                }
            }
            echo json_encode(['Models' => $formatted]);
        }
        
        exit();
    } catch (Exception $e) {
        error_log("NHTSA proxy error: " . $e->getMessage());
        sendError('Failed to fetch from NHTSA', 500);
    }
}
