<?php

require_once __DIR__ . '/../api-common.php';
require_once __DIR__ . '/../ai-car-chat-api.php';
require_once __DIR__ . '/../ai-learning-api.php';

$failures = 0;
$cleanup = [];

function smokeOk($message) {
    echo "[OK] {$message}" . PHP_EOL;
}

function smokeFail($message) {
    global $failures;
    $failures++;
    echo "[FAIL] {$message}" . PHP_EOL;
}

function smokeAssert($condition, $message) {
    if ($condition) {
        smokeOk($message);
        return;
    }

    smokeFail($message);
}

function smokeFetchUserId(PDO $db) {
    $stmt = $db->query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
    $userId = $stmt ? $stmt->fetchColumn() : false;
    return $userId ? (int)$userId : 0;
}

function smokeFetchAnchorListing(PDO $db) {
    $stmt = $db->query("\n        SELECT cl.id, mk.name AS make_name, mo.name AS model_name, loc.name AS location_name\n        FROM car_listings cl\n        INNER JOIN car_makes mk ON cl.make_id = mk.id\n        INNER JOIN car_models mo ON cl.model_id = mo.id\n        LEFT JOIN locations loc ON cl.location_id = loc.id\n        WHERE cl.status = 'active'\n          AND cl.approval_status = 'approved'\n        ORDER BY cl.views_count DESC, cl.created_at DESC\n        LIMIT 1\n    ");

    return $stmt ? ($stmt->fetch(PDO::FETCH_ASSOC) ?: null) : null;
}

