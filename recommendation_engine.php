<?php
/**
 * MotorLink AI Recommendation Engine
 * Provides personalized car recommendations based on user behavior
 */

class RecommendationEngine {
    private $db;
    private $userId;
    
    public function __construct($db, $userId = null) {
        $this->db = $db;
        $this->userId = $userId;
    }
    
    /**
     * Get personalized recommendations based on user behavior
     */
    public function getPersonalizedRecommendations($limit = 10) {
        $recommendations = [];
        
        // Get user preferences from browsing history
        $userPreferences = $this->analyzeUserPreferences();
        
        // Get collaborative filtering results
        $collaborativeResults = $this->collaborativeFiltering();
        
        // Get content-based filtering results
        $contentResults = $this->contentBasedFiltering($userPreferences);
        
        // Merge and rank recommendations
        $recommendations = $this->mergeAndRank(
            $collaborativeResults, 
            $contentResults,
            $userPreferences
        );
        
        return array_slice($recommendations, 0, $limit);
    }
    
    /**
     * Analyze user's browsing patterns and preferences
     */
    private function analyzeUserPreferences() {
        if (!$this->userId) return $this->getDefaultPreferences();
        
        $sql = "
            SELECT 
                AVG(cl.price) as avg_price,
                AVG(cl.year) as avg_year,
                AVG(cl.mileage) as avg_mileage,
                GROUP_CONCAT(DISTINCT cm.name) as preferred_makes,
                GROUP_CONCAT(DISTINCT cmo.body_type) as preferred_body_types,
                COUNT(DISTINCT vh.listing_id) as total_views
            FROM viewing_history vh
            JOIN car_listings cl ON vh.listing_id = cl.id
            JOIN car_makes cm ON cl.make_id = cm.id
            JOIN car_models cmo ON cl.model_id = cmo.id
            WHERE vh.user_id = ?
            AND vh.viewed_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->userId]);
        $preferences = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Add weighted scoring based on interaction types
        $interactionScore = $this->calculateInteractionScore();
        $preferences['interaction_score'] = $interactionScore;
        
        return $preferences;
    }
    
    /**
     * Calculate interaction score based on user actions
     */
    private function calculateInteractionScore() {
        $sql = "
            SELECT 
                SUM(CASE 
                    WHEN action_type = 'view' THEN 1
                    WHEN action_type = 'favorite' THEN 3
                    WHEN action_type = 'inquiry' THEN 5
                    WHEN action_type = 'share' THEN 2
                    ELSE 0
                END) as score
            FROM user_interactions
            WHERE user_id = ?
            AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->userId]);
        return $stmt->fetchColumn() ?: 0;
    }
    
    /**
     * Collaborative filtering - find similar users and their preferences
     */
    private function collaborativeFiltering() {
        if (!$this->userId) return [];
        
        // Find users with similar viewing patterns
        $sql = "
            SELECT 
                other.user_id,
                COUNT(DISTINCT other.listing_id) as common_views,
                GROUP_CONCAT(DISTINCT recommended.listing_id) as recommendations
            FROM viewing_history vh
            JOIN viewing_history other ON vh.listing_id = other.listing_id
            JOIN viewing_history recommended ON other.user_id = recommended.user_id
            LEFT JOIN viewing_history already_seen 
                ON already_seen.listing_id = recommended.listing_id 
                AND already_seen.user_id = ?
            WHERE vh.user_id = ?
            AND other.user_id != ?
            AND already_seen.id IS NULL
            GROUP BY other.user_id
            HAVING common_views >= 3
            ORDER BY common_views DESC
            LIMIT 10
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->userId, $this->userId, $this->userId]);
        
        $recommendations = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $listingIds = explode(',', $row['recommendations']);
            foreach ($listingIds as $id) {
                if (!isset($recommendations[$id])) {
                    $recommendations[$id] = 0;
                }
                $recommendations[$id] += $row['common_views'];
            }
        }
        
        return $this->fetchListingDetails(array_keys($recommendations));
    }
    
    /**
     * Content-based filtering - find similar cars based on features
     */
    private function contentBasedFiltering($preferences) {
        $sql = "
            SELECT 
                cl.*,
                cm.name as make_name,
                cmo.name as model_name,
                loc.name as location_name,
                (
                    ABS(cl.price - :avg_price) / :avg_price * 0.3 +
                    ABS(cl.year - :avg_year) / 10 * 0.2 +
                    ABS(cl.mileage - :avg_mileage) / :avg_mileage * 0.2 +
                    CASE WHEN cm.name IN (:preferred_makes) THEN -0.2 ELSE 0 END +
                    CASE WHEN cmo.body_type IN (:preferred_body_types) THEN -0.1 ELSE 0 END
                ) as similarity_score
            FROM car_listings cl
            JOIN car_makes cm ON cl.make_id = cm.id
            JOIN car_models cmo ON cl.model_id = cmo.id
            JOIN locations loc ON cl.location_id = loc.id
            WHERE cl.status = 'active'
            AND cl.approval_status = 'approved'
            ORDER BY similarity_score ASC
            LIMIT 20
        ";
        
        $params = [
            'avg_price' => $preferences['avg_price'] ?? 5000000,
            'avg_year' => $preferences['avg_year'] ?? 2018,
            'avg_mileage' => $preferences['avg_mileage'] ?? 50000,
            'preferred_makes' => $preferences['preferred_makes'] ?? '',
            'preferred_body_types' => $preferences['preferred_body_types'] ?? ''
        ];
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Merge and rank recommendations from different algorithms
     */
    private function mergeAndRank($collaborative, $content, $preferences) {
        $merged = [];
        
        // Weight collaborative filtering results
        foreach ($collaborative as $item) {
            $id = $item['id'];
            if (!isset($merged[$id])) {
                $merged[$id] = $item;
                $merged[$id]['score'] = 0;
            }
            $merged[$id]['score'] += 0.4; // Collaborative weight
        }
        
        // Weight content-based results
        foreach ($content as $item) {
            $id = $item['id'];
            if (!isset($merged[$id])) {
                $merged[$id] = $item;
                $merged[$id]['score'] = 0;
            }
            $merged[$id]['score'] += 0.3 * (1 - $item['similarity_score']); // Content weight
        }
        
        // Add recency bonus
        $this->addRecencyBonus($merged);
        
        // Add popularity bonus
        $this->addPopularityBonus($merged);
        
        // Sort by final score
        usort($merged, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });
        
        return array_values($merged);
    }
    
    /**
     * Add bonus score for recently listed items
     */
    private function addRecencyBonus(&$items) {
        foreach ($items as &$item) {
            $daysOld = (time() - strtotime($item['created_at'])) / 86400;
            if ($daysOld < 7) {
                $item['score'] += 0.15;
            } elseif ($daysOld < 14) {
                $item['score'] += 0.1;
            } elseif ($daysOld < 30) {
                $item['score'] += 0.05;
            }
        }
    }
    
    /**
     * Add bonus score for popular items
     */
    private function addPopularityBonus(&$items) {
        $ids = array_column($items, 'id');
        if (empty($ids)) return;
        
        $placeholders = str_repeat('?,', count($ids) - 1) . '?';
        $sql = "
            SELECT 
                listing_id,
                COUNT(*) as view_count,
                COUNT(DISTINCT user_id) as unique_viewers
            FROM viewing_history
            WHERE listing_id IN ($placeholders)
            AND viewed_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY listing_id
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($ids);
        
        $popularity = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $popularity[$row['listing_id']] = $row;
        }
        
        foreach ($items as &$item) {
            if (isset($popularity[$item['id']])) {
                $viewScore = min($popularity[$item['id']]['view_count'] / 100, 0.1);
                $item['score'] += $viewScore;
            }
        }
    }
    
    /**
     * Fetch full listing details
     */
    private function fetchListingDetails($listingIds) {
        if (empty($listingIds)) return [];
        
        $placeholders = str_repeat('?,', count($listingIds) - 1) . '?';
        $sql = "
            SELECT 
                cl.*,
                cm.name as make_name,
                cmo.name as model_name,
                loc.name as location_name
            FROM car_listings cl
            JOIN car_makes cm ON cl.make_id = cm.id
            JOIN car_models cmo ON cl.model_id = cmo.id
            JOIN locations loc ON cl.location_id = loc.id
            WHERE cl.id IN ($placeholders)
            AND cl.status = 'active'
            AND cl.approval_status = 'approved'
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($listingIds);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Get default preferences for non-logged users
     */
    private function getDefaultPreferences() {
        return [
            'avg_price' => 5000000,
            'avg_year' => 2018,
            'avg_mileage' => 50000,
            'preferred_makes' => 'Toyota,Nissan,Mazda',
            'preferred_body_types' => 'Sedan,SUV',
            'interaction_score' => 0
        ];
    }
    
    /**
     * Track user viewing history (supports both logged-in and guest users)
     */
    public function trackView($listingId, $sessionId = null) {
        // For logged-in users
        if ($this->userId) {
            $sql = "
                INSERT INTO viewing_history (user_id, listing_id, viewed_at, view_count, last_viewed)
                VALUES (?, ?, NOW(), 1, NOW())
                ON DUPLICATE KEY UPDATE 
                    view_count = view_count + 1,
                    last_viewed = NOW()
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$this->userId, $listingId]);
        } 
        // For guest users with session ID
        else if ($sessionId) {
            $sql = "
                INSERT INTO guest_viewing_history (session_id, listing_id, viewed_at, view_count, last_viewed)
                VALUES (?, ?, NOW(), 1, NOW())
                ON DUPLICATE KEY UPDATE 
                    view_count = view_count + 1,
                    last_viewed = NOW()
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$sessionId, $listingId]);
        }
    }
    
    /**
     * Store user preferences for both logged-in and guest users
     */
    public function storePreferences($preferences, $sessionId = null) {
        $preferencesJson = json_encode($preferences);
        
        // For logged-in users
        if ($this->userId) {
            $sql = "
                INSERT INTO user_preferences (user_id, preferences, updated_at)
                VALUES (?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                    preferences = ?,
                    updated_at = NOW()
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$this->userId, $preferencesJson, $preferencesJson]);
        }
        // For guest users
        else if ($sessionId) {
            $sql = "
                INSERT INTO guest_preferences (session_id, preferences, updated_at)
                VALUES (?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                    preferences = ?,
                    updated_at = NOW()
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$sessionId, $preferencesJson, $preferencesJson]);
        }
    }
    
    /**
     * Get trending cars based on recent activity
     */
    public function getTrendingCars($limit = 10) {
        $sql = "
            SELECT 
                cl.*,
                cm.name as make_name,
                cmo.name as model_name,
                loc.name as location_name,
                COUNT(DISTINCT vh.user_id) as unique_views,
                COUNT(vh.id) as total_views,
                AVG(CASE WHEN vh.viewed_at > DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) as recent_activity
            FROM car_listings cl
            JOIN car_makes cm ON cl.make_id = cm.id
            JOIN car_models cmo ON cl.model_id = cmo.id
            JOIN locations loc ON cl.location_id = loc.id
            LEFT JOIN viewing_history vh ON cl.id = vh.listing_id
            WHERE cl.status = 'active'
            AND cl.approval_status = 'approved'
            AND vh.viewed_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY cl.id
            ORDER BY recent_activity DESC, unique_views DESC
            LIMIT ?
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$limit]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

