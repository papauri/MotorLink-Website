<?php
/**
 * Live smoke checks for MotorLink recommendations.
 * Run: php scripts/recommendation_engine_smoke.php
 */

define('MOTORLINK_RECOMMENDATION_ENGINE_LIB_ONLY', true);
require_once __DIR__ . '/../recommendation_engine.php';

function smokeOk(string $message): void {
    echo "[OK] {$message}\n";
}

function smokeFail(string $message): void {
    echo "[FAIL] {$message}\n";
    exit(1);
}

function smokeAssert(bool $condition, string $message): void {
    if (!$condition) {
        smokeFail($message);
    }

    smokeOk($message);
}

function fetchCandidateListing(PDO $db): array {
    $sql = "
        SELECT
            l.id,
            l.title,
            cm.name AS make_name,
            cmo.name AS model_name,
            cmo.body_type,
            COUNT(candidate.id) AS similar_candidates
        FROM car_listings l
        INNER JOIN car_makes cm ON l.make_id = cm.id
        INNER JOIN car_models cmo ON l.model_id = cmo.id
        INNER JOIN car_listings candidate
            ON candidate.id != l.id
           AND candidate.status = 'active'
           AND candidate.approval_status = 'approved'
           AND (
                candidate.model_id = l.model_id
                OR candidate.make_id = l.make_id
                OR ABS(candidate.year - l.year) <= 4
                OR (l.price > 0 AND candidate.price BETWEEN l.price * 0.65 AND l.price * 1.45)
           )
        WHERE l.status = 'active'
          AND l.approval_status = 'approved'
        GROUP BY l.id, l.title, cm.name, cmo.name, cmo.body_type
        ORDER BY similar_candidates DESC, l.created_at DESC
        LIMIT 1
    ";

    $row = $db->query($sql)->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        smokeFail('No active approved listing with similar candidates was found');
    }

    return $row;
}

function fetchSmokeUserId(PDO $db): int {
    $userId = (int)$db->query("SELECT id FROM users ORDER BY id ASC LIMIT 1")->fetchColumn();
    if ($userId <= 0) {
        smokeFail('No user account exists for logged-in recommendation smoke checks');
    }

    return $userId;
}

function assertListingShape(array $listing, string $context): void {
    smokeAssert(!empty($listing['id']), "{$context}: listing id present");
    smokeAssert(!empty($listing['make_name']), "{$context}: make present");
    smokeAssert(!empty($listing['model_name']), "{$context}: model present");
    smokeAssert(array_key_exists('location_name', $listing), "{$context}: location field present");
}

$db = getDB();
$anchor = fetchCandidateListing($db);
$userId = fetchSmokeUserId($db);
$sessionId = 'smoke_rec_' . bin2hex(random_bytes(6));

try {
    echo "Recommendation smoke anchor: #{$anchor['id']} {$anchor['make_name']} {$anchor['model_name']} ({$anchor['similar_candidates']} candidate matches)\n";

    $engine = new RecommendationEngine($db, $userId, $sessionId);

    $similar = $engine->getSimilarListings((int)$anchor['id'], 6);
    smokeAssert(count($similar) > 0, 'similar listings returned results');
    smokeAssert(count($similar) <= 6, 'similar listings respect requested limit');
    smokeAssert(!in_array((int)$anchor['id'], array_map('intval', array_column($similar, 'id')), true), 'similar listings exclude current listing');
    assertListingShape($similar[0], 'similar listings top result');
    smokeAssert(isset($similar[0]['similarity_score']) && (float)$similar[0]['similarity_score'] > 0, 'similar listings include positive similarity score');

    $similarScores = array_map('floatval', array_column($similar, 'similarity_score'));
    $sortedScores = $similarScores;
    rsort($sortedScores, SORT_NUMERIC);
    smokeAssert($similarScores === $sortedScores, 'similar listings are sorted by descending score');

    $trending = $engine->getTrendingCars(6, (int)$anchor['id']);
    smokeAssert(count($trending) > 0, 'trending fallback returned results');
    smokeAssert(count($trending) <= 6, 'trending fallback respects requested limit');
    smokeAssert(!in_array((int)$anchor['id'], array_map('intval', array_column($trending, 'id')), true), 'trending fallback excludes requested listing');
    assertListingShape($trending[0], 'trending top result');

    $personalized = $engine->getPersonalizedRecommendations(6, (int)$anchor['id']);
    smokeAssert(count($personalized) > 0, 'personalized recommendations returned results');
    smokeAssert(count($personalized) <= 6, 'personalized recommendations respect requested limit');
    smokeAssert(!in_array((int)$anchor['id'], array_map('intval', array_column($personalized, 'id')), true), 'personalized recommendations exclude requested listing');
    assertListingShape($personalized[0], 'personalized top result');

    $guestEngine = new RecommendationEngine($db, null, $sessionId);
    smokeAssert($guestEngine->trackView((int)$anchor['id'], $sessionId), 'guest view tracking succeeds');

    $viewStmt = $db->prepare("SELECT view_count FROM guest_viewing_history WHERE session_id = ? AND listing_id = ? LIMIT 1");
    $viewStmt->execute([$sessionId, (int)$anchor['id']]);
    smokeAssert((int)$viewStmt->fetchColumn() >= 1, 'guest view tracking row is persisted');

    $prefs = [
        'makes' => [$anchor['make_name'] => 3],
        'models' => [$anchor['model_name'] => 2],
        'body_types' => [$anchor['body_type'] => 1],
        'price_range' => ['avg' => 5000000],
        'year_range' => ['avg' => 2018],
        'mileage_range' => ['avg' => 60000]
    ];
    smokeAssert($guestEngine->storePreferences($prefs, $sessionId), 'guest preference snapshot saves');

    $prefStmt = $db->prepare("SELECT preferences FROM guest_preferences WHERE session_id = ? LIMIT 1");
    $prefStmt->execute([$sessionId]);
    $storedPrefs = json_decode((string)$prefStmt->fetchColumn(), true);
    smokeAssert(is_array($storedPrefs) && isset($storedPrefs['makes'][$anchor['make_name']]), 'guest preference snapshot is readable JSON');

    smokeOk('Recommendation engine smoke suite completed');
} finally {
    $cleanupPrefs = $db->prepare("DELETE FROM guest_preferences WHERE session_id = ?");
    $cleanupPrefs->execute([$sessionId]);

    $cleanupViews = $db->prepare("DELETE FROM guest_viewing_history WHERE session_id = ?");
    $cleanupViews->execute([$sessionId]);
}
