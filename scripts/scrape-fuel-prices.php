<?php
/**
 * Fuel Price Scraper for MotorLink
 * 
 * This script scrapes fuel prices from globalpetrolprices.com
 * Should be run daily via cron job:
 * 0 6 * * * /usr/bin/php /path/to/scripts/scrape-fuel-prices.php
 * 
 * Or call via HTTP:
 * curl "http://yourdomain.com/scripts/scrape-fuel-prices.php?api_key=YOUR_KEY"
 */

require_once __DIR__ . '/../api-common.php';

// Security: Require API key
$apiKey = $_GET['api_key'] ?? '';
$expectedKey = 'MOTORLINK_FUEL_SCRAPER_KEY_2025'; // Change this in production!

if ($apiKey !== $expectedKey && php_sapi_name() !== 'cli') {
    http_response_code(401);
    die('Unauthorized');
}

try {
    $db = getDB();
    
    // Scrape petrol prices
    $petrolUrl = 'https://www.globalpetrolprices.com/Malawi/gasoline_prices/';
    $dieselUrl = 'https://www.globalpetrolprices.com/Malawi/diesel_prices/';
    
    $prices = [];
    
    // Function to scrape price from URL
    function scrapePrice($url, $fuelType) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        
        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($httpCode !== 200 || !empty($error)) {
            error_log("Failed to fetch $fuelType prices: HTTP $httpCode, Error: $error");
            return null;
        }
        
        // Try multiple patterns to extract price
        $patterns = [
            '/MWK\s*(\d+[.,]\d*)/i',
            '/Malawi.*?(\d+[.,]\d*)\s*MWK/i',
            '/price.*?(\d+[.,]\d*).*?MWK/i',
            '/(\d+[.,]\d*)\s*MWK.*?per.*?liter/i',
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $html, $matches)) {
                $price = str_replace(',', '.', $matches[1]);
                return (float)$price;
            }
        }
        
        // Try to find price in table format
        if (preg_match('/<td[^>]*>.*?(\d+[.,]\d*).*?<\/td>/i', $html, $matches)) {
            $price = str_replace(',', '.', $matches[1]);
            if ($price > 100 && $price < 10000) { // Sanity check
                return (float)$price;
            }
        }
        
        return null;
    }
    
    // Scrape petrol
    $petrolPrice = scrapePrice($petrolUrl, 'petrol');
    if ($petrolPrice) {
        $prices['petrol'] = $petrolPrice;
    }
    
    // Scrape diesel
    $dieselPrice = scrapePrice($dieselUrl, 'diesel');
    if ($dieselPrice) {
        $prices['diesel'] = $dieselPrice;
    }
    
    // Use fallback prices if scraping failed
    if (empty($prices['petrol'])) {
        // Get last known price or use default
        $stmt = $db->prepare("SELECT price_per_liter_mwk FROM fuel_prices WHERE fuel_type = 'petrol' ORDER BY date DESC LIMIT 1");
        $stmt->execute();
        $lastPrice = $stmt->fetchColumn();
        $prices['petrol'] = $lastPrice ?: 1850.00;
        error_log("Using fallback petrol price: " . $prices['petrol']);
    }
    
    if (empty($prices['diesel'])) {
        $stmt = $db->prepare("SELECT price_per_liter_mwk FROM fuel_prices WHERE fuel_type = 'diesel' ORDER BY date DESC LIMIT 1");
        $stmt->execute();
        $lastPrice = $stmt->fetchColumn();
        $prices['diesel'] = $lastPrice ?: 1950.00;
        error_log("Using fallback diesel price: " . $prices['diesel']);
    }
    
    // Deactivate old prices for today
    $db->prepare("UPDATE fuel_prices SET is_active = 0 WHERE date = CURDATE()")->execute();
    
    // Insert new prices
    $today = date('Y-m-d');
    $inserted = [];
    
    foreach ($prices as $fuelType => $price) {
        $stmt = $db->prepare("
            INSERT INTO fuel_prices 
            (fuel_type, price_per_liter_mwk, date, is_active, source, source_url, last_updated)
            VALUES (?, ?, ?, 1, 'globalpetrolprices.com', ?, NOW())
            ON DUPLICATE KEY UPDATE 
                price_per_liter_mwk = VALUES(price_per_liter_mwk),
                is_active = 1,
                last_updated = NOW()
        ");
        
        $sourceUrl = "https://www.globalpetrolprices.com/Malawi/{$fuelType}_prices/";
        $stmt->execute([$fuelType, $price, $today, $sourceUrl]);
        
        $inserted[$fuelType] = $price;
    }
    
    $message = "Fuel prices updated successfully: " . json_encode($inserted);
    error_log($message);
    
    if (php_sapi_name() === 'cli') {
        echo $message . "\n";
    } else {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Fuel prices updated',
            'prices' => $inserted,
            'date' => $today
        ]);
    }
    
} catch (Exception $e) {
    $errorMsg = "Fuel price scraper error: " . $e->getMessage();
    error_log($errorMsg);
    
    if (php_sapi_name() === 'cli') {
        echo $errorMsg . "\n";
    } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => $errorMsg]);
    }
}

