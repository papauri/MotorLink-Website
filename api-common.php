<?php
/**
 * MotorLink API Common Functions
 * Shared helper functions and initialization for all API endpoints
 */

// Prevent direct access
if (basename($_SERVER['PHP_SELF']) === 'api-common.php') {
    http_response_code(403);
    exit('Direct access not allowed');
}

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/api_errors.log');

// Headers for CORS and JSON responses
header('Content-Type: application/json; charset=utf-8');

// Handle CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database Configuration
$serverHost = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
$isProduction = (strpos($serverHost, 'promanaged-it.com') !== false);

define('DB_HOST', $isProduction ? 'localhost' : 'promanaged-it.com');
define('DB_USER', 'p601229');
define('DB_PASS', '2:p2WpmX[0YTs7');
define('DB_NAME', 'p601229_motorlinkmalawi_db');

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

/**
 * Database Connection Singleton Class
 */
if (!class_exists('Database')) {
    class Database {
        private static $instance = null;
        private $connection;
        
        private function __construct() {
            try {
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_TIMEOUT => 10
                ];

                $this->connection = new PDO(
                    "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                    DB_USER,
                    DB_PASS,
                    $options
                );
            } catch(PDOException $e) {
                error_log("Database connection failed: " . $e->getMessage());
                throw new Exception("Database connection failed: " . $e->getMessage());
            }
        }
        
        public static function getInstance() {
            if (self::$instance === null) {
                self::$instance = new Database();
            }
            return self::$instance;
        }
        
        public function getConnection() {
            return $this->connection;
        }
    }
}

/**
 * Send error response and exit
 */
if (!function_exists('sendError')) {
    function sendError($message, $code = 500) {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $message, 'timestamp' => date('Y-m-d H:i:s')]);
        exit;
    }
}

/**
 * Send success response and exit
 */
if (!function_exists('sendSuccess')) {
    function sendSuccess($data = [], $code = 200) {
        http_response_code($code);
        echo json_encode(array_merge(['success' => true], $data), JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/**
 * Get database connection
 */
if (!function_exists('getDB')) {
    function getDB() {
        static $pdo = null;
        if ($pdo !== null) return $pdo;
        
        try {
            $pdo = Database::getInstance()->getConnection();
            return $pdo;
        } catch (Exception $e) {
            sendError('Database connection failed', 500);
        }
    }
}

/**
 * Check if user is logged in
 */
if (!function_exists('isLoggedIn')) {
    function isLoggedIn() {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }
}

/**
 * Get current user data
 */
if (!function_exists('getCurrentUser')) {
    function getCurrentUser($required = true) {
        $user = [
            'id' => $_SESSION['user_id'] ?? null,
            'name' => $_SESSION['full_name'] ?? null,
            'email' => $_SESSION['email'] ?? null,
            'type' => $_SESSION['user_type'] ?? null
        ];
        
        if (!$required) {
            return $user['id'] ? $user : null;
        }
        
        return $user;
    }
}

/**
 * Require authentication
 */
if (!function_exists('requireAuth')) {
    function requireAuth() {
        if (!isLoggedIn()) {
            sendError('Authentication required', 401);
        }
    }
}