// API Endpoint for recommendations
if (isset($_GET['action']) && $_GET['action'] === 'get_recommendations') {
    require_once 'api.php';
    
    $userId = $_SESSION['user_id'] ?? null;
    $engine = new RecommendationEngine(getDB(), $userId);
    
    $type = $_GET['type'] ?? 'personalized';
    
    switch ($type) {
        case 'personalized':
            $recommendations = $engine->getPersonalizedRecommendations();
            break;
        case 'trending':
            $recommendations = $engine->getTrendingCars();
            break;
        default:
            $recommendations = [];
    }
    
    sendSuccess(['recommendations' => $recommendations]);
}

// API Endpoint for tracking views
if (isset($_POST['action']) || isset($_GET['action'])) {
    $action = $_POST['action'] ?? $_GET['action'];
    
    if ($action === 'track_view') {
        require_once 'api.php';
        
        // Get POST data (supports both JSON and form data)
        $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        
        $listingId = $data['listing_id'] ?? null;
        $preferences = $data['preferences'] ?? null;
        $sessionId = $data['session_id'] ?? null;
        
        if ($listingId) {
            $userId = $_SESSION['user_id'] ?? null;
            $engine = new RecommendationEngine(getDB(), $userId);
            
            // Track the view
            $engine->trackView($listingId, $sessionId);
            
            // Store preferences if provided
            if ($preferences) {
                $engine->storePreferences($preferences, $sessionId);
            }
            
            sendSuccess(['message' => 'View tracked successfully']);
        } else {
            sendError('Missing listing_id');
        }
    }
}
?>