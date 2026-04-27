<?php
/**
 * MotorLink AI Recommendation Engine
 * Learns from user preferences + browsing history for both logged-in and guest sessions.
 */

if (!defined('MOTORLINK_CONSTANTS_ONLY')) {
    define('MOTORLINK_CONSTANTS_ONLY', true);
}
require_once __DIR__ . '/api.php';

class RecommendationEngine {
    private $db;
    private $userId;
    private $sessionId;

    public function __construct($db, $userId = null, $sessionId = null) {
        $this->db = $db;
        $this->userId = $userId ? (int)$userId : null;
        $this->sessionId = $sessionId ? trim((string)$sessionId) : null;
    }

    /**
     * Get personalized recommendations based on browsing behavior and saved preferences.
     */
    public function getPersonalizedRecommendations($limit = 10, $excludeListingId = null) {
        $limit = max(1, min(30, (int)$limit));
        $excludeListingId = $excludeListingId ? (int)$excludeListingId : null;

        $preferences = $this->analyzeUserPreferences();
        $collaborative = $this->collaborativeFiltering();
        $content = $this->contentBasedFiltering($preferences, max($limit * 4, 32));

        $recommendations = $this->mergeAndRank($collaborative, $content, $preferences);

        if ($excludeListingId) {
            $recommendations = array_values(array_filter($recommendations, function ($item) use ($excludeListingId) {
                return (int)($item['id'] ?? 0) !== $excludeListingId;
            }));
        }

        if (empty($recommendations)) {
            $recommendations = $this->getTrendingCars(max($limit * 2, 12), $excludeListingId);
        }

        return $this->diversifyRecommendations($recommendations, $limit);
    }

