<?php
require_once 'config.php';

try {
    $db = getDatabase();
    
    $email = 'admin@motorlink.mw'; // Change to your admin email
    $newPassword = 'newpassword123'; // Change to your desired password
    
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Try users table first
    $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE email = ? AND user_type = 'admin'");
    $stmt->execute([$hashedPassword, $email]);
    
    if ($stmt->rowCount() > 0) {
        echo "Password updated in users table<br>";
    } else {
        // Try admin_users table
        $stmt = $db->prepare("UPDATE admin_users SET password_hash = ? WHERE email = ?");
        $stmt->execute([$hashedPassword, $email]);
        
        if ($stmt->rowCount() > 0) {
            echo "Password updated in admin_users table<br>";
        } else {
            echo "No admin user found with that email<br>";
        }
    }
    
    echo "New password: $newPassword<br>";
    echo "<strong>DELETE THIS FILE AFTER USE!</strong>";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>