try {
    $db = getDB();
    ensureAIChatMemoryTables($db);
    ensureAIChatFeedbackTable($db);
    ensureAILearningSchema($db);

    $columns = $db->query("SHOW COLUMNS FROM ai_chat_feedback")->fetchAll(PDO::FETCH_COLUMN);
    smokeAssert(in_array('failure_type', $columns, true), 'feedback schema has failure_type');
    smokeAssert(in_array('correction_text', $columns, true), 'feedback schema has correction_text');
    smokeAssert(in_array('learning_status', $columns, true), 'feedback schema has learning_status');

    $userId = smokeFetchUserId($db);
    smokeAssert($userId > 0, 'smoke user available');
    if ($userId <= 0) {
        throw new RuntimeException('No user row is available for AI chat smoke tests.');
    }

    $cleanup[] = function() use ($db, $userId) {
        $stmt = $db->prepare("DELETE FROM ai_chat_user_memory WHERE user_id = ? AND source_message LIKE 'smoke:%'");
        $stmt->execute([$userId]);
        refreshAIChatUserSummary($db, $userId);
    };

    smokeAssert(detectCarHireQuery('Looking for car hire in Salima'), 'car hire intent detected');
    smokeAssert(detectGarageQuery('Find a garage in Blantyre for brakes'), 'garage intent detected');
    smokeAssert(detectDealerQuery('Show me dealers in Lilongwe'), 'dealer intent detected');
    smokeAssert(detectSearchQuery('Show me Toyota Sienta for sale in Lilongwe'), 'listing search intent detected');
    smokeAssert(detectCarSpecQuery('Toyota Sienta engine specs'), 'spec intent detected');
    smokeAssert(shouldRouteToPartsQuery('Toyota Sienta brake pads part number'), 'parts intent detected');
    smokeAssert(detectCarRecommendationQuery('best family car under 8 million'), 'recommendation intent detected');
    smokeAssert(detectFuelPriceQuery('current petrol price'), 'fuel price intent detected');
    smokeAssert(detectJourneyCostQuery('fuel cost for a trip from Lilongwe to Blantyre'), 'journey cost intent detected');

    $memoryMessage = 'Remember this is important: I prefer excellent condition automatic 4x4 Toyota Sienta in Lilongwe under 8 million for family trips.';
    smokeAssert(detectAIChatExplicitLearningTrigger($memoryMessage), 'explicit learning trigger detected');
    smokeAssert(!detectAIChatCorrectionSignal($memoryMessage), 'important note is not misclassified as correction');

    $facts = extractAIChatPreferenceFacts($db, $memoryMessage);
    smokeAssert(($facts['preferred_make'] ?? '') === 'Toyota', 'preference learns Toyota make');
    smokeAssert(($facts['preferred_model'] ?? '') === 'Sienta', 'preference learns Sienta model');
    smokeAssert(($facts['preferred_transmission'] ?? '') === 'automatic', 'preference learns automatic transmission');
    smokeAssert(($facts['preferred_drivetrain'] ?? '') === '4wd', 'preference learns 4WD drivetrain');
    smokeAssert(($facts['preferred_condition'] ?? '') === 'excellent', 'preference learns excellent condition');
    smokeAssert(($facts['search_purpose'] ?? '') === 'family', 'preference learns family purpose');

    $storedKeys = storeAIChatTriggeredLearningFacts($db, $userId, $memoryMessage, 'smoke');
    smokeAssert(count($storedKeys) >= 5, 'explicit learning stores multiple durable memory facts');
    $memoryRows = loadAIChatUserMemories($db, $userId, 20);
    $summary = buildAIChatUserSummaryText($memoryRows, []);
    smokeAssert(strpos($summary, 'Important notes:') !== false, 'summary includes important notes');
    smokeAssert(strpos($summary, 'Drivetrain: 4WD') !== false, 'summary includes drivetrain preference');

    $correctionMessage = 'Correction: Toyota Sienta listings should be treated as practical family cars, not sports cars.';
    smokeAssert(detectAIChatCorrectionSignal($correctionMessage), 'correction signal detected');
    $correctionFacts = extractAIChatExplicitMemoryFacts($db, $correctionMessage);
    smokeAssert(($correctionFacts[0]['type'] ?? '') === 'correction', 'correction memory fact is typed correctly');
    smokeAssert(count(storeAIChatTriggeredLearningFacts($db, $userId, $correctionMessage, 'smoke')) >= 1, 'correction fact stored');

    $feedbackMessage = 'Show me Toyota Sienta in Lilongwe under 8 million';
    $weakAnswer = 'I cannot find anything and I will not show alternatives.';
    $feedbackStored = storeAIChatFeedbackRecord($db, $userId, 'not-helpful', $feedbackMessage, $weakAnswer, [
        'failure_type' => classifyAIChatFeedbackFailure($feedbackMessage, $weakAnswer),
        'correction_text' => 'Use live listings, pricing filters, and useful alternatives when exact matches are thin.',
        'context' => ['smoke' => true]
    ]);
    smokeAssert($feedbackStored, 'not-helpful feedback stored');
    $cleanup[] = function() use ($db, $feedbackMessage, $weakAnswer) {
        $stmt = $db->prepare("DELETE FROM ai_chat_feedback WHERE user_message = ? AND ai_response = ?");
        $stmt->execute([$feedbackMessage, $weakAnswer]);
    };

    $stmt = $db->prepare("SELECT failure_type, correction_text, learning_status FROM ai_chat_feedback WHERE user_message = ? AND ai_response = ? ORDER BY id DESC LIMIT 1");
    $stmt->execute([$feedbackMessage, $weakAnswer]);
    $feedbackRow = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    smokeAssert(($feedbackRow['failure_type'] ?? '') === 'pricing', 'feedback classifies pricing failure');
    smokeAssert(trim((string)($feedbackRow['correction_text'] ?? '')) !== '', 'feedback stores correction text');
    smokeAssert(($feedbackRow['learning_status'] ?? '') === 'scheduled', 'feedback marks learning scheduled');

    $feedbackBlock = buildFeedbackSelfImprovementBlock($db);
    smokeAssert(strpos($feedbackBlock, 'AVOID PATTERNS') !== false, 'self-improvement block includes negative feedback');
    smokeAssert(strpos($feedbackBlock, 'Correction to respect') !== false, 'self-improvement block includes correction guidance');

    $cacheQuery = 'motorlink smoke cache toyota sienta ' . bin2hex(random_bytes(4));
    $cacheHash = hash('sha256', strtolower(trim($cacheQuery)));
    $stmt = $db->prepare("\n        INSERT INTO ai_web_cache (query_hash, query_text, summary, sources_json, learning_provider, learning_model, learning_status, created_at, updated_at)\n        VALUES (?, ?, ?, ?, 'smoke', 'deterministic', 'learned', NOW(), NOW())\n    ");
    $stmt->execute([$cacheHash, $cacheQuery, 'Smoke cache summary for Toyota Sienta family suitability.', json_encode([['title' => 'Smoke', 'link' => null]])]);
    $cleanup[] = function() use ($db, $cacheHash) {
        $stmt = $db->prepare("DELETE FROM ai_web_cache WHERE query_hash = ?");
        $stmt->execute([$cacheHash]);
    };
    $cacheResult = queryCacheTables($db, $cacheQuery);
    smokeAssert(!empty($cacheResult['found']) && ($cacheResult['cache_type'] ?? '') === 'web', 'exact learned web cache retrieval works');

    $dbInfo = queryGeneralCarInfoFromDatabase($db, 'Toyota Sienta specifications');
    smokeAssert(!empty($dbInfo['has_data']), 'general DB context finds Toyota Sienta');

    $priorityModels = getLearningPriorityModelsFromDatabase($db, 5);
    smokeAssert(!empty($priorityModels), 'DB-prioritized learning models returned');
    smokeAssert(array_key_exists('active_listing_count', $priorityModels[0] ?? []), 'priority models include active listing count');
    $summaryText = buildIntentionalDatabaseCarSummary([
        'make_name' => 'Toyota',
        'model_name' => 'Sienta',
        'active_listing_count' => 2,
        'listing_views' => 9,
        'listing_favorites' => 1
    ]);
    smokeAssert(strpos($summaryText, 'Marketplace demand in MotorLink DB') !== false, 'DB learning summary includes demand signal');
    smokeAssert(detectAIChatDatabaseLearningTrigger('refresh learning from my MotorLink database'), 'DB learning trigger detected');

    $rewriteRows = [
        ['memory_key' => 'preferred_make', 'memory_value' => 'Toyota', 'memory_type' => 'preference'],
        ['memory_key' => 'preferred_model', 'memory_value' => 'Sienta', 'memory_type' => 'preference'],
        ['memory_key' => 'preferred_location', 'memory_value' => 'Lilongwe', 'memory_type' => 'preference'],
        ['memory_key' => 'budget_max_mwk', 'memory_value' => '8000000', 'memory_type' => 'budget'],
        ['memory_key' => 'last_market_tool', 'memory_value' => 'listings', 'memory_type' => 'routing']
    ];
    $rewritten = buildPersistentMemoryAwareMessage($db, 'automatic only', $rewriteRows);
    smokeAssert($rewritten !== false && stripos($rewritten, 'Toyota') !== false && stripos($rewritten, 'Lilongwe') !== false, 'persistent memory rewrites short follow-up');

    $anchor = smokeFetchAnchorListing($db);
    if ($anchor) {
        $searchMessage = 'Show me ' . $anchor['make_name'] . ' ' . $anchor['model_name'];
        if (!empty($anchor['location_name'])) {
            $searchMessage .= ' in ' . $anchor['location_name'];
        }
        $retrievalContext = buildAIChatStructuredRetrievalContext($db, $searchMessage, [], 'https://motorlink.local/', [], null);
        smokeAssert(strpos($retrievalContext, 'LIVE MARKETPLACE RETRIEVAL') !== false, 'structured retrieval returns live marketplace context');
    } else {
        smokeOk('structured retrieval skipped because no approved active listing exists');
    }
} catch (Throwable $e) {
    smokeFail($e->getMessage());
} finally {
    for ($i = count($cleanup) - 1; $i >= 0; $i--) {
        try {
            $cleanup[$i]();
        } catch (Throwable $cleanupError) {
            echo '[WARN] cleanup failed: ' . $cleanupError->getMessage() . PHP_EOL;
        }
    }
}

if ($failures > 0) {
    echo "AI chat learning smoke suite completed with {$failures} failure(s)." . PHP_EOL;
    exit(1);
}

echo 'AI chat learning smoke suite completed successfully.' . PHP_EOL;