    /**
     * Find cars that are genuinely similar to the listing a logged-in user is viewing.
     */
    public function getSimilarListings($listingId, $limit = 8) {
        $listingId = (int)$listingId;
        $limit = max(1, min(18, (int)$limit));

        if ($listingId <= 0) {
            return [];
        }

        $anchor = $this->getAnchorListing($listingId);
        if (!$anchor) {
            return [];
        }

        $targetPrice = max(1, (float)($anchor['price'] ?? 0));
        $targetMileage = max(1, (float)($anchor['mileage'] ?? 0));
        $targetYear = max(1990, (int)($anchor['year'] ?? date('Y')));
        $priceMin = $targetPrice > 1 ? $targetPrice * 0.65 : 0;
        $priceMax = $targetPrice > 1 ? $targetPrice * 1.45 : 999999999;
        $yearMin = $targetYear - 4;
        $yearMax = $targetYear + 4;
        $candidateLimit = min(80, max($limit * 6, 36));

        $sql = "
            SELECT
                cl.id,
                cl.title,
                cl.featured_image_id,
                cl.make_id,
                cl.model_id,
                cl.year,
                cl.price,
                cl.negotiable,
                cl.mileage,
                cl.fuel_type,
                cl.transmission,
                cl.condition_type,
                cl.exterior_color,
                cl.interior_color,
                cl.engine_size,
                cl.doors,
                cl.seats,
                cl.drivetrain,
                cl.location_id,
                cl.listing_type,
                cl.views_count,
                cl.favorites_count,
                cl.created_at,
                cl.updated_at,
                cm.name AS make_name,
                cmo.name AS model_name,
                cmo.body_type AS body_type,
                loc.name AS location_name,
                COALESCE(cl.featured_image_id,
                    (SELECT id FROM car_listing_images WHERE listing_id = cl.id ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1)
                ) AS primary_image_id,
                (
                    CASE WHEN cl.model_id = ? THEN 34 ELSE 0 END +
                    CASE WHEN cl.make_id = ? THEN 18 ELSE 0 END +
                    CASE WHEN cmo.body_type = ? THEN 12 ELSE 0 END +
                    CASE WHEN cl.fuel_type = ? THEN 7 ELSE 0 END +
                    CASE WHEN cl.transmission = ? THEN 6 ELSE 0 END +
                    CASE WHEN cl.drivetrain = ? THEN 5 ELSE 0 END +
                    CASE WHEN cl.condition_type = ? THEN 3 ELSE 0 END +
                    CASE WHEN cl.seats = ? THEN 4 ELSE 0 END +
                    GREATEST(0, 11 - (ABS(COALESCE(cl.year, ?) - ?) * 2.2)) +
                    GREATEST(0, 12 - ((ABS(COALESCE(cl.price, ?) - ?) / ?) * 24)) +
                    GREATEST(0, 6 - ((ABS(COALESCE(cl.mileage, ?) - ?) / ?) * 10)) +
                    CASE WHEN cl.location_id = ? THEN 3 ELSE 0 END +
                    CASE WHEN COALESCE(cl.featured_image_id,
                        (SELECT id FROM car_listing_images WHERE listing_id = cl.id ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1)
                    ) IS NOT NULL THEN 2 ELSE 0 END +
                    CASE WHEN cl.listing_type = 'premium' THEN 3 WHEN cl.listing_type = 'featured' THEN 2 ELSE 0 END +
                    LEAST(COALESCE(cl.views_count, 0) / 75, 4) +
                    LEAST(COALESCE(cl.favorites_count, 0) / 12, 3) +
                    GREATEST(0, 4 - (DATEDIFF(NOW(), cl.created_at) / 14))
                ) AS similarity_score
            FROM car_listings cl
            INNER JOIN car_makes cm ON cl.make_id = cm.id
            INNER JOIN car_models cmo ON cl.model_id = cmo.id
            INNER JOIN locations loc ON cl.location_id = loc.id
            WHERE cl.status = 'active'
              AND cl.approval_status = 'approved'
              AND cl.id != ?
              AND (
                  cl.model_id = ?
                  OR cl.make_id = ?
                  OR cmo.body_type = ?
                  OR cl.year BETWEEN ? AND ?
                  OR cl.price BETWEEN ? AND ?
                  OR cl.seats = ?
              )
            ORDER BY similarity_score DESC, cl.created_at DESC
            LIMIT {$candidateLimit}
        ";

        $params = [
            (int)$anchor['model_id'],
            (int)$anchor['make_id'],
            $anchor['body_type'],
            $anchor['fuel_type'],
            $anchor['transmission'],
            $anchor['drivetrain'],
            $anchor['condition_type'],
            (int)$anchor['seats'],
            $targetYear, $targetYear,
            $targetPrice, $targetPrice, $targetPrice,
            $targetMileage, $targetMileage, $targetMileage,
            (int)$anchor['location_id'],
            $listingId,
            (int)$anchor['model_id'],
            (int)$anchor['make_id'],
            $anchor['body_type'],
            $yearMin, $yearMax,
            $priceMin, $priceMax,
            (int)$anchor['seats']
        ];

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $rows = $this->decorateListingRows($stmt->fetchAll(PDO::FETCH_ASSOC));
            return array_slice($rows, 0, $limit);
        } catch (Exception $e) {
            error_log('getSimilarListings failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Analyze user preferences from behavior + stored preference snapshots.
     */
    private function analyzeUserPreferences() {
        $defaults = $this->getDefaultPreferences();
        $historyPrefs = $this->loadHistoryPreferences();
        $savedPrefs = $this->loadSavedListingPreferences();
        $storedPrefs = $this->loadStoredPreferences();

        $defaults['avg_price'] = $this->pickNumericPreference($historyPrefs['avg_price'] ?? null, $savedPrefs['avg_price'] ?? null, $storedPrefs['avg_price'] ?? null, $defaults['avg_price']);
        $defaults['avg_year'] = $this->pickNumericPreference($historyPrefs['avg_year'] ?? null, $savedPrefs['avg_year'] ?? null, $storedPrefs['avg_year'] ?? null, $defaults['avg_year']);
        $defaults['avg_mileage'] = $this->pickNumericPreference($historyPrefs['avg_mileage'] ?? null, $savedPrefs['avg_mileage'] ?? null, $storedPrefs['avg_mileage'] ?? null, $defaults['avg_mileage']);

        $defaults['preferred_makes'] = $this->mergePreferenceLists(
            $defaults['preferred_makes'],
            $historyPrefs['preferred_makes'] ?? [],
            $savedPrefs['preferred_makes'] ?? [],
            $storedPrefs['preferred_makes'] ?? []
        );

        $defaults['preferred_models'] = $this->mergePreferenceLists(
            $defaults['preferred_models'],
            $historyPrefs['preferred_models'] ?? [],
            $savedPrefs['preferred_models'] ?? [],
            $storedPrefs['preferred_models'] ?? []
        );

        $defaults['preferred_body_types'] = $this->mergePreferenceLists(
            $defaults['preferred_body_types'],
            $historyPrefs['preferred_body_types'] ?? [],
            $savedPrefs['preferred_body_types'] ?? [],
            $storedPrefs['preferred_body_types'] ?? []
        );

        $defaults['preferred_fuel_types'] = $this->mergePreferenceLists(
            $historyPrefs['preferred_fuel_types'] ?? [],
            $savedPrefs['preferred_fuel_types'] ?? [],
            $storedPrefs['preferred_fuel_types'] ?? []
        );

        $defaults['preferred_transmissions'] = $this->mergePreferenceLists(
            $historyPrefs['preferred_transmissions'] ?? [],
            $savedPrefs['preferred_transmissions'] ?? [],
            $storedPrefs['preferred_transmissions'] ?? []
        );

        $defaults['preferred_drivetrains'] = $this->mergePreferenceLists(
            $historyPrefs['preferred_drivetrains'] ?? [],
            $savedPrefs['preferred_drivetrains'] ?? [],
            $storedPrefs['preferred_drivetrains'] ?? []
        );

        $defaults['preferred_conditions'] = $this->mergePreferenceLists(
            $historyPrefs['preferred_conditions'] ?? [],
            $savedPrefs['preferred_conditions'] ?? [],
            $storedPrefs['preferred_conditions'] ?? []
        );

        $defaults['preferred_locations'] = $this->mergePreferenceLists(
            $historyPrefs['preferred_locations'] ?? [],
            $savedPrefs['preferred_locations'] ?? [],
            $storedPrefs['preferred_locations'] ?? []
        );

        $defaults['interaction_score'] = $this->calculateInteractionScore();

        return $defaults;
    }

    /**
     * Preference averages and dominant attributes from recent views.
     */
    private function loadHistoryPreferences() {
        $identity = null;
        $param = null;
        $historyTable = null;

        if ($this->userId) {
            $identity = 'user_id';
            $param = $this->userId;
            $historyTable = 'viewing_history';
        } elseif ($this->sessionId) {
            $identity = 'session_id';
            $param = $this->sessionId;
            $historyTable = 'guest_viewing_history';
        } else {
            return [];
        }

        try {
            // View-count weighted averages give stronger preference signals for
            // cars the user kept coming back to, rather than treating all views equally.
            $sql = "
                SELECT
                    SUM(cl.price * COALESCE(vh.view_count, 1))
                        / NULLIF(SUM(COALESCE(vh.view_count, 1)), 0)        AS avg_price,
                    SUM(cl.year  * COALESCE(vh.view_count, 1))
                        / NULLIF(SUM(COALESCE(vh.view_count, 1)), 0)        AS avg_year,
                    SUM(cl.mileage * COALESCE(vh.view_count, 1))
                        / NULLIF(SUM(COALESCE(vh.view_count, 1)), 0)        AS avg_mileage,
                    GROUP_CONCAT(DISTINCT cm.name
                        ORDER BY vh.view_count DESC SEPARATOR ',')          AS preferred_makes,
                    GROUP_CONCAT(DISTINCT cmo.name
                        ORDER BY vh.view_count DESC SEPARATOR ',')          AS preferred_models,
                    GROUP_CONCAT(DISTINCT cmo.body_type
                        ORDER BY vh.view_count DESC SEPARATOR ',')          AS preferred_body_types,
                    GROUP_CONCAT(DISTINCT cl.fuel_type
                        ORDER BY vh.view_count DESC SEPARATOR ',')          AS preferred_fuel_types,
                    GROUP_CONCAT(DISTINCT cl.transmission
                        ORDER BY vh.view_count DESC SEPARATOR ',')          AS preferred_transmissions,
                    GROUP_CONCAT(DISTINCT cl.drivetrain
                        ORDER BY vh.view_count DESC SEPARATOR ',')          AS preferred_drivetrains,
                    GROUP_CONCAT(DISTINCT cl.condition_type
                        ORDER BY vh.view_count DESC SEPARATOR ',')          AS preferred_conditions,
                    GROUP_CONCAT(DISTINCT loc.name
                        ORDER BY vh.view_count DESC SEPARATOR ',')          AS preferred_locations,
                    COUNT(DISTINCT vh.listing_id)                           AS total_views
                FROM {$historyTable} vh
                JOIN car_listings cl  ON vh.listing_id = cl.id
                JOIN car_makes cm     ON cl.make_id = cm.id
                JOIN car_models cmo   ON cl.model_id = cmo.id
                JOIN locations loc    ON cl.location_id = loc.id
                WHERE vh.{$identity} = ?
                AND vh.last_viewed > DATE_SUB(NOW(), INTERVAL 45 DAY)
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$param]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                return [];
            }

            return [
                'avg_price'              => !empty($row['avg_price'])  ? (float)$row['avg_price']  : null,
                'avg_year'               => !empty($row['avg_year'])   ? (float)$row['avg_year']   : null,
                'avg_mileage'            => !empty($row['avg_mileage'])? (float)$row['avg_mileage']: null,
                'preferred_makes'        => $this->normalizePreferenceList($row['preferred_makes']        ?? ''),
                'preferred_models'       => $this->normalizePreferenceList($row['preferred_models']       ?? ''),
                'preferred_body_types'   => $this->normalizePreferenceList($row['preferred_body_types']   ?? ''),
                'preferred_fuel_types'   => $this->normalizePreferenceList($row['preferred_fuel_types']   ?? ''),
                'preferred_transmissions'=> $this->normalizePreferenceList($row['preferred_transmissions']?? ''),
                'preferred_drivetrains'  => $this->normalizePreferenceList($row['preferred_drivetrains']  ?? ''),
                'preferred_conditions'   => $this->normalizePreferenceList($row['preferred_conditions']   ?? ''),
                'preferred_locations'    => $this->normalizePreferenceList($row['preferred_locations']    ?? ''),
            ];
        } catch (Exception $e) {
            error_log('Recommendation history preference query failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Saved cars are high-intent preference signals for logged-in buyers.
     */
    private function loadSavedListingPreferences() {
        if (!$this->userId) {
            return [];
        }

        try {
            $sql = "
                SELECT
                    AVG(cl.price) AS avg_price,
                    AVG(cl.year) AS avg_year,
                    AVG(cl.mileage) AS avg_mileage,
                    GROUP_CONCAT(DISTINCT cm.name ORDER BY sl.created_at DESC SEPARATOR ',') AS preferred_makes,
                    GROUP_CONCAT(DISTINCT cmo.name ORDER BY sl.created_at DESC SEPARATOR ',') AS preferred_models,
                    GROUP_CONCAT(DISTINCT cmo.body_type ORDER BY sl.created_at DESC SEPARATOR ',') AS preferred_body_types,
                    GROUP_CONCAT(DISTINCT cl.fuel_type ORDER BY sl.created_at DESC SEPARATOR ',') AS preferred_fuel_types,
                    GROUP_CONCAT(DISTINCT cl.transmission ORDER BY sl.created_at DESC SEPARATOR ',') AS preferred_transmissions,
                    GROUP_CONCAT(DISTINCT cl.drivetrain ORDER BY sl.created_at DESC SEPARATOR ',') AS preferred_drivetrains,
                    GROUP_CONCAT(DISTINCT cl.condition_type ORDER BY sl.created_at DESC SEPARATOR ',') AS preferred_conditions,
                    GROUP_CONCAT(DISTINCT loc.name ORDER BY sl.created_at DESC SEPARATOR ',') AS preferred_locations
                FROM saved_listings sl
                JOIN car_listings cl ON sl.listing_id = cl.id
                JOIN car_makes cm ON cl.make_id = cm.id
                JOIN car_models cmo ON cl.model_id = cmo.id
                JOIN locations loc ON cl.location_id = loc.id
                WHERE sl.user_id = ?
                  AND cl.status = 'active'
                  AND cl.approval_status = 'approved'
                  AND sl.created_at > DATE_SUB(NOW(), INTERVAL 180 DAY)
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$this->userId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                return [];
            }

            return [
                'avg_price' => !empty($row['avg_price']) ? (float)$row['avg_price'] : null,
                'avg_year' => !empty($row['avg_year']) ? (float)$row['avg_year'] : null,
                'avg_mileage' => !empty($row['avg_mileage']) ? (float)$row['avg_mileage'] : null,
                'preferred_makes' => $this->normalizePreferenceList($row['preferred_makes'] ?? ''),
                'preferred_models' => $this->normalizePreferenceList($row['preferred_models'] ?? ''),
                'preferred_body_types' => $this->normalizePreferenceList($row['preferred_body_types'] ?? ''),
                'preferred_fuel_types' => $this->normalizePreferenceList($row['preferred_fuel_types'] ?? ''),
                'preferred_transmissions' => $this->normalizePreferenceList($row['preferred_transmissions'] ?? ''),
                'preferred_drivetrains' => $this->normalizePreferenceList($row['preferred_drivetrains'] ?? ''),
                'preferred_conditions' => $this->normalizePreferenceList($row['preferred_conditions'] ?? ''),
                'preferred_locations' => $this->normalizePreferenceList($row['preferred_locations'] ?? ''),
            ];
        } catch (Exception $e) {
            error_log('Recommendation saved preference query failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Pull client-snapshotted preferences (sent by frontend) for better cold-start quality.
     */
    private function loadStoredPreferences() {
        try {
            if ($this->userId) {
                $stmt = $this->db->prepare("SELECT preferences FROM user_preferences WHERE user_id = ? LIMIT 1");
                $stmt->execute([$this->userId]);
            } elseif ($this->sessionId) {
                $stmt = $this->db->prepare("SELECT preferences FROM guest_preferences WHERE session_id = ? LIMIT 1");
                $stmt->execute([$this->sessionId]);
            } else {
                return [];
            }

            $raw = $stmt->fetchColumn();
            if (!$raw) {
                return [];
            }

            $decoded = json_decode($raw, true);
            if (!is_array($decoded)) {
                return [];
            }

            $stored = [
                'preferred_makes'         => $this->normalizePreferenceList($decoded['preferred_makes']  ?? ($decoded['makes']       ?? [])),
                'preferred_models'        => $this->normalizePreferenceList($decoded['preferred_models'] ?? ($decoded['models']      ?? [])),
                'preferred_body_types'    => $this->normalizePreferenceList($decoded['preferred_body_types'] ?? ($decoded['body_types'] ?? [])),
                'preferred_fuel_types'    => $this->normalizePreferenceList($decoded['preferred_fuel_types']  ?? ($decoded['fuel_types']  ?? [])),
                'preferred_transmissions' => $this->normalizePreferenceList($decoded['preferred_transmissions'] ?? ($decoded['transmissions'] ?? [])),
                'preferred_drivetrains'   => $this->normalizePreferenceList($decoded['preferred_drivetrains'] ?? ($decoded['drivetrains'] ?? [])),
                'preferred_conditions'    => $this->normalizePreferenceList($decoded['preferred_conditions'] ?? ($decoded['conditions'] ?? [])),
                'preferred_locations'     => $this->normalizePreferenceList($decoded['preferred_locations'] ?? ($decoded['locations'] ?? [])),
                'avg_price' => null,
                'avg_year'  => null,
                'avg_mileage' => null
            ];

            if (!empty($decoded['price_range']['avg'])) {
                $stored['avg_price'] = (float)$decoded['price_range']['avg'];
            } elseif (!empty($decoded['avgPrice'])) {
                $stored['avg_price'] = (float)$decoded['avgPrice'];
            }

            if (!empty($decoded['year_range']['avg'])) {
                $stored['avg_year'] = (float)$decoded['year_range']['avg'];
            } elseif (!empty($decoded['avgYear'])) {
                $stored['avg_year'] = (float)$decoded['avgYear'];
            }

            if (!empty($decoded['mileage_range']['avg'])) {
                $stored['avg_mileage'] = (float)$decoded['mileage_range']['avg'];
            }

            return $stored;
        } catch (Exception $e) {
            error_log('Recommendation stored preference query failed: ' . $e->getMessage());
            return [];
        }
    }

    private function pickNumericPreference(...$values) {
        foreach ($values as $value) {
            if (is_numeric($value) && (float)$value > 0) {
                return (float)$value;
            }
        }

        return 0.0;
    }

    private function mergePreferenceLists(...$lists) {
        $counts = [];

        foreach ($lists as $list) {
            foreach ($this->normalizePreferenceList($list) as $item) {
                if ($item === '') {
                    continue;
                }

                if (!isset($counts[$item])) {
                    $counts[$item] = 0;
                }
                $counts[$item]++;
            }
        }

        arsort($counts);
        return array_slice(array_keys($counts), 0, 8);
    }

    private function normalizePreferenceList($value) {
        if (is_string($value)) {
            $parts = array_map('trim', explode(',', $value));
            $parts = array_values(array_filter($parts, function ($item) {
                return $item !== '';
            }));
            return array_slice($parts, 0, 8);
        }

        if (!is_array($value)) {
            return [];
        }

        if (array_values($value) === $value) {
            $normalized = array_values(array_filter(array_map('trim', $value), function ($item) {
                return $item !== '';
            }));
            return array_slice($normalized, 0, 8);
        }

        arsort($value);
        $keys = array_map('trim', array_keys($value));
        $keys = array_values(array_filter($keys, function ($item) {
            return $item !== '';
        }));
        return array_slice($keys, 0, 8);
    }

    /**
     * Interaction score from explicit user actions.
     */
    private function calculateInteractionScore() {
        if (!$this->userId) {
            return 0;
        }

        $score = 0.0;

        try {
            $sql = "
                SELECT
                    SUM(CASE
                        WHEN action_type = 'view' THEN 1
                        WHEN action_type = 'favorite' THEN 3
                        WHEN action_type = 'inquiry' THEN 5
                        WHEN action_type = 'share' THEN 2
                        ELSE 0
                    END) AS score
                FROM user_interactions
                WHERE user_id = ?
                AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$this->userId]);
            $score += (float)($stmt->fetchColumn() ?: 0);
        } catch (Exception $e) {
            // Table may not be available in all environments.
        }

        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) * 4 FROM saved_listings WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 180 DAY)");
            $stmt->execute([$this->userId]);
            $score += (float)($stmt->fetchColumn() ?: 0);
        } catch (Exception $e) {
            // Optional table.
        }

        try {
            $stmt = $this->db->prepare("SELECT COALESCE(SUM(view_count), 0) FROM viewing_history WHERE user_id = ? AND last_viewed > DATE_SUB(NOW(), INTERVAL 45 DAY)");
            $stmt->execute([$this->userId]);
            $score += min((float)($stmt->fetchColumn() ?: 0), 80);
        } catch (Exception $e) {
            // Optional table.
        }

        return $score;
    }

    /**
     * Collaborative filtering for logged-in users.
     */
    private function collaborativeFiltering() {
        if (!$this->userId) {
            return [];
        }

        try {
            // Use SUM(view_count) instead of COUNT(DISTINCT listing_id) so users who
            // repeatedly viewed the same shared listing produce a stronger similarity signal.
            $sql = "
                SELECT
                    other.user_id,
                    SUM(COALESCE(other.view_count, 1)) AS common_views,
                    GROUP_CONCAT(DISTINCT recommended.listing_id) AS recommendations
                FROM viewing_history vh
                JOIN viewing_history other       ON vh.listing_id = other.listing_id
                JOIN viewing_history recommended ON other.user_id = recommended.user_id
                LEFT JOIN viewing_history already_seen
                    ON already_seen.listing_id = recommended.listing_id
                    AND already_seen.user_id = ?
                WHERE vh.user_id = ?
                AND other.user_id != ?
                AND already_seen.id IS NULL
                GROUP BY other.user_id
                HAVING common_views >= 2
                ORDER BY common_views DESC
                LIMIT 12
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$this->userId, $this->userId, $this->userId]);

            $recommendationMap = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                if (empty($row['recommendations'])) {
                    continue;
                }

                $listingIds = array_filter(array_map('trim', explode(',', $row['recommendations'])));
                foreach ($listingIds as $id) {
                    $key = (int)$id;
                    if (!isset($recommendationMap[$key])) {
                        $recommendationMap[$key] = 0;
                    }
                    $recommendationMap[$key] += (int)$row['common_views'];
                }
            }

            if (empty($recommendationMap)) {
                return [];
            }

            $details = $this->fetchListingDetails(array_keys($recommendationMap));
            foreach ($details as &$item) {
                $id = (int)($item['id'] ?? 0);
                $item['_collab_weight'] = (float)($recommendationMap[$id] ?? 0);
            }
            unset($item);

            return $details;
        } catch (Exception $e) {
            error_log('Collaborative filtering failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Content-based filtering from preferences.
     */
    private function contentBasedFiltering($preferences, $limit = 24) {
        $limit = max(8, min(60, (int)$limit));

        $avgPrice   = max(1,    (float)($preferences['avg_price']   ?? 5000000));
        $avgYear    = max(1990, (float)($preferences['avg_year']    ?? 2018));
        $avgMileage = max(1,    (float)($preferences['avg_mileage'] ?? 50000));

        $preferredMakes         = $this->normalizePreferenceList($preferences['preferred_makes']         ?? []);
        $preferredModels        = $this->normalizePreferenceList($preferences['preferred_models']        ?? []);
        $preferredBodyTypes     = $this->normalizePreferenceList($preferences['preferred_body_types']    ?? []);
        $preferredFuelTypes     = $this->normalizePreferenceList($preferences['preferred_fuel_types']    ?? []);
        $preferredTransmissions = $this->normalizePreferenceList($preferences['preferred_transmissions'] ?? []);
        $preferredDrivetrains   = $this->normalizePreferenceList($preferences['preferred_drivetrains']   ?? []);
        $preferredConditions    = $this->normalizePreferenceList($preferences['preferred_conditions']    ?? []);
        $preferredLocations     = $this->normalizePreferenceList($preferences['preferred_locations']     ?? []);

        // Lower score = better match (similarity distance, not ranking score).
        // Price/year/mileage deviation weights sum to 0.76; attribute bonuses bring it down further.
        $scoreSql = "
            ABS(COALESCE(cl.price,   ?) - ?) / ? * 0.34 +
            ABS(COALESCE(cl.year,    ?) - ?) / 12 * 0.20 +
            ABS(COALESCE(cl.mileage, ?) - ?) / ? * 0.16
        ";

        $params = [
            $avgPrice,   $avgPrice,   $avgPrice,
            $avgYear,    $avgYear,
            $avgMileage, $avgMileage, $avgMileage
        ];

        if (!empty($preferredMakes)) {
            $placeholders = implode(',', array_fill(0, count($preferredMakes), '?'));
            $scoreSql .= " + CASE WHEN cm.name IN ({$placeholders}) THEN -0.22 ELSE 0 END";
            $params = array_merge($params, $preferredMakes);
        }

        if (!empty($preferredModels)) {
            $placeholders = implode(',', array_fill(0, count($preferredModels), '?'));
            $scoreSql .= " + CASE WHEN cmo.name IN ({$placeholders}) THEN -0.28 ELSE 0 END";
            $params = array_merge($params, $preferredModels);
        }

        if (!empty($preferredBodyTypes)) {
            $placeholders = implode(',', array_fill(0, count($preferredBodyTypes), '?'));
            $scoreSql .= " + CASE WHEN cmo.body_type IN ({$placeholders}) THEN -0.12 ELSE 0 END";
            $params = array_merge($params, $preferredBodyTypes);
        }

        if (!empty($preferredFuelTypes)) {
            $placeholders = implode(',', array_fill(0, count($preferredFuelTypes), '?'));
            $scoreSql .= " + CASE WHEN cl.fuel_type IN ({$placeholders}) THEN -0.08 ELSE 0 END";
            $params = array_merge($params, $preferredFuelTypes);
        }

        if (!empty($preferredTransmissions)) {
            $placeholders = implode(',', array_fill(0, count($preferredTransmissions), '?'));
            $scoreSql .= " + CASE WHEN cl.transmission IN ({$placeholders}) THEN -0.05 ELSE 0 END";
            $params = array_merge($params, $preferredTransmissions);
        }

        if (!empty($preferredDrivetrains)) {
            $placeholders = implode(',', array_fill(0, count($preferredDrivetrains), '?'));
            $scoreSql .= " + CASE WHEN cl.drivetrain IN ({$placeholders}) THEN -0.05 ELSE 0 END";
            $params = array_merge($params, $preferredDrivetrains);
        }

        if (!empty($preferredConditions)) {
            $placeholders = implode(',', array_fill(0, count($preferredConditions), '?'));
            $scoreSql .= " + CASE WHEN cl.condition_type IN ({$placeholders}) THEN -0.04 ELSE 0 END";
            $params = array_merge($params, $preferredConditions);
        }

        if (!empty($preferredLocations)) {
            $placeholders = implode(',', array_fill(0, count($preferredLocations), '?'));
            $scoreSql .= " + CASE WHEN loc.name IN ({$placeholders}) THEN -0.05 ELSE 0 END";
            $params = array_merge($params, $preferredLocations);
        }

        $scoreSql .= " + CASE WHEN COALESCE(cl.featured_image_id, (SELECT id FROM car_listing_images WHERE listing_id = cl.id ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1)) IS NOT NULL THEN -0.04 ELSE 0.08 END";
        $scoreSql .= " + CASE WHEN cl.listing_type = 'premium' THEN -0.04 WHEN cl.listing_type = 'featured' THEN -0.025 ELSE 0 END";

        // Exclude listings the user has already viewed in the past 7 days
        // so recommendations are always fresh discoveries, not repeats.
        $excludeViewedSql = '';
        if ($this->userId) {
            $excludeViewedSql = "
                AND cl.id NOT IN (
                    SELECT listing_id FROM viewing_history
                    WHERE user_id = ?
                    AND last_viewed > DATE_SUB(NOW(), INTERVAL 7 DAY)
                )
            ";
            $params[] = $this->userId;

            $excludeViewedSql .= "
                AND cl.id NOT IN (
                    SELECT listing_id FROM saved_listings
                    WHERE user_id = ?
                )
            ";
            $params[] = $this->userId;
        }

        $sql = "
            SELECT
                cl.id,
                cl.title,
                cl.featured_image_id,
                cl.make_id,
                cl.model_id,
                cl.year,
                cl.price,
                cl.negotiable,
                cl.mileage,
                cl.fuel_type,
                cl.transmission,
                cl.condition_type,
                cl.exterior_color,
                cl.interior_color,
                cl.engine_size,
                cl.doors,
                cl.seats,
                cl.drivetrain,
                cl.location_id,
                cl.listing_type,
                cl.views_count,
                cl.favorites_count,
                cl.created_at,
                cl.updated_at,
                cm.name AS make_name,
                cmo.name AS model_name,
                cmo.body_type AS body_type,
                loc.name AS location_name,
                COALESCE(cl.featured_image_id,
                    (SELECT id FROM car_listing_images WHERE listing_id = cl.id ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1)
                ) AS primary_image_id,
                ({$scoreSql}) AS similarity_score
            FROM car_listings cl
            JOIN car_makes cm  ON cl.make_id    = cm.id
            JOIN car_models cmo ON cl.model_id  = cmo.id
            JOIN locations loc  ON cl.location_id = loc.id
            WHERE cl.status = 'active'
            AND cl.approval_status = 'approved'
            {$excludeViewedSql}
            ORDER BY similarity_score ASC, cl.created_at DESC
            LIMIT {$limit}
        ";

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            return $this->decorateListingRows($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Exception $e) {
            error_log('Content filtering failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Merge and rank recommendations from different signals.
     */
    private function mergeAndRank($collaborative, $content, $preferences) {
        $merged = [];
        $preferredMakes         = $this->normalizePreferenceList($preferences['preferred_makes']         ?? []);
        $preferredModels        = $this->normalizePreferenceList($preferences['preferred_models']        ?? []);
        $preferredBodyTypes     = $this->normalizePreferenceList($preferences['preferred_body_types']    ?? []);
        $preferredFuelTypes     = $this->normalizePreferenceList($preferences['preferred_fuel_types']    ?? []);
        $preferredTransmissions = $this->normalizePreferenceList($preferences['preferred_transmissions'] ?? []);
        $preferredDrivetrains   = $this->normalizePreferenceList($preferences['preferred_drivetrains']   ?? []);
        $preferredConditions    = $this->normalizePreferenceList($preferences['preferred_conditions']    ?? []);
        $preferredLocations     = $this->normalizePreferenceList($preferences['preferred_locations']     ?? []);

        foreach ($collaborative as $item) {
            $id = (int)($item['id'] ?? 0);
            if ($id <= 0) {
                continue;
            }

            if (!isset($merged[$id])) {
                $merged[$id] = $item;
                $merged[$id]['score'] = 0.0;
            }

            $collabWeight = (float)($item['_collab_weight'] ?? 1);
            $merged[$id]['score'] += 0.45 + min($collabWeight / 20, 0.20);
        }

        foreach ($content as $item) {
            $id = (int)($item['id'] ?? 0);
            if ($id <= 0) {
                continue;
            }

            if (!isset($merged[$id])) {
                $merged[$id] = $item;
                $merged[$id]['score'] = 0.0;
            }

            $similarity = (float)($item['similarity_score'] ?? 3.0);
            $normalized = max(0, 1 - min($similarity, 3.0) / 3.0);
            $merged[$id]['score'] += 0.40 * $normalized;

            if (!empty($item['make_name']) && in_array($item['make_name'], $preferredMakes, true)) {
                $merged[$id]['score'] += 0.06;
            }

            if (!empty($item['model_name']) && in_array($item['model_name'], $preferredModels, true)) {
                $merged[$id]['score'] += 0.08;
            }

            if (!empty($item['body_type']) && in_array($item['body_type'], $preferredBodyTypes, true)) {
                $merged[$id]['score'] += 0.04;
            }

            if (!empty($item['fuel_type']) && in_array($item['fuel_type'], $preferredFuelTypes, true)) {
                $merged[$id]['score'] += 0.04;
            }

            if (!empty($item['transmission']) && in_array($item['transmission'], $preferredTransmissions, true)) {
                $merged[$id]['score'] += 0.03;
            }

            if (!empty($item['drivetrain']) && in_array($item['drivetrain'], $preferredDrivetrains, true)) {
                $merged[$id]['score'] += 0.03;
            }

            if (!empty($item['condition_type']) && in_array($item['condition_type'], $preferredConditions, true)) {
                $merged[$id]['score'] += 0.025;
            }

            if (!empty($item['location_name']) && in_array($item['location_name'], $preferredLocations, true)) {
                $merged[$id]['score'] += 0.025;
            }

            if (!empty($item['primary_image_id']) || !empty($item['featured_image_id'])) {
                $merged[$id]['score'] += 0.025;
            }
        }

        $engagementBoost = min(((float)($preferences['interaction_score'] ?? 0)) / 220, 0.08);
        foreach ($merged as &$item) {
            $item['score'] += $engagementBoost;
        }
        unset($item);

        $this->addRecencyBonus($merged);
        $this->addPopularityBonus($merged);

        uasort($merged, function ($a, $b) {
            return ((float)$b['score']) <=> ((float)$a['score']);
        });

        return array_values($merged);
    }

    private function addRecencyBonus(&$items) {
        foreach ($items as &$item) {
            if (empty($item['created_at'])) {
                continue;
            }

            $ageSeconds = time() - strtotime((string)$item['created_at']);
            $daysOld = $ageSeconds / 86400;

            if ($daysOld <= 3) {
                $item['score'] += 0.14;
            } elseif ($daysOld <= 10) {
                $item['score'] += 0.08;
            } elseif ($daysOld <= 21) {
                $item['score'] += 0.04;
            }
        }
        unset($item);
    }

    private function addPopularityBonus(&$items) {
        $ids = array_values(array_filter(array_map('intval', array_column($items, 'id'))));
        if (empty($ids)) {
            return;
        }

        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $popularity = [];

        try {
            $sql = "
                SELECT listing_id, SUM(COALESCE(view_count, 1)) AS views, COUNT(DISTINCT user_id) AS unique_views
                FROM viewing_history
                WHERE listing_id IN ({$placeholders})
                AND last_viewed > DATE_SUB(NOW(), INTERVAL 10 DAY)
                GROUP BY listing_id
            ";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($ids);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $listingId = (int)$row['listing_id'];
                $popularity[$listingId] = [
                    'views' => (int)$row['views'],
                    'unique' => (int)$row['unique_views']
                ];
            }
        } catch (Exception $e) {
            // Optional table.
        }

        try {
            $sql = "
                SELECT listing_id, SUM(COALESCE(view_count, 1)) AS views, COUNT(DISTINCT session_id) AS unique_views
                FROM guest_viewing_history
                WHERE listing_id IN ({$placeholders})
                AND last_viewed > DATE_SUB(NOW(), INTERVAL 10 DAY)
                GROUP BY listing_id
            ";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($ids);
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $listingId = (int)$row['listing_id'];
                if (!isset($popularity[$listingId])) {
                    $popularity[$listingId] = ['views' => 0, 'unique' => 0];
                }
                $popularity[$listingId]['views'] += (int)$row['views'];
                $popularity[$listingId]['unique'] += (int)$row['unique_views'];
            }
        } catch (Exception $e) {
            // Optional table.
        }

        foreach ($items as &$item) {
            $id = (int)($item['id'] ?? 0);
            if (!isset($popularity[$id])) {
                continue;
            }

            $views = (int)$popularity[$id]['views'];
            $unique = (int)$popularity[$id]['unique'];
            $item['score'] += min(($views / 120), 0.10) + min(($unique / 80), 0.06);
        }
        unset($item);

        try {
            $sql = "
                SELECT listing_id, COUNT(*) AS saves
                FROM saved_listings
                WHERE listing_id IN ({$placeholders})
                GROUP BY listing_id
            ";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($ids);
            $savedCounts = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $savedCounts[(int)$row['listing_id']] = (int)$row['saves'];
            }

            foreach ($items as &$item) {
                $id = (int)($item['id'] ?? 0);
                if (isset($savedCounts[$id])) {
                    $item['score'] += min($savedCounts[$id] / 45, 0.07);
                }
            }
            unset($item);
        } catch (Exception $e) {
            // Optional table.
        }
    }

    private function fetchListingDetails($listingIds) {
        $listingIds = array_values(array_filter(array_map('intval', $listingIds)));
        if (empty($listingIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($listingIds), '?'));
        $sql = "
            SELECT
                cl.id,
                cl.title,
                cl.featured_image_id,
                cl.make_id,
                cl.model_id,
                cl.year,
                cl.price,
                cl.negotiable,
                cl.mileage,
                cl.fuel_type,
                cl.transmission,
                cl.condition_type,
                cl.exterior_color,
                cl.interior_color,
                cl.engine_size,
                cl.doors,
                cl.seats,
                cl.drivetrain,
                cl.location_id,
                cl.listing_type,
                cl.views_count,
                cl.favorites_count,
                cl.created_at,
                cl.updated_at,
                cm.name AS make_name,
                cmo.name AS model_name,
                cmo.body_type AS body_type,
                loc.name AS location_name,
                COALESCE(cl.featured_image_id,
                    (SELECT id FROM car_listing_images WHERE listing_id = cl.id ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1)
                ) AS primary_image_id
            FROM car_listings cl
            JOIN car_makes cm ON cl.make_id = cm.id
            JOIN car_models cmo ON cl.model_id = cmo.id
            JOIN locations loc ON cl.location_id = loc.id
            WHERE cl.id IN ({$placeholders})
            AND cl.status = 'active'
            AND cl.approval_status = 'approved'
        ";

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($listingIds);
            return $this->decorateListingRows($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Exception $e) {
            error_log('fetchListingDetails failed: ' . $e->getMessage());
            return [];
        }
    }

    private function getAnchorListing($listingId) {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    cl.id,
                    cl.title,
                    cl.featured_image_id,
                    cl.make_id,
                    cl.model_id,
                    cl.year,
                    cl.price,
                    cl.negotiable,
                    cl.mileage,
                    cl.fuel_type,
                    cl.transmission,
                    cl.condition_type,
                    cl.exterior_color,
                    cl.interior_color,
                    cl.engine_size,
                    cl.doors,
                    cl.seats,
                    cl.drivetrain,
                    cl.location_id,
                    cl.listing_type,
                    cl.views_count,
                    cl.favorites_count,
                    cl.created_at,
                    cl.updated_at,
                    cm.name AS make_name,
                    cmo.name AS model_name,
                    cmo.body_type AS body_type,
                    loc.name AS location_name
                FROM car_listings cl
                INNER JOIN car_makes cm ON cl.make_id = cm.id
                INNER JOIN car_models cmo ON cl.model_id = cmo.id
                INNER JOIN locations loc ON cl.location_id = loc.id
                WHERE cl.id = ?
                  AND cl.status = 'active'
                  AND cl.approval_status = 'approved'
                LIMIT 1
            ");
            $stmt->execute([(int)$listingId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ?: null;
        } catch (Exception $e) {
            error_log('getAnchorListing failed: ' . $e->getMessage());
            return null;
        }
    }

    private function decorateListingRows($rows) {
        if (!is_array($rows)) {
            return [];
        }

        foreach ($rows as &$row) {
            if (empty($row['featured_image_id']) && !empty($row['primary_image_id'])) {
                $row['featured_image_id'] = (int)$row['primary_image_id'];
            }

            if (!empty($row['similarity_score'])) {
                $row['similarity_score'] = round((float)$row['similarity_score'], 4);
                $row['match_percent'] = (int)max(1, min(99, round(((float)$row['similarity_score'] / 96) * 100)));
            }
        }
        unset($row);

        return $rows;
    }

    private function diversifyRecommendations($items, $limit) {
        $limit = max(1, min(30, (int)$limit));
        $selected = [];
        $deferred = [];
        $makeCounts = [];
        $modelCounts = [];

        foreach ($items as $item) {
            $make = strtolower((string)($item['make_name'] ?? 'unknown'));
            $model = strtolower((string)($item['model_name'] ?? 'unknown'));

            if (($makeCounts[$make] ?? 0) >= 3 || ($modelCounts[$model] ?? 0) >= 2) {
                $deferred[] = $item;
                continue;
            }

            $selected[] = $item;
            $makeCounts[$make] = ($makeCounts[$make] ?? 0) + 1;
            $modelCounts[$model] = ($modelCounts[$model] ?? 0) + 1;

            if (count($selected) >= $limit) {
                return $selected;
            }
        }

        foreach ($deferred as $item) {
            $selected[] = $item;
            if (count($selected) >= $limit) {
                break;
            }
        }

        return array_slice($selected, 0, $limit);
    }

    private function getDefaultPreferences() {
        return [
            'avg_price'               => 5000000,
            'avg_year'                => 2018,
            'avg_mileage'             => 50000,
            'preferred_makes'         => ['Toyota', 'Nissan', 'Mazda'],
            'preferred_models'        => [],
            'preferred_body_types'    => ['sedan', 'suv', 'crossover'],
            'preferred_fuel_types'    => [],
            'preferred_transmissions' => [],
            'preferred_drivetrains'   => [],
            'preferred_conditions'    => [],
            'preferred_locations'     => [],
            'interaction_score'       => 0
        ];
    }

    /**
     * Track listing view (guest or authenticated).
     */
    public function trackView($listingId, $sessionId = null) {
        $listingId = (int)$listingId;
        $sessionId = $sessionId ? trim((string)$sessionId) : $this->sessionId;

        if ($listingId <= 0) {
            return false;
        }

        if ($this->userId) {
            try {
                $sql = "
                    INSERT INTO viewing_history (user_id, listing_id, viewed_at, view_count, last_viewed)
                    VALUES (?, ?, NOW(), 1, NOW())
                    ON DUPLICATE KEY UPDATE
                        view_count = view_count + 1,
                        last_viewed = NOW(),
                        viewed_at = NOW()
                ";

                $stmt = $this->db->prepare($sql);
                $stmt->execute([$this->userId, $listingId]);
                return true;
            } catch (Exception $e) {
                try {
                    $fallback = $this->db->prepare("INSERT INTO viewing_history (user_id, listing_id, viewed_at, view_count, last_viewed) VALUES (?, ?, NOW(), 1, NOW())");
                    $fallback->execute([$this->userId, $listingId]);
                    return true;
                } catch (Exception $inner) {
                    error_log('trackView user failed: ' . $inner->getMessage());
                    return false;
                }
            }
        }

        if (!$sessionId) {
            return false;
        }

        try {
            $sql = "
                INSERT INTO guest_viewing_history (session_id, listing_id, viewed_at, view_count, last_viewed)
                VALUES (?, ?, NOW(), 1, NOW())
                ON DUPLICATE KEY UPDATE
                    view_count = view_count + 1,
                    last_viewed = NOW(),
                    viewed_at = NOW()
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$sessionId, $listingId]);
            return true;
        } catch (Exception $e) {
            try {
                $fallback = $this->db->prepare("INSERT INTO guest_viewing_history (session_id, listing_id, viewed_at, view_count, last_viewed) VALUES (?, ?, NOW(), 1, NOW())");
                $fallback->execute([$sessionId, $listingId]);
                return true;
            } catch (Exception $inner) {
                error_log('trackView guest failed: ' . $inner->getMessage());
                return false;
            }
        }
    }

    /**
     * Store learned preference snapshot from client behavior.
     */
    public function storePreferences($preferences, $sessionId = null) {
        if (!is_array($preferences) || empty($preferences)) {
            return false;
        }

        $sessionId = $sessionId ? trim((string)$sessionId) : $this->sessionId;
        $payload = json_encode($preferences, JSON_UNESCAPED_UNICODE);
        if ($payload === false) {
            return false;
        }

        if ($this->userId) {
            try {
                $sql = "
                    INSERT INTO user_preferences (user_id, preferences, updated_at)
                    VALUES (?, ?, NOW())
                    ON DUPLICATE KEY UPDATE
                        preferences = VALUES(preferences),
                        updated_at = NOW()
                ";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([$this->userId, $payload]);
                return true;
            } catch (Exception $e) {
                try {
                    $update = $this->db->prepare("UPDATE user_preferences SET preferences = ?, updated_at = NOW() WHERE user_id = ?");
                    $update->execute([$payload, $this->userId]);
                    if ($update->rowCount() > 0) {
                        return true;
                    }

                    $insert = $this->db->prepare("INSERT INTO user_preferences (user_id, preferences, updated_at) VALUES (?, ?, NOW())");
                    $insert->execute([$this->userId, $payload]);
                    return true;
                } catch (Exception $inner) {
                    error_log('storePreferences user failed: ' . $inner->getMessage());
                    return false;
                }
            }
        }

        if (!$sessionId) {
            return false;
        }

        try {
            $sql = "
                INSERT INTO guest_preferences (session_id, preferences, updated_at)
                VALUES (?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                    preferences = VALUES(preferences),
                    updated_at = NOW()
            ";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$sessionId, $payload]);
            return true;
        } catch (Exception $e) {
            try {
                $update = $this->db->prepare("UPDATE guest_preferences SET preferences = ?, updated_at = NOW() WHERE session_id = ?");
                $update->execute([$payload, $sessionId]);
                if ($update->rowCount() > 0) {
                    return true;
                }

                $insert = $this->db->prepare("INSERT INTO guest_preferences (session_id, preferences, updated_at) VALUES (?, ?, NOW())");
                $insert->execute([$sessionId, $payload]);
                return true;
            } catch (Exception $inner) {
                error_log('storePreferences guest failed: ' . $inner->getMessage());
                return false;
            }
        }
    }

    /**
     * Fallback recommendations based on platform popularity.
     */
    public function getTrendingCars($limit = 10, $excludeListingId = null) {
        $limit = max(1, min(30, (int)$limit));
        $params = [];

        $excludeSql = '';
        if ($excludeListingId) {
            $excludeSql = ' AND cl.id != ?';
            $params[] = (int)$excludeListingId;
        }

        $sql = "
            SELECT
                cl.id,
                cl.title,
                cl.featured_image_id,
                cl.make_id,
                cl.model_id,
                cl.year,
                cl.price,
                cl.negotiable,
                cl.mileage,
                cl.fuel_type,
                cl.transmission,
                cl.condition_type,
                cl.exterior_color,
                cl.interior_color,
                cl.engine_size,
                cl.doors,
                cl.seats,
                cl.drivetrain,
                cl.location_id,
                cl.listing_type,
                cl.views_count,
                cl.favorites_count,
                cl.created_at,
                cl.updated_at,
                cm.name AS make_name,
                cmo.name AS model_name,
                cmo.body_type AS body_type,
                loc.name AS location_name,
                COALESCE(cl.featured_image_id,
                    (SELECT id FROM car_listing_images WHERE listing_id = cl.id ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1)
                ) AS primary_image_id,
                COALESCE(vh.total_views, 0) + COALESCE(gvh.total_views, 0) AS total_views,
                COALESCE(vh.unique_views, 0) + COALESCE(gvh.unique_views, 0) AS unique_viewers
            FROM car_listings cl
            JOIN car_makes cm ON cl.make_id = cm.id
            JOIN car_models cmo ON cl.model_id = cmo.id
            JOIN locations loc ON cl.location_id = loc.id
            LEFT JOIN (
                SELECT listing_id, SUM(COALESCE(view_count, 1)) AS total_views, COUNT(DISTINCT user_id) AS unique_views
                FROM viewing_history
                WHERE last_viewed > DATE_SUB(NOW(), INTERVAL 10 DAY)
                GROUP BY listing_id
            ) vh ON vh.listing_id = cl.id
            LEFT JOIN (
                SELECT listing_id, SUM(COALESCE(view_count, 1)) AS total_views, COUNT(DISTINCT session_id) AS unique_views
                FROM guest_viewing_history
                WHERE last_viewed > DATE_SUB(NOW(), INTERVAL 10 DAY)
                GROUP BY listing_id
            ) gvh ON gvh.listing_id = cl.id
            WHERE cl.status = 'active'
            AND cl.approval_status = 'approved'
            {$excludeSql}
            ORDER BY total_views DESC, unique_viewers DESC, cl.created_at DESC
            LIMIT {$limit}
        ";

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $rows = $this->decorateListingRows($stmt->fetchAll(PDO::FETCH_ASSOC));

            if (!empty($rows)) {
                return $rows;
            }
        } catch (Exception $e) {
            // Continue to newest fallback.
        }

        try {
            $fallbackSql = "
                SELECT
                    cl.id,
                    cl.title,
                    cl.featured_image_id,
                    cl.make_id,
                    cl.model_id,
                    cl.year,
                    cl.price,
                    cl.negotiable,
                    cl.mileage,
                    cl.fuel_type,
                    cl.transmission,
                    cl.condition_type,
                    cl.exterior_color,
                    cl.interior_color,
                    cl.engine_size,
                    cl.doors,
                    cl.seats,
                    cl.drivetrain,
                    cl.location_id,
                    cl.listing_type,
                    cl.views_count,
                    cl.favorites_count,
                    cl.created_at,
                    cl.updated_at,
                    cm.name AS make_name,
                    cmo.name AS model_name,
                    cmo.body_type AS body_type,
                    loc.name AS location_name,
                    COALESCE(cl.featured_image_id,
                        (SELECT id FROM car_listing_images WHERE listing_id = cl.id ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1)
                    ) AS primary_image_id
                FROM car_listings cl
                JOIN car_makes cm ON cl.make_id = cm.id
                JOIN car_models cmo ON cl.model_id = cmo.id
                JOIN locations loc ON cl.location_id = loc.id
                WHERE cl.status = 'active'
                AND cl.approval_status = 'approved'
                {$excludeSql}
                ORDER BY cl.created_at DESC
                LIMIT {$limit}
            ";

            $stmt = $this->db->prepare($fallbackSql);
            $stmt->execute($params);
            return $this->decorateListingRows($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Exception $e) {
            error_log('getTrendingCars failed: ' . $e->getMessage());
            return [];
        }
    }
}

if (defined('MOTORLINK_RECOMMENDATION_ENGINE_LIB_ONLY')) {
    return;
}

// -----------------------------------------------------------------------------
// Endpoint handler
// -----------------------------------------------------------------------------

try {
    $rawInput = file_get_contents('php://input');
    $jsonInput = json_decode($rawInput, true);
    if (!is_array($jsonInput)) {
        $jsonInput = [];
    }

    $action = $_GET['action'] ?? $_POST['action'] ?? ($jsonInput['action'] ?? '');
    if (!$action) {
        sendError('No action specified', 400);
    }

    // Recommendations work for both logged-in users and guests.
    // Logged-in users get personalised results; guests fall back to trending.
    $sessionId = trim((string)($_GET['session_id'] ?? $_POST['session_id'] ?? ($jsonInput['session_id'] ?? '')));
    if ($sessionId === '') {
        $sessionId = null;
    }

    $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
    $engine = new RecommendationEngine(getDB(), $userId, $sessionId);

    switch ($action) {
        case 'get_recommendations':
            $type = strtolower((string)($_GET['type'] ?? $_POST['type'] ?? ($jsonInput['type'] ?? 'personalized')));
            $limit = (int)($_GET['limit'] ?? $_POST['limit'] ?? ($jsonInput['limit'] ?? 10));
            $excludeListingId = (int)($_GET['exclude_listing_id'] ?? $_POST['exclude_listing_id'] ?? ($jsonInput['exclude_listing_id'] ?? 0));
            if ($excludeListingId <= 0) {
                $excludeListingId = null;
            }

            if ($type === 'trending') {
                $recommendations = $engine->getTrendingCars($limit, $excludeListingId);
            } else {
                $recommendations = $engine->getPersonalizedRecommendations($limit, $excludeListingId);
                if (empty($recommendations)) {
                    $recommendations = $engine->getTrendingCars($limit, $excludeListingId);
                }
                $type = 'personalized';
            }

            sendSuccess([
                'recommendations' => $recommendations,
                'meta' => [
                    'type' => $type,
                    'count' => count($recommendations),
                    'session_tracking' => $sessionId ? true : false
                ]
            ]);
            break;

        case 'get_similar_listings':
            if (!$userId) {
                sendError('Authentication required', 401);
            }

            $listingId = (int)($_GET['listing_id'] ?? $_POST['listing_id'] ?? ($jsonInput['listing_id'] ?? 0));
            if ($listingId <= 0) {
                sendError('Missing listing_id', 400);
            }

            $limit = (int)($_GET['limit'] ?? $_POST['limit'] ?? ($jsonInput['limit'] ?? 8));
            $similarListings = $engine->getSimilarListings($listingId, $limit);

            sendSuccess([
                'similar_listings' => $similarListings,
                'meta' => [
                    'type' => 'similar',
                    'count' => count($similarListings),
                    'listing_id' => $listingId
                ]
            ]);
            break;

        case 'track_view':
            $listingId = (int)($_GET['listing_id'] ?? $_POST['listing_id'] ?? ($jsonInput['listing_id'] ?? 0));
            if ($listingId <= 0) {
                sendError('Missing listing_id', 400);
            }

            $tracked = $engine->trackView($listingId, $sessionId);

            $preferences = $jsonInput['preferences'] ?? $_POST['preferences'] ?? null;
            if (is_string($preferences)) {
                $decoded = json_decode($preferences, true);
                if (is_array($decoded)) {
                    $preferences = $decoded;
                }
            }

            if (is_array($preferences) && !empty($preferences)) {
                $engine->storePreferences($preferences, $sessionId);
            }

            sendSuccess([
                'message' => 'View tracking processed',
                'tracked' => $tracked
            ]);
            break;

        case 'store_preferences':
            $preferences = $jsonInput['preferences'] ?? $_POST['preferences'] ?? null;
            if (is_string($preferences)) {
                $decoded = json_decode($preferences, true);
                if (is_array($decoded)) {
                    $preferences = $decoded;
                }
            }

            if (!is_array($preferences) || empty($preferences)) {
                sendError('Missing preferences payload', 400);
            }

            $saved = $engine->storePreferences($preferences, $sessionId);
            sendSuccess([
                'message' => 'Preferences processed',
                'saved' => $saved
            ]);
            break;

        case 'get_recently_viewed':
            // Returns the most recently viewed listings for the current user (or session for guests).
            $limit = max(1, min(20, (int)($_GET['limit'] ?? $_POST['limit'] ?? ($jsonInput['limit'] ?? 8))));
            $reDB  = getDB();

            if ($userId) {
                // Authenticated: query viewing_history (table may not exist on older installs)
                try {
                    $stmt = $reDB->prepare("
                        SELECT
                            vh.listing_id, vh.last_viewed,
                            cl.title, cm.name AS make, cmo.name AS model, cmo.body_type,
                            cl.year, cl.price, cl.mileage,
                            cl.fuel_type, cl.transmission, cl.location_id,
                            l.name AS location_name,
                            (SELECT id FROM car_listing_images WHERE listing_id = cl.id ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1) AS primary_image_id
                        FROM viewing_history vh
                        JOIN car_listings cl ON cl.id = vh.listing_id AND cl.status = 'active' AND cl.approval_status = 'approved'
                        JOIN car_makes cm ON cl.make_id = cm.id
                        JOIN car_models cmo ON cl.model_id = cmo.id
                        LEFT JOIN locations l ON l.id = cl.location_id
                        WHERE vh.user_id = ?
                        ORDER BY vh.last_viewed DESC
                        LIMIT ?
                    ");
                    $stmt->execute([$userId, $limit]);
                } catch (Exception $vhe) {
                    error_log('get_recently_viewed user query failed: ' . $vhe->getMessage());
                    sendSuccess(['listings' => []]);
                    break;
                }
            } elseif ($sessionId) {
                // Guest: query guest_viewing_history
                try {
                    $stmt = $reDB->prepare("
                        SELECT
                            gvh.listing_id, gvh.last_viewed,
                            cl.title, cm.name AS make, cmo.name AS model, cmo.body_type,
                            cl.year, cl.price, cl.mileage,
                            cl.fuel_type, cl.transmission, cl.location_id,
                            l.name AS location_name,
                            (SELECT id FROM car_listing_images WHERE listing_id = cl.id ORDER BY is_primary DESC, sort_order ASC, id ASC LIMIT 1) AS primary_image_id
                        FROM guest_viewing_history gvh
                        JOIN car_listings cl ON cl.id = gvh.listing_id AND cl.status = 'active' AND cl.approval_status = 'approved'
                        JOIN car_makes cm ON cl.make_id = cm.id
                        JOIN car_models cmo ON cl.model_id = cmo.id
                        LEFT JOIN locations l ON l.id = cl.location_id
                        WHERE gvh.session_id = ?
                        ORDER BY gvh.last_viewed DESC
                        LIMIT ?
                    ");
                    $stmt->execute([$sessionId, $limit]);
                } catch (Exception $gve) {
                    // guest_viewing_history may not exist — return empty
                    sendSuccess(['listings' => []]);
                    break;
                }
            } else {
                sendSuccess(['listings' => []]);
                break;
            }

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $listings = array_map(function ($r) {
                return [
                    'id'            => (int)$r['listing_id'],
                    'title'         => $r['title'],
                    'make'          => $r['make'],
                    'model'         => $r['model'],
                    'year'          => $r['year'],
                    'price'         => (float)$r['price'],
                    'mileage'       => $r['mileage'],
                    'fuel_type'     => $r['fuel_type'],
                    'transmission'  => $r['transmission'],
                    'location_name' => $r['location_name'],
                    'primary_image_id' => $r['primary_image_id'] ? (int)$r['primary_image_id'] : null,
                    'last_viewed'   => $r['last_viewed'],
                ];
            }, $rows);

            sendSuccess(['listings' => $listings]);
            break;

        default:
            sendError('Invalid action: ' . $action, 400);
    }
} catch (Exception $e) {
    error_log('Recommendation engine fatal error: ' . $e->getMessage());
    sendError('Internal server error', 500);
}
