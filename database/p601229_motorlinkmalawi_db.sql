-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 11, 2026 at 12:53 PM
-- Server version: 8.0.44-cll-lve
-- PHP Version: 8.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `p601229_motorlinkmalawi_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`p601229`@`localhost` PROCEDURE `UpdateCompanyVehicleCounts` (IN `company_id_param` INT)   BEGIN
    UPDATE car_hire_companies
    SET
        total_vehicles = (
            SELECT COUNT(*)
            FROM car_hire_fleet
            WHERE company_id = company_id_param AND is_active = 1
        ),
        available_vehicles = (
            SELECT COUNT(*)
            FROM car_hire_fleet
            WHERE company_id = company_id_param AND is_active = 1 AND is_available = 1
        )
    WHERE id = company_id_param;
END$$

CREATE DEFINER=`p601229`@`localhost` PROCEDURE `UpdateFleetDenormalizedData` (IN `fleet_id_param` INT)   BEGIN
    UPDATE car_hire_fleet chf
    JOIN car_hire_companies chc ON chf.company_id = chc.id
    JOIN car_makes cm ON chf.make_id = cm.id
    JOIN car_models cmo ON chf.model_id = cmo.id
    SET
        chf.company_name = chc.business_name,
        chf.company_phone = chc.phone,
        chf.company_email = chc.email,
        chf.company_location_id = chc.location_id,
        chf.make_name = cm.name,
        chf.model_name = cmo.name
    WHERE chf.id = fleet_id_param;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int NOT NULL,
  `admin_id` int DEFAULT NULL,
  `action_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `admin_id`, `action_type`, `action_description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'car_premium', 'Car set to premium', 'Car ID: 5, Until: 2026-01-10 13:11:02', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-11 13:11:01'),
(2, 1, 'car_featured', 'Car featured', 'Car ID: 16', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-13 19:19:46'),
(3, 1, 'car_premium', 'Car set to premium', 'Car ID: 1, Until: 2026-01-12 19:20:02', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-13 19:20:02'),
(4, 1, 'car_premium', 'Car set to premium', 'Car ID: 1, Until: 2026-01-15 15:39:24', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-16 15:39:23'),
(5, 1, 'car_premium', 'Car set to premium', 'Car ID: 2, Until: 2026-01-15 15:39:28', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-16 15:39:27'),
(6, 1, 'user_deleted', 'User deleted', 'User ID: 26, Type: individual', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-16 23:12:59'),
(7, 1, 'garage_featured', 'Garage unfeatured', 'Garage ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 13:41:53'),
(8, 1, 'garage_featured', 'Garage featured', 'Garage ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 13:41:56'),
(9, 1, 'garage_verified', 'Garage unverified', 'Garage ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 13:41:58'),
(10, 1, 'garage_verified', 'Garage verified', 'Garage ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 13:41:59'),
(11, 1, 'garage_featured', 'Garage unfeatured', 'Garage ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 14:44:20'),
(12, 1, 'car_hire_featured', 'Car hire company unfeatured', 'Car Hire ID: 5', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 18:56:09'),
(13, 1, 'car_hire_featured', 'Car hire company unfeatured', 'Car Hire ID: 3', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 18:56:12'),
(14, 1, 'car_hire_featured', 'Car hire company unfeatured', 'Car Hire ID: 2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 18:56:13'),
(15, 1, 'car_hire_featured', 'Car hire company unfeatured', 'Car Hire ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 18:56:15'),
(16, 1, 'car_hire_certified', 'Car hire company certified', 'Car Hire ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 18:56:25'),
(17, 1, 'car_hire_verified', 'Car hire company unverified', 'Car Hire ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 18:57:15'),
(18, 1, 'car_hire_verified', 'Car hire company unverified', 'Car Hire ID: 2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 18:57:18'),
(19, 1, 'car_hire_verified', 'Car hire company unverified', 'Car Hire ID: 3', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 18:57:21'),
(20, 1, 'car_hire_verified', 'Car hire company unverified', 'Car Hire ID: 4', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 18:57:23'),
(21, 1, 'car_hire_verified', 'Car hire company unverified', 'Car Hire ID: 5', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 18:57:24'),
(22, 1, 'car_hire_certified', 'Car hire company uncertified', 'Car Hire ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 18:57:29'),
(23, 1, 'car_hire_certified', 'Car hire company certified', 'Car Hire ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 19:09:13'),
(24, 1, 'car_hire_certified', 'Car hire company uncertified', 'Car Hire ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 19:09:26'),
(25, 1, 'car_hire_verified', 'Car hire company verified', 'Car Hire ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-17 19:09:28'),
(26, 1, 'car_featured', 'Car featured', 'Car ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-26 18:38:21'),
(27, 1, 'garage_verified', 'Garage unverified', 'Garage ID: 4', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 00:15:14'),
(28, 1, 'garage_featured', 'Garage unfeatured', 'Garage ID: 1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 00:17:04'),
(29, 1, 'garage_certified', 'Garage uncertified', 'Garage ID: 3', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 00:17:30'),
(30, 1, 'garage_certified', 'Garage uncertified', 'Garage ID: 2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 00:17:51'),
(31, 1, 'user_updated', 'User updated', 'User ID: 23', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 00:34:58'),
(32, 1, 'car_hire_verified', 'Car hire company verified', 'Car Hire ID: 7', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 03:58:18'),
(33, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Premium Auto Malawi JP\' (ID: 7) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 12:29:20'),
(34, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Testing Rental Company\' (ID: 6) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 13:54:21'),
(35, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Premium Auto Malawi JP\' (ID: 8) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 20:06:33'),
(36, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Premium Auto Malawi JP\' (ID: 9) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 23:44:28'),
(37, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Test\' (ID: 10) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 23:44:32'),
(38, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Test\' (ID: 11) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-30 00:08:47'),
(39, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Test\' (ID: 12) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-30 00:10:35'),
(40, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Premium Auto Malawi JP\' (ID: 13) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-30 00:26:45'),
(41, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Premium Auto Malawi\' (ID: 14) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-30 00:57:57'),
(42, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Premium Auto Malawi\' (ID: 15) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-30 23:13:17'),
(43, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Premium Auto Malawi JP\' (ID: 16) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 00:26:06'),
(44, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Premium Auto Malawi JP\' (ID: 17) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 00:45:39'),
(45, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Premium Auto Malawi TEST\' (ID: 18) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 01:21:38'),
(46, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Premium Auto Malawi JP\' (ID: 19) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 01:31:37'),
(47, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Tese\' (ID: 20) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings moved to deleted: 0\nFleet vehicles removed: 0\nAll user data removed', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 01:37:24'),
(48, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Test\' (ID: 21) permanently deleted\nUser: N/A (ID: 0, Email: N/A)\nCar Listings permanently removed: 0\nFleet vehicles removed: 0\nAll user data removed', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 02:02:06'),
(49, 1, 'car_hire_deleted', 'Car hire company permanently deleted with CASCADE', 'Car Hire \'Premium Auto Malawi rr\' (ID: 22) permanently deleted\nUser: Premium Auto Malawi rr (ID: 26, Email: johnpaulchirwa@dddddd.com)\nCar Listings permanently removed: 0\nFleet vehicles removed: 0\nAll user data removed', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 02:05:51'),
(50, 1, 'user_deleted', 'User permanently deleted', 'User ID: 27, Type: individual, CASCADE DELETE all related records', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 02:27:41'),
(51, 1, 'user_deleted', 'User permanently deleted', 'User ID: 28, Type: individual, CASCADE DELETE all related records', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 02:36:15'),
(52, 1, 'user_deleted', 'User permanently deleted', 'User ID: 29, Type: individual, CASCADE DELETE all related records', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 02:56:06'),
(53, 1, 'user_deleted', 'User permanently deleted', 'User ID: 30, Type: individual, CASCADE DELETE all related records', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 02:56:12'),
(54, 1, 'user_deleted', 'User permanently deleted', 'User ID: 31, Type: individual, CASCADE DELETE all related records', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 02:57:38'),
(55, 1, 'user_deleted', 'User permanently deleted', 'User ID: 32, Type: individual, CASCADE DELETE all related records', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 03:09:18'),
(56, 1, 'user_deleted', 'User permanently deleted', 'User ID: 33, Type: individual, CASCADE DELETE all related records', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 03:14:19'),
(57, 1, 'user_deleted', 'User permanently deleted', 'User ID: 34, Type: individual, CASCADE DELETE all related records', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 03:15:57'),
(58, 1, 'user_deleted', 'User permanently deleted', 'User ID: 35, Type: individual, CASCADE DELETE all related records', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 03:26:36'),
(59, 1, 'car_premium', 'Car set to premium', 'Car ID: 18, Until: 2026-02-01 00:22:00', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 00:22:00'),
(60, 1, 'ai_chat_restriction', 'AI chat disabled for user', 'User: johnpaulchirwa (johnpaulchirwa@gmail.com) - disabled - Reason: Exceeded recomended usage', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 21:02:11'),
(61, 1, 'ai_chat_restriction', 'AI chat enabled for user', 'User: johnpaulchirwa (johnpaulchirwa@gmail.com) - enabled', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 21:09:09');

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('super_admin','admin','moderator','onboarding_manager') DEFAULT 'moderator',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@motorlink.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'super_admin', 'active', '2026-01-11 12:45:20', '2025-12-18 19:04:30', '2026-01-11 12:45:20'),
(2, 'moderator', 'moderator@motorlink.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Content Moderator', 'moderator', 'active', NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30');

-- --------------------------------------------------------

--
-- Table structure for table `ai_chat_settings`
--

CREATE TABLE `ai_chat_settings` (
  `id` int NOT NULL DEFAULT '1',
  `model_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'gpt-4o-mini',
  `max_tokens_per_request` int DEFAULT '500',
  `temperature` decimal(3,2) DEFAULT '0.70',
  `requests_per_day` int DEFAULT '50',
  `requests_per_hour` int DEFAULT '10',
  `enabled` tinyint(1) DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL COMMENT 'Admin user ID who last updated',
  `serpapi_enabled` tinyint(1) DEFAULT '1',
  `serpapi_quota_used` int DEFAULT '0',
  `serpapi_quota_reset_date` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deepseek_enabled` tinyint(1) DEFAULT '1',
  `openai_enabled` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_chat_settings`
--

INSERT INTO `ai_chat_settings` (`id`, `model_name`, `max_tokens_per_request`, `temperature`, `requests_per_day`, `requests_per_hour`, `enabled`, `updated_at`, `updated_by`, `serpapi_enabled`, `serpapi_quota_used`, `serpapi_quota_reset_date`, `deepseek_enabled`, `openai_enabled`) VALUES
(1, 'gpt-4o-mini', 500, 0.70, 50, 50, 1, '2026-01-11 12:23:26', 1, 1, 21, NULL, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `ai_chat_usage`
--

CREATE TABLE `ai_chat_usage` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `response_length` int DEFAULT '0',
  `tokens_used` int DEFAULT '0',
  `model_used` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'gpt-4o-mini',
  `cost_estimate` decimal(10,6) DEFAULT '0.000000',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_chat_usage`
--

INSERT INTO `ai_chat_usage` (`id`, `user_id`, `message`, `response_length`, `tokens_used`, `model_used`, `cost_estimate`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 36, 'Looking for an SUV', 174, 894, 'gpt-4o-mini', 0.000152, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 20:08:03'),
(2, 36, 'Hilux', 223, 951, 'gpt-4o-mini', 0.000165, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 20:08:12'),
(3, 36, 'Yes', 187, 996, 'gpt-4o-mini', 0.000166, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 20:08:22'),
(4, 36, 'No proce range', 631, 1201, 'gpt-4o-mini', 0.000266, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 20:08:34'),
(5, 2, 'Looking for a reliable SUV under 10 million', 245, 856, 'gpt-4o-mini', 0.000148, '127.0.0.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-08 20:34:19'),
(6, 2, 'Show me Toyota Hilux listings', 312, 923, 'gpt-4o-mini', 0.000162, '127.0.0.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-13 20:34:19'),
(7, 2, 'What are the best car deals available?', 198, 745, 'gpt-4o-mini', 0.000128, '127.0.0.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-18 20:34:19'),
(8, 3, 'Find me a car with good fuel economy', 267, 891, 'gpt-4o-mini', 0.000154, '127.0.0.23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-11 20:34:19'),
(9, 3, 'Which cars are available in Blantyre?', 289, 934, 'gpt-4o-mini', 0.000165, '127.0.0.23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-15 20:34:19'),
(10, 3, 'Looking for an automatic transmission car', 223, 812, 'gpt-4o-mini', 0.000142, '127.0.0.23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-21 20:34:19'),
(11, 3, 'Show me cars under 5 million', 256, 878, 'gpt-4o-mini', 0.000152, '127.0.0.23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-25 20:34:19'),
(12, 4, 'Show me Toyota Hilux listings', 312, 923, 'gpt-4o-mini', 0.000162, '127.0.0.34', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-05 20:34:19'),
(13, 4, 'What are the best car deals available?', 198, 745, 'gpt-4o-mini', 0.000128, '127.0.0.34', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-23 20:34:19'),
(14, 5, 'Find me a car with good fuel economy', 267, 891, 'gpt-4o-mini', 0.000154, '127.0.0.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-14 20:34:19'),
(15, 5, 'Which cars are available in Zomba?', 234, 867, 'gpt-4o-mini', 0.000150, '127.0.0.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-19 20:34:19'),
(16, 5, 'Looking for a sedan under 8 million', 278, 912, 'gpt-4o-mini', 0.000159, '127.0.0.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-26 20:34:19'),
(17, 6, 'Show me cars under 5 million', 256, 878, 'gpt-4o-mini', 0.000152, '127.0.0.56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-17 20:34:19'),
(18, 6, 'What are the best car deals available?', 198, 745, 'gpt-4o-mini', 0.000128, '127.0.0.56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-28 20:34:19'),
(19, 7, 'Looking for a reliable SUV under 10 million', 245, 856, 'gpt-4o-mini', 0.000148, '127.0.0.67', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-12 20:34:19'),
(20, 7, 'Find me a car with good fuel economy', 267, 891, 'gpt-4o-mini', 0.000154, '127.0.0.67', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-20 20:34:19'),
(21, 7, 'Which cars are available in Mangochi?', 289, 934, 'gpt-4o-mini', 0.000165, '127.0.0.67', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-27 20:34:19'),
(22, 8, 'Show me Toyota Hilux listings', 312, 923, 'gpt-4o-mini', 0.000162, '127.0.0.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-09 20:34:19'),
(23, 8, 'What are the best car deals available?', 198, 745, 'gpt-4o-mini', 0.000128, '127.0.0.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-22 20:34:19'),
(24, 8, 'Looking for an automatic transmission car', 223, 812, 'gpt-4o-mini', 0.000142, '127.0.0.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-29 20:34:19'),
(25, 9, 'Find me a car with good fuel economy', 267, 891, 'gpt-4o-mini', 0.000154, '127.0.0.89', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-16 20:34:19'),
(26, 9, 'Show me cars under 5 million', 256, 878, 'gpt-4o-mini', 0.000152, '127.0.0.89', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-24 20:34:19'),
(27, 10, 'Looking for a reliable SUV under 10 million', 245, 856, 'gpt-4o-mini', 0.000148, '127.0.0.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-10 20:34:19'),
(28, 10, 'Which cars are available in Lilongwe?', 234, 867, 'gpt-4o-mini', 0.000150, '127.0.0.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-30 20:34:19'),
(29, 11, 'Show me my listings', 312, 1023, 'gpt-4o-mini', 0.000178, '127.0.0.111', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-07 20:34:19'),
(30, 11, 'How many views did my Toyota get?', 245, 934, 'gpt-4o-mini', 0.000165, '127.0.0.111', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-14 20:34:19'),
(31, 11, 'What is my inventory status?', 289, 987, 'gpt-4o-mini', 0.000172, '127.0.0.111', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-21 20:34:19'),
(32, 11, 'Which of my cars needs attention?', 267, 912, 'gpt-4o-mini', 0.000159, '127.0.0.111', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-31 20:34:19'),
(33, 12, 'Show me my listings', 312, 1023, 'gpt-4o-mini', 0.000178, '127.0.0.122', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-06 20:34:19'),
(34, 12, 'Change the price of my listing #5 to 8 million', 198, 856, 'gpt-4o-mini', 0.000148, '127.0.0.122', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-19 20:34:19'),
(35, 12, 'What is my inventory status?', 289, 987, 'gpt-4o-mini', 0.000172, '127.0.0.122', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-01-01 20:34:19'),
(36, 13, 'Show me my listings', 312, 1023, 'gpt-4o-mini', 0.000178, '127.0.0.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-04 20:34:19'),
(37, 13, 'How many views did my Toyota get?', 245, 934, 'gpt-4o-mini', 0.000165, '127.0.0.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-17 20:34:19'),
(38, 14, 'What is my inventory status?', 289, 987, 'gpt-4o-mini', 0.000172, '127.0.0.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-15 20:34:19'),
(39, 14, 'Which of my cars needs attention?', 267, 912, 'gpt-4o-mini', 0.000159, '127.0.0.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-26 20:34:19'),
(40, 15, 'Show me my listings', 312, 1023, 'gpt-4o-mini', 0.000178, '127.0.0.155', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-13 20:34:19'),
(41, 15, 'Change the price of my listing #5 to 8 million', 198, 856, 'gpt-4o-mini', 0.000148, '127.0.0.155', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-28 20:34:19'),
(42, 16, 'Show me my garage information', 345, 1123, 'gpt-4o-mini', 0.000195, '127.0.0.166', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-08 20:34:19'),
(43, 16, 'What services does my garage offer?', 278, 967, 'gpt-4o-mini', 0.000169, '127.0.0.166', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-16 20:34:19'),
(44, 16, 'Update my operating hours', 198, 823, 'gpt-4o-mini', 0.000143, '127.0.0.166', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-23 20:34:19'),
(45, 16, 'How can I improve my garage visibility?', 312, 1034, 'gpt-4o-mini', 0.000180, '127.0.0.166', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-30 20:34:19'),
(46, 17, 'Show me my garage information', 345, 1123, 'gpt-4o-mini', 0.000195, '127.0.0.177', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-11 20:34:19'),
(47, 17, 'What services does my garage offer?', 278, 967, 'gpt-4o-mini', 0.000169, '127.0.0.177', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-25 20:34:19'),
(48, 18, 'Update my operating hours', 198, 823, 'gpt-4o-mini', 0.000143, '127.0.0.188', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-18 20:34:19'),
(49, 18, 'How can I improve my garage visibility?', 312, 1034, 'gpt-4o-mini', 0.000180, '127.0.0.188', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-27 20:34:19'),
(50, 19, 'Show me my garage information', 345, 1123, 'gpt-4o-mini', 0.000195, '127.0.0.199', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-12 20:34:19'),
(51, 19, 'What services does my garage offer?', 278, 967, 'gpt-4o-mini', 0.000169, '127.0.0.199', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-22 20:34:19'),
(52, 19, 'Show me customer inquiries', 234, 889, 'gpt-4o-mini', 0.000154, '127.0.0.199', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-29 20:34:19'),
(53, 20, 'Update my operating hours', 198, 823, 'gpt-4o-mini', 0.000143, '127.0.0.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-20 20:34:19'),
(54, 20, 'How can I improve my garage visibility?', 312, 1034, 'gpt-4o-mini', 0.000180, '127.0.0.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-31 20:34:19'),
(55, 21, 'Show me my fleet', 312, 1056, 'gpt-4o-mini', 0.000184, '127.0.0.211', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-07 20:34:19'),
(56, 21, 'Which car hire has most cars?', 234, 912, 'gpt-4o-mini', 0.000159, '127.0.0.211', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-14 20:34:19'),
(57, 21, 'Update my fleet availability', 267, 945, 'gpt-4o-mini', 0.000165, '127.0.0.211', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-21 20:34:19'),
(58, 21, 'What are the rental rates?', 289, 978, 'gpt-4o-mini', 0.000170, '127.0.0.211', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-01-01 20:34:19'),
(59, 22, 'Show me my fleet', 312, 1056, 'gpt-4o-mini', 0.000184, '127.0.0.222', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-09 20:34:19'),
(60, 22, 'Show me my business details', 278, 934, 'gpt-4o-mini', 0.000162, '127.0.0.222', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-24 20:34:19'),
(61, 23, 'Which car hire has most cars?', 234, 912, 'gpt-4o-mini', 0.000159, '127.0.0.233', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-13 20:34:19'),
(62, 23, 'Update my fleet availability', 267, 945, 'gpt-4o-mini', 0.000165, '127.0.0.233', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-26 20:34:19'),
(63, 23, 'What are the rental rates?', 289, 978, 'gpt-4o-mini', 0.000170, '127.0.0.233', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-30 20:34:19'),
(64, 24, 'Show me my fleet', 312, 1056, 'gpt-4o-mini', 0.000184, '127.0.0.244', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-15 20:34:19'),
(65, 24, 'Show me my business details', 278, 934, 'gpt-4o-mini', 0.000162, '127.0.0.244', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-28 20:34:19'),
(66, 25, 'Which car hire has most cars?', 234, 912, 'gpt-4o-mini', 0.000159, '127.0.0.255', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-17 20:34:19'),
(67, 25, 'Update my fleet availability', 267, 945, 'gpt-4o-mini', 0.000165, '127.0.0.255', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-25 20:34:19'),
(68, 25, 'What are the rental rates?', 289, 978, 'gpt-4o-mini', 0.000170, '127.0.0.255', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2025-12-31 20:34:19'),
(69, 36, 'I am lookign for a car', 278, 750, 'gpt-4o-mini', 0.000139, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 20:56:57'),
(70, 36, 'A toyota hilux', 681, 962, 'gpt-4o-mini', 0.000235, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 20:57:12'),
(71, 36, 'What are the colors', 422, 1053, 'gpt-4o-mini', 0.000194, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 20:57:37'),
(72, 36, 'Are any of these red in color', 368, 1224, 'gpt-4o-mini', 0.000221, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 20:59:44'),
(73, 36, 'toyota under 5 million in blantyre', 609, 1083, 'gpt-4o-mini', 0.000237, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 21:11:20'),
(74, 36, 'What about in Lilongwe', 593, 1260, 'gpt-4o-mini', 0.000264, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 21:12:17'),
(75, 36, 'Looking foor a hilux in lilongwe', 476, 1194, 'gpt-4o-mini', 0.000244, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 21:19:43'),
(76, 36, 'Cheapest car in Blantyre hilux', 571, 1182, 'gpt-4o-mini', 0.000250, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 21:23:31'),
(77, 36, 'What else can you tell me about this car', 711, 1358, 'gpt-4o-mini', 0.000275, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 21:23:56'),
(78, 36, 'perfomance specs', 601, 1512, 'gpt-4o-mini', 0.000293, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 21:24:16'),
(79, 36, 'Loooking only for a hilux', 293, 1593, 'gpt-4o-mini', 0.000265, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-03 00:17:27'),
(80, 36, 'WHat about in lilongwe', 446, 1742, 'gpt-4o-mini', 0.000322, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-03 00:17:43'),
(81, 36, 'My jaguar XF 2016 2.0litre diesal has a manifold hold. How can I fix this', 309, 1661, 'gpt-4o-mini', 0.000275, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-03 00:25:57'),
(82, 36, 'I need help', 189, 1689, 'gpt-4o-mini', 0.000271, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-03 00:26:15'),
(83, 36, 'Take me to my listings', 204, 1815, 'gpt-4o-mini', 0.000294, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-03 00:26:49'),
(84, 36, 'All certified', 282, 1947, 'gpt-4o-mini', 0.000316, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-03 00:41:13'),
(85, 36, 'What color is it', 49, 1633, 'gpt-3.5-turbo', 0.000250, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-04 00:04:50'),
(86, 36, 'Who is the seller', 262, 1695, 'gpt-3.5-turbo', 0.000277, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-04 00:05:00'),
(87, 12, 'What can you tell me about this car', 474, 1093, 'gpt-4o-mini', 0.000225, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-04 01:14:17'),
(88, 12, 'Hoew much HP', 402, 1075, 'gpt-4o-mini', 0.000199, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-04 01:14:35'),
(89, 12, 'What listing', 318, 627, 'gpt-4o-mini', 0.000128, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-04 01:23:39'),
(90, 12, 'A garge just for tuning', 236, 694, 'gpt-4o-mini', 0.000132, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-04 13:19:39'),
(91, 1, 'What cars do they have', 380, 693, 'gpt-4o', 0.000155, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-04 13:24:17'),
(92, 1, 'muu auto opening hours', 441, 576, 'gpt-4o', 0.000139, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-04 13:41:31'),
(93, 1, 'I have a problem with my car. It is just cranking', 725, 633, 'gpt-4o-mini', 0.000166, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-04 13:43:04'),
(94, 1, 'Yes', 209, 692, 'gpt-4o-mini', 0.000132, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-04 13:43:26'),
(95, 1, 'Fuel capacity 2020 fortuner', 174, 585, 'gpt-4o-mini', 0.000104, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-05 10:18:09'),
(96, 36, 'Hi', 171, 807, 'gpt-4o-mini', 0.000139, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 14:47:26'),
(97, 36, 'Hi', 179, 806, 'gpt-4o-mini', 0.000138, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 15:18:48'),
(98, 36, 'I need a 6 seater SUV', 1181, 493, 'gpt-4o-mini', 0.000000, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 15:19:04'),
(99, 36, 'How much is the diesal cost today', 678, 1933, 'gpt-4o-mini', 0.000000, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 15:27:29'),
(100, 36, 'I need a family vam', 1413, 480, 'gpt-4o-mini', 0.000000, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 19:28:59'),
(101, 36, 'Help me', 1605, 2053, 'gpt-4o-mini', 0.000479, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 20:40:28'),
(102, 36, 'Any available on motorlink', 393, 2148, 'gpt-4o-mini', 0.000358, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 20:40:51'),
(103, 36, 'brake pads', 969, 2002, 'gpt-4o-mini', 0.000405, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-08 15:34:11'),
(104, 1, 'Hi', 176, 1562, 'gpt-4o-mini', 0.000252, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-08 17:09:58'),
(105, 1, 'I am lookign for a car in mzuzu', 394, 432, 'gpt-4o-mini', 0.000000, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-08 17:10:23'),
(106, 1, 'Looking for a car part', 410, 366, 'gpt-4o-mini', 0.000000, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-08 21:48:46'),
(107, 1, 'Looking for a van in lilongwe', 907, 388, 'gpt-4o-mini', 0.000000, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-09 15:19:30'),
(108, 1, 'Looking for one in liliongwe only', 707, 1026, 'gpt-4o-mini', 0.000000, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-10 14:11:45'),
(109, 1, 'In muzu', 281, 1889, 'gpt-4o-mini', 0.000309, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-11 12:46:26');

-- --------------------------------------------------------

--
-- Table structure for table `ai_chat_user_restrictions`
--

CREATE TABLE `ai_chat_user_restrictions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `disabled` tinyint(1) DEFAULT '0',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `disabled_by` int DEFAULT NULL COMMENT 'Admin user ID who disabled it',
  `disabled_at` timestamp NULL DEFAULT NULL,
  `enabled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_chat_user_restrictions`
--

INSERT INTO `ai_chat_user_restrictions` (`id`, `user_id`, `disabled`, `reason`, `disabled_by`, `disabled_at`, `enabled_at`, `created_at`, `updated_at`) VALUES
(1, 36, 0, '', 1, NULL, '2026-01-02 21:09:09', '2026-01-02 21:02:11', '2026-01-02 21:09:09');

-- --------------------------------------------------------

--
-- Table structure for table `ai_learning_status`
--

CREATE TABLE `ai_learning_status` (
  `id` int NOT NULL,
  `learning_date` date NOT NULL,
  `topics_learned` int DEFAULT '0',
  `topics_failed` int DEFAULT '0',
  `categories_completed` text COLLATE utf8mb4_unicode_ci,
  `last_run_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_learning_status`
--

INSERT INTO `ai_learning_status` (`id`, `learning_date`, `topics_learned`, `topics_failed`, `categories_completed`, `last_run_at`) VALUES
(1, '2026-01-09', 3, 0, 'Mechanical Topics, Parts, Specifications', '2026-01-09 10:17:57'),
(4, '2026-01-10', 3, 0, 'Mechanical Topics, Parts, Specifications', '2026-01-10 23:09:41'),
(6, '2026-01-11', 3, 0, 'Mechanical Topics, Parts, Specifications', '2026-01-11 00:45:11');

-- --------------------------------------------------------

--
-- Table structure for table `ai_parts_cache`
--

CREATE TABLE `ai_parts_cache` (
  `id` int NOT NULL,
  `make_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year` int DEFAULT NULL,
  `part_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `part_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oem_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci,
  `compatibility` text COLLATE utf8mb4_unicode_ci,
  `specifications` text COLLATE utf8mb4_unicode_ci,
  `cross_reference` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of alternative part numbers',
  `price_usd` decimal(10,2) DEFAULT NULL,
  `price_aed` decimal(10,2) DEFAULT NULL,
  `source_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `partsouq_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `query_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` mediumtext COLLATE utf8mb4_unicode_ci,
  `sources_json` mediumtext COLLATE utf8mb4_unicode_ci,
  `helpfulness_score` int DEFAULT '0',
  `usage_count` int DEFAULT '0',
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_web_cache`
--

CREATE TABLE `ai_web_cache` (
  `id` int NOT NULL,
  `query_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `query_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` mediumtext COLLATE utf8mb4_unicode_ci,
  `sources_json` mediumtext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `helpfulness_score` int DEFAULT '0' COMMENT 'Sum of upvotes (+1) and downvotes (-1)',
  `usage_count` int DEFAULT '0' COMMENT 'Number of times this cache entry was used',
  `last_used_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_web_cache`
--

INSERT INTO `ai_web_cache` (`id`, `query_hash`, `query_text`, `summary`, `sources_json`, `created_at`, `updated_at`, `helpfulness_score`, `usage_count`, `last_used_at`) VALUES
(1, '2e702c26b1de6089735870aee7e72e74476bdaa7b344c6a083ac6c416ea6d5db', 'Toyota Hilux 2020 fuel tank capacity consumption liters per 100km', 'Fuel Tank Capacity: Not found liters. Fuel Consumption: 6.9 L/100km.', '[{\"title\":\"HiLux Range | WorkMate, SR, SR5, Rogue & Rugged X\",\"link\":\"https:\\/\\/www.toyota.com.au\\/hilux\\/range?srsltid=AfmBOorhGI-0l-BySWozxgVAJNj6ABLkZv4H6W1kkFltzFLTSzvfmAVV\",\"snippet\":\"\\u25cb Fuel efficiency : 7.4L\\/100km ... Results were achieved under laboratory conditions and do not reflect the fuel consumption in real world driving.\"},{\"title\":\"\\ud83d\\udd25Toyota Hilux \\u25aa Fuel Economy: 6.9L\\/100km \\u25aa Engine Size ...\",\"link\":\"https:\\/\\/www.facebook.com\\/beforward\\/posts\\/toyota-hilux-fuel-economy-69l100km-engine-size-2393cc-year-2020-mileage-150000-k\\/1096238695876861\\/\",\"snippet\":\"Toyota Hilux \\u25ab Fuel Economy: 6.9L\\/100km \\u25ab Engine Size: 2,393cc \\u25ab Year: 2020 \\u25ab Mileage: 150,000 km \\u25ab Fuel: Diesel Browse Toyota Hilux Cars: ...\"},{\"title\":\"2020 Toyota Hilux\",\"link\":\"https:\\/\\/greenvehicleguide.gov.au\\/Vehicle\\/ViewVehicle?vehicleDisplayIdList=30613%3A30614%3A30615%3A30616%3A30617%3A30618%3A30619%3A30620%3A30621%3A30622%3A30623%3A30624%3A30625%3A30626%3A30627%3A30628%3A30629%3A30630%3A30631%3A30632\",\"snippet\":\"The vehicle\'s fuel consumption per 100km, as measured in the official laboratory test. Actual fuel consumption will depend on how you use your vehicle. ... The ...\"}]', '2026-01-08 18:45:13', '2026-01-08 18:45:13', 0, 0, NULL),
(2, '3aef7d3d184df0e3e3beebe73932efb367bb011eefe2ffb548f433137c74a3b5', 'how does a car engine work', 'Certainly! Understanding how a car engine works involves breaking down the process into several key components and stages. Below is a detailed explanation of how an internal combustion engine operates, along with its key components and important details.\n\n### Overview of an Internal Combustion Engine\n\nAn internal combustion engine (ICE) converts fuel into mechanical energy through a series of controlled explosions (combustion) within the engine\'s cylinders. This energy is then used to power the vehicle.\n\n### Key Components of an Internal Combustion Engine\n\n1. **Engine Block**\n   - The main structure of the engine, housing the cylinders and other components.\n   - Made from cast iron or aluminum for strength and heat dissipation.\n\n2. **Cylinders**\n   - Hollow tubes where fuel and air mix and combust.\n   - Typically, engines have 4, 6, or 8 cylinders.\n\n3. **Pistons**\n   - Move up and down within the cylinders.\n   - Convert the energy from combustion into mechanical motion.\n\n4. **Crankshaft**\n   - Converts the linear motion of the pistons into rotational motion.\n   - Connected to the transmission, which ultimately drives the wheels.\n\n5. **Camshaft**\n   - Controls the opening and closing of the engine\'s valves.\n   - Synchronizes with the crankshaft to ensure proper timing.\n\n6. **Valves**\n   - Intake Valves: Allow the air-fuel mixture into the cylinders.\n   - Exhaust Valves: Allow exhaust gases to exit after combustion.\n\n7. **Fuel System**\n   - **Fuel Tank**: Stores fuel.\n   - **Fuel Pump**: Delivers fuel to the engine.\n   - **Fuel Injectors**: Spray a fine mist of fuel into the intake manifold or directly into the combustion chamber.\n\n8. **Air Intake System**\n   - Draws air into the engine.\n   - Includes air filters to prevent dirt and debris from entering.\n\n9. **Exhaust System**\n   - Directs exhaust gases away from the engine.\n   - Includes components like the catalytic converter and muffler.\n\n10. **Ignition System**\n    - **Spark Plugs**: Ignite the air-fuel mixture in gasoline engines.\n    - **Ignition Coil**: Converts battery voltage to a higher voltage for the spark plugs.\n\n11. **Cooling System**\n    - Regulates engine temperature to prevent overheating.\n    - Includes a radiator, water pump, and coolant.\n\n12. **Lubrication System**\n    - Reduces friction between moving parts.\n    - Circulates oil throughout the engine.\n\n### How an Internal Combustion Engine Works\n\nThe operation of a typical four-stroke internal combustion engine can be broken down into four main strokes:\n\n1. **Intake Stroke**\n   - The intake valve opens, and the piston moves down the cylinder.\n   - A mixture of air and fuel is drawn into the cylinder.\n\n2. **Compression Stroke**\n   - The intake valve closes, and the piston moves back up.\n   - The air-fuel mixture is compressed, increasing its temperature and pressure.\n\n3. **Power Stroke (Combustion)**\n   - At the top of the compression stroke, the spark plug ignites the compressed air-fuel mixture.\n   - The explosion forces the piston down, creating power.\n\n4. **Exhaust Stroke**\n   - The exhaust valve opens, and the piston moves back up.\n   - Exhaust gases are expelled from the cylinder.\n\n### Important Details\n\n- **Fuel Types**: Most common types include gasoline and diesel. Diesel engines operate at higher compression ratios and do not use spark plugs.\n- **Efficiency**: Engine efficiency can be affected by factors such as fuel type, engine design, and tuning.\n- **Emissions**: Modern engines are equipped with systems to reduce harmful emissions, such as catalytic converters and EGR (Exhaust Gas Recirculation) systems.\n- **Turbocharging and Supercharging**: These technologies increase engine power by forcing more air into the combustion chamber, allowing for more fuel to be burned.\n- **Hybrid and Electric Engines**: While traditional ICEs rely on combustion, hybrid engines combine ICE with electric motors, and fully electric vehicles use electric motors powered by batteries.\n\n### Conclusion\n\nAn internal combustion engine is a complex machine that converts fuel into mechanical energy through a series of controlled explosions. Understanding its components and operation is crucial for anyone interested in automotive technology. As technology advances, engines continue to evolve, incorporating new methods for efficiency and emissions control.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-09 10:03:25', '2026-01-10 14:55:06', 0, 1, '2026-01-10 14:55:06'),
(3, 'e4ba2a8a4b7900384640f77804f5dbb1857c923958ab7e175ebd55c8e61a9d33', 'Toyota brake pads part number compatibility specifications', '### Toyota Brake Pads Part Number Compatibility Specifications\n\nWhen it comes to brake pads for Toyota vehicles, understanding part numbers, compatibility, and specifications is crucial for ensuring optimal performance and safety. Below is a detailed overview of OEM part numbers, compatibility information, common alternatives, and specifications.\n\n---\n\n#### 1. OEM Part Numbers\n\nToyota brake pads have specific OEM part numbers that correspond to various models and production years. Here are some common OEM part numbers for Toyota brake pads:\n\n- **Front Brake Pads:**\n  - **04465-0E020**: Used in models like the Toyota Camry (2012-2017).\n  - **04465-0E030**: Compatible with the Toyota RAV4 (2013-2018).\n  - **04465-0C020**: Fits Toyota Corolla (2014-2019).\n\n- **Rear Brake Pads:**\n  - **04466-0E020**: For Toyota Camry (2012-2017).\n  - **04466-0E030**: Used in Toyota RAV4 (2013-2018).\n  - **04466-0C020**: Fits Toyota Corolla (2014-2019).\n\n#### 2. Compatibility Information\n\nCompatibility of brake pads can vary based on the model, year, and trim level of the Toyota vehicle. Below are some key points regarding compatibility:\n\n- **Model-Specific Fitment**: Always verify that the brake pad part number matches the specific model and year of your Toyota. For example, brake pads for a 2015 Toyota Camry may not fit a 2015 Toyota RAV4.\n  \n- **Trim Levels**: Some models may have different brake pad specifications based on trim levels (e.g., LE, SE, XLE). Always check if the part number is compatible with the specific trim.\n\n- **Aftermarket Options**: Many aftermarket brands offer brake pads that are compatible with OEM specifications. However, it’s essential to confirm that the aftermarket part matches the OEM part number for fitment.\n\n#### 3. Common Alternatives\n\nSeveral aftermarket brands produce brake pads that are compatible with Toyota vehicles. Here are some popular alternatives:\n\n- **Akebono**: Known for their ceramic brake pads, Akebono offers options that provide excellent stopping power with reduced dust.\n  \n- **Bosch**: Bosch offers a range of brake pads, including quiet and low-dust options that are compatible with various Toyota models.\n\n- **Raybestos**: This brand provides a variety of brake pads, including premium options designed for high performance and durability.\n\n- **Wagner**: Wagner brake pads are designed to meet or exceed OEM specifications and are available for many Toyota models.\n\n#### 4. Specifications\n\nWhen selecting brake pads for Toyota vehicles, consider the following specifications:\n\n- **Material Composition**:\n  - **Ceramic**: Offers low dust and noise, ideal for daily driving.\n  - **Semi-Metallic**: Provides better heat dissipation and stopping power, suitable for performance applications.\n  - **Organic**: Generally quieter and softer but may wear faster.\n\n- **Friction Coefficient**: The friction coefficient indicates the effectiveness of the brake pads. Higher coefficients provide better stopping power.\n\n- **Temperature Range**: Brake pads are rated for specific temperature ranges. Ensure that the pads selected can handle the operating conditions of your vehicle.\n\n- **Noise Dampening Features**: Many modern brake pads come with noise-dampening shims or coatings to reduce squeaking and improve comfort.\n\n- **Dust Production**: Some pads are designed to produce less brake dust, which can help keep wheels cleaner.\n\n---\n\n### Conclusion\n\nWhen selecting brake pads for your Toyota vehicle, it is essential to consider OEM part numbers, compatibility with your specific model and trim, and the specifications of the brake pads. While OEM parts are often recommended for their reliability, aftermarket alternatives can provide excellent performance at potentially lower prices. Always ensure that the selected brake pads meet the required specifications for your driving needs.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-09 10:03:50', '2026-01-09 10:03:50', 0, 0, NULL),
(4, 'a5a4badaab6a7e1d35dc54b619c57992b0f5b0b30c36ba8bbd37b07dbad36794', 'Honda City 2017.0000 complete specifications engine transmission fuel capacity dimensions', 'Here are the detailed specifications for the 2017 Honda City:\n\n### General Overview\n- **Make**: Honda\n- **Model**: City\n- **Year**: 2017\n\n### Engine Specifications\n- **Engine Type**: Inline-4, DOHC, i-VTEC\n- **Displacement**: 1.5 liters (1497 cc)\n- **Maximum Power**: \n  - Petrol: 119 hp (88 kW) @ 6,600 rpm\n  - Diesel: 98.6 hp (73.5 kW) @ 4,000 rpm\n- **Maximum Torque**: \n  - Petrol: 145 Nm @ 4,600 rpm\n  - Diesel: 200 Nm @ 1,750 rpm\n- **Fuel System**: Multi-Point Fuel Injection (MPFI)\n- **Fuel Type**: Petrol / Diesel\n\n### Transmission\n- **Transmission Type**: \n  - Petrol: Continuously Variable Transmission (CVT)\n  - Diesel: 6-speed Manual Transmission\n- **Drive Type**: Front-Wheel Drive (FWD)\n\n### Fuel Capacity\n- **Fuel Tank Capacity**: 40 liters\n\n### Dimensions\n- **Overall Length**: 4,440 mm\n- **Overall Width**: 1,694 mm\n- **Overall Height**: 1,477 mm\n- **Wheelbase**: 2,600 mm\n- **Ground Clearance**: 165 mm\n- **Curb Weight**: \n  - Petrol: Approximately 1,200 kg\n  - Diesel: Approximately 1,300 kg\n\n### Performance Specifications\n- **Top Speed**: Approximately 180 km/h\n- **Acceleration (0-100 km/h)**: \n  - Petrol: Approximately 10.0 seconds\n  - Diesel: Approximately 11.0 seconds\n- **Fuel Efficiency (Mileage)**: \n  - Petrol: 17.4 km/l (ARAI)\n  - Diesel: 25.6 km/l (ARAI)\n\n### Suspension\n- **Front Suspension**: MacPherson Strut\n- **Rear Suspension**: Torsion Beam\n\n### Brakes\n- **Front Brakes**: Disc brakes\n- **Rear Brakes**: Drum brakes\n\n### Tires\n- **Tire Size**: 185/60 R15\n- **Spare Tire**: Full-size spare\n\n### Interior Features\n- **Seating Capacity**: 5 passengers\n- **Infotainment System**: 7-inch touchscreen with Bluetooth, USB, and Aux connectivity\n- **Air Conditioning**: Automatic Climate Control\n- **Power Windows**: Yes\n- **Steering Wheel**: Leather-wrapped with audio controls\n\n### Safety Features\n- **Airbags**: Dual front airbags\n- **ABS**: Anti-lock Braking System\n- **EBD**: Electronic Brake Distribution\n- **Rear Parking Sensors**: Available\n- **Vehicle Stability Assist**: Available\n\n### Additional Features\n- **Keyless Entry**: Yes\n- **Sunroof**: Available in higher trims\n- **Cruise Control**: Available\n\nThis structured list provides a comprehensive overview of the specifications and features of the 2017 Honda City.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-09 10:04:16', '2026-01-09 10:04:16', 0, 0, NULL),
(5, 'aef155c79ce9bdc002e6ffd377e5cff2d30003d9f48f30845a1d74480c2f3537', 'how does a car air conditioning system work', 'Certainly! A car air conditioning (A/C) system is designed to cool the interior of a vehicle, providing comfort to passengers during hot weather. Below is a detailed explanation of how a car A/C system works, its key components, and important details.\n\n### How Car Air Conditioning Works\n\nThe car A/C system operates on the principles of thermodynamics, specifically the refrigeration cycle. It removes heat from the cabin air and expels it outside, while circulating cool air back into the vehicle. The process involves several key steps:\n\n1. **Evaporation**: The refrigerant absorbs heat from the cabin air as it evaporates from a liquid to a gas in the evaporator coil.\n2. **Compression**: The gaseous refrigerant is then compressed by the compressor, raising its pressure and temperature.\n3. **Condensation**: The high-pressure gas moves to the condenser, where it releases heat to the outside air and condenses back into a liquid.\n4. **Expansion**: The liquid refrigerant passes through an expansion valve, where it expands and cools before returning to the evaporator.\n\n### Key Components of a Car A/C System\n\n1. **Refrigerant**:\n   - A chemical compound that circulates through the A/C system, absorbing and releasing heat.\n   - Common refrigerants include R-134a and R-1234yf, with the latter being more environmentally friendly.\n\n2. **Compressor**:\n   - The heart of the A/C system, it compresses the refrigerant gas, increasing its pressure and temperature.\n   - Typically driven by a belt connected to the engine, it activates when the A/C is turned on.\n\n3. **Condenser**:\n   - Located at the front of the vehicle, it cools the high-pressure refrigerant gas by dissipating heat to the outside air.\n   - It consists of a series of coils that allow air to flow through and cool the refrigerant.\n\n4. **Expansion Valve (or Orifice Tube)**:\n   - Regulates the flow of refrigerant into the evaporator.\n   - It reduces the pressure of the refrigerant, allowing it to expand and cool before entering the evaporator.\n\n5. **Evaporator**:\n   - Located inside the cabin, it absorbs heat from the air inside the vehicle.\n   - The refrigerant evaporates here, turning from a liquid to a gas and cooling the air that is blown into the cabin.\n\n6. **Blower Motor**:\n   - Circulates air over the evaporator and into the cabin.\n   - It can be adjusted to different speeds to control airflow.\n\n7. **Receiver-Drier (or Accumulator)**:\n   - A component that removes moisture from the refrigerant and filters out contaminants.\n   - It ensures that only clean, dry refrigerant enters the expansion valve.\n\n### Important Details\n\n- **System Control**: The A/C system is controlled by the vehicle\'s climate control system, which allows the driver to set the desired temperature and airflow settings.\n- **Defrost Function**: The A/C system can also be used to defrost windows by dehumidifying the air, which helps to clear condensation.\n- **Maintenance**: Regular maintenance is crucial for optimal performance. This includes checking refrigerant levels, inspecting for leaks, and ensuring components are functioning properly.\n- **Environmental Considerations**: Older refrigerants like R-12 are being phased out due to their ozone-depleting properties. Modern vehicles use R-134a or R-1234yf, which have a lower environmental impact.\n- **Common Issues**: Problems can arise in the A/C system, such as refrigerant leaks, compressor failure, or electrical issues. Symptoms may include weak airflow, warm air blowing from vents, or unusual noises.\n\n### Conclusion\n\nA car air conditioning system is a complex yet efficient mechanism that relies on the principles of thermodynamics to provide comfort in the vehicle. Understanding its components and how they work together can help in diagnosing issues and maintaining the system for optimal performance. Regular checks and maintenance are essential to ensure the longevity and efficiency of the A/C system.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-09 10:17:24', '2026-01-09 10:17:24', 0, 0, NULL),
(6, '5f69fd8f987de2eb33596759ceee80090e0bbaa8df4d424fc6e1858e03ff10fc', 'Mazda water pump part number compatibility specifications', '### Mazda Water Pump Compatibility Specifications\n\nMazda water pumps are critical components of the engine cooling system, ensuring that coolant circulates through the engine and radiator to maintain optimal operating temperatures. Below is detailed information regarding Mazda water pump part numbers, compatibility, specifications, and alternatives.\n\n#### 1. OEM Part Numbers\n\nMazda water pumps have specific OEM part numbers that correspond to various models and engine configurations. Here are some commonly referenced OEM part numbers:\n\n- **Genuine Mazda Water Pump Part Numbers:**\n  - **L3Y1-15-100**: Commonly used in Mazda 3 (2004-2009) with 2.0L and 2.3L engines.\n  - **L3Y1-15-200**: Used in Mazda 6 (2003-2008) with 2.3L engines.\n  - **PE01-15-100**: Found in Mazda RX-8 (2003-2011) with the Renesis engine.\n  - **B6Y1-15-100**: Used in Mazda MX-5 Miata (1990-2005) with 1.6L and 1.8L engines.\n\n#### 2. Compatibility Information\n\nWhen selecting a water pump for a Mazda vehicle, it is essential to ensure compatibility with the specific model and engine type. Below are some general compatibility guidelines:\n\n- **Mazda 3 (2004-2009)**: Compatible with L3Y1-15-100 and L3Y1-15-200.\n- **Mazda 6 (2003-2008)**: Compatible with L3Y1-15-200.\n- **Mazda RX-8 (2003-2011)**: Compatible with PE01-15-100.\n- **Mazda MX-5 Miata (1990-2005)**: Compatible with B6Y1-15-100.\n\n**Note**: Always verify the engine size and year of manufacture to ensure the correct part number is selected.\n\n#### 3. Common Alternatives\n\nIn addition to OEM parts, there are aftermarket alternatives available. Some common aftermarket brands that manufacture compatible water pumps for Mazda vehicles include:\n\n- **Aisin**: Known for high-quality water pumps that often meet or exceed OEM specifications.\n- **GMB**: Offers a range of water pumps that are compatible with various Mazda models.\n- **Duralast**: Available at AutoZone, providing a reliable alternative for Mazda water pumps.\n- **Mishimoto**: Offers performance-oriented water pumps for enthusiasts looking to upgrade.\n\nWhen choosing an aftermarket option, it is advisable to check reviews and ensure that the part meets OEM specifications.\n\n#### 4. Specifications\n\nWater pumps for Mazda vehicles typically have the following specifications:\n\n- **Material**: Most OEM water pumps are made from aluminum or cast iron for durability and heat resistance.\n- **Pump Type**: Centrifugal water pumps are standard in Mazda vehicles, designed to efficiently circulate coolant.\n- **Flow Rate**: Varies by model but generally ranges from 50 to 100 gallons per minute (GPM) depending on engine size and design.\n- **Mounting**: Most Mazda water pumps are designed for direct bolt-on installation, with specific mounting points that align with the engine block.\n- **Seal Type**: Typically includes a mechanical seal to prevent coolant leaks.\n\n#### 5. Installation Considerations\n\nWhen replacing a water pump, consider the following:\n\n- **Timing Belt/Chain**: In some models, the water pump is driven by the timing belt or chain. It is often recommended to replace the timing belt/chain at the same time to avoid future labor costs.\n- **Coolant**: Always use the manufacturer-recommended coolant type and mixture when refilling the system after installation.\n- **Gaskets and Seals**: Ensure that new gaskets and seals are used during installation to prevent leaks.\n\n### Conclusion\n\nSelecting the correct water pump for your Mazda vehicle is crucial for maintaining engine performance and preventing overheating. Always refer to the OEM part numbers and compatibility information specific to your model and engine type. If opting for aftermarket alternatives, ensure they meet or exceed OEM specifications for reliability.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-09 10:17:42', '2026-01-09 10:17:42', 0, 0, NULL),
(7, '0df6c809c71f64b0d73b48ac6b30feb4adfa9fa71b51c4abe1394f9f4585717d', 'Nissan X-Trail 2017.0000 complete specifications engine transmission fuel capacity dimensions', 'Here are the detailed specifications for the 2017 Nissan X-Trail:\n\n### General Information\n- **Make:** Nissan\n- **Model:** X-Trail\n- **Year:** 2017\n\n### Engine Specifications\n- **Engine Type:** Inline-4\n- **Displacement:** 2.5 liters (2488 cc)\n- **Power Output:** \n  - 170 hp (126 kW) at 6,000 rpm\n- **Torque:** \n  - 175 lb-ft (237 Nm) at 4,000 rpm\n- **Fuel System:** Multi-Point Fuel Injection\n- **Fuel Type:** Regular unleaded gasoline\n- **Emissions Rating:** Varies by region; typically meets Euro 6 standards\n\n### Transmission\n- **Transmission Type:** Continuously Variable Transmission (CVT)\n- **Drive Type:** All-Wheel Drive (AWD) or Front-Wheel Drive (FWD) options available\n\n### Fuel Capacity\n- **Fuel Tank Capacity:** 14.8 gallons (56 liters)\n- **Fuel Economy (Combined):**\n  - FWD: Approximately 26 mpg (10.9 L/100 km)\n  - AWD: Approximately 25 mpg (11.2 L/100 km)\n\n### Dimensions\n- **Overall Length:** 182.3 inches (4,638 mm)\n- **Overall Width:** 72.4 inches (1,838 mm)\n- **Overall Height:** 67.3 inches (1,710 mm)\n- **Wheelbase:** 106.5 inches (2,700 mm)\n- **Ground Clearance:** 7.9 inches (200 mm)\n- **Curb Weight:** \n  - FWD: Approximately 3,400 lbs (1,542 kg)\n  - AWD: Approximately 3,600 lbs (1,633 kg)\n\n### Performance Specifications\n- **0-60 mph (0-100 km/h):** Approximately 9.0 seconds (varies by drivetrain)\n- **Top Speed:** Approximately 125 mph (201 km/h)\n- **Towing Capacity:** \n  - FWD: Up to 1,500 lbs (680 kg)\n  - AWD: Up to 2,000 lbs (907 kg)\n\n### Interior and Cargo\n- **Seating Capacity:** 5 passengers\n- **Cargo Volume:** \n  - Behind 2nd row: 39.3 cubic feet (1,113 liters)\n  - With 2nd row folded: 70.0 cubic feet (1,982 liters)\n\n### Safety Features\n- **Airbags:** Front, side, and curtain airbags\n- **Safety Ratings:** Generally high ratings from safety organizations (specific ratings may vary by region)\n- **Driver Assistance Features:** Available features may include:\n  - Forward Collision Warning\n  - Automatic Emergency Braking\n  - Blind Spot Monitoring\n  - Rear Cross Traffic Alert\n\n### Additional Features\n- **Infotainment System:** NissanConnect with a 7-inch touchscreen, Bluetooth, and available navigation\n- **Audio System:** Available premium audio systems with multiple speakers\n- **Climate Control:** Dual-zone automatic climate control available\n\n### Conclusion\nThe 2017 Nissan X-Trail is a versatile compact SUV that combines practicality with performance, making it suitable for both urban and off-road driving. Its spacious interior, advanced safety features, and efficient engine options contribute to its appeal in the competitive SUV market.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-09 10:17:56', '2026-01-09 10:17:56', 0, 0, NULL),
(8, 'bd727c48b06cf42f3d03fe7922dfd8f5b8008ec176b7145e8c927018dd3e6e93', 'how does a car exhaust system work', '## How a Car Exhaust System Works\n\nThe exhaust system of a car is a critical component that plays a vital role in the vehicle\'s performance, efficiency, and emissions control. It is designed to channel exhaust gases produced by the engine out of the vehicle while minimizing noise and reducing harmful emissions. Below is a detailed explanation of how the exhaust system works, its key components, and important details.\n\n### 1. Function of the Exhaust System\n\nThe primary functions of a car exhaust system include:\n\n- **Expelling Exhaust Gases**: The system carries exhaust gases produced during combustion away from the engine and out of the vehicle.\n- **Reducing Emissions**: It helps to minimize harmful pollutants released into the atmosphere, complying with environmental regulations.\n- **Noise Reduction**: The exhaust system is designed to reduce engine noise, making the vehicle quieter and more pleasant to drive.\n- **Improving Engine Performance**: A well-designed exhaust system can enhance engine efficiency and performance by optimizing exhaust flow.\n\n### 2. Key Components of the Exhaust System\n\nThe exhaust system consists of several key components, each serving a specific purpose:\n\n#### a. Exhaust Manifold\n\n- **Function**: Collects exhaust gases from the engine\'s cylinders and directs them into the exhaust system.\n- **Material**: Typically made of cast iron or stainless steel to withstand high temperatures.\n- **Design**: Can be a single manifold or a dual manifold for engines with multiple banks of cylinders.\n\n#### b. Catalytic Converter\n\n- **Function**: Converts harmful gases (such as carbon monoxide, hydrocarbons, and nitrogen oxides) into less harmful emissions (such as carbon dioxide and nitrogen) through a chemical reaction.\n- **Location**: Usually located between the exhaust manifold and the muffler.\n- **Components**: Contains a catalyst (often made of platinum, palladium, and rhodium) that facilitates the conversion process.\n\n#### c. Oxygen Sensors\n\n- **Function**: Monitor the level of oxygen in the exhaust gases to help the engine control unit (ECU) optimize the air-fuel mixture for combustion.\n- **Location**: Typically located before and after the catalytic converter.\n- **Types**: There are two main types: upstream (pre-catalytic converter) and downstream (post-catalytic converter) sensors.\n\n#### d. Exhaust Pipes\n\n- **Function**: Transport exhaust gases from the manifold to the tailpipe.\n- **Design**: Can vary in diameter and length, affecting exhaust flow and back pressure.\n- **Material**: Commonly made of stainless steel or aluminized steel for durability.\n\n#### e. Muffler\n\n- **Function**: Reduces noise produced by the engine\'s exhaust gases.\n- **Design**: Contains chambers and baffles that dissipate sound waves.\n- **Types**: Various designs are available, including performance mufflers that can enhance sound and flow.\n\n#### f. Tailpipe\n\n- **Function**: The final section of the exhaust system that expels gases into the atmosphere.\n- **Design**: Can be customized in terms of shape and size for aesthetic or performance purposes.\n\n### 3. How the Exhaust System Works\n\nThe operation of the exhaust system can be summarized in the following steps:\n\n1. **Exhaust Gas Collection**: When the engine burns fuel, it produces exhaust gases. These gases exit the engine through the exhaust valves and enter the exhaust manifold.\n  \n2. **Gas Flow Through the System**: The exhaust manifold collects gases from multiple cylinders and directs them into the exhaust pipes. The design of the manifold ensures efficient gas flow.\n\n3. **Emissions Treatment**: As the gases flow through the catalytic converter, harmful substances are converted into less harmful emissions through oxidation and reduction reactions.\n\n4. **Oxygen Monitoring**: Oxygen sensors continuously monitor the exhaust gases to provide feedback to the ECU, which adjusts the fuel mixture for optimal combustion.\n\n5. **Noise Reduction**: The gases then pass through the muffler, where sound waves are dissipated, reducing the noise produced by the engine.\n\n6. **Exhaust Release**: Finally, the gases exit through the tailpipe and are released into the atmosphere.\n\n### 4. Important Details\n\n- **Back Pressure**: The exhaust system must maintain a balance of back pressure to ensure optimal engine performance. Too much back pressure can hinder engine efficiency, while too little can lead to a loss of power.\n  \n- **Maintenance**: Regular inspection and maintenance of the exhaust system are essential to prevent leaks, corrosion, and blockages that can affect performance and emissions.\n\n- **Aftermarket Modifications**: Many car enthusiasts modify their exhaust systems for improved performance or sound. However, these modifications should comply with local emissions regulations to avoid legal issues.\n\n- **Environmental Impact**: Modern exhaust systems are designed to meet stringent emissions standards, contributing to reduced air pollution and environmental protection.\n\nIn summary, the exhaust system is a complex assembly of components that work', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-10 14:57:47', '2026-01-10 14:57:47', 0, 0, NULL),
(9, 'ad3d52515bf70388228c48072a610600aae588356b0ce1163d44454124973860', 'Mercedes-Benz timing belt part number compatibility specifications', '### Mercedes-Benz Timing Belt Compatibility and Specifications\n\nTiming belts are critical components in the engine of a vehicle, ensuring that the crankshaft and camshaft rotate in sync. In Mercedes-Benz vehicles, the timing belt is often referred to as a timing chain in many models, particularly those with inline engines. However, for models that do utilize timing belts, it is essential to ensure compatibility with the correct OEM part numbers and specifications.\n\n#### 1. **OEM Part Numbers**\n\nThe OEM part numbers for Mercedes-Benz timing belts can vary based on the specific model and engine configuration. Below are some common OEM part numbers for various models that utilize timing belts:\n\n- **A-Class (W168)**\n  - OEM Part Number: **A 168 997 01 20**\n  \n- **B-Class (W245)**\n  - OEM Part Number: **A 245 997 00 20**\n\n- **C-Class (W202, W203)**\n  - OEM Part Number: **A 203 997 00 20** (W203)\n\n- **E-Class (W210, W211)**\n  - OEM Part Number: **A 211 997 00 20** (W211)\n\n- **M-Class (W163)**\n  - OEM Part Number: **A 163 997 00 20**\n\n- **SLK-Class (R170)**\n  - OEM Part Number: **A 170 997 00 20**\n\n#### 2. **Compatibility Information**\n\nWhen replacing a timing belt, it is crucial to ensure compatibility with the specific engine type and model year. Here are some key points regarding compatibility:\n\n- **Engine Type**: Ensure that the timing belt matches the engine configuration (e.g., inline-4, V6, etc.).\n- **Model Year**: Different model years may have different specifications, even for the same model.\n- **Substitutes**: Some aftermarket brands may offer compatible timing belts, but it is essential to verify that they meet or exceed OEM specifications.\n\n#### 3. **Common Alternatives**\n\nWhile OEM parts are recommended for their reliability, there are several aftermarket brands that provide compatible timing belts. Some common alternatives include:\n\n- **ContiTech**: Known for high-quality timing belts that meet OEM specifications.\n- **Gates**: Offers a range of timing belts and kits that are compatible with various Mercedes-Benz models.\n- **Dayco**: Provides reliable timing belts that are often used as alternatives to OEM parts.\n\n#### 4. **Specifications**\n\nTiming belts are designed with specific materials and specifications to ensure durability and performance. Here are some general specifications to consider:\n\n- **Material**: Most timing belts are made from reinforced rubber with nylon or fiberglass cords for added strength.\n- **Tooth Design**: The tooth profile must match the engine\'s specifications for proper engagement with the sprockets.\n- **Length and Width**: Each timing belt has specific dimensions that must be adhered to for compatibility.\n- **Service Interval**: Timing belts typically have a service interval of 60,000 to 100,000 miles, depending on the model and driving conditions.\n\n#### 5. **Installation and Maintenance**\n\n- **Installation**: It is recommended to have a certified technician perform the timing belt replacement, as incorrect installation can lead to severe engine damage.\n- **Maintenance**: Regular inspections of the timing belt for signs of wear, such as cracks or fraying, can help prevent failure.\n\n### Conclusion\n\nWhen dealing with the timing belt for a Mercedes-Benz vehicle, it is crucial to reference the correct OEM part numbers and ensure compatibility with the specific model and engine type. Utilizing quality aftermarket alternatives can be a viable option, but always verify that they meet the necessary specifications. Regular maintenance and timely replacement are key to ensuring the longevity and performance of the engine.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-10 14:58:01', '2026-01-10 14:58:01', 0, 0, NULL),
(10, '8006a5deb2613f712df9ca1e44e1da13aa6ba8a81cb1d02fc83b80483c1c7537', 'Suzuki Swift 2018.0000 complete specifications engine transmission fuel capacity dimensions', 'Here are the detailed specifications for the 2018 Suzuki Swift:\n\n### General Information\n- **Make:** Suzuki\n- **Model:** Swift\n- **Year:** 2018\n\n### Engine Specifications\n- **Engine Type:** Inline-4, DOHC\n- **Displacement:** 1.2 liters (K12M)\n- **Power Output:** \n  - 83 hp (61.5 kW) at 6,000 rpm\n- **Torque:** \n  - 113 Nm (83 lb-ft) at 4,200 rpm\n- **Fuel System:** Multi-Point Fuel Injection (MPFI)\n- **Fuel Type:** Petrol\n- **Emissions Standard:** Euro 6\n\n### Transmission\n- **Transmission Type:** \n  - 5-speed manual transmission\n  - Continuously Variable Transmission (CVT) available in some variants\n- **Drive Type:** Front-wheel drive (FWD)\n\n### Fuel Capacity\n- **Fuel Tank Capacity:** 37 liters (9.8 gallons)\n\n### Dimensions\n- **Overall Length:** 3,840 mm (151.6 inches)\n- **Overall Width:** 1,735 mm (68.3 inches)\n- **Overall Height:** 1,495 mm (58.9 inches)\n- **Wheelbase:** 2,450 mm (96.5 inches)\n- **Ground Clearance:** 120 mm (4.7 inches)\n- **Curb Weight:** Approximately 970 kg (2,138 lbs)\n\n### Performance Specifications\n- **Top Speed:** Approximately 170 km/h (106 mph)\n- **0-100 km/h (0-62 mph) Acceleration:** \n  - Manual: Approximately 11.0 seconds\n  - CVT: Approximately 12.0 seconds\n- **Fuel Economy (Combined):** \n  - Manual: Approximately 4.9 L/100 km (48 mpg)\n  - CVT: Approximately 5.1 L/100 km (46 mpg)\n\n### Suspension\n- **Front Suspension:** MacPherson strut\n- **Rear Suspension:** Torsion beam\n\n### Brakes\n- **Front Brakes:** Disc brakes\n- **Rear Brakes:** Drum brakes\n\n### Wheels and Tires\n- **Wheel Size:** 15 to 16 inches (depending on variant)\n- **Tire Size:** \n  - 185/65 R15 (standard)\n  - 195/55 R16 (optional)\n\n### Interior and Features\n- **Seating Capacity:** 5 passengers\n- **Infotainment System:** \n  - 7-inch touchscreen display\n  - Bluetooth connectivity\n  - USB and AUX input\n- **Air Conditioning:** Manual air conditioning\n- **Safety Features:** \n  - Dual front airbags\n  - ABS with EBD\n  - Electronic Stability Program (ESP) (available in higher trims)\n\n### Exterior Features\n- **Headlights:** Halogen\n- **Fog Lights:** Available in higher trims\n- **Body Style:** Hatchback\n\n### Additional Information\n- **Color Options:** Various colors available depending on market\n- **Warranty:** Typically 3 years or 100,000 km (whichever comes first)\n\nThis structured list provides a comprehensive overview of the specifications for the 2018 Suzuki Swift, covering all essential aspects of the vehicle.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-10 14:58:15', '2026-01-10 14:58:15', 0, 0, NULL),
(11, 'be6f3eb262922cb36163efab11b3bebb530468c3c24e9461af2c822f14e0e6c9', 'Toyota Fortuner bearing OEM part number', 'For the Toyota Fortuner, the following OEM part numbers for bearings have been identified:\n\n1. **Front Axle Hub Inner Bearing**: \n   - **OEM**: 90366-T0061 (compatible with Hilux and 4Runner) [1].\n\n2. **Wheel Hub Bearing (2008-2015 Model)**: \n   - **OEM**: 93305-0060100 (includes ABS compatibility) [2].\n\n3. **Rear Axle Shaft & Hub**: \n   - **OEM**: 42311-0K040 and 42312-0K040 for the KUN50R model [3].\n\n**Common Aftermarket Alternatives**:\n- Brands such as Timken, SKF, and Moog often provide compatible aftermarket bearings for these OEM parts.\n\n**Compatibility**:\n- These parts are compatible with the Toyota Fortuner models from 2008 to 2015, as well as the Hilux and 4Runner.\n\nFor further details or specific part inquiries, consider checking with a Toyota dealer, parts catalog, or using a VIN decoder for precise identification.\n\n**Sources**:\n[1] [eBay](https://www.ebay.com/itm/365029511428)  \n[2] [CRJ Heavy Trucks](https://crjheavytrucks.com/detail/?query=Toyota-Fortuner-Wheel-Hub-Bearing-2008-2015-Model-Front-Rear/520445)  \n[3] [Toyota General EPC Data](https://toyota-general.epc-data.com/fortuner/kun50r/5050/chassis/4102/42312/)  \n[4] [eBay](https://www.ebay.com', '[{\"title\":\"OEM Toyota Fortuner Hilux 4Runner Front Axle Hub Inner ...\",\"link\":\"https:\\/\\/www.ebay.com\\/itm\\/365029511428\",\"snippet\":\"OEM Toyota Fortuner Hilux 4Runner Front Axle Hub Inner Bearing RH 90366-T0061 ; Est. delivery. Wed, Jan 21 - Tue, Jan 27. From Jakarta, Indonesia ; Returns.\"},{\"title\":\"Toyota Fortuner Wheel Hub Bearing\\/2008-2015 Model ...\",\"link\":\"https:\\/\\/crjheavytrucks.com\\/detail\\/?query=Toyota-Fortuner-Wheel-Hub-Bearing-2008-2015-Model-Front-Rear\\/520445\",\"snippet\":\"Toyota Fortuner Wheel Hub Bearing\\/2008-2015 Model\\/Front Rear\\/With ABS 933050060100 Yamaha Grizzly Kodiak Big Bear Front Rear Wheel Bearings If you\'re in need of ...\"},{\"title\":\"Rear axle shaft & hub for Fortuner KUN50R\",\"link\":\"https:\\/\\/toyota-general.epc-data.com\\/fortuner\\/kun50r\\/5050\\/chassis\\/4102\\/42312\\/\",\"snippet\":\"Rear axle shaft & hub for Fortuner KUN50R ; 01, 42312, 42311-0K040 ...\"},{\"title\":\"Toyota Fortuner Hilux OEM Genuine Front Bearing Retainer ...\",\"link\":\"https:\\/\\/www.ebay.com\\/itm\\/324712969427\",\"snippet\":\"Toyota Fortuner Hilux OEM Genuine Front Bearing Retainer 33108-0K020 ; Brand. Toyota ; Manufacturer Part Number. 33108-0K020 ; Est. delivery. Wed, Jan 7 - Sat, Jan ...\"},{\"title\":\"Toyota Hilux Fortuner OEM Genuine Front Inner Wheel ...\",\"link\":\"https:\\/\\/patagonic.cl\\/Toyota-Hilux-Fortuner-OEM-Genuine-Front-Inner-Wheel-Bearing-758385\",\"snippet\":\"Toyota Hilux Fortuner OEM Genuine Front Inner Wheel Bearing 90369-T0003 Compatible Models for Reference *Please check with the manufacturer before purchasing.\"}]', '2026-01-10 15:08:26', '2026-01-10 15:08:26', 0, 0, NULL),
(12, '42b2cf858b36cebbccbbaa07fedf706fc10ab0224a191f25c8cf8855f1984bdd', 'Toyota Fortuner BOLT (FOR HEAD TO CAMSHAFT BEARING CAP) OEM part number', 'For the Toyota Fortuner, the OEM part numbers for the bolt (for head to camshaft bearing cap) include:\n\n- **OEM: 90119-07001** [1]\n- **OEM: 90119-06902** [5]\n- **OEM: 90109-06080** [3]\n- **Cross-reference: 91621-60840** [2]\n\nThese bolts are compatible with various Toyota models, particularly those utilizing the same engine architecture as the Fortuner. \n\nCommon aftermarket alternatives may include generic camshaft cap bolts, but it\'s advisable to verify compatibility with specific vehicle models and engine types. For precise fitment, consult a Toyota dealer, parts catalog, or use a VIN decoder.\n\n**Sources:**\n[1] https://www.toyotapartsdeal.com/oem/toyota~bolt~for~head~to~camshaft~bearing~cap~90119-07001.html  \n[2] https://www.ebay.com/itm/324713063275  \n[3] https://www.nengun.com/oem/toyota/90109-06080?srsltid=AfmBOoqr16MJE7krnBeeHD8NjHrSt1tInMV9UA_vqC0z6h32DACo1HBT  \n[4] https://autoparts.toyota.com/products/product/bolt-camshaft-cap-90118wb426  \n[5] https://www.megazip.net/zapchasti-dlya/toyota/bolt-for-head-to-camshaft-bearing-cap-9011906902?srsltid=AfmBOorF9OrvUQwaPXJu', '[{\"title\":\"90119-07001 Genuine Toyota Bolt\",\"link\":\"https:\\/\\/www.toyotapartsdeal.com\\/oem\\/toyota~bolt~for~head~to~camshaft~bearing~cap~90119-07001.html\",\"snippet\":\"Genuine Toyota. Part Name Code, 11159A. Manufacturer Part Number, 90119-07001. Part Description, Bolt(For Head To Camshaft Bearing Cap). Manufacturer Note, NO.1.\"},{\"title\":\"91621-60840 Toyota OEM Genuine BOLT(FOR HEAD TO ...\",\"link\":\"https:\\/\\/www.ebay.com\\/itm\\/324713063275\",\"snippet\":\"91621-60840 Toyota OEM Genuine BOLT(FOR HEAD TO CAMSHAFT BEARING CAP) ; Country of Origin. Japan ; Brand. Toyota ; Est. delivery. Wed, Jan 7 - Wed, Jan 14. From ...\"},{\"title\":\"Bolt (for Head To Camshaft Bearing Cap)\",\"link\":\"https:\\/\\/www.nengun.com\\/oem\\/toyota\\/90109-06080?srsltid=AfmBOoqr16MJE7krnBeeHD8NjHrSt1tInMV9UA_vqC0z6h32DACo1HBT\",\"snippet\":\"Genuine Toyota OEM part Bolt (for Head To Camshaft Bearing Cap) 90109-06080, can be purchased and shipped direct from Japan to anywhere in the world.\"},{\"title\":\"Camshaft Cap Bolt #90118-WB426\",\"link\":\"https:\\/\\/autoparts.toyota.com\\/products\\/product\\/bolt-camshaft-cap-90118wb426\",\"snippet\":\"Genuine Toyota Camshaft Cap Bolt (#90118-WB426)s have been specifically designed for maximum compatibility and are supported by Toyota\'s genuine parts warranty.\"},{\"title\":\"90119-06902 Bolt(For Head To Camshaft Bearing Cap) ...\",\"link\":\"https:\\/\\/www.megazip.net\\/zapchasti-dlya\\/toyota\\/bolt-for-head-to-camshaft-bearing-cap-9011906902?srsltid=AfmBOorF9OrvUQwaPXJu2sP39Hp1C_0cCaP_veihctB1-1h_PBPWtGqK\",\"snippet\":\"90119-06902 Bolt(For Head To Camshaft Bearing Cap), Toyota ; Japanese Warehouse US $1.44 1 pc. ; Status New Genuine Part ; Shipping | See details ; Worldwide\"}]', '2026-01-10 15:10:06', '2026-01-10 15:10:06', 0, 0, NULL),
(13, 'b595a1dd75b1162494f133a8cab4656ea715fd03af96592b322f2c6ee468745b', 'Mercedes-Benz timing belt part number compatibility specifications (AI Research)', '# Mercedes-Benz Timing Belt Information\n\n## 1. OEM Part Numbers\n- **OEM Part Number**:  A 271 200 00 20\n- **Alternative OEM Part Numbers**: \n  - A 271 200 01 20\n  - A 271 200 02 20\n  - A 271 200 03 20\n\n## 2. Part Number Variations and Alternative Part Numbers\n- **Gates Timing Belt**: T274\n- **Continental Timing Belt**: 5040\n- **Dayco Timing Belt**: 95140\n- **Bando Timing Belt**: 5PK1340\n\n## 3. Cross-Reference Numbers (Compatible Aftermarket Parts)\n- **Gates**: T274\n- **Continental**: 5040\n- **Dayco**: 95140\n- **Bando**: 5PK1340\n- **Meyle**: 100 100 0001\n\n## 4. Compatibility Information\n### Make and Model Compatibility\n- **Mercedes-Benz C-Class (W203)**: 2001-2007\n- **Mercedes-Benz E-Class (W211)**: 2003-2009\n- **Mercedes-Benz CLK-Class (W209)**: 2003-2009\n- **Mercedes-Benz SLK-Class (R171)**: 2004-2011\n- **Mercedes-Benz M-Class (W164)**: 2006-2011\n- **Mercedes-Benz GL-Class (X164)**: 2007-2012\n\n### Engine Compatibility\n- **M271**: 1.8L I4 (Supercharged)\n- **M272**: 3.0L V6\n- **M273**: 5.5L V8\n\n## 5. Technical Specifications\n- **Length**: Approximately 1,000 mm (varies by engine type)\n- **Width**: 25 mm\n- **Thickness**: 5 mm\n- **Material**: Rubber with nylon reinforcement\n- **Tooth Profile**: Curvilinear\n- **Number of Teeth**: Varies by application (typically around 120-130 teeth)\n\n## 6. Common Prices\n- **OEM Timing Belt**: \n  - **USD**: $150 - $250\n  - **AED**: 550 - 920\n- **Aftermarket Timing Belt**: \n  - **USD**: $50 - $120\n  - **AED**: 180 - 440\n\n## 7. Installation Notes\n- **Tools Required**: Basic hand tools, torque wrench, timing belt tensioner tool.\n- **Installation Time**: Approximately 4-6 hours depending on the vehicle and experience level.\n- **Important**: Always replace the timing belt tensioner and idler pulleys during installation to ensure optimal performance and longevity.\n\n## 8. Common Issues or Compatibility Notes\n- **Wear and Tear**: Timing belts can wear out prematurely if not replaced at recommended intervals (typically every 60,000 to 100,000 miles).\n- **Noise**: A failing timing belt may produce a ticking or slapping noise, indicating it may be loose or damaged.\n- **Compatibility**: Ensure that the correct part number is used for your specific engine variant, as using the wrong belt can lead to engine damage.\n- **Visual Inspection**: Before installation, inspect the belt for any signs of cracking, fraying, or glazing.\n\n### Conclusion\nWhen replacing the timing belt on a Mercedes-Benz vehicle, it is crucial to use the correct OEM part number or a high-quality aftermarket alternative. Regular maintenance and timely replacement can prevent severe engine damage and ensure the longevity of the vehicle. Always consult the vehicle\'s service manual for specific instructions and recommendations.', '[{\"title\":\"AI Research - OpenAI\",\"link\":null,\"snippet\":\"AI-generated parts research\"}]', '2026-01-10 23:09:38', '2026-01-10 23:09:38', 0, 0, NULL),
(14, 'ef96c6da07424aa47fd5ff23ea46a0249c8fc1404c2dad47be1180fea4d6167e', 'Toyota brake pads part number compatibility specifications (AI Research)', '# Comprehensive Information on Toyota Brake Pads\n\n## 1. OEM Part Numbers\nToyota brake pads vary by model and year. Here are some common OEM part numbers:\n\n- **Front Brake Pads:**\n  - 04465-0E020 (Toyota Camry 2018-2021)\n  - 04465-0E021 (Toyota RAV4 2019-2021)\n  - 04465-0E022 (Toyota Corolla 2020-2021)\n\n- **Rear Brake Pads:**\n  - 04466-0E020 (Toyota Camry 2018-2021)\n  - 04466-0E021 (Toyota RAV4 2019-2021)\n  - 04466-0E022 (Toyota Corolla 2020-2021)\n\n## 2. Part Number Variations and Alternative Part Numbers\n- **Variations:**\n  - Toyota often updates part numbers; ensure compatibility with the specific vehicle model and year.\n  \n- **Alternative Part Numbers:**\n  - 04465-0E020 can also be referred to as 04465-0E021 in some catalogs.\n  - Aftermarket brands may use different numbering systems but can be cross-referenced.\n\n## 3. Cross-Reference Numbers (Compatible Aftermarket Parts)\n- **Aftermarket Options:**\n  - **Akebono:** ACT787 (compatible with various Toyota models)\n  - **Raybestos:** EHT1003 (compatible with Toyota Camry)\n  - **Bosch:** BP1090 (compatible with Toyota RAV4)\n\n## 4. Compatibility Information\n### Make and Model Compatibility:\n- **Toyota Camry:** 2018-2021\n- **Toyota RAV4:** 2019-2021\n- **Toyota Corolla:** 2020-2021\n- **Toyota Tacoma:** 2016-2021\n- **Toyota Highlander:** 2017-2021\n\n### Year Ranges:\n- Compatibility may vary; always check the specific year and trim level for accurate fitment.\n\n## 5. Technical Specifications\n### Dimensions:\n- **Front Brake Pads:**\n  - Length: Approximately 5.5 inches\n  - Width: Approximately 4.0 inches\n  - Thickness: Approximately 0.5 inches\n\n- **Rear Brake Pads:**\n  - Length: Approximately 5.0 inches\n  - Width: Approximately 3.5 inches\n  - Thickness: Approximately 0.5 inches\n\n### Materials:\n- Typically made from semi-metallic or ceramic materials, providing a balance of performance and noise reduction.\n\n## 6. Common Prices\n- **OEM Brake Pads:**\n  - **USD:** $60 - $120 per set (front or rear)\n  - **AED:** 220 - 440 AED per set (front or rear)\n\n- **Aftermarket Brake Pads:**\n  - **USD:** $30 - $90 per set (front or rear)\n  - **AED:** 110 - 330 AED per set (front or rear)\n\n## 7. Installation Notes\n- **Tools Required:**\n  - Basic hand tools (ratchet set, wrenches)\n  - Brake cleaner\n  - Torque wrench\n\n- **Installation Steps:**\n  1. Lift the vehicle and remove the wheel.\n  2. Remove the caliper bolts and slide the caliper off the rotor.\n  3. Replace the old pads with new ones, ensuring proper orientation.\n  4. Reinstall the caliper and torque bolts to manufacturer specifications.\n  5. Repeat for the other side and reassemble the wheel.\n\n- **Brake Pad Bedding:**\n  - It is recommended to bed the new brake pads by performing a series of controlled stops to ensure optimal performance.\n\n## 8. Common Issues or Compatibility Notes\n- **Noise:** Some aftermarket pads may produce more noise than OEM pads; consider ceramic pads for quieter operation.\n- **Dust:** Aftermarket pads may generate more brake dust; check for low-dust formulations if this is a concern.\n- **Fitment:** Always verify the specific part number against your vehicle\'s VIN to ensure compatibility, as variations exist even within the same model year.\n\n### Conclusion\nWhen selecting brake pads for Toyota vehicles, it is crucial to consider OEM specifications, compatibility, and the intended use of the vehicle. Always consult with a professional or refer to the vehicle\'s service manual for the most accurate information.', '[{\"title\":\"AI Research - OpenAI\",\"link\":null,\"snippet\":\"AI-generated parts research\"}]', '2026-01-11 00:40:41', '2026-01-11 00:40:41', 0, 0, NULL);
INSERT INTO `ai_web_cache` (`id`, `query_hash`, `query_text`, `summary`, `sources_json`, `created_at`, `updated_at`, `helpfulness_score`, `usage_count`, `last_used_at`) VALUES
(15, 'a5a4badaab6a7e1d35dc54b619c57992b0f5b0b30c36ba8bbd37b07dbad36794', 'Honda City 2017.0000 complete specifications engine transmission fuel capacity dimensions', 'Here are the detailed specifications for the 2017 Honda City:\n\n### General Information\n- **Make:** Honda\n- **Model:** City\n- **Year:** 2017\n\n### Engine Specifications\n- **Engine Type:** Inline-4\n- **Displacement:** 1.5 liters (1497 cc)\n- **Power Output:** \n  - Petrol: 119 hp (88 kW) at 6,600 rpm\n  - Diesel: 98.6 hp (73.5 kW) at 4,000 rpm\n- **Torque:**\n  - Petrol: 145 Nm (107 lb-ft) at 4,600 rpm\n  - Diesel: 200 Nm (147 lb-ft) at 1,750 rpm\n- **Fuel System:** Multi-Point Fuel Injection (MPFI) for petrol; Common Rail Direct Injection (CRDI) for diesel\n- **Fuel Type:** Petrol / Diesel\n- **Emissions Standard:** Euro 4\n\n### Transmission\n- **Transmission Type:**\n  - Petrol: Continuously Variable Transmission (CVT) or 5-speed Manual\n  - Diesel: 6-speed Manual\n- **Drive Type:** Front-Wheel Drive (FWD)\n\n### Fuel Capacity\n- **Fuel Tank Capacity:** 40 liters (10.6 gallons)\n\n### Dimensions\n- **Overall Length:** 4,440 mm (174.8 inches)\n- **Overall Width:** 1,694 mm (66.7 inches)\n- **Overall Height:** 1,477 mm (58.2 inches)\n- **Wheelbase:** 2,600 mm (102.4 inches)\n- **Ground Clearance:** 165 mm (6.5 inches)\n- **Curb Weight:** \n  - Petrol: Approximately 1,200 kg (2,645 lbs)\n  - Diesel: Approximately 1,250 kg (2,755 lbs)\n\n### Performance Specifications\n- **Top Speed:**\n  - Petrol: Approximately 180 km/h (112 mph)\n  - Diesel: Approximately 175 km/h (109 mph)\n- **Acceleration (0-100 km/h):**\n  - Petrol: Approximately 10.0 seconds\n  - Diesel: Approximately 11.5 seconds\n- **Fuel Efficiency:**\n  - Petrol: Approximately 17 km/l (40 mpg)\n  - Diesel: Approximately 26 km/l (61 mpg)\n\n### Suspension\n- **Front Suspension:** MacPherson Strut\n- **Rear Suspension:** Torsion Beam\n\n### Brakes\n- **Front Brakes:** Disc brakes\n- **Rear Brakes:** Drum brakes\n\n### Tires\n- **Tire Size:** 185/60 R15 (varies by trim level)\n\n### Interior Features\n- **Seating Capacity:** 5 passengers\n- **Infotainment System:** 7-inch touchscreen display with Bluetooth, USB, and AUX connectivity\n- **Air Conditioning:** Automatic climate control\n- **Safety Features:** Dual front airbags, ABS with EBD, rear parking sensors, and more\n\n### Exterior Features\n- **Headlights:** Halogen with LED daytime running lights\n- **Wheels:** Alloy wheels (varies by trim level)\n- **Sunroof:** Available in higher trims\n\n### Additional Information\n- **Warranty:** Typically 3 years or 100,000 km (whichever comes first) depending on the region\n- **Color Options:** Various colors available depending on the market\n\nThis structured list provides a comprehensive overview of the 2017 Honda City, covering all relevant technical specifications and features.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-11 00:40:57', '2026-01-11 00:40:57', 0, 0, NULL),
(16, 'ef96c6da07424aa47fd5ff23ea46a0249c8fc1404c2dad47be1180fea4d6167e', 'Toyota brake pads part number compatibility specifications (AI Research)', '# Toyota Brake Pads Information\n\n## 1. OEM Part Numbers\n- **Front Brake Pads:**\n  - 04465-0E010\n  - 04465-0E020\n  - 04465-0E030\n- **Rear Brake Pads:**\n  - 04466-0E010\n  - 04466-0E020\n  - 04466-0E030\n\n## 2. Part Number Variations and Alternative Part Numbers\n- **Front Brake Pads:**\n  - 04465-0E010 (for models like Camry, Corolla)\n  - 04465-0E020 (for models like RAV4, Highlander)\n  - 04465-0E030 (for models like Tacoma, Tundra)\n- **Rear Brake Pads:**\n  - 04466-0E010 (for models like Camry, Corolla)\n  - 04466-0E020 (for models like RAV4, Highlander)\n  - 04466-0E030 (for models like Tacoma, Tundra)\n\n## 3. Cross-Reference Numbers (Compatible Aftermarket Parts)\n- **Front Brake Pads:**\n  - Akebono ACT905 (for various Toyota models)\n  - Bosch BP1080 (compatible with several Toyota vehicles)\n  - Wagner ZD1060 (for select Toyota models)\n- **Rear Brake Pads:**\n  - Akebono ACT906 (for various Toyota models)\n  - Bosch BP1081 (compatible with several Toyota vehicles)\n  - Wagner ZD1061 (for select Toyota models)\n\n## 4. Compatibility Information\n### Front Brake Pads\n- **Toyota Models:**\n  - Camry (2012-2023)\n  - Corolla (2014-2023)\n  - RAV4 (2013-2023)\n  - Highlander (2014-2023)\n  - Tacoma (2016-2023)\n  - Tundra (2014-2023)\n\n### Rear Brake Pads\n- **Toyota Models:**\n  - Camry (2012-2023)\n  - Corolla (2014-2023)\n  - RAV4 (2013-2023)\n  - Highlander (2014-2023)\n  - Tacoma (2016-2023)\n  - Tundra (2014-2023)\n\n## 5. Technical Specifications\n### Front Brake Pads\n- **Dimensions:** Typically around 5.5 inches long, 2.5 inches wide, and 0.5 inches thick (varies by model).\n- **Material:** Semi-metallic or ceramic compounds for optimal performance and reduced noise.\n- **Friction Material Thickness:** Approximately 10-12 mm (new pads).\n\n### Rear Brake Pads\n- **Dimensions:** Typically around 5.0 inches long, 2.4 inches wide, and 0.5 inches thick (varies by model).\n- **Material:** Semi-metallic or ceramic compounds.\n- **Friction Material Thickness:** Approximately 10-12 mm (new pads).\n\n## 6. Common Prices\n- **OEM Front Brake Pads:** \n  - Approximately $70 - $120 USD\n  - Approximately 250 - 440 AED\n- **OEM Rear Brake Pads:**\n  - Approximately $60 - $110 USD\n  - Approximately 220 - 400 AED\n- **Aftermarket Options:**\n  - Typically range from $30 - $80 USD\n  - Approximately 110 - 300 AED\n\n## 7. Installation Notes\n- **Tools Required:** Basic hand tools including a socket set, torque wrench, and brake cleaner.\n- **Installation Steps:**\n  1. Lift the vehicle and remove the wheel.\n  2. Remove the caliper bolts and slide the caliper off the rotor.\n  3. Replace the old brake pads with new ones, ensuring proper orientation.\n  4. Compress the caliper piston if necessary.\n  5. Reinstall the caliper and wheel, then torque to manufacturer specifications.\n- **Brake Pad Break-In:** It’s recommended to perform a break-in procedure after installation to ensure optimal performance.\n\n## 8. Common Issues or Compatibility Notes\n- **Squeaking or Grinding:** Often indicates worn pads or improper installation.\n- **Dust Accumulation:** Some aftermarket pads may produce more dust than OEM pads.\n- **Compatibility:** Always verify the specific part number for your vehicle\'s make and model, as variations may exist even within the same model year.\n- **Brake Warning Light:** If the light appears after installation, check the installation and sensor connections.\n\nThis comprehensive guide provides essential information for selecting and installing Toyota brake pads, ensuring compatibility and performance for your vehicle. Always consult your vehicle\'s service manual for specific details related to your model.', '[{\"title\":\"AI Research - OpenAI\",\"link\":null,\"snippet\":\"AI-generated parts research\"}]', '2026-01-11 00:44:51', '2026-01-11 00:44:51', 0, 0, NULL),
(17, 'a5a4badaab6a7e1d35dc54b619c57992b0f5b0b30c36ba8bbd37b07dbad36794', 'Honda City 2017.0000 complete specifications engine transmission fuel capacity dimensions', 'Here are the detailed specifications for the 2017 Honda City:\n\n### General Information\n- **Make**: Honda\n- **Model**: City\n- **Year**: 2017\n\n### Engine Specifications\n- **Engine Type**: Inline-4, DOHC, i-VTEC\n- **Displacement**: 1.5 liters (1497 cc)\n- **Power Output**: \n  - Petrol: 119 hp (88 kW) at 6,600 rpm\n  - Diesel: 98.6 hp (73.5 kW) at 4,000 rpm\n- **Torque**: \n  - Petrol: 145 Nm at 4,600 rpm\n  - Diesel: 200 Nm at 1,750 rpm\n- **Fuel System**: Multi-Point Fuel Injection (MPFI) for petrol; Direct Injection for diesel\n- **Fuel Type**: \n  - Petrol: Unleaded\n  - Diesel: Diesel\n\n### Transmission\n- **Transmission Type**: \n  - Petrol: Continuously Variable Transmission (CVT) or 5-speed Manual Transmission\n  - Diesel: 6-speed Manual Transmission\n- **Drive Type**: Front-Wheel Drive (FWD)\n\n### Fuel Capacity\n- **Fuel Tank Capacity**: 40 liters (10.57 gallons)\n\n### Dimensions\n- **Overall Length**: 4,440 mm (174.8 inches)\n- **Overall Width**: 1,694 mm (66.7 inches)\n- **Overall Height**: 1,477 mm (58.2 inches)\n- **Wheelbase**: 2,600 mm (102.4 inches)\n- **Ground Clearance**: 165 mm (6.5 inches)\n- **Curb Weight**: \n  - Petrol: Approximately 1,150 kg (2,535 lbs)\n  - Diesel: Approximately 1,200 kg (2,645 lbs)\n\n### Performance Specifications\n- **Top Speed**: \n  - Petrol: Approximately 190 km/h (118 mph)\n  - Diesel: Approximately 180 km/h (112 mph)\n- **Acceleration (0-100 km/h)**: \n  - Petrol: Approximately 10.0 seconds\n  - Diesel: Approximately 11.5 seconds\n- **Fuel Efficiency**: \n  - Petrol: Approximately 17 km/l (40 mpg) (varies by driving conditions)\n  - Diesel: Approximately 25 km/l (59 mpg) (varies by driving conditions)\n\n### Other Relevant Technical Information\n- **Suspension**: \n  - Front: MacPherson Strut\n  - Rear: Torsion Beam\n- **Brakes**: \n  - Front: Disc brakes\n  - Rear: Drum brakes (Petrol) / Disc brakes (Diesel)\n- **Tires**: \n  - Size: 185/60 R15 (varies by trim)\n- **Seating Capacity**: 5 passengers\n- **Cargo Volume**: 510 liters (18 cubic feet)\n\n### Features\n- **Infotainment System**: Touchscreen display with Bluetooth connectivity, USB ports, and audio streaming\n- **Safety Features**: Dual front airbags, ABS with EBD, rear parking sensors, and optional side airbags\n- **Interior Features**: Air conditioning, power windows, central locking, and adjustable steering\n\nThis structured list provides a comprehensive overview of the specifications for the 2017 Honda City, covering all essential aspects of the vehicle.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-11 00:45:10', '2026-01-11 00:45:10', 0, 0, NULL),
(18, '5bda63ea4b8c1b7a2f3928b3bcc80df9f9dcabdc6c7cd77ee66e2f4fc48d6c5a', 'how does a car transmission work', 'Certainly! A car transmission is a crucial component of the vehicle\'s drivetrain that enables the engine\'s power to be effectively transferred to the wheels. It allows the vehicle to operate efficiently at various speeds and under different load conditions. Below is a detailed explanation of how a car transmission works, its key components, and important details.\n\n### 1. Overview of Transmission Types\nThere are several types of transmissions, but the most common are:\n\n- **Manual Transmission (MT)**: Requires the driver to manually shift gears using a clutch pedal and gear stick.\n- **Automatic Transmission (AT)**: Shifts gears automatically based on vehicle speed and engine load, without driver intervention.\n- **Continuously Variable Transmission (CVT)**: Uses a system of pulleys and belts to provide an infinite range of gear ratios, allowing for smooth acceleration without traditional gear shifts.\n- **Dual-Clutch Transmission (DCT)**: Combines elements of manual and automatic transmissions, using two separate clutches for odd and even gears to enable faster shifting.\n\n### 2. Key Components of a Transmission\nRegardless of the type, a transmission consists of several key components:\n\n- **Gear Sets**: These are the different gear ratios that allow the vehicle to change speed and torque. Gear sets can be simple (like in manual transmissions) or complex (like in automatics).\n  \n- **Clutch (in Manual Transmissions)**: Engages and disengages the engine from the transmission, allowing the driver to change gears. It consists of:\n  - **Clutch Disc**: Pressed against the flywheel to transmit power.\n  - **Pressure Plate**: Holds the clutch disc against the flywheel.\n  - **Release Bearing**: Engages and disengages the clutch when the pedal is pressed.\n\n- **Torque Converter (in Automatic Transmissions)**: A fluid coupling that allows the engine to continue running while the vehicle is stationary. It multiplies torque and enables smooth acceleration.\n\n- **Planetary Gear Sets**: Common in automatic transmissions, these consist of a sun gear, planet gears, and a ring gear, allowing for multiple gear ratios.\n\n- **Transmission Fluid**: Lubricates components, cools the transmission, and aids in hydraulic operation in automatic transmissions.\n\n- **Valve Body**: A complex hydraulic control system that directs transmission fluid to the appropriate clutches and bands to engage the correct gears.\n\n- **Shifter**: The mechanism that allows the driver to select gears (in manual) or modes (in automatic).\n\n### 3. How a Transmission Works\n#### Manual Transmission\n1. **Engagement**: The driver presses the clutch pedal, disengaging the engine from the transmission.\n2. **Shifting Gears**: The driver moves the gear stick to select a different gear.\n3. **Re-engagement**: Releasing the clutch pedal re-engages the engine with the transmission, allowing power to flow to the wheels in the selected gear.\n\n#### Automatic Transmission\n1. **Torque Converter**: The engine drives the torque converter, which uses fluid dynamics to transfer power to the transmission.\n2. **Gear Selection**: The vehicle\'s speed and throttle position are monitored by the transmission control unit (TCU), which determines when to shift gears.\n3. **Hydraulic Control**: The valve body directs transmission fluid to the appropriate clutches and bands, engaging the selected gear.\n4. **Shifting**: As the vehicle accelerates, the TCU signals the valve body to shift to a higher gear, or downshift as needed for acceleration or deceleration.\n\n#### Continuously Variable Transmission (CVT)\n1. **Pulleys and Belt System**: A CVT uses a pair of variable-diameter pulleys connected by a belt. As the pulleys change diameter, the effective gear ratio changes continuously.\n2. **Smooth Acceleration**: This allows for seamless acceleration without noticeable gear shifts, optimizing engine performance.\n\n### 4. Important Details\n- **Gear Ratios**: Different gear ratios affect acceleration and top speed. Lower gears provide more torque for acceleration, while higher gears allow for higher speeds with better fuel efficiency.\n- **Maintenance**: Regular maintenance, including fluid changes and inspections, is crucial for transmission longevity. Automatic transmissions often require specific fluids and service intervals.\n- **Common Issues**: Problems can include slipping gears, delayed engagement, overheating, and unusual noises, which can indicate issues with clutches, bands, or fluid levels.\n\n### 5. Conclusion\nThe transmission is a vital component of a vehicle that allows for the efficient transfer of power from the engine to the wheels. Understanding how it works, its key components, and the differences between types of transmissions can help in diagnosing issues and maintaining optimal vehicle performance. Regular maintenance and awareness of potential problems are essential for ensuring the longevity and reliability of the transmission system.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-11 12:24:04', '2026-01-11 12:24:04', 0, 0, NULL),
(19, '8f0a4565ce87bbbaa3acd8a4a065b41163b15d3dd4b284bf6d4671891e0a1a34', 'how do car brakes work', '# How Car Brakes Work\n\nCar brakes are a critical safety feature that allows vehicles to slow down or come to a complete stop. The braking system converts kinetic energy into thermal energy through friction, which is then dissipated as heat. Below is a comprehensive explanation of how car brakes work, including key components and important details.\n\n## 1. Basic Principles of Braking\n\n- **Kinetic Energy**: When a vehicle is in motion, it possesses kinetic energy, which must be overcome to slow down or stop the vehicle.\n- **Friction**: Braking systems rely on friction to convert kinetic energy into heat, which slows the wheels and ultimately stops the vehicle.\n\n## 2. Types of Brake Systems\n\n### A. Disc Brakes\n\n- **Components**:\n  - **Brake Rotor**: A disc that rotates with the wheel.\n  - **Brake Caliper**: A clamp that houses the brake pads and applies pressure to the rotor.\n  - **Brake Pads**: Friction material that presses against the rotor to create stopping power.\n  - **Brake Fluid**: Hydraulic fluid that transfers force from the brake pedal to the caliper.\n\n- **Operation**:\n  1. When the driver presses the brake pedal, hydraulic pressure is created in the brake lines.\n  2. This pressure forces the caliper pistons to push the brake pads against the rotor.\n  3. The friction between the pads and rotor slows down the wheel.\n\n### B. Drum Brakes\n\n- **Components**:\n  - **Brake Drum**: A cylindrical component that rotates with the wheel.\n  - **Brake Shoes**: Curved friction material that presses against the inside of the drum.\n  - **Wheel Cylinder**: A hydraulic component that pushes the brake shoes outward.\n\n- **Operation**:\n  1. Pressing the brake pedal creates hydraulic pressure in the wheel cylinder.\n  2. The wheel cylinder pushes the brake shoes outward against the inner surface of the drum.\n  3. The friction between the shoes and drum slows the wheel.\n\n## 3. Key Components of Brake Systems\n\n### A. Brake Pedal\n\n- The interface between the driver and the braking system.\n- When pressed, it activates the master cylinder.\n\n### B. Master Cylinder\n\n- Converts the mechanical force from the brake pedal into hydraulic pressure.\n- Contains brake fluid, which is essential for the hydraulic system.\n\n### C. Brake Lines\n\n- Tubes that carry brake fluid from the master cylinder to the brake calipers or wheel cylinders.\n- Must be free of leaks and blockages for effective braking.\n\n### D. Anti-lock Braking System (ABS)\n\n- A safety feature that prevents wheel lock-up during hard braking.\n- Uses sensors to monitor wheel speed and modulates brake pressure to maintain traction.\n\n## 4. Important Details\n\n### A. Brake Fluid\n\n- A hydraulic fluid that transmits force from the brake pedal to the brake components.\n- Must be maintained at the proper level and replaced periodically to prevent moisture contamination.\n\n### B. Brake Maintenance\n\n- **Inspection**: Regular checks of brake pads, rotors, and fluid levels are crucial for safety.\n- **Replacement**: Worn brake pads should be replaced to maintain effective stopping power.\n- **Brake Noise**: Squeaking or grinding noises can indicate worn pads or other issues.\n\n### C. Heat Dissipation\n\n- Braking generates heat due to friction, which can lead to brake fade if not dissipated effectively.\n- Disc brakes generally dissipate heat better than drum brakes, making them more effective in high-performance situations.\n\n### D. Performance Factors\n\n- Weight of the vehicle, road conditions, and brake system design all affect braking performance.\n- Proper tire maintenance also plays a critical role in effective braking.\n\n## Conclusion\n\nUnderstanding how car brakes work is essential for vehicle safety and maintenance. The braking system, whether disc or drum, relies on friction to convert kinetic energy into heat, allowing the vehicle to slow down or stop. Regular maintenance and awareness of the key components can ensure that the braking system functions effectively, providing safety for drivers and passengers alike.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-11 12:24:24', '2026-01-11 12:24:24', 0, 0, NULL),
(20, '65ec98c1a068267fe7efc82a63171635cc6906936f2c34e51293224e5a1915a8', 'how does a car cooling system work', '## Overview of a Car Cooling System\n\nThe cooling system in a car is essential for maintaining the engine\'s optimal operating temperature. It prevents overheating, which can lead to severe engine damage. The cooling system works by circulating coolant through the engine and radiator to dissipate heat.\n\n### Key Functions of the Cooling System\n\n- **Temperature Regulation**: Keeps the engine at a stable operating temperature.\n- **Heat Dissipation**: Removes excess heat generated during combustion.\n- **Prevention of Engine Damage**: Protects against overheating, which can warp engine components or cause failure.\n\n### Key Components of the Cooling System\n\n1. **Coolant**:\n   - A mixture of water and antifreeze (ethylene glycol or propylene glycol).\n   - Lowers the freezing point and raises the boiling point of the fluid, allowing it to operate effectively under various temperature conditions.\n\n2. **Radiator**:\n   - A heat exchanger that dissipates heat from the coolant into the air.\n   - Consists of a series of tubes and fins that increase surface area for better heat transfer.\n\n3. **Water Pump**:\n   - Circulates coolant throughout the engine and cooling system.\n   - Typically driven by a belt connected to the engine, ensuring constant flow of coolant.\n\n4. **Thermostat**:\n   - A temperature-sensitive valve that regulates the flow of coolant to the radiator.\n   - Remains closed when the engine is cold to allow it to warm up quickly and opens when the engine reaches a predetermined temperature to allow coolant to flow to the radiator.\n\n5. **Hoses**:\n   - Flexible tubes that transport coolant between the engine, radiator, and other components.\n   - Include upper and lower radiator hoses, as well as heater hoses.\n\n6. **Cooling Fans**:\n   - Electric or belt-driven fans that help draw air through the radiator when the vehicle is stationary or moving slowly.\n   - Activate based on engine temperature or air conditioning demands.\n\n7. **Expansion Tank (or Overflow Tank)**:\n   - A reservoir that allows for the expansion of coolant as it heats up.\n   - Helps maintain system pressure and allows for coolant recovery when the engine cools down.\n\n### How the Cooling System Works\n\n1. **Engine Operation**:\n   - As the engine runs, it generates heat from the combustion process.\n   - The coolant absorbs this heat as it circulates through the engine block and cylinder head.\n\n2. **Heat Transfer**:\n   - The heated coolant exits the engine and flows to the radiator.\n   - In the radiator, air is drawn through the fins by the cooling fans or the vehicle\'s motion, cooling the coolant as it passes through the radiator tubes.\n\n3. **Thermostat Regulation**:\n   - The thermostat monitors the coolant temperature.\n   - When the engine is cold, the thermostat remains closed, allowing the engine to warm up quickly.\n   - Once the coolant reaches the set temperature (usually around 195-220°F or 90-105°C), the thermostat opens, allowing coolant to flow to the radiator for cooling.\n\n4. **Return Flow**:\n   - The cooled coolant returns to the engine to absorb more heat, continuing the cycle.\n   - The system maintains a balance of coolant flow and temperature regulation.\n\n5. **Expansion and Recovery**:\n   - As the coolant heats up, it expands and may overflow into the expansion tank.\n   - When the engine cools down, the coolant contracts, and the system can draw coolant back from the expansion tank to maintain proper levels.\n\n### Important Details\n\n- **Coolant Maintenance**: Regularly check and replace coolant to prevent corrosion and maintain effective heat transfer.\n- **System Leaks**: Inspect hoses, the radiator, and connections for leaks, which can lead to coolant loss and overheating.\n- **Temperature Monitoring**: Pay attention to the temperature gauge on the dashboard; if it rises above normal, it may indicate a cooling system issue.\n- **Preventive Maintenance**: Flush the cooling system periodically to remove debris and old coolant, ensuring optimal performance.\n\n### Conclusion\n\nThe car cooling system is a vital component that ensures the engine operates within a safe temperature range. Understanding its components and operation can help in maintaining the vehicle and preventing overheating issues. Regular maintenance and monitoring are key to ensuring the cooling system functions effectively.', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-11 12:24:42', '2026-01-11 12:24:42', 0, 0, NULL),
(21, 'cfa22a580dafbf7bef1a4f8a7a5243472bba720affcd4bf351938aa018542d66', 'how does a car electrical system work', 'Certainly! The electrical system of a car is a complex network that powers various components and systems, ensuring the vehicle operates efficiently. Below is a detailed explanation of how a car electrical system works, its key components, and important details.\n\n### Overview of the Car Electrical System\n\nThe car electrical system is primarily responsible for starting the engine, powering the vehicle\'s accessories, and ensuring the proper functioning of various electronic systems. It operates on a 12-volt direct current (DC) system, which is generated by the battery and regulated by the alternator.\n\n### Key Components of the Car Electrical System\n\n1. **Battery**\n   - **Function**: The battery stores electrical energy and provides the initial power needed to start the engine. It also powers electrical accessories when the engine is off.\n   - **Type**: Most vehicles use lead-acid batteries, which consist of lead plates and sulfuric acid.\n   - **Voltage**: Typically, a car battery has a nominal voltage of 12 volts.\n\n2. **Alternator**\n   - **Function**: The alternator generates electrical power while the engine is running, recharging the battery and supplying power to the vehicle’s electrical systems.\n   - **Operation**: It converts mechanical energy from the engine into electrical energy through electromagnetic induction.\n   - **Output**: Alternators typically produce between 13.5 to 14.5 volts.\n\n3. **Starter Motor**\n   - **Function**: The starter motor is responsible for turning the engine over to initiate the combustion process.\n   - **Operation**: When the ignition key is turned, the battery sends power to the starter motor, which engages the flywheel and starts the engine.\n\n4. **Ignition System**\n   - **Function**: The ignition system generates the spark necessary to ignite the air-fuel mixture in the engine’s cylinders.\n   - **Components**: Key components include the ignition coil, spark plugs, and ignition switch.\n   - **Operation**: The ignition coil transforms battery voltage into a high-voltage spark that ignites the fuel.\n\n5. **Fuses and Relays**\n   - **Fuses**: Protect electrical circuits by breaking the circuit if the current exceeds a certain level.\n   - **Relays**: Act as switches that control high-current circuits with a low-current signal, allowing for safer operation of components like headlights and fuel pumps.\n\n6. **Wiring Harness**\n   - **Function**: A network of wires that connects all electrical components, allowing for the flow of electricity throughout the vehicle.\n   - **Design**: Wiring harnesses are designed to withstand vibrations, heat, and environmental conditions.\n\n7. **Electronic Control Units (ECUs)**\n   - **Function**: These are computer systems that manage various functions of the vehicle, including engine performance, transmission, and safety systems.\n   - **Types**: Common ECUs include the Engine Control Module (ECM), Transmission Control Module (TCM), and Body Control Module (BCM).\n\n8. **Lighting and Accessory Systems**\n   - **Function**: These systems include headlights, taillights, interior lights, and other electrical accessories (e.g., radio, air conditioning).\n   - **Operation**: They are powered by the battery and alternator, controlled by switches and relays.\n\n### How the Car Electrical System Works\n\n1. **Starting the Engine**\n   - When the ignition key is turned, the battery sends voltage to the starter motor.\n   - The starter motor engages the flywheel, cranking the engine.\n   - The ignition system generates a spark to ignite the air-fuel mixture, starting the engine.\n\n2. **Power Generation**\n   - Once the engine is running, the alternator takes over, generating electrical power.\n   - The alternator charges the battery and powers the vehicle’s electrical systems.\n\n3. **Power Distribution**\n   - The electrical power is distributed through the wiring harness to various components.\n   - Fuses protect circuits from overload, while relays control high-current devices.\n\n4. **Control Systems**\n   - ECUs monitor and manage engine performance, emissions, and other systems.\n   - Sensors provide data to the ECUs, allowing for real-time adjustments to optimize performance.\n\n### Important Details\n\n- **Maintenance**: Regular checks of the battery, alternator, and wiring are essential for reliable operation. Corrosion on battery terminals and loose connections can lead to electrical failures.\n- **Upgrades**: Aftermarket electrical components (e.g., high-output alternators, LED lighting) can enhance performance but may require additional modifications to the electrical system.\n- **Troubleshooting**: Common electrical issues include dead batteries, faulty alternators, and blown fuses. Diagnostic tools can help identify problems within the electrical system.\n\n### Conclusion\n\nThe car electrical system is a vital part of vehicle operation, encompassing various components that work together to ensure functionality and safety. Understanding its workings can aid in', '[{\"title\":\"OpenAI Knowledge Base\",\"link\":\"https:\\/\\/openai.com\"}]', '2026-01-11 12:25:06', '2026-01-11 12:25:06', 0, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `car_dealers`
--

CREATE TABLE `car_dealers` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Foreign key to users table',
  `business_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `whatsapp` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `location_id` int NOT NULL,
  `specialization` json DEFAULT NULL,
  `years_established` int DEFAULT NULL,
  `total_sales` int DEFAULT '0',
  `business_hours` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified` tinyint(1) DEFAULT '0',
  `certified` tinyint(1) DEFAULT '0',
  `featured` tinyint(1) DEFAULT '0',
  `status` enum('active','pending_approval','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending_approval',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `car_dealers`
--

INSERT INTO `car_dealers` (`id`, `user_id`, `business_name`, `owner_name`, `email`, `phone`, `whatsapp`, `address`, `location_id`, `specialization`, `years_established`, `total_sales`, `business_hours`, `website`, `facebook_url`, `instagram_url`, `twitter_url`, `linkedin_url`, `description`, `logo_url`, `verified`, `certified`, `featured`, `status`, `created_at`, `updated_at`, `approved_at`, `approved_by`) VALUES
(1, 11, 'Premium Auto Malawi', 'Peter Mwale', 'info@premiumauto.mw', '+265991234567', '+265991234567', '789 Kamuzu Procession Road, Lilongwe', 2, '[\"Toyota\", \"Honda\", \"Nissan\", \"Mazda\"]', 2015, 342, NULL, 'https://www.premiumauto.mw', 'https://facebook.com/premiumautomalawi', 'https://instagram.com/premiumautomalawi', 'https://twitter.com/premiumautomw', 'https://linkedin.com/company/premium-auto-malawi', 'Leading car dealership in Malawi offering quality Japanese and European vehicles with comprehensive warranty and service packages. We pride ourselves on transparency, excellent customer service, and competitive pricing.', NULL, 1, 0, 1, 'active', '2025-12-18 19:04:30', '2026-01-02 14:09:44', NULL, NULL),
(2, 12, 'Southern Motors Ltd', 'Grace Tembo', 'info@southernmotors.mw', '+265881234567', '+265881234567', '321 Victoria Avenue, Blantyre', 1, '[\"Luxury Vehicles\", \"SUVs\", \"Commercial Vehicles\"]', 2010, 285, NULL, 'https://www.southernmotors.mw', 'https://facebook.com/southernmotorsmalawi', 'https://instagram.com/southernmotorsmw', 'https://twitter.com/southernmotors', 'https://linkedin.com/company/southern-motors-malawi', 'Established dealership specializing in premium vehicles and commercial fleets with excellent after-sales service. We offer financing options and extended warranties on all vehicles.', NULL, 1, 0, 1, 'active', '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, NULL),
(3, 13, 'Capital Car Center', 'Michael Phiri', 'info@capitalcars.mw', '+265991345678', '+265991345678', '123 City Centre, Lilongwe', 2, '[\"Budget Cars\", \"Family Vehicles\", \"First Car Buyers\"]', 2018, 198, NULL, 'https://www.capitalcars.mw', 'https://facebook.com/capitalcarsmalawi', 'https://instagram.com/capitalcarsmw', NULL, NULL, 'Affordable quality cars for families and first-time buyers with flexible payment options. We specialize in helping young professionals and families find reliable, budget-friendly vehicles.', NULL, 1, 0, 0, 'active', '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, NULL),
(4, 14, 'Northern Auto Sales', 'Patricia Banda', 'info@northernauto.mw', '+265881345678', '+265881345678', '456 Independence Drive, Mzuzu', 3, '[\"Toyota\", \"Nissan\", \"Mitsubishi\", \"4x4 Vehicles\"]', 2020, 127, NULL, 'https://www.northernauto.mw', 'https://facebook.com/northernautomw', 'https://instagram.com/northernautosales', 'https://twitter.com/northernautomw', NULL, 'Northern region specialist in reliable Japanese vehicles and 4x4s suitable for all terrains. Perfect for exploring Malawi\'s beautiful northern landscapes and rural areas.', NULL, 1, 0, 0, 'active', '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, NULL),
(5, 15, 'Blantyre Elite Motors', 'James Chirwa', 'info@elitemotors.mw', '+265991456789', '+265991456789', '789 Glyn Jones Road, Blantyre', 1, '[\"Luxury Cars\", \"Sports Cars\", \"Executive Vehicles\"]', 2012, 356, NULL, 'https://www.elitemotorsmalawi.com', 'https://facebook.com/blantyreelitemotors', 'https://instagram.com/elitemotorsmw', 'https://twitter.com/elitemotorsmw', 'https://linkedin.com/company/blantyre-elite-motors', 'Premium luxury car dealership offering exclusive vehicles and VIP service for discerning clients. We import high-end vehicles from Europe, Japan, and the USA with full documentation and certification.', NULL, 1, 0, 1, 'active', '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `car_hire_companies`
--

CREATE TABLE `car_hire_companies` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Foreign key to users table',
  `business_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `whatsapp` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `location_id` int NOT NULL,
  `vehicle_types` json DEFAULT NULL,
  `services` json DEFAULT NULL,
  `special_services` json DEFAULT NULL,
  `daily_rate_from` decimal(10,2) DEFAULT NULL,
  `weekly_rate_from` decimal(10,2) DEFAULT NULL,
  `monthly_rate_from` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'MWK',
  `total_vehicles` int DEFAULT '0',
  `available_vehicles` int DEFAULT '0',
  `years_established` int DEFAULT NULL,
  `operates_24_7` tinyint(1) DEFAULT '0',
  `opening_hours` json DEFAULT NULL,
  `business_hours` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `verified` tinyint(1) DEFAULT '0',
  `certified` tinyint(1) DEFAULT '0',
  `featured` tinyint(1) DEFAULT '0',
  `status` enum('active','pending_approval','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending_approval',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `car_hire_companies`
--

INSERT INTO `car_hire_companies` (`id`, `user_id`, `business_name`, `owner_name`, `email`, `phone`, `whatsapp`, `address`, `location_id`, `vehicle_types`, `services`, `special_services`, `daily_rate_from`, `weekly_rate_from`, `monthly_rate_from`, `currency`, `total_vehicles`, `available_vehicles`, `years_established`, `operates_24_7`, `opening_hours`, `business_hours`, `website`, `facebook_url`, `instagram_url`, `twitter_url`, `linkedin_url`, `description`, `verified`, `certified`, `featured`, `status`, `created_at`, `updated_at`, `approved_at`, `approved_by`) VALUES
(1, 21, 'Malawi Premier Car Rentals', 'David Chirwa', 'info@premierrentals.mw', '+265991234567', '+265991234567', '555 City Centre, Lilongwe', 2, '[\"Economy\", \"Sedan\", \"SUV\", \"Pickup\", \"Luxury\"]', '[\"Airport Pickup\", \"Long Distance\", \"Wedding Cars\", \"Corporate Rental\", \"Self Drive\"]', '[\"GPS Navigation\", \"Child Seats\", \"Additional Driver\"]', 25000.00, 150000.00, 550000.00, 'MWK', 4, 4, 2018, 1, '{\"friday\": {\"open\": \"08:00\", \"close\": \"18:00\", \"closed\": false}, \"monday\": {\"open\": \"08:00\", \"close\": \"18:00\", \"closed\": false}, \"sunday\": {\"open\": \"09:00\", \"close\": \"12:00\", \"closed\": false}, \"tuesday\": {\"open\": \"08:00\", \"close\": \"18:00\", \"closed\": false}, \"saturday\": {\"open\": \"09:00\", \"close\": \"14:00\", \"closed\": false}, \"thursday\": {\"open\": \"08:00\", \"close\": \"18:00\", \"closed\": false}, \"wednesday\": {\"open\": \"08:00\", \"close\": \"18:00\", \"closed\": false}}', NULL, 'https://www.premierrentals.mw', 'https://facebook.com/premierrentalsmw', 'https://instagram.com/premier_rentals_malawi', 'https://twitter.com/premierrentalsmw', 'https://linkedin.com/company/malawi-premier-car-rentals', 'Leading car rental service with modern fleet and flexible rental packages for business and leisure. We offer 24/7 emergency support and have vehicles available across all major cities in Malawi.', 1, 1, 1, 'active', '2025-12-18 19:04:30', '2025-12-27 02:15:10', NULL, NULL),
(2, 22, 'Blantyre Rent-a-Car', 'Susan Kachingwe', 'info@blantyrerentals.mw', '+265881234567', '+265881234567', '777 Glyn Jones Road, Blantyre', 1, '[\"Economy\", \"Luxury\", \"Van\", \"Minibus\", \"4x4\"]', '[\"Self Drive\", \"With Driver\", \"Tourist Packages\", \"Airport Transfer\"]', '[\"Tour Guide Services\", \"Hotel Bookings\"]', 20000.00, 120000.00, 450000.00, 'MWK', 3, 3, 2020, 0, '{\"friday\": {\"open\": \"07:30\", \"close\": \"17:30\", \"closed\": false}, \"monday\": {\"open\": \"07:30\", \"close\": \"17:30\", \"closed\": false}, \"sunday\": {\"open\": null, \"close\": null, \"closed\": true}, \"tuesday\": {\"open\": \"07:30\", \"close\": \"17:30\", \"closed\": false}, \"saturday\": {\"open\": \"08:00\", \"close\": \"13:00\", \"closed\": false}, \"thursday\": {\"open\": \"07:30\", \"close\": \"17:30\", \"closed\": false}, \"wednesday\": {\"open\": \"07:30\", \"close\": \"17:30\", \"closed\": false}}', NULL, 'https://www.blantyrerentals.com', 'https://facebook.com/blantyrerentacar', 'https://instagram.com/blantyre_rentacar', NULL, NULL, 'Reliable car rental service in Blantyre offering competitive rates and well-maintained vehicles. Perfect for tourists and business travelers exploring the commercial capital of Malawi.', 1, 1, 1, 'active', '2025-12-18 19:04:30', '2025-12-27 02:15:10', NULL, NULL),
(3, 23, 'Capital Auto Rentals', 'Andrew Mwale', 'info@capitalrentals.mw', '+265991345678', '+265991345678', '123 Area 47, Lilongwe', 2, '[\"Budget\", \"Standard\", \"Premium\", \"4WD\", \"Commercial\"]', '[\"Daily Rental\", \"Weekly Rental\", \"Monthly Rental\", \"Corporate Accounts\"]', '[\"Unlimited Mileage\", \"Roadside Assistance\"]', 18000.00, 108000.00, 400000.00, 'MWK', 3, 3, 2019, 1, '{\"friday\": {\"open\": \"00:00\", \"close\": \"23:59\", \"closed\": false}, \"monday\": {\"open\": \"00:00\", \"close\": \"23:59\", \"closed\": false}, \"sunday\": {\"open\": \"00:00\", \"close\": \"23:59\", \"closed\": false}, \"tuesday\": {\"open\": \"00:00\", \"close\": \"23:59\", \"closed\": false}, \"saturday\": {\"open\": \"00:00\", \"close\": \"23:59\", \"closed\": false}, \"thursday\": {\"open\": \"00:00\", \"close\": \"23:59\", \"closed\": false}, \"wednesday\": {\"open\": \"00:00\", \"close\": \"23:59\", \"closed\": false}}', NULL, 'https://www.capitalrentals.mw', 'https://facebook.com/capitalrentalsmw', 'https://instagram.com/capital_rentals', 'https://twitter.com/capitalrentalsmw', NULL, '24/7 car rental service with convenient city location and flexible rental terms. We specialize in long-term rentals for NGOs, businesses, and expatriates.', 1, 1, 1, 'active', '2025-12-18 19:04:30', '2025-12-27 02:15:10', NULL, NULL),
(4, 24, 'Northern Car Hire', 'Jennifer Banda', 'info@northernhire.mw', '+265881345678', '+265881345678', '456 Orton Chirwa Avenue, Mzuzu', 3, '[\"Compact\", \"SUV\", \"Pickup\", \"Family Cars\"]', '[\"Self Drive\", \"Tour Packages\", \"Business Rental\"]', '[\"Tourist Support\", \"Local Guide Recommendations\"]', 22000.00, 132000.00, 480000.00, 'MWK', 2, 2, 2021, 0, '{\"friday\": {\"open\": \"08:30\", \"close\": \"17:00\", \"closed\": false}, \"monday\": {\"open\": \"08:30\", \"close\": \"17:00\", \"closed\": false}, \"sunday\": {\"open\": null, \"close\": null, \"closed\": true}, \"tuesday\": {\"open\": \"08:30\", \"close\": \"17:00\", \"closed\": false}, \"saturday\": {\"open\": \"09:00\", \"close\": \"12:00\", \"closed\": false}, \"thursday\": {\"open\": \"08:30\", \"close\": \"17:00\", \"closed\": false}, \"wednesday\": {\"open\": \"08:30\", \"close\": \"17:00\", \"closed\": false}}', NULL, 'https://www.northernhire.com', 'https://facebook.com/northernhiremw', 'https://instagram.com/northern_car_hire', NULL, NULL, 'Northern region car rental specialist perfect for exploring the beautiful north of Malawi. Our vehicles are well-suited for both paved and unpaved roads.', 1, 0, 0, 'active', '2025-12-18 19:04:30', '2025-12-27 02:15:10', NULL, NULL),
(5, 25, 'Executive Rentals Malawi', 'Charles Tembo', 'info@executiverentals.mw', '+265991456789', '+265991456789', '888 Independence Drive, Blantyre', 1, '[\"Executive\", \"Luxury\", \"Sports Car\", \"Limousine\", \"Premium SUV\"]', '[\"VIP Service\", \"Executive Transport\", \"Special Events\", \"Wedding Cars\", \"Chauffeur Service\"]', '[\"Personal Chauffeur\", \"Red Carpet Service\", \"Premium Insurance\"]', 45000.00, 270000.00, 980000.00, 'MWK', 3, 3, 2017, 1, '{\"friday\": {\"open\": \"09:00\", \"close\": \"17:00\", \"closed\": false}, \"monday\": {\"open\": \"09:00\", \"close\": \"17:00\", \"closed\": false}, \"sunday\": {\"open\": null, \"close\": null, \"closed\": true}, \"tuesday\": {\"open\": \"09:00\", \"close\": \"17:00\", \"closed\": false}, \"saturday\": {\"open\": \"10:00\", \"close\": \"14:00\", \"closed\": false}, \"thursday\": {\"open\": \"09:00\", \"close\": \"17:00\", \"closed\": false}, \"wednesday\": {\"open\": \"09:00\", \"close\": \"17:00\", \"closed\": false}}', NULL, 'https://www.executiverentals.mw', 'https://facebook.com/executiverentalsmw', 'https://instagram.com/executive_rentals_malawi', 'https://twitter.com/execrentalsmw', 'https://linkedin.com/company/executive-rentals-malawi', 'Premium car rental service for executives and special occasions with luxury fleet. We offer bespoke services including airport VIP pickup, event transportation, and corporate executive packages.', 1, 1, 1, 'active', '2025-12-18 19:04:30', '2025-12-27 02:15:10', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `car_hire_fleet`
--

CREATE TABLE `car_hire_fleet` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `company_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_location_id` int DEFAULT NULL,
  `make_id` int NOT NULL,
  `model_id` int NOT NULL,
  `make_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year` year NOT NULL,
  `vehicle_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g. Toyota Corolla 2023',
  `registration_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transmission` enum('automatic','manual') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fuel_type` enum('petrol','diesel','hybrid','electric') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `seats` tinyint NOT NULL DEFAULT '5',
  `exterior_color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `features` json DEFAULT NULL COMMENT 'AC, GPS, Bluetooth, etc.',
  `daily_rate` decimal(10,2) NOT NULL,
  `weekly_rate` decimal(10,2) DEFAULT NULL,
  `monthly_rate` decimal(10,2) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `status` enum('available','rented','maintenance','not_available') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `car_hire_fleet`
--

INSERT INTO `car_hire_fleet` (`id`, `company_id`, `company_name`, `company_phone`, `company_email`, `company_location_id`, `make_id`, `model_id`, `make_name`, `model_name`, `year`, `vehicle_name`, `registration_number`, `image`, `transmission`, `fuel_type`, `seats`, `exterior_color`, `features`, `daily_rate`, `weekly_rate`, `monthly_rate`, `is_available`, `status`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, NULL, NULL, 1, 1, NULL, 'Corolla', '2023', 'Toyota Corolla 2023', 'BL-1234-MW', NULL, 'automatic', 'petrol', 5, NULL, '[\"Air Conditioning\", \"Bluetooth\", \"USB Charging\", \"Backup Camera\"]', 25000.00, 150000.00, 550000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13'),
(2, 1, NULL, NULL, NULL, NULL, 1, 3, NULL, 'RAV4', '2022', 'Toyota RAV4 2022', 'LL-5678-MW', NULL, 'automatic', 'petrol', 5, NULL, '[\"Air Conditioning\", \"GPS Navigation\", \"Bluetooth\", \"4WD\", \"Cruise Control\"]', 45000.00, 270000.00, 950000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13'),
(3, 1, NULL, NULL, NULL, NULL, 1, 5, NULL, 'Hilux', '2021', 'Toyota Hilux Double Cab 2021', 'MZ-9012-MW', NULL, 'manual', 'diesel', 5, NULL, '[\"Air Conditioning\", \"Bluetooth\", \"Cargo Cover\", \"4WD\"]', 50000.00, 300000.00, 1100000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13'),
(4, 1, NULL, NULL, NULL, NULL, 8, 41, NULL, 'C-Class', '2022', 'Mercedes-Benz C-Class 2022', 'BL-3456-MW', NULL, 'automatic', 'petrol', 5, NULL, '[\"Leather Seats\", \"Sunroof\", \"GPS Navigation\", \"Premium Sound\", \"Heated Seats\"]', 80000.00, 480000.00, 1750000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05'),
(5, 2, NULL, NULL, NULL, NULL, 1, 4, NULL, 'Prado', '2021', 'Toyota Prado 2021', 'BL-7890-MW', NULL, 'automatic', 'diesel', 7, NULL, '[\"Air Conditioning\", \"GPS Navigation\", \"4WD\", \"Leather Seats\", \"7 Seats\"]', 70000.00, 420000.00, 1500000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13'),
(6, 2, NULL, NULL, NULL, NULL, 6, 37, NULL, 'Swift', '2022', 'Suzuki Swift 2022', 'LL-1122-MW', NULL, 'automatic', 'petrol', 5, NULL, '[\"Air Conditioning\", \"Bluetooth\", \"USB Port\"]', 20000.00, 120000.00, 450000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05'),
(7, 2, NULL, NULL, NULL, NULL, 2, 15, NULL, 'CR-V', '2022', 'Honda CR-V 2022', 'BL-3344-MW', NULL, 'automatic', 'petrol', 5, NULL, '[\"Air Conditioning\", \"Bluetooth\", \"Backup Camera\", \"Sunroof\"]', 42000.00, 252000.00, 920000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13'),
(8, 3, NULL, NULL, NULL, NULL, 1, 1, NULL, 'Corolla', '2021', 'Toyota Corolla 2021', 'LL-5566-MW', NULL, 'manual', 'petrol', 5, NULL, '[\"Air Conditioning\", \"Radio/CD\"]', 18000.00, 108000.00, 400000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13'),
(9, 3, NULL, NULL, NULL, NULL, 1, 3, NULL, 'RAV4', '2021', 'Toyota RAV4 2021', 'MZ-7788-MW', NULL, 'automatic', 'petrol', 5, NULL, '[\"Air Conditioning\", \"4WD\", \"Bluetooth\"]', 38000.00, 228000.00, 850000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13'),
(10, 3, NULL, NULL, NULL, NULL, 3, 22, NULL, 'X-Trail', '2020', 'Nissan X-Trail 2020', 'LL-9900-MW', NULL, 'automatic', 'petrol', 7, 'Blue', '[\"Air Conditioning\", \"7 Seats\", \"Bluetooth\", \"Reverse Camera\"]', 40000.00, 240000.00, 880000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05'),
(11, 4, NULL, NULL, NULL, NULL, 1, 5, NULL, 'Hilux', '2020', 'Toyota Hilux 2020', 'MZ-1122-MW', NULL, 'manual', 'diesel', 5, NULL, '[\"Air Conditioning\", \"4WD\"]', 45000.00, 270000.00, 990000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13'),
(12, 4, NULL, NULL, NULL, NULL, 5, 33, NULL, 'Outlander', '2021', 'Mitsubishi Outlander 2021', 'MZ-3344-MW', NULL, 'automatic', 'petrol', 7, NULL, '[\"Air Conditioning\", \"7 Seats\", \"Bluetooth\", \"All-Wheel Drive\"]', 42000.00, 252000.00, 920000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05'),
(13, 5, NULL, NULL, NULL, NULL, 9, 45, NULL, '5 Series', '2023', 'BMW 5 Series 2023', 'BL-5566-MW', NULL, 'automatic', 'petrol', 5, NULL, '[\"Luxury Interior\", \"GPS\", \"Premium Sound\", \"Sunroof\", \"Massage Seats\"]', 150000.00, 900000.00, 3200000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05'),
(14, 5, NULL, NULL, NULL, NULL, 8, 42, NULL, 'E-Class', '2023', 'Mercedes-Benz E-Class 2023', 'BL-7788-MW', NULL, 'automatic', 'petrol', 5, NULL, '[\"Luxury Interior\", \"GPS\", \"Premium Sound\", \"Massage Seats\", \"Ambient Lighting\"]', 160000.00, 960000.00, 3400000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05'),
(15, 5, NULL, NULL, NULL, NULL, 9, 46, NULL, 'X5', '2022', 'BMW X5 2022', 'LL-9900-MW', NULL, 'automatic', 'diesel', 7, NULL, '[\"Luxury Interior\", \"7 Seats\", \"Panoramic Roof\", \"Premium Sound\", \"4WD\"]', 180000.00, 1080000.00, 3800000.00, 1, 'available', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05');

--
-- Triggers `car_hire_fleet`
--
DELIMITER $$
CREATE TRIGGER `trg_fleet_delete_count` AFTER DELETE ON `car_hire_fleet` FOR EACH ROW BEGIN
    CALL UpdateCompanyVehicleCounts(OLD.company_id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_fleet_insert_count` AFTER INSERT ON `car_hire_fleet` FOR EACH ROW BEGIN
    CALL UpdateCompanyVehicleCounts(NEW.company_id);
    CALL UpdateFleetDenormalizedData(NEW.id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_fleet_update_count` AFTER UPDATE ON `car_hire_fleet` FOR EACH ROW BEGIN
    IF OLD.company_id != NEW.company_id THEN
        CALL UpdateCompanyVehicleCounts(OLD.company_id);
        CALL UpdateCompanyVehicleCounts(NEW.company_id);
    ELSE
        CALL UpdateCompanyVehicleCounts(NEW.company_id);
    END IF;

    IF OLD.company_id != NEW.company_id OR OLD.make_id != NEW.make_id OR OLD.model_id != NEW.model_id THEN
        CALL UpdateFleetDenormalizedData(NEW.id);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `car_hire_fleet_details`
-- (See below for the actual view)
--
CREATE TABLE `car_hire_fleet_details` (
`id` int
,`company_id` int
,`company_name` varchar(200)
,`company_phone` varchar(20)
,`company_email` varchar(100)
,`company_location_id` int
,`make_id` int
,`model_id` int
,`make_name` varchar(100)
,`model_name` varchar(100)
,`year` year
,`vehicle_name` varchar(200)
,`registration_number` varchar(50)
,`image` varchar(255)
,`transmission` enum('automatic','manual')
,`fuel_type` enum('petrol','diesel','hybrid','electric')
,`seats` tinyint
,`features` json
,`daily_rate` decimal(10,2)
,`weekly_rate` decimal(10,2)
,`monthly_rate` decimal(10,2)
,`is_available` tinyint(1)
,`is_active` tinyint(1)
,`created_at` timestamp
,`updated_at` timestamp
,`business_name` varchar(200)
,`owner_name` varchar(100)
,`company_contact_phone` varchar(20)
,`company_whatsapp` varchar(20)
,`company_address` text
,`location_name` varchar(100)
,`location_region` varchar(100)
,`make_country` varchar(100)
,`body_type` enum('sedan','suv','hatchback','pickup','coupe','wagon','minivan','convertible','crossover','truck')
);

-- --------------------------------------------------------

--
-- Table structure for table `car_listings`
--

CREATE TABLE `car_listings` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `reference_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `featured_image_id` int DEFAULT NULL,
  `make_id` int NOT NULL,
  `model_id` int NOT NULL,
  `year` int NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `negotiable` tinyint(1) DEFAULT '0',
  `mileage` int DEFAULT NULL,
  `fuel_type` enum('petrol','diesel','hybrid','electric','lpg') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `transmission` enum('manual','automatic','cvt','semi-automatic') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `condition_type` enum('excellent','very_good','good','fair','poor') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exterior_color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `interior_color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `engine_size` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doors` int DEFAULT '4',
  `seats` int DEFAULT '5',
  `drivetrain` enum('fwd','rwd','awd','4wd') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_id` int NOT NULL,
  `listing_type` enum('free','featured','premium') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'free',
  `status` enum('draft','pending_approval','active','sold','expired','suspended','deleted') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending_approval',
  `approval_status` enum('pending','approved','denied') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `approval_date` datetime DEFAULT NULL,
  `denial_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_guest` tinyint(1) DEFAULT '0',
  `guest_seller_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_seller_phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_seller_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_seller_whatsapp` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payment_status` enum('pending','paid','free','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'free',
  `payment_reference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `views_count` int DEFAULT '0',
  `inquiries_count` int DEFAULT '0',
  `favorites_count` int DEFAULT '0',
  `featured_until` date DEFAULT NULL,
  `expires_at` date NOT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `sold_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `dealer_id` int DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  `is_premium` tinyint(1) DEFAULT '0',
  `premium_until` datetime DEFAULT NULL,
  `report_count` int DEFAULT '0' COMMENT 'Number of times this listing has been reported'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `car_listings`
--

INSERT INTO `car_listings` (`id`, `user_id`, `reference_number`, `title`, `description`, `featured_image_id`, `make_id`, `model_id`, `year`, `price`, `negotiable`, `mileage`, `fuel_type`, `transmission`, `condition_type`, `exterior_color`, `interior_color`, `engine_size`, `doors`, `seats`, `drivetrain`, `location_id`, `listing_type`, `status`, `approval_status`, `approval_date`, `denial_reason`, `is_guest`, `guest_seller_name`, `guest_seller_phone`, `guest_seller_email`, `guest_seller_whatsapp`, `admin_notes`, `payment_status`, `payment_reference`, `views_count`, `inquiries_count`, `favorites_count`, `featured_until`, `expires_at`, `approved_at`, `approved_by`, `sold_at`, `created_at`, `updated_at`, `dealer_id`, `is_featured`, `is_premium`, `premium_until`, `report_count`) VALUES
(1, 11, 'ML2025001', '2020 Toyota Corolla - Excellent Condition', 'Well maintained Toyota Corolla with full service history. Clean interior and exterior. Single owner vehicle with all original documents.', 1, 1, 1, 2025, 8500000.00, 1, 45000, 'diesel', 'automatic', 'excellent', 'White', NULL, NULL, 4, 5, NULL, 1, 'free', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 13, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2026-01-11 02:26:58', 1, 1, 0, NULL, 1),
(2, 2, 'ML2025002', '2018 Honda CR-V - Low Mileage SUV', 'Honda CR-V with low mileage, one owner, excellent condition. All maintenance records available. Perfect family SUV with spacious interior.', 13, 2, 15, 2018, 12000000.00, 0, 68000, 'petrol', 'automatic', 'very_good', 'Silver', NULL, NULL, 4, 5, NULL, 2, 'featured', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 2, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2026-01-02 13:59:57', NULL, 0, 0, NULL, 0),
(3, 3, 'ML2025003', '2019 Toyota RAV4 - AWD Adventure Ready', 'Toyota RAV4 All-Wheel Drive, perfect for Malawi roads. Recently serviced and ready to go. Excellent for both city and rural driving.', NULL, 1, 3, 2019, 15000000.00, 1, 32000, 'petrol', 'automatic', 'excellent', 'Black', NULL, NULL, 4, 5, NULL, 1, 'featured', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 1, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2025-12-27 21:31:58', NULL, 0, 0, NULL, 0),
(4, 4, 'ML2025004', '2017 Nissan X-Trail - 7 Seater Family SUV', 'Spacious family SUV with 7 seats. Great for long trips and city driving. Well maintained with service records. Air conditioning works perfectly.', NULL, 3, 22, 2017, 9500000.00, 1, 89000, 'petrol', 'automatic', 'good', 'Blue', NULL, NULL, 4, 5, NULL, 3, 'free', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 0, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, 0, NULL, 0),
(5, 12, 'ML2025005', '2021 Toyota Hilux - Double Cab Pickup', 'Brand new Toyota Hilux Double Cab. Perfect for business or personal use. Diesel engine with excellent fuel economy. Load capacity 1 ton.', 10, 1, 5, 2023, 25000000.00, 0, 15000, 'hybrid', 'manual', 'excellent', 'White', NULL, NULL, 4, 5, NULL, 2, 'premium', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 12, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2026-01-04 02:06:07', 2, 0, 0, NULL, 0),
(6, 13, 'ML2025006', '2016 Honda Fit - Fuel Efficient City Car', 'Excellent fuel economy, perfect for city driving. Well maintained and reliable. Compact size makes parking easy. Recent service done.', NULL, 2, 17, 2016, 4500000.00, 1, 95000, 'petrol', 'automatic', 'good', 'Red', NULL, NULL, 4, 5, NULL, 1, 'free', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 0, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', 3, 0, 0, NULL, 0),
(7, 4, 'ML2025007', '2019 Mazda CX-5 - Premium SUV', 'Luxury SUV with premium features. Leather seats, sunroof, navigation system. Excellent condition with full service history.', NULL, 4, 28, 2019, 18000000.00, 0, 28000, 'petrol', 'automatic', 'excellent', 'Gray', NULL, NULL, 4, 5, NULL, 2, 'featured', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 1, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2025-12-26 23:55:51', NULL, 0, 0, NULL, 0),
(8, 2, 'ML2025008', '2020 Toyota Prius - Hybrid Eco Car', 'Eco-friendly hybrid vehicle. Excellent fuel economy and environmentally conscious. Perfect for long distance travel with minimal fuel costs.', NULL, 1, 8, 2020, 14000000.00, 1, 25000, 'hybrid', 'automatic', 'very_good', 'Blue', NULL, NULL, 4, 5, NULL, 3, 'free', 'sold', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 0, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2025-12-26 22:22:39', NULL, 0, 0, NULL, 0),
(9, 3, 'ML2025009', '2018 Mercedes-Benz C-Class - Luxury Sedan', 'Luxury sedan with premium features. Well maintained by authorized dealer. Full service history and warranty remaining.', NULL, 8, 41, 2018, 22000000.00, 0, 42000, 'petrol', 'automatic', 'excellent', 'Black', NULL, NULL, 4, 5, NULL, 1, 'premium', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 1, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2025-12-26 18:42:41', NULL, 0, 0, NULL, 0),
(10, 3, 'ML2025010', '2017 Toyota Vitz - Compact City Car', 'Compact and economical city car. Perfect for urban driving and parking. Low maintenance costs and excellent reliability.', NULL, 1, 7, 2017, 5500000.00, 1, 78000, 'petrol', 'automatic', 'very_good', 'Silver', NULL, NULL, 4, 5, NULL, 2, 'free', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 0, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, 0, NULL, 0),
(11, 6, 'ML2025011', '2019 Honda Civic - Sports Sedan', 'Sporty sedan with excellent performance. Turbocharged engine with great acceleration. Well maintained with premium sound system.', NULL, 2, 13, 2019, 11000000.00, 1, 52000, 'petrol', 'manual', 'very_good', 'White', NULL, NULL, 4, 5, NULL, 4, 'free', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 0, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, 0, NULL, 0),
(12, 11, 'ML2025012', '2020 Nissan Navara - Pickup Truck', 'Double cab pickup truck perfect for business. 4WD capability for all terrain. Recent service and excellent condition.', NULL, 3, 25, 2020, 19000000.00, 0, 35000, 'diesel', 'automatic', 'excellent', 'Silver', NULL, NULL, 4, 5, NULL, 6, 'featured', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 1, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2026-01-05 13:18:47', 1, 0, 0, NULL, 0),
(13, 8, 'ML2025013', '2016 Toyota Land Cruiser - 4x4 SUV', 'Legendary 4x4 SUV perfect for any terrain. Well maintained with service records. Ideal for safari and rough roads.', NULL, 1, 9, 2016, 28000000.00, 1, 125000, 'diesel', 'automatic', 'good', 'White', NULL, NULL, 4, 5, NULL, 7, 'featured', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 2, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2026-01-02 14:27:32', NULL, 0, 0, NULL, 0),
(14, 4, 'ML2025014', '2018 Suzuki Swift - Hatchback', 'Compact hatchback with excellent fuel economy. Perfect first car or city commuter. Recently serviced with new tires.', NULL, 6, 37, 2018, 6200000.00, 1, 72000, 'petrol', 'manual', 'good', 'Red', NULL, NULL, 4, 5, NULL, 8, 'free', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 0, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, 0, NULL, 0),
(15, 6, 'ML2025015', '2021 Mitsubishi Outlander - Family SUV', 'Modern family SUV with 7 seats. Latest safety features and excellent warranty remaining. Perfect for growing families.', NULL, 5, 33, 2021, 16500000.00, 0, 18000, 'petrol', 'automatic', 'excellent', 'Black', NULL, NULL, 4, 5, NULL, 9, 'premium', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 1, 0, 0, NULL, '2026-06-01', '2025-10-16 02:27:35', 1, NULL, '2025-12-18 19:04:30', '2025-12-18 21:57:38', NULL, 0, 0, NULL, 0),
(16, 2, 'ML20250016', '2023 Toyota Corolla - Excellent Condition Automatic', '', NULL, 1, 1, 2023, 56666666.00, 1, 363636, 'hybrid', 'automatic', 'excellent', '', NULL, NULL, 4, 5, NULL, 17, 'free', 'deleted', 'pending', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, 'free', NULL, 0, 0, 0, NULL, '0000-00-00', NULL, NULL, NULL, '2025-12-26 22:28:49', '2025-12-26 22:29:10', NULL, 0, 0, NULL, 0),
(19, 36, 'ML20260001', '2017 Honda City Hybrid - Very Good Condition Cvt', '', NULL, 2, 20, 2017, 5000000.00, 1, 0, 'petrol', 'manual', 'excellent', 'Red', 'Beige', '1.50', 4, 5, 'fwd', 2, 'free', 'active', 'approved', NULL, NULL, 0, NULL, NULL, NULL, NULL, 'Rejection reason: Does not meet website standards', 'free', NULL, 10, 0, 0, NULL, '0000-00-00', '2026-01-02 01:16:59', 1, NULL, '2026-01-02 00:40:43', '2026-01-10 15:48:34', NULL, 0, 0, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `car_listing_images`
--

CREATE TABLE `car_listing_images` (
  `id` int NOT NULL,
  `listing_id` int NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `sort_order` int DEFAULT '0',
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `car_listing_images`
--

INSERT INTO `car_listing_images` (`id`, `listing_id`, `filename`, `original_filename`, `file_path`, `thumbnail_path`, `file_size`, `mime_type`, `is_primary`, `sort_order`, `uploaded_at`) VALUES
(1, 1, 'img_694f4661cc2d79.03165439.jpg', 'carpic6.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_694f4661cc2d79.03165439.jpg', NULL, 7950, 'image/jpeg', 0, 0, '2025-12-27 02:37:12'),
(2, 1, 'img_694f46621cf7e3.00866854.jpg', 'carpic5.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_694f46621cf7e3.00866854.jpg', NULL, 5564, 'image/jpeg', 0, 0, '2025-12-27 02:37:13'),
(3, 1, 'img_694f4662639925.59939975.jpg', 'carpic4.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_694f4662639925.59939975.jpg', NULL, 7959, 'image/jpeg', 1, 0, '2025-12-27 02:37:13'),
(4, 1, 'img_694f4662a8a070.26788562.jpg', 'carpic3.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_694f4662a8a070.26788562.jpg', NULL, 11030, 'image/jpeg', 0, 0, '2025-12-27 02:37:13'),
(5, 1, 'img_694f4662ec7f47.70946531.jpg', 'carpic2.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_694f4662ec7f47.70946531.jpg', NULL, 8806, 'image/jpeg', 0, 0, '2025-12-27 02:37:13'),
(6, 1, 'img_694f46633ae914.80346944.jpg', 'carpic1.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_694f46633ae914.80346944.jpg', NULL, 8685, 'image/jpeg', 0, 0, '2025-12-27 02:37:14'),
(7, 5, 'img_694f47a5df4535.66527591.jpg', 'carpic6.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_694f47a5df4535.66527591.jpg', NULL, 7950, 'image/jpeg', 1, 0, '2025-12-27 02:42:36'),
(8, 5, 'img_694f47a5e6e010.41867288.jpg', 'carpic5.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_694f47a5e6e010.41867288.jpg', NULL, 5564, 'image/jpeg', 0, 0, '2025-12-27 02:42:36'),
(9, 5, 'img_694f47a5ecf6e3.18394863.jpg', 'carpic4.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_694f47a5ecf6e3.18394863.jpg', NULL, 7959, 'image/jpeg', 0, 0, '2025-12-27 02:42:36'),
(10, 5, 'img_694f47a5f2eef1.80422002.jpg', 'carpic3.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_694f47a5f2eef1.80422002.jpg', NULL, 11030, 'image/jpeg', 0, 0, '2025-12-27 02:42:36'),
(11, 5, 'img_694f47a6047ae2.66427453.jpg', 'carpic2.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_694f47a6047ae2.66427453.jpg', NULL, 8806, 'image/jpeg', 0, 0, '2025-12-27 02:42:36'),
(12, 5, 'img_694f47a60a0f28.30173642.jpg', 'carpic1.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_694f47a60a0f28.30173642.jpg', NULL, 8685, 'image/jpeg', 0, 0, '2025-12-27 02:42:36'),
(13, 2, 'img_695050f3d815b3.17985939.jpg', 'carpic6.jpg', 'C:\\Users\\john-paul.chirwa\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_695050f3d815b3.17985939.jpg', NULL, 7950, 'image/jpeg', 1, 0, '2025-12-27 21:34:34'),
(19, 19, 'img_6957140bb3f4b0.25955307.png', 'Screenshot 2023-03-01 180610.png', 'C:\\Users\\Admin\\Documents\\OneDrive Yanga\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_6957140bb3f4b0.25955307.png', NULL, 285113, 'image/png', 0, 0, '2026-01-02 00:40:44'),
(20, 19, 'img_6957140bbaac39.41602832.png', 'Screenshot 2023-03-12 165400.png', 'C:\\Users\\Admin\\Documents\\OneDrive Yanga\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_6957140bbaac39.41602832.png', NULL, 1522424, 'image/png', 0, 0, '2026-01-02 00:40:44'),
(21, 19, 'img_6957140bc0c6e9.10175144.png', 'Screenshot 2023-03-17 145532.png', 'C:\\Users\\Admin\\Documents\\OneDrive Yanga\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_6957140bc0c6e9.10175144.png', NULL, 58384, 'image/png', 0, 0, '2026-01-02 00:40:44'),
(22, 19, 'img_6957140bc71f58.66958989.png', 'Screenshot 2023-03-20 194656.png', 'C:\\Users\\Admin\\Documents\\OneDrive Yanga\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_6957140bc71f58.66958989.png', NULL, 25163, 'image/png', 0, 0, '2026-01-02 00:40:44'),
(23, 19, 'img_6957140bcd6211.04158145.png', 'Screenshot 2023-03-28 223646.png', 'C:\\Users\\Admin\\Documents\\OneDrive Yanga\\OneDrive\\MSP\\motorlinkbackup_22_11_2025\\Git\\MotorLink/uploads/img_6957140bcd6211.04158145.png', NULL, 341078, 'image/png', 0, 0, '2026-01-02 00:40:44');

-- --------------------------------------------------------

--
-- Table structure for table `car_makes`
--

CREATE TABLE `car_makes` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `car_makes`
--

INSERT INTO `car_makes` (`id`, `name`, `country`, `logo_url`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Toyota', 'Japan', NULL, 1, 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(2, 'Honda', 'Japan', NULL, 1, 2, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(3, 'Nissan', 'Japan', NULL, 1, 3, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(4, 'Mazda', 'Japan', NULL, 1, 4, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(5, 'Mitsubishi', 'Japan', NULL, 1, 5, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(6, 'Suzuki', 'Japan', NULL, 1, 6, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(7, 'Subaru', 'Japan', NULL, 1, 7, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(8, 'Mercedes-Benz', 'Germany', NULL, 1, 8, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(9, 'BMW', 'Germany', NULL, 1, 9, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(10, 'Volkswagen', 'Germany', NULL, 1, 10, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(11, 'Audi', 'Germany', NULL, 1, 11, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(12, 'Ford', 'USA', NULL, 1, 12, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(13, 'Chevrolet', 'USA', NULL, 1, 13, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(14, 'Hyundai', 'South Korea', NULL, 1, 14, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(15, 'Kia', 'South Korea', NULL, 1, 15, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(16, 'Peugeot', 'France', NULL, 1, 16, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(17, 'Land Rover', 'UK', NULL, 1, 17, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(18, 'Jeep', 'USA', NULL, 1, 18, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(19, 'Volvo', 'Sweden', NULL, 1, 19, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(20, 'Isuzu', 'Japan', NULL, 1, 20, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(21, 'Tata', 'India', NULL, 1, 21, '2026-01-04 18:31:05', '2026-01-04 18:31:05'),
(22, 'Mahindra', 'India', NULL, 1, 22, '2026-01-04 18:31:05', '2026-01-04 18:31:05'),
(23, 'Maruti', 'India', NULL, 1, 23, '2026-01-04 18:31:05', '2026-01-04 18:31:05'),
(24, 'Geely', 'China', NULL, 1, 24, '2026-01-04 18:31:05', '2026-01-04 18:31:05'),
(25, 'BYD', 'China', NULL, 1, 25, '2026-01-04 18:31:05', '2026-01-04 18:31:05'),
(26, 'Great Wall Motors', 'China', NULL, 1, 26, '2026-01-04 18:31:05', '2026-01-04 18:31:05'),
(27, 'Haval', 'China', NULL, 1, 27, '2026-01-04 18:31:05', '2026-01-04 18:31:05'),
(28, 'Chery', 'China', NULL, 1, 28, '2026-01-04 18:31:05', '2026-01-04 18:31:05'),
(29, 'MG Motor', 'China', NULL, 1, 29, '2026-01-04 18:31:05', '2026-01-04 18:31:05'),
(30, 'Changan', 'China', NULL, 1, 30, '2026-01-04 18:31:05', '2026-01-04 18:31:05'),
(31, 'FAW', 'China', NULL, 1, 31, '2026-01-04 18:31:05', '2026-01-04 18:31:05'),
(32, 'Skoda', 'Czech Republic', NULL, 1, 32, '2026-01-04 19:43:49', '2026-01-04 19:43:49'),
(33, 'SEAT', 'Spain', NULL, 1, 33, '2026-01-04 19:43:49', '2026-01-04 19:43:49'),
(34, 'Renault', 'France', NULL, 1, 34, '2026-01-04 19:43:49', '2026-01-04 19:43:49'),
(35, 'Citroen', 'France', NULL, 1, 35, '2026-01-04 19:43:49', '2026-01-04 19:43:49'),
(36, 'Fiat', 'Italy', NULL, 1, 36, '2026-01-04 19:43:49', '2026-01-04 19:43:49'),
(37, 'Opel', 'Germany', NULL, 1, 37, '2026-01-04 19:43:49', '2026-01-04 19:43:49'),
(38, 'Mini', 'UK', NULL, 1, 38, '2026-01-04 19:43:49', '2026-01-04 19:43:49'),
(39, 'Jaguar', 'UK', NULL, 1, 39, '2026-01-04 19:43:49', '2026-01-04 19:43:49'),
(40, 'Range Rover', 'UK', NULL, 1, 40, '2026-01-04 19:43:49', '2026-01-04 19:43:49'),
(41, 'Alfa Romeo', 'Italy', NULL, 1, 41, '2026-01-04 19:43:49', '2026-01-04 19:43:49'),
(42, 'Porsche', 'Germany', NULL, 1, 42, '2026-01-04 19:43:49', '2026-01-04 19:43:49'),
(43, 'Lexus', 'Japan', NULL, 1, 43, '2026-01-04 19:43:49', '2026-01-04 19:43:49');

--
-- Triggers `car_makes`
--
DELIMITER $$
CREATE TRIGGER `trg_make_update` AFTER UPDATE ON `car_makes` FOR EACH ROW BEGIN
    UPDATE car_hire_fleet
    SET make_name = NEW.name
    WHERE make_id = NEW.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `car_models`
--

CREATE TABLE `car_models` (
  `id` int NOT NULL,
  `make_id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `body_type` enum('sedan','suv','hatchback','pickup','coupe','wagon','minivan','convertible','crossover','truck') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'sedan',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `year_start` int DEFAULT NULL COMMENT 'First year this model was produced',
  `year_end` int DEFAULT NULL COMMENT 'Last year this model was produced (NULL if still in production)',
  `fuel_tank_capacity_liters` decimal(5,2) DEFAULT NULL COMMENT 'Fuel tank capacity in liters',
  `engine_size_liters` decimal(4,2) DEFAULT NULL COMMENT 'Engine displacement in liters',
  `engine_cylinders` tinyint DEFAULT NULL COMMENT 'Number of cylinders',
  `fuel_consumption_urban_l100km` decimal(4,2) DEFAULT NULL COMMENT 'Urban fuel consumption L/100km',
  `fuel_consumption_highway_l100km` decimal(4,2) DEFAULT NULL COMMENT 'Highway fuel consumption L/100km',
  `fuel_consumption_combined_l100km` decimal(4,2) DEFAULT NULL COMMENT 'Combined fuel consumption L/100km',
  `fuel_type` enum('petrol','diesel','hybrid','electric','plug-in_hybrid','lpg','cng') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Primary fuel type',
  `transmission_type` enum('manual','automatic','cvt','semi-automatic','dct') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Transmission type',
  `horsepower_hp` int DEFAULT NULL COMMENT 'Horsepower',
  `torque_nm` int DEFAULT NULL COMMENT 'Torque in Newton meters',
  `seating_capacity` tinyint DEFAULT NULL COMMENT 'Number of seats',
  `doors` tinyint DEFAULT NULL COMMENT 'Number of doors',
  `weight_kg` int DEFAULT NULL COMMENT 'Curb weight in kg',
  `drive_type` enum('fwd','rwd','awd','4wd') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Drive type (front/rear/all wheel drive)',
  `co2_emissions_gkm` int DEFAULT NULL COMMENT 'CO2 emissions in g/km',
  `length_mm` int DEFAULT NULL COMMENT 'Length in millimeters',
  `width_mm` int DEFAULT NULL COMMENT 'Width in millimeters',
  `height_mm` int DEFAULT NULL COMMENT 'Height in millimeters',
  `wheelbase_mm` int DEFAULT NULL COMMENT 'Wheelbase in millimeters'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `car_models`
--

INSERT INTO `car_models` (`id`, `make_id`, `name`, `body_type`, `is_active`, `created_at`, `updated_at`, `year_start`, `year_end`, `fuel_tank_capacity_liters`, `engine_size_liters`, `engine_cylinders`, `fuel_consumption_urban_l100km`, `fuel_consumption_highway_l100km`, `fuel_consumption_combined_l100km`, `fuel_type`, `transmission_type`, `horsepower_hp`, `torque_nm`, `seating_capacity`, `doors`, `weight_kg`, `drive_type`, `co2_emissions_gkm`, `length_mm`, `width_mm`, `height_mm`, `wheelbase_mm`) VALUES
(1, 1, 'Corolla', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13', 2005, 2025, 50.00, 1.80, 4, 8.50, 6.20, 7.10, 'petrol', 'cvt', 139, 173, 5, 4, 1320, 'fwd', 165, 4630, 1780, 1435, 2700),
(2, 1, 'Camry', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13', 2005, NULL, 60.00, 2.50, 4, 10.50, 7.20, 8.50, 'petrol', 'automatic', 203, 250, 5, 4, 1550, 'fwd', 195, 4885, 1840, 1445, 2825),
(3, 1, 'RAV4', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13', 2005, NULL, 55.00, 2.50, 4, 11.50, 8.20, 9.50, 'petrol', 'cvt', 203, 250, 5, 5, 1620, 'awd', 220, 4600, 1855, 1685, 2690),
(4, 1, 'Prado', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13', 2005, NULL, 87.00, 4.00, 6, 15.50, 11.20, 12.80, 'petrol', 'automatic', 271, 385, 7, 5, 2290, '4wd', 298, 4825, 1885, 1890, 2790),
(5, 1, 'Hilux', 'pickup', 1, '2025-12-18 19:04:30', '2026-01-07 08:21:59', 2005, NULL, 80.00, 2.80, 4, 9.20, 7.20, 8.10, 'diesel', 'automatic', 204, 500, 5, 4, 2050, '4wd', 276, 5330, 1855, 1815, 3085),
(6, 1, 'Fortuner', 'suv', 1, '2025-12-18 19:04:30', '2026-01-07 08:21:59', 2005, NULL, 80.00, 2.80, 4, 9.50, 7.20, 8.10, 'diesel', 'automatic', 204, 500, 7, 5, 2180, '4wd', 283, 4795, 1855, 1835, 2745),
(7, 1, 'Vitz', 'hatchback', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1999, 2020, 42.00, 1.30, 4, 7.50, 5.80, 6.50, 'petrol', 'cvt', 91, 121, 5, 5, 1030, 'fwd', 152, 3940, 1695, 1515, 2510),
(8, 1, 'Prius', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1997, NULL, 43.00, 1.80, 4, 4.50, 4.20, 4.30, 'hybrid', 'cvt', 121, 142, 5, 4, 1380, 'fwd', 101, 4540, 1760, 1490, 2700),
(9, 1, 'Land Cruiser', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13', 2005, NULL, 93.00, 4.60, 8, 18.50, 13.20, 15.20, 'petrol', 'automatic', 307, 439, 8, 5, 2670, '4wd', 351, 4990, 1980, 1920, 2850),
(10, 1, 'Hiace', 'minivan', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1967, NULL, 70.00, 2.80, 4, 12.50, 9.50, 10.80, 'diesel', 'manual', 151, 420, 15, 5, 2080, 'rwd', 285, 5380, 1880, 2285, 3110),
(11, 1, 'Yaris', 'hatchback', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1999, NULL, 42.00, 1.50, 4, 8.20, 6.20, 7.00, 'petrol', 'cvt', 106, 140, 5, 5, 1070, 'fwd', 160, 3940, 1695, 1510, 2510),
(12, 1, 'Highlander', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 2000, NULL, 72.50, 3.50, 6, 13.50, 9.80, 11.20, 'petrol', 'automatic', 295, 356, 7, 5, 1990, 'awd', 258, 4950, 1930, 1730, 2790),
(13, 2, 'Civic', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13', 2005, NULL, 47.00, 1.80, 4, 8.80, 6.50, 7.40, 'petrol', 'cvt', 158, 177, 5, 4, 1280, 'fwd', 171, 4640, 1800, 1415, 2700),
(14, 2, 'Accord', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1976, NULL, 56.00, 2.40, 4, 10.20, 7.50, 8.60, 'petrol', 'cvt', 192, 260, 5, 4, 1490, 'fwd', 199, 4910, 1860, 1450, 2830),
(15, 2, 'CR-V', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13', 2005, NULL, 57.00, 2.40, 4, 11.50, 8.50, 9.70, 'petrol', 'cvt', 184, 244, 5, 5, 1540, 'awd', 224, 4585, 1855, 1689, 2660),
(16, 2, 'HR-V', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1998, NULL, 50.00, 1.80, 4, 10.50, 7.80, 8.90, 'petrol', 'cvt', 141, 172, 5, 5, 1310, 'fwd', 206, 4340, 1790, 1605, 2610),
(17, 2, 'Fit', 'hatchback', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 2001, NULL, 40.00, 1.50, 4, 8.50, 6.50, 7.30, 'petrol', 'cvt', 130, 155, 5, 5, 1080, 'fwd', 169, 3995, 1695, 1545, 2530),
(18, 2, 'Pilot', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 2002, NULL, 73.00, 3.50, 6, 14.20, 10.50, 11.90, 'petrol', 'automatic', 280, 355, 8, 5, 1930, 'awd', 275, 4991, 1996, 1773, 2820),
(19, 2, 'Odyssey', 'minivan', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1994, NULL, 55.00, 3.50, 6, 13.50, 9.80, 11.30, 'petrol', 'automatic', 280, 355, 8, 5, 1920, 'fwd', 261, 5154, 1994, 1738, 3000),
(20, 2, 'City', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1996, NULL, 40.00, 1.50, 4, 8.80, 6.50, 7.40, 'petrol', 'cvt', 120, 145, 5, 4, 1120, 'fwd', 171, 4440, 1695, 1477, 2600),
(21, 3, 'Altima', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1992, NULL, 61.00, 2.50, 4, 10.80, 7.80, 9.00, 'petrol', 'cvt', 182, 244, 5, 4, 1450, 'fwd', 208, 4895, 1830, 1445, 2776),
(22, 3, 'X-Trail', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 2000, NULL, 60.00, 2.50, 4, 12.50, 9.20, 10.50, 'petrol', 'cvt', 169, 233, 5, 5, 1550, 'awd', 243, 4680, 1820, 1720, 2706),
(23, 3, 'Qashqai', 'crossover', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 2006, NULL, 55.00, 2.00, 4, 10.50, 7.80, 8.90, 'petrol', 'cvt', 141, 200, 5, 5, 1380, 'fwd', 206, 4377, 1806, 1595, 2646),
(24, 3, 'Patrol', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1951, NULL, 100.00, 5.60, 8, 19.50, 14.20, 16.20, 'petrol', 'automatic', 400, 560, 8, 5, 2730, '4wd', 374, 5165, 1995, 1940, 3075),
(25, 3, 'Navara', 'pickup', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13', 2005, NULL, 80.00, 2.50, 4, 12.80, 9.50, 10.80, 'diesel', 'automatic', 190, 450, 5, 4, 1970, '4wd', 284, 5255, 1850, 1840, 3150),
(26, 3, 'March', 'hatchback', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05', 2005, NULL, 41.00, 1.20, 3, 7.80, 6.20, 6.80, 'petrol', 'cvt', 79, 106, 5, 5, 940, 'fwd', 157, 3780, 1665, 1520, 2450),
(27, 3, 'Note', 'hatchback', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05', 2005, 2020, 41.00, 1.20, 3, 8.20, 6.50, 7.10, 'petrol', 'cvt', 79, 106, 5, 5, 980, 'fwd', 164, 4100, 1695, 1525, 2600),
(28, 4, 'CX-5', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13', 2012, NULL, 58.00, 2.50, 4, 11.50, 8.50, 9.70, 'petrol', 'automatic', 187, 252, 5, 5, 1570, 'awd', 224, 4550, 1840, 1680, 2700),
(29, 4, 'CX-3', 'crossover', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05', 2015, 2021, 48.00, 2.00, 4, 10.50, 7.80, 8.90, 'petrol', 'automatic', 148, 192, 5, 5, 1290, 'fwd', 206, 4275, 1765, 1535, 2570),
(30, 4, 'Mazda3', 'hatchback', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 2003, NULL, 51.00, 2.00, 4, 9.50, 7.20, 8.10, 'petrol', 'automatic', 155, 200, 5, 5, 1290, 'fwd', 188, 4460, 1795, 1435, 2725),
(31, 4, 'Mazda6', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 2002, NULL, 62.00, 2.50, 4, 10.80, 8.00, 9.20, 'petrol', 'automatic', 184, 250, 5, 4, 1460, 'fwd', 213, 4870, 1840, 1450, 2830),
(32, 4, 'BT-50', 'pickup', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05', 2006, NULL, 80.00, 3.20, 5, 13.50, 10.20, 11.50, 'diesel', 'automatic', 197, 470, 5, 4, 1980, '4wd', 303, 5365, 1850, 1819, 3220),
(33, 5, 'Outlander', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 2001, NULL, 63.00, 2.40, 4, 12.50, 9.20, 10.50, 'petrol', 'cvt', 166, 222, 7, 5, 1590, 'awd', 243, 4695, 1810, 1710, 2670),
(34, 5, 'Lancer', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1973, 2017, 59.00, 2.00, 4, 10.50, 7.80, 8.90, 'petrol', 'cvt', 148, 197, 5, 4, 1320, 'fwd', 206, 4570, 1760, 1490, 2635),
(35, 5, 'Pajero', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13', 2005, 2021, 88.00, 3.20, 6, 15.50, 11.50, 13.00, 'diesel', 'automatic', 200, 441, 7, 5, 2210, '4wd', 342, 4900, 1875, 1900, 2780),
(36, 5, 'L200', 'pickup', 1, '2025-12-18 19:04:30', '2026-01-05 14:10:13', 2005, NULL, 75.00, 2.40, 4, 12.50, 9.50, 10.80, 'diesel', 'automatic', 181, 430, 5, 4, 1920, '4wd', 285, 5225, 1815, 1780, 3000),
(37, 6, 'Swift', 'hatchback', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1983, NULL, 42.00, 1.20, 4, 8.20, 6.20, 7.00, 'petrol', 'cvt', 83, 113, 5, 5, 970, 'fwd', 161, 3840, 1735, 1480, 2450),
(38, 6, 'Vitara', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1988, NULL, 47.00, 1.60, 4, 10.50, 7.80, 8.90, 'petrol', 'automatic', 117, 156, 5, 5, 1180, '4wd', 206, 4175, 1775, 1610, 2500),
(39, 6, 'Jimny', 'suv', 1, '2025-12-18 19:04:30', '2026-01-05 13:16:53', 1970, NULL, 40.00, 1.50, 4, 9.50, 7.50, 8.30, 'petrol', 'manual', 102, 130, 4, 3, 1130, '4wd', 192, 3645, 1645, 1725, 2250),
(40, 6, 'Alto', 'hatchback', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05', 2005, NULL, 35.00, 1.00, 3, 7.20, 5.80, 6.40, 'petrol', 'manual', 68, 90, 5, 5, 810, 'fwd', 148, 3575, 1630, 1510, 2360),
(41, 8, 'C-Class', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05', 2005, NULL, 66.00, 2.00, 4, 10.50, 7.20, 8.50, 'petrol', 'automatic', 184, 300, 5, 4, 1540, 'rwd', 197, 4686, 1810, 1442, 2840),
(42, 8, 'E-Class', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05', 2005, NULL, 66.00, 2.00, 4, 11.50, 7.80, 9.20, 'petrol', 'automatic', 184, 300, 5, 4, 1650, 'rwd', 213, 4923, 1852, 1468, 2939),
(43, 8, 'GLE', 'suv', 1, '2025-12-18 19:04:30', '2026-01-07 08:54:21', 2015, NULL, 93.00, 3.00, 6, 14.50, 10.50, 12.00, 'petrol', 'automatic', 362, 500, 7, 5, 2180, 'awd', 278, 4924, 1947, 1772, 2995),
(44, 9, '3 Series', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-07 08:54:21', 2005, NULL, 59.00, 2.00, 4, 10.80, 7.20, 8.50, 'petrol', 'automatic', 184, 300, 5, 4, 1500, 'rwd', 197, 4709, 1827, 1442, 2851),
(45, 9, '5 Series', 'sedan', 1, '2025-12-18 19:04:30', '2026-01-04 18:31:05', 2005, NULL, 68.00, 2.00, 4, 11.50, 7.80, 9.20, 'petrol', 'automatic', 184, 290, 5, 4, 1620, 'rwd', 213, 4954, 1868, 1466, 2975),
(46, 9, 'X5', 'suv', 1, '2025-12-18 19:04:30', '2026-01-07 08:54:21', 2005, NULL, 83.00, 3.00, 6, 14.50, 10.50, 12.00, 'petrol', 'automatic', 300, 400, 5, 5, 2090, 'awd', 278, 4922, 2004, 1745, 2975),
(47, 3, 'Micra', 'hatchback', 1, '2026-01-04 18:31:05', '2026-01-04 18:31:05', 2005, NULL, 41.00, 1.20, 4, 8.50, 6.50, 7.30, 'petrol', 'cvt', 80, 106, 5, 5, 1020, 'fwd', 166, 3825, 1665, 1535, 2452),
(48, 1, 'Innova', 'minivan', 1, '2026-01-04 18:31:05', '2026-01-05 13:16:53', 2004, NULL, 55.00, 2.70, 4, 13.50, 9.80, 11.30, 'diesel', 'manual', 102, 200, 7, 5, 1720, 'rwd', 267, 4735, 1830, 1795, 2750),
(49, 1, 'Etios', 'sedan', 1, '2026-01-04 18:31:05', '2026-01-04 18:31:05', 2010, 2020, 45.00, 1.50, 4, 9.50, 7.20, 8.10, 'petrol', 'manual', 90, 132, 5, 4, 1080, 'fwd', 188, 4265, 1695, 1510, 2550),
(50, 1, 'Etios Liva', 'hatchback', 1, '2026-01-04 18:31:05', '2026-01-04 18:31:05', 2011, 2020, 45.00, 1.20, 4, 9.20, 6.80, 7.80, 'petrol', 'manual', 80, 104, 5, 5, 960, 'fwd', 180, 3775, 1695, 1510, 2460),
(51, 3, 'Sunny', 'sedan', 1, '2026-01-04 18:31:05', '2026-01-04 18:31:05', 2011, 2018, 50.00, 1.50, 4, 9.80, 7.50, 8.40, 'petrol', 'cvt', 99, 134, 5, 4, 1100, 'fwd', 194, 4425, 1695, 1505, 2600),
(52, 3, 'Almera', 'sedan', 1, '2026-01-04 18:31:05', '2026-01-04 18:31:05', 2011, NULL, 50.00, 1.50, 4, 9.80, 7.50, 8.40, 'petrol', 'cvt', 99, 134, 5, 4, 1110, 'fwd', 194, 4425, 1695, 1505, 2600),
(53, 10, 'Golf', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 50.00, 1.40, 4, 9.50, 7.20, 8.10, 'petrol', 'manual', 150, 250, 5, 5, 1280, 'fwd', 188, 4258, 1799, 1492, 2631),
(54, 10, 'Polo', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 45.00, 1.20, 4, 8.80, 6.50, 7.40, 'petrol', 'manual', 90, 160, 5, 5, 1080, 'fwd', 171, 4053, 1751, 1446, 2548),
(55, 10, 'Passat', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 66.00, 2.00, 4, 10.80, 7.50, 8.80, 'petrol', 'automatic', 190, 320, 5, 4, 1450, 'fwd', 204, 4767, 1832, 1456, 2791),
(56, 10, 'Jetta', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 55.00, 1.40, 4, 9.80, 7.50, 8.40, 'petrol', 'manual', 150, 250, 5, 4, 1320, 'fwd', 194, 4644, 1778, 1452, 2651),
(57, 10, 'Tiguan', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, NULL, 60.00, 2.00, 4, 11.50, 8.50, 9.70, 'petrol', 'automatic', 180, 280, 5, 5, 1590, 'awd', 224, 4486, 1839, 1673, 2681),
(58, 10, 'Touareg', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 75.00, 3.00, 6, 14.50, 10.50, 12.00, 'petrol', 'automatic', 340, 450, 5, 5, 2095, 'awd', 278, 4801, 1940, 1709, 2893),
(59, 10, 'Amarok', 'pickup', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2010, NULL, 80.00, 2.00, 4, 12.80, 9.50, 10.80, 'diesel', 'manual', 180, 400, 5, 4, 1950, '4wd', 255, 5254, 1944, 1834, 3095),
(60, 11, 'A3', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-07 08:54:21', 2005, NULL, 50.00, 1.40, 4, 10.20, 7.50, 8.60, 'petrol', 'automatic', 150, 250, 5, 5, 1335, 'fwd', 199, 4312, 1785, 1426, 2601),
(61, 11, 'A4', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 58.00, 2.00, 4, 11.50, 7.80, 9.20, 'petrol', 'automatic', 190, 320, 5, 4, 1470, 'fwd', 213, 4726, 1842, 1427, 2820),
(62, 11, 'A6', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-07 08:54:21', 2005, NULL, 73.00, 2.00, 4, 12.50, 8.50, 10.00, 'petrol', 'automatic', 252, 370, 5, 4, 1670, 'awd', 231, 4933, 1874, 1455, 2912),
(63, 11, 'Q5', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2008, NULL, 75.00, 2.00, 4, 12.50, 8.50, 10.00, 'petrol', 'automatic', 252, 370, 5, 5, 1790, 'awd', 231, 4663, 1893, 1659, 2807),
(64, 11, 'Q7', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 85.00, 3.00, 6, 14.50, 10.50, 12.00, 'petrol', 'automatic', 333, 440, 7, 5, 2140, 'awd', 278, 5086, 1968, 1737, 2994),
(65, 8, 'A-Class', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-07 08:54:21', 2012, NULL, 43.00, 1.60, 4, 10.50, 7.20, 8.50, 'petrol', 'automatic', 136, 200, 5, 5, 1395, 'fwd', 197, 4419, 1796, 1440, 2729),
(66, 8, 'S-Class', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-07 08:54:21', 2005, NULL, 90.00, 3.00, 6, 15.50, 10.20, 12.00, 'petrol', 'automatic', 362, 500, 5, 4, 2010, 'rwd', 278, 5116, 1899, 1496, 3035),
(67, 8, 'GLC', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2015, NULL, 66.00, 2.00, 4, 11.50, 8.50, 9.70, 'petrol', 'automatic', 211, 350, 5, 5, 1770, 'awd', 224, 4656, 1890, 1639, 2873),
(68, 8, 'GLS', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2006, NULL, 100.00, 3.00, 6, 16.50, 11.50, 13.50, 'petrol', 'automatic', 362, 500, 7, 5, 2410, 'awd', 312, 5207, 1956, 1823, 3135),
(69, 8, 'Sprinter', 'minivan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 75.00, 2.20, 4, 12.50, 9.20, 10.50, 'diesel', 'manual', 163, 360, 12, 5, 2080, 'rwd', 248, 5910, 1993, 2535, 3665),
(70, 9, '1 Series', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 52.00, 1.50, 3, 10.20, 7.50, 8.60, 'petrol', 'automatic', 140, 220, 5, 5, 1365, 'rwd', 199, 4319, 1765, 1421, 2690),
(71, 9, '7 Series', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 78.00, 3.00, 6, 15.50, 10.20, 12.00, 'petrol', 'automatic', 326, 450, 5, 4, 1925, 'rwd', 278, 5098, 1902, 1467, 3070),
(72, 9, 'X3', 'suv', 1, '2026-01-04 19:43:49', '2026-01-07 08:54:21', 2005, NULL, 65.00, 2.00, 4, 12.50, 8.50, 10.00, 'petrol', 'automatic', 184, 290, 5, 5, 1735, 'awd', 231, 4708, 1891, 1676, 2864),
(73, 9, 'X1', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2009, NULL, 51.00, 2.00, 4, 11.50, 8.20, 9.50, 'petrol', 'automatic', 192, 280, 5, 5, 1545, 'awd', 220, 4439, 1821, 1598, 2670),
(74, 9, 'X6', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2008, NULL, 85.00, 3.00, 6, 14.50, 10.50, 12.00, 'petrol', 'automatic', 306, 400, 5, 5, 2140, 'awd', 278, 4880, 1985, 1699, 2933),
(75, 16, '208', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2012, NULL, 50.00, 1.20, 3, 8.80, 6.50, 7.40, 'petrol', 'manual', 82, 118, 5, 5, 1040, 'fwd', 171, 3962, 1739, 1460, 2538),
(76, 16, '308', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, NULL, 53.00, 1.60, 4, 9.80, 7.20, 8.30, 'petrol', 'manual', 120, 160, 5, 5, 1205, 'fwd', 192, 4253, 1804, 1460, 2620),
(77, 16, '3008', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2009, NULL, 53.00, 1.60, 4, 11.50, 8.50, 9.70, 'petrol', 'automatic', 165, 240, 5, 5, 1450, 'fwd', 224, 4447, 1841, 1624, 2675),
(78, 16, '5008', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2009, NULL, 53.00, 1.60, 4, 12.50, 9.20, 10.50, 'petrol', 'automatic', 165, 240, 7, 5, 1520, 'fwd', 248, 4641, 1844, 1646, 2840),
(79, 16, 'Partner', 'pickup', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 60.00, 1.60, 4, 10.80, 8.20, 9.30, 'diesel', 'manual', 92, 230, 2, 2, 1420, 'fwd', 215, 4407, 1815, 1844, 2728),
(80, 17, 'Discovery', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 90.00, 3.00, 6, 15.50, 10.50, 12.50, 'diesel', 'automatic', 258, 600, 7, 5, 2270, '4wd', 289, 4970, 2073, 1846, 2923),
(81, 17, 'Defender', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 90.00, 3.00, 6, 16.50, 11.50, 13.50, 'diesel', 'automatic', 296, 650, 5, 5, 2415, '4wd', 312, 5018, 2008, 1967, 3022),
(82, 17, 'Range Rover Sport', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 105.00, 3.00, 6, 17.50, 12.20, 14.20, 'petrol', 'automatic', 340, 450, 5, 5, 2325, '4wd', 328, 4879, 2073, 1803, 2923),
(83, 17, 'Evoque', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2011, NULL, 63.00, 2.00, 4, 12.50, 8.50, 10.00, 'petrol', 'automatic', 240, 340, 5, 5, 1690, 'awd', 231, 4371, 1965, 1649, 2662),
(84, 17, 'Discovery Sport', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2014, NULL, 67.00, 2.00, 4, 12.80, 9.20, 10.50, 'diesel', 'automatic', 180, 430, 7, 5, 1880, '4wd', 248, 4597, 2069, 1727, 2741),
(85, 19, 'XC60', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2008, NULL, 70.00, 2.00, 4, 12.50, 8.50, 10.00, 'petrol', 'automatic', 250, 350, 5, 5, 1835, 'awd', 231, 4688, 1902, 1658, 2865),
(86, 19, 'XC90', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 80.00, 2.00, 4, 13.50, 9.80, 11.30, 'petrol', 'automatic', 320, 400, 7, 5, 2125, 'awd', 267, 4950, 2008, 1776, 2984),
(87, 19, 'S60', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 67.50, 2.00, 4, 11.50, 8.20, 9.50, 'petrol', 'automatic', 250, 350, 5, 4, 1615, 'fwd', 220, 4761, 1850, 1437, 2872),
(88, 19, 'V40', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2012, 2019, 54.00, 2.00, 4, 10.80, 7.50, 8.80, 'petrol', 'automatic', 190, 300, 5, 5, 1440, 'fwd', 204, 4369, 1802, 1420, 2647),
(89, 19, 'XC40', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2017, NULL, 54.00, 2.00, 4, 11.50, 8.50, 9.70, 'petrol', 'automatic', 250, 350, 5, 5, 1715, 'awd', 224, 4425, 1863, 1652, 2702),
(90, 32, 'Octavia', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 55.00, 1.40, 4, 9.80, 7.50, 8.40, 'petrol', 'manual', 150, 250, 5, 4, 1330, 'fwd', 194, 4689, 1814, 1461, 2680),
(91, 32, 'Fabia', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 45.00, 1.20, 4, 8.80, 6.50, 7.40, 'petrol', 'manual', 90, 160, 5, 5, 1095, 'fwd', 171, 3997, 1732, 1467, 2462),
(92, 32, 'Superb', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 66.00, 2.00, 4, 10.80, 7.50, 8.80, 'petrol', 'automatic', 190, 320, 5, 4, 1450, 'fwd', 204, 4861, 1864, 1468, 2841),
(93, 32, 'Kodiaq', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2016, NULL, 60.00, 2.00, 4, 11.50, 8.50, 9.70, 'petrol', 'automatic', 180, 320, 7, 5, 1700, 'awd', 224, 4697, 1882, 1676, 2791),
(94, 33, 'Ibiza', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 45.00, 1.20, 4, 8.80, 6.50, 7.40, 'petrol', 'manual', 90, 160, 5, 5, 1085, 'fwd', 171, 4059, 1780, 1444, 2564),
(95, 33, 'Leon', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 50.00, 1.40, 4, 9.50, 7.20, 8.10, 'petrol', 'manual', 150, 250, 5, 5, 1280, 'fwd', 188, 4238, 1810, 1445, 2602),
(96, 33, 'Ateca', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2016, NULL, 58.00, 1.50, 4, 10.50, 7.80, 8.90, 'petrol', 'manual', 150, 250, 5, 5, 1420, 'fwd', 206, 4363, 1841, 1615, 2638),
(97, 34, 'Clio', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 45.00, 1.20, 4, 8.80, 6.50, 7.40, 'petrol', 'manual', 90, 135, 5, 5, 1080, 'fwd', 171, 4050, 1733, 1442, 2589),
(98, 34, 'Megane', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 60.00, 1.60, 4, 9.80, 7.20, 8.30, 'petrol', 'manual', 130, 205, 5, 5, 1300, 'fwd', 192, 4359, 1814, 1445, 2649),
(99, 34, 'Kadjar', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2015, NULL, 55.00, 1.60, 4, 11.50, 8.50, 9.70, 'petrol', 'manual', 130, 205, 5, 5, 1415, 'fwd', 224, 4449, 1836, 1613, 2646),
(100, 34, 'Duster', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2010, NULL, 50.00, 1.50, 4, 10.80, 8.20, 9.30, 'petrol', 'manual', 115, 156, 5, 5, 1285, 'fwd', 215, 4315, 1822, 1695, 2673),
(101, 35, 'C3', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 47.00, 1.20, 4, 9.20, 6.80, 7.80, 'petrol', 'manual', 82, 118, 5, 5, 1090, 'fwd', 180, 3996, 1729, 1474, 2539),
(102, 35, 'C4', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 60.00, 1.60, 4, 9.80, 7.20, 8.30, 'petrol', 'manual', 120, 160, 5, 5, 1280, 'fwd', 192, 4328, 1789, 1489, 2608),
(103, 35, 'C5', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, 2017, 71.00, 1.60, 4, 10.80, 7.50, 8.80, 'petrol', 'automatic', 165, 240, 5, 4, 1505, 'fwd', 204, 4805, 1860, 1458, 2815),
(104, 35, 'Berlingo', 'minivan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 50.00, 1.60, 4, 10.80, 8.20, 9.30, 'diesel', 'manual', 92, 230, 7, 5, 1415, 'fwd', 215, 4407, 1815, 1844, 2728),
(105, 36, '500', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, NULL, 35.00, 1.20, 4, 8.20, 6.50, 7.20, 'petrol', 'manual', 69, 102, 4, 3, 865, 'fwd', 166, 3571, 1627, 1488, 2300),
(106, 36, 'Punto', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, 2018, 45.00, 1.40, 4, 9.50, 7.20, 8.10, 'petrol', 'manual', 77, 127, 5, 5, 1055, 'fwd', 188, 4065, 1687, 1490, 2510),
(107, 36, 'Doblo', 'minivan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 60.00, 1.60, 4, 10.80, 8.20, 9.30, 'diesel', 'manual', 105, 290, 7, 5, 1480, 'fwd', 215, 4390, 1832, 1847, 2755),
(108, 37, 'Corsa', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 45.00, 1.20, 4, 8.80, 6.50, 7.40, 'petrol', 'manual', 90, 170, 5, 5, 1085, 'fwd', 171, 4060, 1765, 1434, 2511),
(109, 37, 'Astra', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 55.00, 1.40, 4, 9.80, 7.20, 8.30, 'petrol', 'manual', 150, 250, 5, 5, 1300, 'fwd', 192, 4370, 1809, 1485, 2662),
(110, 37, 'Insignia', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2008, NULL, 70.00, 2.00, 4, 11.50, 8.20, 9.50, 'petrol', 'automatic', 170, 350, 5, 4, 1485, 'fwd', 220, 4830, 1856, 1498, 2737),
(111, 37, 'Mokka', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2012, NULL, 50.00, 1.40, 4, 10.50, 7.80, 8.90, 'petrol', 'manual', 140, 230, 5, 5, 1305, 'fwd', 206, 4278, 1776, 1646, 2555),
(112, 38, 'Cooper', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 40.00, 1.50, 3, 9.50, 7.20, 8.10, 'petrol', 'manual', 136, 220, 4, 3, 1155, 'fwd', 188, 3832, 1727, 1414, 2495),
(113, 38, 'Countryman', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2010, NULL, 51.00, 1.50, 3, 10.50, 7.80, 8.90, 'petrol', 'automatic', 136, 220, 5, 5, 1330, 'awd', 206, 4310, 1822, 1616, 2670),
(114, 39, 'XF', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, NULL, 70.00, 2.00, 4, 12.50, 8.50, 10.00, 'petrol', 'automatic', 250, 365, 5, 4, 1670, 'rwd', 231, 4954, 1880, 1457, 2909),
(115, 39, 'XE', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2015, NULL, 60.00, 2.00, 4, 11.50, 8.20, 9.50, 'petrol', 'automatic', 200, 320, 5, 4, 1580, 'rwd', 220, 4672, 1850, 1416, 2835),
(116, 39, 'F-Pace', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2015, NULL, 82.00, 2.00, 4, 13.50, 9.80, 11.30, 'petrol', 'automatic', 250, 365, 5, 5, 1865, 'awd', 267, 4731, 1936, 1667, 2874),
(117, 40, 'Range Rover', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 105.00, 3.00, 6, 17.50, 12.20, 14.20, 'petrol', 'automatic', 340, 450, 5, 5, 2365, '4wd', 328, 4999, 2073, 1835, 2922),
(118, 40, 'Velar', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2017, NULL, 82.00, 2.00, 4, 13.50, 9.80, 11.30, 'petrol', 'automatic', 250, 365, 5, 5, 1810, 'awd', 267, 4803, 1930, 1665, 2874),
(119, 41, 'Giulietta', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2010, 2020, 60.00, 1.40, 4, 10.20, 7.50, 8.60, 'petrol', 'manual', 170, 250, 5, 5, 1365, 'fwd', 199, 4351, 1798, 1465, 2634),
(120, 41, 'Stelvio', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2016, NULL, 64.00, 2.00, 4, 12.50, 8.50, 10.00, 'petrol', 'automatic', 280, 400, 5, 5, 1660, 'awd', 231, 4687, 1903, 1688, 2818),
(121, 42, 'Cayenne', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 100.00, 3.00, 6, 15.50, 10.50, 12.50, 'petrol', 'automatic', 340, 450, 5, 5, 2040, 'awd', 289, 4918, 1983, 1696, 2895),
(122, 42, 'Macan', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2014, NULL, 65.00, 2.00, 4, 12.50, 8.50, 10.00, 'petrol', 'automatic', 252, 370, 5, 5, 1770, 'awd', 231, 4696, 1923, 1624, 2807),
(124, 1, 'Tundra', 'pickup', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, NULL, 100.00, 3.50, 6, 15.50, 11.20, 13.00, 'petrol', 'automatic', 381, 543, 5, 4, 2530, '4wd', 295, 5815, 2030, 1935, 3700),
(125, 1, 'Sienna', 'minivan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2003, NULL, 75.00, 3.50, 6, 12.80, 9.50, 10.80, 'petrol', 'automatic', 296, 362, 8, 5, 2105, 'fwd', 249, 5175, 1995, 1770, 3030),
(128, 1, 'Sequoia', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2008, NULL, 100.00, 5.70, 8, 18.50, 13.50, 15.50, 'petrol', 'automatic', 381, 544, 8, 5, 2750, '4wd', 361, 5210, 2030, 1895, 3100),
(129, 1, 'Tacoma', 'pickup', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 80.00, 3.50, 6, 14.20, 10.50, 12.00, 'petrol', 'automatic', 278, 359, 5, 4, 2050, '4wd', 275, 5395, 1890, 1815, 3239),
(130, 1, 'Avalon', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, 2022, 68.00, 3.50, 6, 12.50, 8.80, 10.30, 'petrol', 'automatic', 301, 362, 5, 4, 1615, 'fwd', 235, 4975, 1849, 1435, 2820),
(137, 2, 'Passport', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2019, NULL, 70.00, 3.50, 6, 13.20, 9.50, 11.00, 'petrol', 'automatic', 280, 355, 5, 5, 1880, 'awd', 254, 4840, 1996, 1820, 2820),
(138, 2, 'Ridgeline', 'pickup', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2006, NULL, 73.50, 3.50, 6, 13.50, 9.80, 11.30, 'petrol', 'automatic', 280, 355, 5, 4, 1925, 'awd', 258, 5334, 1996, 1793, 3180),
(139, 3, 'Sentra', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, NULL, 50.00, 2.00, 4, 9.80, 7.20, 8.30, 'petrol', 'cvt', 149, 198, 5, 4, 1280, 'fwd', 192, 4641, 1815, 1447, 2700),
(140, 3, 'Maxima', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2004, NULL, 68.00, 3.50, 6, 13.50, 9.20, 11.00, 'petrol', 'cvt', 300, 354, 5, 4, 1630, 'fwd', 255, 4897, 1859, 1443, 2776),
(141, 3, 'Pathfinder', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 79.50, 3.50, 6, 13.80, 10.20, 11.70, 'petrol', 'cvt', 284, 351, 7, 5, 1940, 'awd', 270, 5008, 1960, 1795, 2900),
(142, 3, 'Armada', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2004, NULL, 98.00, 5.60, 8, 18.50, 13.20, 15.50, 'petrol', 'automatic', 390, 534, 8, 5, 2610, '4wd', 360, 5160, 1995, 1940, 3075),
(143, 3, 'Rogue', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2008, NULL, 57.00, 2.50, 4, 11.20, 8.20, 9.50, 'petrol', 'cvt', 181, 244, 5, 5, 1610, 'awd', 220, 4648, 1839, 1710, 2705),
(144, 3, 'Kicks', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2018, NULL, 41.00, 1.60, 4, 9.20, 7.20, 8.00, 'petrol', 'cvt', 122, 154, 5, 5, 1190, 'fwd', 185, 4294, 1760, 1628, 2620),
(145, 3, 'Murano', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2003, NULL, 79.50, 3.50, 6, 13.80, 10.20, 11.70, 'petrol', 'cvt', 260, 325, 5, 5, 1835, 'awd', 270, 4826, 1888, 1730, 2825),
(146, 3, 'Frontier', 'pickup', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 73.00, 3.80, 6, 13.50, 10.20, 11.70, 'petrol', 'automatic', 310, 381, 5, 4, 1930, '4wd', 272, 5328, 1920, 1798, 3199),
(147, 7, 'Forester', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2008, NULL, 63.00, 2.50, 4, 11.50, 8.50, 9.70, 'petrol', 'cvt', 182, 239, 5, 5, 1615, 'awd', 220, 4625, 1815, 1730, 2670),
(148, 7, 'Outback', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 65.00, 2.50, 4, 11.80, 8.80, 10.00, 'petrol', 'cvt', 182, 239, 5, 5, 1680, 'awd', 231, 4870, 1875, 1675, 2745),
(149, 7, 'Impreza', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2008, NULL, 50.00, 2.00, 4, 10.20, 7.50, 8.60, 'petrol', 'cvt', 152, 196, 5, 4, 1490, 'awd', 199, 4640, 1779, 1460, 2670),
(150, 7, 'WRX', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2014, NULL, 56.00, 2.00, 4, 13.50, 9.50, 11.30, 'petrol', 'manual', 268, 350, 5, 4, 1530, 'awd', 262, 4630, 1795, 1475, 2670),
(151, 7, 'Crosstrek', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2013, NULL, 55.00, 2.00, 4, 10.20, 7.50, 8.60, 'petrol', 'cvt', 152, 196, 5, 5, 1495, 'awd', 199, 4495, 1800, 1615, 2670),
(152, 7, 'Ascent', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2019, NULL, 73.00, 2.40, 4, 13.50, 9.80, 11.30, 'petrol', 'cvt', 260, 277, 8, 5, 1970, 'awd', 258, 4999, 1930, 1819, 2891),
(153, 7, 'Legacy', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2010, NULL, 65.00, 2.50, 4, 11.80, 8.80, 10.00, 'petrol', 'cvt', 182, 239, 5, 4, 1620, 'awd', 231, 4836, 1840, 1500, 2750),
(154, 7, 'BRZ', 'coupe', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2012, NULL, 50.00, 2.40, 4, 12.50, 8.50, 10.00, 'petrol', 'manual', 228, 249, 4, 2, 1274, 'rwd', 231, 4265, 1775, 1320, 2570),
(156, 9, 'X7', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2019, NULL, 90.00, 3.00, 6, 14.50, 10.20, 12.00, 'petrol', 'automatic', 335, 450, 7, 5, 2405, 'awd', 278, 5151, 2000, 1805, 3105),
(158, 9, 'X2', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2018, NULL, 51.00, 2.00, 4, 11.50, 8.50, 9.70, 'petrol', 'automatic', 228, 350, 5, 5, 1550, 'awd', 220, 4360, 1824, 1526, 2670),
(159, 9, 'X4', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2014, NULL, 67.00, 2.00, 4, 12.50, 8.50, 10.00, 'petrol', 'automatic', 248, 350, 5, 5, 1790, 'awd', 231, 4682, 1890, 1632, 2864),
(160, 9, '4 Series', 'coupe', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2014, NULL, 60.00, 2.00, 4, 11.50, 8.20, 9.50, 'petrol', 'automatic', 248, 350, 4, 2, 1580, 'rwd', 220, 4708, 1825, 1383, 2810),
(163, 8, 'GLA', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2014, NULL, 51.00, 2.00, 4, 10.80, 7.80, 9.00, 'petrol', 'automatic', 221, 350, 5, 5, 1520, 'awd', 208, 4427, 1834, 1610, 2729),
(164, 8, 'CLA', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2014, NULL, 56.00, 2.00, 4, 11.20, 8.00, 9.30, 'petrol', 'automatic', 221, 350, 5, 4, 1475, 'fwd', 213, 4693, 1830, 1432, 2729),
(165, 8, 'GLB', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2020, NULL, 60.00, 2.00, 4, 11.50, 8.50, 9.70, 'petrol', 'automatic', 221, 350, 7, 5, 1695, 'awd', 220, 4634, 1834, 1659, 2829),
(166, 8, 'AMG GT', 'coupe', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2015, NULL, 65.00, 4.00, 8, 16.50, 11.20, 13.50, 'petrol', 'automatic', 469, 630, 2, 2, 1645, 'rwd', 312, 4544, 1939, 1268, 2630),
(167, 8, 'Maybach S-Class', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2015, NULL, 90.00, 4.00, 8, 17.50, 11.50, 14.00, 'petrol', 'automatic', 621, 900, 4, 4, 2355, 'awd', 325, 5470, 1921, 1510, 3396),
(168, 11, 'Q3', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2011, NULL, 64.00, 2.00, 4, 11.50, 8.50, 9.70, 'petrol', 'automatic', 228, 350, 5, 5, 1690, 'awd', 220, 4481, 1848, 1616, 2680),
(169, 11, 'A5', 'coupe', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, NULL, 65.00, 2.00, 4, 11.80, 8.20, 9.70, 'petrol', 'automatic', 248, 370, 4, 2, 1615, 'awd', 220, 4700, 1846, 1371, 2824),
(170, 11, 'TT', 'coupe', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2006, NULL, 55.00, 2.00, 4, 12.50, 8.50, 10.00, 'petrol', 'automatic', 241, 370, 4, 2, 1425, 'awd', 231, 4191, 1832, 1343, 2505),
(171, 11, 'e-tron', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2019, NULL, 0.00, 0.00, 0, 0.00, 0.00, 24.00, 'electric', 'automatic', 402, 664, 5, 5, 2490, 'awd', 0, 4901, 1935, 1629, 2928),
(172, 11, 'RS6', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2002, NULL, 75.00, 4.00, 8, 16.50, 11.20, 13.50, 'petrol', 'automatic', 600, 800, 5, 4, 2075, 'awd', 312, 4995, 1951, 1482, 2929),
(173, 10, 'Atlas', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2018, NULL, 70.00, 2.00, 4, 12.50, 9.20, 10.70, 'petrol', 'automatic', 235, 350, 7, 5, 2005, 'awd', 247, 5037, 1979, 1768, 2980),
(174, 10, 'Arteon', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2017, NULL, 66.00, 2.00, 4, 11.50, 8.20, 9.50, 'petrol', 'automatic', 268, 350, 5, 4, 1615, 'fwd', 220, 4862, 1871, 1427, 2840),
(175, 10, 'T-Cross', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2019, NULL, 50.00, 1.00, 3, 8.50, 6.50, 7.40, 'petrol', 'manual', 115, 200, 5, 5, 1235, 'fwd', 171, 4108, 1760, 1559, 2563),
(176, 10, 'ID.4', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2021, NULL, 0.00, 0.00, 0, 0.00, 0.00, 20.00, 'electric', 'automatic', 201, 310, 5, 5, 2124, 'rwd', 0, 4584, 1852, 1616, 2771),
(178, 4, 'CX-9', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, NULL, 74.00, 2.50, 4, 13.50, 9.80, 11.30, 'petrol', 'automatic', 250, 420, 7, 5, 1955, 'awd', 258, 5065, 1969, 1750, 2930),
(179, 4, 'CX-30', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2019, NULL, 51.00, 2.50, 4, 10.50, 8.00, 9.10, 'petrol', 'automatic', 186, 252, 5, 5, 1420, 'awd', 210, 4395, 1795, 1545, 2655),
(180, 4, 'MX-5 Miata', 'convertible', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 45.00, 2.00, 4, 10.50, 7.50, 8.80, 'petrol', 'manual', 181, 205, 2, 2, 1059, 'rwd', 204, 3915, 1735, 1225, 2310),
(182, 43, 'RX', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2003, NULL, 72.50, 3.50, 6, 13.50, 9.80, 11.30, 'petrol', 'automatic', 295, 362, 5, 5, 2020, 'awd', 258, 4890, 1895, 1710, 2790),
(183, 43, 'ES', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2006, NULL, 65.00, 3.50, 6, 12.50, 8.80, 10.30, 'petrol', 'automatic', 302, 362, 5, 4, 1695, 'fwd', 235, 4975, 1866, 1447, 2870),
(184, 43, 'GX', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2003, NULL, 87.00, 4.60, 8, 17.50, 12.50, 14.50, 'petrol', 'automatic', 301, 446, 7, 5, 2380, '4wd', 336, 4880, 1885, 1885, 2790),
(185, 43, 'NX', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2015, NULL, 60.00, 2.00, 4, 11.50, 8.50, 9.70, 'petrol', 'automatic', 235, 350, 5, 5, 1775, 'awd', 220, 4640, 1845, 1645, 2660),
(186, 43, 'UX', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2019, NULL, 43.00, 2.00, 4, 9.80, 7.20, 8.30, 'petrol', 'cvt', 169, 205, 5, 5, 1545, 'fwd', 192, 4495, 1840, 1540, 2640),
(187, 43, 'LC', 'coupe', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2018, NULL, 82.00, 5.00, 8, 18.50, 12.50, 15.00, 'petrol', 'automatic', 471, 540, 2, 2, 1935, 'rwd', 348, 4770, 1920, 1345, 2870),
(188, 12, 'F-150', 'pickup', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2004, NULL, 87.00, 3.50, 6, 14.50, 10.50, 12.20, 'petrol', 'automatic', 400, 500, 5, 4, 2090, '4wd', 285, 5910, 2029, 1961, 3708),
(189, 12, 'Ranger', 'pickup', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2019, NULL, 80.00, 2.30, 4, 13.20, 9.80, 11.30, 'petrol', 'automatic', 270, 420, 5, 4, 2010, '4wd', 262, 5370, 1859, 1874, 3270),
(190, 12, 'Explorer', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2011, NULL, 70.80, 2.30, 4, 12.50, 9.20, 10.70, 'petrol', 'automatic', 300, 415, 7, 5, 1980, 'awd', 247, 5066, 2004, 1778, 3025),
(191, 12, 'Escape', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2001, NULL, 54.00, 2.00, 4, 10.80, 8.20, 9.30, 'petrol', 'automatic', 250, 373, 5, 5, 1680, 'awd', 215, 4585, 1882, 1678, 2710),
(192, 12, 'Mustang', 'coupe', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 61.00, 2.30, 4, 13.50, 9.20, 11.00, 'petrol', 'automatic', 315, 475, 4, 2, 1643, 'rwd', 255, 4784, 1916, 1381, 2720),
(193, 12, 'Edge', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, NULL, 69.00, 2.00, 4, 12.20, 9.20, 10.50, 'petrol', 'automatic', 250, 373, 5, 5, 1850, 'awd', 243, 4878, 1925, 1738, 2850),
(194, 12, 'Focus', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 55.00, 2.00, 4, 10.20, 7.50, 8.60, 'petrol', 'automatic', 160, 248, 5, 4, 1320, 'fwd', 199, 4538, 1825, 1484, 2648),
(195, 12, 'Everest', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2003, NULL, 71.00, 3.20, 6, 13.80, 10.20, 11.70, 'diesel', 'automatic', 200, 470, 7, 5, 2250, '4wd', 272, 4893, 1862, 1836, 2850),
(196, 13, 'Silverado', 'pickup', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, NULL, 98.00, 5.30, 8, 18.50, 13.20, 15.50, 'petrol', 'automatic', 355, 519, 5, 4, 2210, '4wd', 360, 5843, 2032, 1884, 3645),
(197, 13, 'Tahoe', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, NULL, 98.00, 5.30, 8, 18.50, 13.20, 15.50, 'petrol', 'automatic', 355, 519, 8, 5, 2560, '4wd', 360, 5179, 2045, 1898, 2946),
(198, 13, 'Traverse', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2009, NULL, 83.00, 3.60, 6, 14.20, 10.50, 12.00, 'petrol', 'automatic', 310, 360, 8, 5, 2060, 'awd', 278, 5189, 1996, 1796, 3071),
(199, 13, 'Equinox', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 59.00, 1.50, 4, 11.50, 8.50, 9.70, 'petrol', 'automatic', 170, 203, 5, 5, 1620, 'fwd', 220, 4652, 1843, 1684, 2725),
(200, 13, 'Cruze', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2009, NULL, 60.00, 1.40, 4, 10.50, 7.20, 8.60, 'petrol', 'automatic', 153, 200, 5, 4, 1385, 'fwd', 199, 4666, 1797, 1477, 2685),
(201, 13, 'Malibu', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2008, NULL, 60.00, 2.00, 4, 11.20, 8.00, 9.40, 'petrol', 'automatic', 163, 250, 5, 4, 1480, 'fwd', 218, 4923, 1854, 1473, 2829),
(202, 13, 'Trailblazer', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2002, NULL, 87.00, 4.20, 6, 15.80, 11.50, 13.30, 'petrol', 'automatic', 275, 376, 7, 5, 2230, '4wd', 308, 4868, 1900, 1869, 2870),
(203, 13, 'Spark', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2009, NULL, 35.00, 1.20, 4, 8.50, 6.50, 7.40, 'petrol', 'manual', 98, 125, 5, 5, 1050, 'fwd', 171, 3640, 1597, 1522, 2375),
(204, 14, 'Tucson', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2004, NULL, 62.00, 2.00, 4, 11.20, 8.50, 9.60, 'petrol', 'automatic', 164, 205, 5, 5, 1620, 'awd', 222, 4480, 1850, 1655, 2670),
(205, 14, 'Santa Fe', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2001, NULL, 72.00, 2.40, 4, 12.80, 9.50, 10.80, 'petrol', 'automatic', 232, 330, 7, 5, 1845, 'awd', 250, 4770, 1890, 1680, 2765),
(206, 14, 'Elantra', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2006, NULL, 50.00, 2.00, 4, 10.20, 7.50, 8.60, 'petrol', 'automatic', 147, 178, 5, 4, 1275, 'fwd', 199, 4570, 1800, 1440, 2700),
(207, 14, 'Sonata', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2004, NULL, 70.00, 2.40, 4, 11.80, 8.20, 9.70, 'petrol', 'automatic', 185, 241, 5, 4, 1470, 'fwd', 220, 4870, 1865, 1475, 2805),
(208, 14, 'Accent', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 43.00, 1.60, 4, 9.20, 7.00, 7.90, 'petrol', 'manual', 130, 157, 5, 4, 1120, 'fwd', 183, 4370, 1700, 1459, 2570),
(209, 14, 'i10', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2008, NULL, 35.00, 1.20, 4, 8.50, 6.50, 7.40, 'petrol', 'manual', 87, 118, 5, 5, 990, 'fwd', 171, 3665, 1660, 1505, 2385),
(210, 14, 'Grand i10', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2013, NULL, 43.00, 1.20, 4, 8.80, 6.80, 7.60, 'petrol', 'manual', 83, 114, 5, 5, 1010, 'fwd', 176, 3765, 1660, 1520, 2425),
(211, 14, 'Creta', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2015, NULL, 55.00, 1.60, 4, 10.50, 8.20, 9.20, 'petrol', 'automatic', 123, 151, 5, 5, 1230, 'fwd', 213, 4270, 1780, 1630, 2590),
(212, 15, 'Sportage', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2004, NULL, 62.00, 2.00, 4, 11.20, 8.50, 9.60, 'petrol', 'automatic', 164, 205, 5, 5, 1620, 'awd', 222, 4480, 1855, 1645, 2670),
(213, 15, 'Sorento', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2002, NULL, 70.00, 2.40, 4, 12.80, 9.50, 10.80, 'petrol', 'automatic', 185, 241, 7, 5, 1845, 'awd', 250, 4780, 1890, 1690, 2780),
(214, 15, 'Rio', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 45.00, 1.60, 4, 9.50, 7.20, 8.20, 'petrol', 'automatic', 120, 151, 5, 4, 1180, 'fwd', 190, 4065, 1725, 1450, 2580),
(215, 15, 'Cerato', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2008, NULL, 50.00, 2.00, 4, 10.20, 7.50, 8.60, 'petrol', 'automatic', 150, 192, 5, 4, 1275, 'fwd', 199, 4560, 1780, 1440, 2700),
(216, 15, 'Optima', 'sedan', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2011, NULL, 70.00, 2.40, 4, 11.80, 8.20, 9.70, 'petrol', 'automatic', 185, 241, 5, 4, 1470, 'fwd', 220, 4855, 1860, 1465, 2805),
(217, 15, 'Picanto', 'hatchback', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2011, NULL, 35.00, 1.20, 4, 8.50, 6.50, 7.40, 'petrol', 'manual', 84, 122, 5, 5, 940, 'fwd', 171, 3595, 1595, 1485, 2400),
(218, 15, 'Seltos', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2019, NULL, 50.00, 1.60, 4, 10.50, 8.20, 9.20, 'petrol', 'automatic', 123, 151, 5, 5, 1230, 'fwd', 213, 4315, 1800, 1620, 2630),
(219, 15, 'Telluride', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2019, NULL, 73.00, 3.80, 6, 14.20, 10.50, 12.00, 'petrol', 'automatic', 291, 355, 8, 5, 1960, 'awd', 278, 5001, 1996, 1750, 2901),
(220, 18, 'Wrangler', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, NULL, 85.00, 3.60, 6, 15.50, 11.20, 13.00, 'petrol', 'manual', 285, 353, 5, 4, 1935, '4wd', 302, 4334, 1894, 1838, 2460),
(221, 18, 'Grand Cherokee', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2005, NULL, 93.00, 3.60, 6, 15.50, 11.20, 13.00, 'petrol', 'automatic', 290, 347, 5, 5, 2185, '4wd', 302, 4828, 1943, 1792, 2915),
(222, 18, 'Cherokee', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2014, NULL, 60.00, 2.40, 4, 12.50, 9.50, 10.70, 'petrol', 'automatic', 184, 232, 5, 5, 1820, '4wd', 247, 4624, 1859, 1680, 2707),
(223, 18, 'Compass', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2017, NULL, 51.00, 2.40, 4, 12.20, 9.20, 10.50, 'petrol', 'automatic', 180, 237, 5, 5, 1630, 'fwd', 243, 4394, 1819, 1624, 2636),
(224, 18, 'Renegade', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2015, NULL, 48.00, 1.40, 4, 10.50, 8.20, 9.20, 'petrol', 'manual', 160, 250, 5, 5, 1340, 'fwd', 213, 4232, 1805, 1690, 2570),
(225, 18, 'Patriot', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2007, 2017, 51.00, 2.40, 4, 12.20, 9.20, 10.50, 'petrol', 'automatic', 172, 223, 5, 5, 1555, 'fwd', 243, 4408, 1760, 1686, 2635),
(226, 20, 'D-Max', 'pickup', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2002, NULL, 76.00, 3.00, 4, 12.50, 9.50, 10.70, 'diesel', 'manual', 163, 380, 5, 4, 1950, '4wd', 247, 5295, 1860, 1780, 3095),
(227, 20, 'MU-X', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 2013, NULL, 65.00, 3.00, 4, 12.80, 9.80, 11.20, 'diesel', 'automatic', 163, 380, 7, 5, 2060, '4wd', 258, 4825, 1860, 1830, 2845),
(228, 20, 'Trooper', 'suv', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 1991, 2002, 90.00, 3.50, 6, 14.50, 10.50, 12.20, 'petrol', 'manual', 215, 314, 7, 5, 2130, '4wd', 285, 4710, 1860, 1820, 2760),
(229, 20, 'Rodeo', 'pickup', 1, '2026-01-04 19:43:49', '2026-01-04 19:43:49', 1988, 2004, 75.00, 3.20, 6, 13.50, 10.20, 11.70, 'petrol', 'manual', 190, 251, 5, 4, 1850, '4wd', 272, 4950, 1780, 1740, 2760),
(239, 1, 'Prado 2.7L', 'suv', 1, '2026-01-05 12:57:50', '2026-01-05 12:57:50', 2009, NULL, 87.00, 2.70, 4, 14.50, 10.50, 12.20, 'petrol', 'automatic', 163, 246, 7, 5, 2220, '4wd', 285, 4825, 1885, 1890, 2790),
(250, 5, 'Pajero 3.8L', 'suv', 1, '2026-01-05 12:57:50', '2026-01-05 12:57:50', 2006, 2021, 88.00, 3.80, 6, 16.50, 11.50, 13.50, 'petrol', 'automatic', 247, 329, 7, 5, 2240, '4wd', 315, 4900, 1875, 1900, 2780),
(260, 12, 'Ranger 2.2L', 'pickup', 1, '2026-01-05 13:16:53', '2026-01-05 13:16:53', 2011, NULL, 80.00, 2.20, 4, 10.50, 7.80, 8.90, 'diesel', 'manual', 160, 385, 5, 4, 2000, '4wd', 235, 5374, 1918, 1876, 3220),
(264, 20, 'D-Max 1.9L', 'pickup', 1, '2026-01-05 13:16:53', '2026-01-05 13:16:53', 2020, NULL, 76.00, 1.90, 4, 10.20, 7.50, 8.60, 'diesel', 'automatic', 163, 360, 5, 4, 1950, '4wd', 227, 5295, 1860, 1775, 3095),
(267, 1, 'Corolla', 'sedan', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2005, 2019, 50.00, 1.60, 4, 8.80, 6.50, 7.40, 'petrol', 'cvt', 122, 157, 5, 4, 1300, 'fwd', 170, 4630, 1780, 1435, 2700),
(268, 1, 'Corolla', 'sedan', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2005, NULL, 50.00, 1.80, 4, 8.50, 6.20, 7.10, 'petrol', 'manual', 139, 173, 5, 4, 1320, 'fwd', 165, 4630, 1780, 1435, 2700),
(269, 1, 'Corolla', 'sedan', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2019, NULL, 50.00, 2.00, 4, 9.20, 6.80, 7.80, 'petrol', 'cvt', 169, 205, 5, 4, 1350, 'fwd', 180, 4630, 1780, 1435, 2700),
(270, 1, 'Corolla', 'sedan', 1, '2026-01-05 14:44:32', '2026-01-07 08:54:21', 2019, NULL, 50.00, 1.80, 4, 4.50, 4.20, 4.30, 'hybrid', 'cvt', 121, 142, 5, 4, 1380, 'fwd', 101, 4630, 1780, 1435, 2700),
(271, 1, 'Fortuner', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2015, NULL, 80.00, 2.40, 4, 9.20, 7.20, 8.10, 'diesel', 'automatic', 150, 400, 7, 5, 2150, '4wd', 270, 4795, 1855, 1835, 2745),
(272, 1, 'Fortuner', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2015, NULL, 80.00, 2.40, 4, 9.00, 7.00, 7.90, 'diesel', 'manual', 150, 400, 7, 5, 2130, '4wd', 268, 4795, 1855, 1835, 2745),
(273, 1, 'Fortuner', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2005, NULL, 80.00, 2.70, 4, 14.50, 10.50, 12.20, 'petrol', 'automatic', 166, 245, 7, 5, 2220, '4wd', 285, 4795, 1855, 1835, 2745),
(274, 1, 'Fortuner', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2015, NULL, 80.00, 2.80, 4, 9.50, 7.20, 8.10, 'diesel', 'manual', 204, 500, 7, 5, 2180, '4wd', 283, 4795, 1855, 1835, 2745),
(275, 1, 'Fortuner', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2005, NULL, 80.00, 4.00, 6, 17.50, 12.50, 14.50, 'petrol', 'automatic', 238, 376, 7, 5, 2350, '4wd', 338, 4795, 1855, 1835, 2745),
(276, 1, 'Hilux', 'pickup', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2015, NULL, 80.00, 2.40, 4, 9.20, 7.20, 8.10, 'diesel', 'automatic', 150, 400, 5, 4, 2000, '4wd', 270, 5330, 1855, 1815, 3085),
(277, 1, 'Hilux', 'pickup', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2015, NULL, 80.00, 2.40, 4, 9.00, 7.00, 7.90, 'diesel', 'manual', 150, 400, 5, 4, 1980, '4wd', 268, 5330, 1855, 1815, 3085),
(278, 1, 'Hilux', 'pickup', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2015, NULL, 80.00, 2.80, 4, 9.20, 7.20, 8.10, 'diesel', 'manual', 204, 500, 5, 4, 2050, '4wd', 276, 5330, 1855, 1815, 3085),
(279, 1, 'RAV4', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2013, NULL, 55.00, 2.00, 4, 10.50, 7.80, 8.90, 'petrol', 'cvt', 151, 192, 5, 5, 1580, 'fwd', 206, 4600, 1855, 1685, 2690),
(280, 1, 'RAV4', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2016, NULL, 55.00, 2.50, 4, 6.50, 5.80, 6.10, 'hybrid', 'cvt', 219, 221, 5, 5, 1680, 'awd', 142, 4600, 1855, 1685, 2690),
(281, 1, 'Camry', 'sedan', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2005, NULL, 60.00, 3.50, 6, 12.50, 8.50, 10.20, 'petrol', 'automatic', 301, 362, 5, 4, 1615, 'fwd', 235, 4885, 1840, 1445, 2825),
(282, 1, 'Prado', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2009, NULL, 87.00, 2.70, 4, 14.50, 10.50, 12.20, 'petrol', 'automatic', 163, 246, 7, 5, 2220, '4wd', 285, 4825, 1885, 1890, 2790),
(283, 1, 'Prado', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2015, NULL, 87.00, 2.80, 4, 11.50, 8.50, 9.80, 'diesel', 'automatic', 177, 450, 7, 5, 2290, '4wd', 258, 4825, 1885, 1890, 2790),
(284, 1, 'Land Cruiser', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2007, NULL, 93.00, 4.00, 6, 17.50, 12.50, 14.50, 'petrol', 'automatic', 271, 385, 8, 5, 2600, '4wd', 338, 4990, 1980, 1920, 2850),
(285, 1, 'Land Cruiser', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2007, NULL, 93.00, 4.50, 8, 13.50, 9.80, 11.30, 'diesel', 'automatic', 232, 615, 8, 5, 2670, '4wd', 298, 4990, 1980, 1920, 2850),
(286, 2, 'Civic', 'sedan', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2016, NULL, 47.00, 1.50, 4, 8.20, 6.20, 7.00, 'petrol', 'cvt', 182, 240, 5, 4, 1300, 'fwd', 165, 4640, 1800, 1415, 2700),
(287, 2, 'Civic', 'sedan', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2016, NULL, 47.00, 2.00, 4, 9.20, 6.80, 7.80, 'petrol', 'cvt', 158, 187, 5, 4, 1310, 'fwd', 180, 4640, 1800, 1415, 2700),
(288, 2, 'CR-V', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2017, NULL, 57.00, 1.50, 4, 9.50, 7.20, 8.20, 'petrol', 'cvt', 190, 243, 5, 5, 1563, 'awd', 190, 4585, 1855, 1689, 2660),
(289, 3, 'Navara', 'pickup', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2014, NULL, 80.00, 2.30, 4, 12.50, 9.20, 10.50, 'diesel', 'automatic', 163, 403, 5, 4, 1950, '4wd', 248, 5255, 1850, 1840, 3150),
(290, 3, 'Navara', 'pickup', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2014, NULL, 80.00, 2.30, 4, 12.20, 9.00, 10.30, 'diesel', 'manual', 163, 403, 5, 4, 1930, '4wd', 245, 5255, 1850, 1840, 3150),
(291, 4, 'CX-5', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2012, NULL, 58.00, 2.00, 4, 10.50, 7.80, 8.90, 'petrol', 'automatic', 155, 200, 5, 5, 1500, 'fwd', 206, 4550, 1840, 1680, 2700),
(292, 5, 'Pajero', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2005, 2021, 88.00, 3.00, 6, 15.00, 11.00, 12.50, 'petrol', 'automatic', 184, 310, 7, 5, 2150, '4wd', 295, 4900, 1875, 1900, 2780);
INSERT INTO `car_models` (`id`, `make_id`, `name`, `body_type`, `is_active`, `created_at`, `updated_at`, `year_start`, `year_end`, `fuel_tank_capacity_liters`, `engine_size_liters`, `engine_cylinders`, `fuel_consumption_urban_l100km`, `fuel_consumption_highway_l100km`, `fuel_consumption_combined_l100km`, `fuel_type`, `transmission_type`, `horsepower_hp`, `torque_nm`, `seating_capacity`, `doors`, `weight_kg`, `drive_type`, `co2_emissions_gkm`, `length_mm`, `width_mm`, `height_mm`, `wheelbase_mm`) VALUES
(293, 5, 'Pajero', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2005, 2021, 88.00, 3.80, 6, 16.00, 11.50, 13.20, 'petrol', 'automatic', 250, 343, 7, 5, 2250, '4wd', 310, 4900, 1875, 1900, 2780),
(294, 5, 'L200', 'pickup', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2005, NULL, 75.00, 2.50, 4, 12.80, 9.50, 10.80, 'diesel', 'automatic', 178, 400, 5, 4, 1920, '4wd', 284, 5225, 1815, 1780, 3000),
(295, 5, 'L200', 'pickup', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2005, NULL, 75.00, 2.50, 4, 12.50, 9.20, 10.50, 'diesel', 'manual', 178, 400, 5, 4, 1900, '4wd', 280, 5225, 1815, 1780, 3000),
(296, 2, 'Accord', 'sedan', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2018, NULL, 56.00, 1.50, 4, 9.20, 6.50, 7.60, 'petrol', 'cvt', 192, 260, 5, 4, 1447, 'fwd', 176, 4910, 1860, 1450, 2830),
(297, 2, 'Accord', 'sedan', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2018, NULL, 56.00, 2.00, 4, 10.80, 7.50, 8.80, 'petrol', 'automatic', 252, 370, 5, 4, 1520, 'fwd', 204, 4910, 1860, 1450, 2830),
(298, 3, 'X-Trail', 'suv', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2014, NULL, 60.00, 2.00, 4, 11.50, 8.50, 9.70, 'petrol', 'cvt', 144, 200, 5, 5, 1520, 'fwd', 220, 4680, 1820, 1720, 2706),
(299, 4, 'BT-50', 'pickup', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2011, NULL, 80.00, 2.20, 4, 12.50, 9.20, 10.50, 'diesel', 'manual', 147, 375, 5, 4, 1900, '4wd', 248, 5365, 1850, 1819, 3220),
(300, 4, 'BT-50', 'pickup', 1, '2026-01-05 14:44:32', '2026-01-05 14:44:32', 2011, NULL, 80.00, 2.20, 4, 12.80, 9.50, 10.80, 'diesel', 'automatic', 147, 375, 5, 4, 1920, '4wd', 255, 5365, 1850, 1819, 3220),
(301, 1, 'Corolla', 'sedan', 1, '2026-01-05 15:00:57', '2026-01-07 08:54:21', 2019, NULL, 50.00, 1.80, 4, 4.50, 4.20, 4.30, 'hybrid', '', 121, 142, 5, 4, 1380, 'fwd', 101, 4630, 1780, 1435, 2700),
(302, 1, 'RAV4', 'suv', 1, '2026-01-05 15:00:57', '2026-01-05 15:00:57', 2016, NULL, 55.00, 2.50, 4, 6.50, 5.80, 6.10, 'hybrid', '', 219, 221, 5, 5, 1680, 'awd', 142, 4600, 1855, 1685, 2690),
(303, 1, 'Corolla', 'sedan', 1, '2026-01-07 08:21:59', '2026-01-07 08:54:21', 2019, NULL, 50.00, 1.80, 4, 4.50, 4.20, 4.30, 'hybrid', '', 121, 142, 5, 4, 1380, 'fwd', 101, 4630, 1780, 1435, 2700),
(304, 1, 'RAV4', 'suv', 1, '2026-01-07 08:21:59', '2026-01-07 08:21:59', 2016, NULL, 55.00, 2.50, 4, 6.50, 5.80, 6.10, 'hybrid', '', 219, 221, 5, 5, 1680, 'awd', 142, 4600, 1855, 1685, 2690),
(305, 8, 'C-Class', 'sedan', 1, '2026-01-07 08:46:34', '2026-01-07 08:46:34', 2014, NULL, 66.00, 1.60, 4, 7.20, 5.10, 5.90, 'diesel', 'automatic', 136, 320, 5, 4, 1580, 'rwd', 154, 4686, 1810, 1442, 2840),
(306, 8, 'C-Class', 'sedan', 1, '2026-01-07 08:46:34', '2026-01-07 08:46:34', 2014, NULL, 66.00, 2.10, 4, 7.80, 5.60, 6.50, 'diesel', 'automatic', 170, 400, 5, 4, 1620, 'rwd', 171, 4686, 1810, 1442, 2840),
(307, 8, 'E-Class', 'sedan', 1, '2026-01-07 08:46:34', '2026-01-07 08:46:34', 2016, NULL, 66.00, 2.00, 4, 8.80, 6.20, 7.20, 'diesel', 'automatic', 194, 400, 5, 4, 1720, 'rwd', 189, 4923, 1852, 1468, 2939),
(308, 8, 'E-Class', 'sedan', 1, '2026-01-07 08:46:34', '2026-01-07 08:46:34', 2016, NULL, 66.00, 3.00, 6, 10.50, 7.20, 8.50, 'diesel', 'automatic', 258, 620, 5, 4, 1800, 'rwd', 223, 4923, 1852, 1468, 2939),
(309, 8, 'GLE', 'suv', 1, '2026-01-07 08:46:34', '2026-01-07 08:46:34', 2015, NULL, 93.00, 2.10, 4, 9.50, 7.20, 8.10, 'diesel', 'automatic', 204, 500, 5, 5, 2150, 'awd', 213, 4819, 1935, 1796, 2915),
(310, 8, 'GLE', 'suv', 1, '2026-01-07 08:46:34', '2026-01-07 08:46:34', 2015, NULL, 93.00, 3.00, 6, 11.20, 8.50, 9.60, 'diesel', 'automatic', 258, 620, 5, 5, 2250, 'awd', 252, 4819, 1935, 1796, 2915),
(311, 8, 'GLC', 'suv', 1, '2026-01-07 08:46:34', '2026-01-07 08:46:34', 2015, NULL, 66.00, 2.00, 4, 8.50, 6.50, 7.30, 'diesel', 'automatic', 170, 400, 5, 5, 1820, 'awd', 192, 4656, 1890, 1639, 2873),
(312, 8, 'S-Class', 'sedan', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2013, NULL, 90.00, 3.00, 6, 9.80, 6.80, 8.00, 'diesel', 'automatic', 258, 620, 5, 4, 2020, 'rwd', 209, 5116, 1899, 1496, 3035),
(313, 8, 'S-Class', 'sedan', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2013, NULL, 90.00, 4.00, 8, 13.20, 9.50, 11.00, 'petrol', 'automatic', 455, 700, 5, 4, 2100, 'rwd', 256, 5116, 1899, 1496, 3035),
(314, 8, 'A-Class', 'hatchback', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2018, NULL, 43.00, 1.30, 4, 7.50, 5.20, 6.10, 'petrol', 'automatic', 163, 250, 5, 5, 1410, 'fwd', 139, 4419, 1796, 1440, 2729),
(315, 8, 'A-Class', 'hatchback', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2018, NULL, 43.00, 1.50, 4, 6.80, 4.90, 5.60, 'diesel', 'automatic', 116, 260, 5, 5, 1450, 'fwd', 147, 4419, 1796, 1440, 2729),
(316, 9, '3 Series', 'sedan', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2019, NULL, 59.00, 2.00, 4, 8.20, 5.80, 6.80, 'diesel', 'automatic', 190, 400, 5, 4, 1560, 'rwd', 178, 4709, 1827, 1442, 2851),
(317, 9, '3 Series', 'sedan', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2019, NULL, 59.00, 3.00, 6, 10.20, 7.20, 8.40, 'petrol', 'automatic', 255, 400, 5, 4, 1610, 'rwd', 195, 4709, 1827, 1442, 2851),
(318, 9, '5 Series', 'sedan', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2017, NULL, 68.00, 2.00, 4, 8.50, 6.00, 7.00, 'diesel', 'automatic', 231, 450, 5, 4, 1710, 'rwd', 184, 4936, 1868, 1479, 2975),
(319, 9, '5 Series', 'sedan', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2017, NULL, 68.00, 3.00, 6, 11.20, 7.80, 9.20, 'petrol', 'automatic', 340, 450, 5, 4, 1750, 'rwd', 210, 4936, 1868, 1479, 2975),
(320, 9, 'X3', 'suv', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2017, NULL, 65.00, 2.00, 4, 8.80, 6.50, 7.40, 'diesel', 'automatic', 190, 400, 5, 5, 1820, 'awd', 195, 4708, 1891, 1676, 2864),
(321, 9, 'X3', 'suv', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2017, NULL, 65.00, 3.00, 6, 11.50, 8.20, 9.60, 'petrol', 'automatic', 360, 500, 5, 5, 1890, 'awd', 220, 4708, 1891, 1676, 2864),
(322, 9, 'X5', 'suv', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2018, NULL, 83.00, 3.00, 6, 9.50, 7.20, 8.20, 'diesel', 'automatic', 265, 620, 5, 5, 2140, 'awd', 215, 4922, 2004, 1745, 2975),
(323, 9, 'X5', 'suv', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2018, NULL, 83.00, 4.40, 8, 13.80, 9.80, 11.50, 'petrol', 'automatic', 530, 750, 5, 5, 2250, 'awd', 262, 4922, 2004, 1745, 2975),
(324, 9, 'X1', 'suv', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2015, NULL, 51.00, 2.00, 4, 8.20, 6.00, 6.90, 'diesel', 'automatic', 150, 350, 5, 5, 1620, 'awd', 181, 4439, 1821, 1598, 2670),
(325, 11, 'A4', 'sedan', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2016, NULL, 58.00, 2.00, 4, 8.20, 5.50, 6.60, 'diesel', 'automatic', 150, 320, 5, 4, 1580, 'fwd', 173, 4726, 1842, 1427, 2820),
(326, 11, 'A4', 'sedan', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2016, NULL, 58.00, 2.00, 4, 8.80, 6.00, 7.20, 'diesel', 'automatic', 190, 400, 5, 4, 1620, 'awd', 189, 4726, 1842, 1427, 2820),
(327, 11, 'A6', 'sedan', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2018, NULL, 73.00, 2.00, 4, 8.50, 6.00, 7.00, 'diesel', 'automatic', 204, 400, 5, 4, 1750, 'fwd', 183, 4939, 1886, 1457, 2924),
(328, 11, 'A6', 'sedan', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2018, NULL, 73.00, 3.00, 6, 10.50, 7.20, 8.60, 'diesel', 'automatic', 272, 600, 5, 4, 1850, 'awd', 225, 4939, 1886, 1457, 2924),
(329, 11, 'Q5', 'suv', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2017, NULL, 75.00, 2.00, 4, 8.80, 6.50, 7.40, 'diesel', 'automatic', 190, 400, 5, 5, 1880, 'awd', 195, 4663, 1893, 1659, 2819),
(330, 11, 'Q5', 'suv', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2017, NULL, 75.00, 3.00, 6, 11.50, 8.20, 9.60, 'petrol', 'automatic', 354, 500, 5, 5, 1950, 'awd', 220, 4663, 1893, 1659, 2819),
(331, 11, 'Q7', 'suv', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2015, NULL, 85.00, 3.00, 6, 9.50, 7.20, 8.20, 'diesel', 'automatic', 272, 600, 7, 5, 2180, 'awd', 215, 5052, 1968, 1741, 2994),
(332, 11, 'A3', 'sedan', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2013, NULL, 50.00, 2.00, 4, 6.80, 4.90, 5.60, 'diesel', 'automatic', 150, 320, 5, 4, 1390, 'fwd', 147, 4456, 1796, 1416, 2637),
(333, 11, 'A3', 'sedan', 1, '2026-01-07 08:46:35', '2026-01-07 08:46:35', 2013, NULL, 50.00, 2.00, 4, 8.50, 6.20, 7.20, 'petrol', 'automatic', 190, 320, 5, 4, 1370, 'fwd', 164, 4456, 1796, 1416, 2637);

--
-- Triggers `car_models`
--
DELIMITER $$
CREATE TRIGGER `trg_model_update` AFTER UPDATE ON `car_models` FOR EACH ROW BEGIN
    UPDATE car_hire_fleet
    SET model_name = NEW.name
    WHERE model_id = NEW.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `company_fleet_summary`
-- (See below for the actual view)
--
CREATE TABLE `company_fleet_summary` (
`id` int
,`business_name` varchar(200)
,`phone` varchar(20)
,`email` varchar(100)
,`location_id` int
,`location_name` varchar(100)
,`total_vehicles` int
,`available_vehicles` int
,`daily_rate_from` decimal(10,2)
,`weekly_rate_from` decimal(10,2)
,`monthly_rate_from` decimal(10,2)
,`verified` tinyint(1)
,`featured` tinyint(1)
,`fleet_makes` text
,`actual_fleet_count` bigint
,`min_daily_rate` decimal(10,2)
,`max_daily_rate` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` int NOT NULL,
  `listing_id` int DEFAULT NULL,
  `buyer_id` int NOT NULL,
  `seller_id` int NOT NULL,
  `last_message` text,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `listing_id`, `buyer_id`, `seller_id`, `last_message`, `last_message_at`, `created_at`) VALUES
(1, 19, 12, 36, 'LLZ in 5mins', '2026-01-02 01:33:52', '2026-01-02 01:22:19');

-- --------------------------------------------------------

--
-- Table structure for table `fuel_prices`
--

CREATE TABLE `fuel_prices` (
  `id` int NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Malawi',
  `fuel_type` enum('petrol','diesel','lpg','cng') COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_per_liter_mwk` decimal(10,2) NOT NULL COMMENT 'Price in Malawi Kwacha per liter',
  `price_per_liter_usd` decimal(10,4) DEFAULT NULL COMMENT 'Price in USD per liter',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'MWK',
  `source` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'globalpetrolprices.com',
  `source_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date` date NOT NULL COMMENT 'Date for which this price is valid',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Active price (most recent)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fuel_prices`
--

INSERT INTO `fuel_prices` (`id`, `country`, `fuel_type`, `price_per_liter_mwk`, `price_per_liter_usd`, `currency`, `source`, `source_url`, `last_updated`, `date`, `is_active`, `created_at`) VALUES
(1, 'Malawi', 'petrol', 3499.00, NULL, 'MWK', 'globalpetrolprices.com', NULL, '2026-01-10 15:44:49', '2026-01-04', 1, '2026-01-04 10:37:38'),
(2, 'Malawi', 'diesel', 3500.00, NULL, 'MWK', 'globalpetrolprices.com', NULL, '2026-01-10 15:44:55', '2026-01-04', 1, '2026-01-04 10:37:38');

-- --------------------------------------------------------

--
-- Table structure for table `garages`
--

CREATE TABLE `garages` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Foreign key to users table',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recovery_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `location_id` int NOT NULL,
  `services` json DEFAULT NULL,
  `emergency_services` json DEFAULT NULL,
  `specialization` json DEFAULT NULL,
  `specializes_in_cars` json DEFAULT NULL,
  `years_experience` int DEFAULT '0',
  `business_hours` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `operating_hours` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `verified` tinyint(1) DEFAULT '0',
  `certified` tinyint(1) DEFAULT '0',
  `featured` tinyint(1) DEFAULT '0',
  `status` enum('active','pending_approval','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending_approval',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `garages`
--

INSERT INTO `garages` (`id`, `user_id`, `name`, `owner_name`, `email`, `phone`, `recovery_number`, `whatsapp`, `address`, `location_id`, `services`, `emergency_services`, `specialization`, `specializes_in_cars`, `years_experience`, `business_hours`, `operating_hours`, `website`, `facebook_url`, `instagram_url`, `twitter_url`, `linkedin_url`, `description`, `verified`, `certified`, `featured`, `status`, `created_at`, `updated_at`, `approved_at`, `approved_by`) VALUES
(1, 16, 'AutoCare Malawi', 'John Banda', 'info@autocare.mw', '+265991234567', '+265991234568', '+265991234567', '123 Industrial Area, Blantyre', 1, '[\"Oil Change\", \"Brake Service\", \"Transmission Service\", \"Air Conditioning\", \"Electrical\", \"Engine Repair\", \"AC Repair\", \"Electrical Repair\"]', '[\"24/7 Breakdown Recovery\", \"Tire Replacement\", \"Jump Start\", \"Fuel Delivery\"]', '[\"Toyota\", \"Honda\", \"Nissan\"]', '[\"Toyota\", \"Honda\", \"Nissan\", \"Mazda\"]', 8, NULL, 'Mon-Fri: 7:30 AM - 6:00 PM, Sat: 8:00 AM - 4:00 PM, Sun: Emergency Only', 'https://www.autocaremalawi.com', 'https://facebook.com/autocaremalawi', 'https://instagram.com/autocare_mw', 'https://twitter.com/autocaremw', NULL, 'Professional automotive service center with certified technicians and genuine parts. We offer comprehensive car servicing, repairs, and maintenance for all makes and models.', 1, 1, 0, 'active', '2025-12-18 19:04:30', '2026-01-02 01:19:13', NULL, NULL),
(2, 17, 'Quality Motors Workshop', 'Mary Phiri', 'info@qualitymotors.mw', '+265881234567', '+265881234568', '+265881234567', '456 Area 47, Lilongwe', 2, '[\"General Repair\", \"Body Work\", \"Painting\", \"Dent Removal\", \"Glass Replacement\", \"Welding\"]', '[\"Towing Service\", \"Lockout Assistance\", \"Tire Repair\"]', '[\"All Makes\", \"European Cars\"]', '[\"All Japanese Makes\", \"European Cars\", \"American Cars\"]', 12, NULL, 'Mon-Sat: 8:00 AM - 5:30 PM, Sun: Closed', 'https://www.qualitymotorsmw.com', 'https://facebook.com/qualitymotorsmw', 'https://instagram.com/qualitymotors', NULL, NULL, 'Full-service garage specializing in body work and comprehensive automotive repairs. Our experienced team handles everything from minor dents to major collision repairs.', 1, 0, 0, 'active', '2025-12-18 19:04:30', '2025-12-29 00:17:51', NULL, NULL),
(3, 18, 'Precision Auto Services', 'David Chirwa', 'info@precision.mw', '+265991567890', '+265991567891', '+265991567890', '789 Kamuzu Procession Road, Lilongwe', 2, '[\"Engine Diagnostics\", \"Computer Diagnostics\", \"Hybrid Service\", \"Import Clearance\", \"Pre-Purchase Inspections\"]', '[\"24/7 Emergency Support\", \"Mobile Mechanic\", \"Towing\"]', '[\"Toyota\", \"Honda\", \"Mercedes-Benz\", \"BMW\"]', '[\"Toyota\", \"Honda\", \"Mercedes-Benz\", \"BMW\", \"Hybrid Vehicles\"]', 15, NULL, 'Open 24/7 - Emergency Services Available', 'https://www.precisionauto.mw', 'https://facebook.com/precisionautomw', 'https://instagram.com/precision_auto_malawi', 'https://twitter.com/precisionautomw', 'https://linkedin.com/company/precision-auto-malawi', 'Advanced diagnostic center with state-of-the-art equipment for modern vehicles. We specialize in hybrid and electric vehicle maintenance and repairs.', 1, 0, 1, 'active', '2025-12-18 19:04:30', '2025-12-29 00:17:30', NULL, NULL),
(4, 19, 'Mzuzu Auto Repair', 'James Tembo', 'info@mzuzuauto.mw', '+265881567890', '+265881567891', '+265881567890', '321 Orton Chirwa Avenue, Mzuzu', 3, '[\"General Service\", \"Tire Service\", \"Battery Replacement\", \"Oil Change\", \"Brake Service\"]', '[\"Breakdown Recovery\", \"Towing\"]', '[\"Japanese Cars\", \"Korean Cars\"]', '[\"Toyota\", \"Nissan\", \"Mitsubishi\", \"Suzuki\", \"Hyundai\", \"Kia\"]', 6, NULL, 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 8:00 AM - 1:00 PM, Sun: Closed', 'https://www.mzuzuautorepair.com', 'https://facebook.com/mzuzuautorepair', 'https://instagram.com/mzuzuauto', NULL, NULL, 'Reliable garage serving the northern region with honest pricing and quality work. We pride ourselves on transparent communication and fair pricing.', 0, 0, 0, 'active', '2025-12-18 19:04:30', '2025-12-29 00:15:14', NULL, NULL),
(5, 20, 'Executive Auto Care', 'Susan Kachingwe', 'info@executiveauto.mw', '+265991789123', NULL, '+265991789123', '555 Victoria Avenue, Blantyre', 1, '[\"Luxury Car Service\", \"Performance Tuning\", \"Custom Modifications\", \"Detailing\", \"Paint Protection\"]', '[\"Premium Breakdown Service\", \"Executive Recovery\"]', '[\"BMW\", \"Mercedes-Benz\", \"Audi\", \"Land Rover\"]', '[\"BMW\", \"Mercedes-Benz\", \"Audi\", \"Land Rover\", \"Porsche\"]', 10, NULL, 'Mon-Fri: 7:00 AM - 7:00 PM, Sat-Sun: 9:00 AM - 3:00 PM', 'https://www.executiveautocare.mw', 'https://facebook.com/executiveautocaremw', 'https://instagram.com/executive_autocare', 'https://twitter.com/execautocare', 'https://linkedin.com/company/executive-auto-care-malawi', 'Premium service center specializing in luxury and executive vehicles with expert technicians. We offer concierge service including vehicle pickup and delivery.', 1, 1, 1, 'active', '2025-12-18 19:04:30', '2025-12-29 00:08:54', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `guest_preferences`
--

CREATE TABLE `guest_preferences` (
  `id` int NOT NULL,
  `session_id` varchar(100) NOT NULL,
  `preferences` json DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guest_viewing_history`
--

CREATE TABLE `guest_viewing_history` (
  `id` int NOT NULL,
  `session_id` varchar(100) NOT NULL,
  `listing_id` int NOT NULL,
  `viewed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `view_count` int DEFAULT '1',
  `last_viewed` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journey_history`
--

CREATE TABLE `journey_history` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `vehicle_id` int DEFAULT NULL COMMENT 'Foreign key to user_vehicles',
  `origin_location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Origin location name',
  `origin_lat` decimal(10,8) DEFAULT NULL COMMENT 'Origin latitude',
  `origin_lng` decimal(11,8) DEFAULT NULL COMMENT 'Origin longitude',
  `destination_location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Destination location name',
  `destination_lat` decimal(10,8) DEFAULT NULL COMMENT 'Destination latitude',
  `destination_lng` decimal(11,8) DEFAULT NULL COMMENT 'Destination longitude',
  `distance_km` decimal(8,2) NOT NULL COMMENT 'Distance in kilometers',
  `duration_minutes` int DEFAULT NULL COMMENT 'Estimated duration in minutes',
  `fuel_type` enum('petrol','diesel','lpg','cng') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fuel_needed_liters` decimal(8,2) NOT NULL COMMENT 'Fuel needed in liters',
  `fuel_cost_mwk` decimal(10,2) NOT NULL COMMENT 'Total fuel cost in MWK',
  `fuel_price_per_liter` decimal(10,2) NOT NULL COMMENT 'Fuel price at time of calculation',
  `fuel_consumption_used` decimal(5,2) DEFAULT NULL COMMENT 'L/100km used for calculation',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `journey_history`
--

INSERT INTO `journey_history` (`id`, `user_id`, `vehicle_id`, `origin_location`, `origin_lat`, `origin_lng`, `destination_location`, `destination_lat`, `destination_lng`, `distance_km`, `duration_minutes`, `fuel_type`, `fuel_needed_liters`, `fuel_cost_mwk`, `fuel_price_per_liter`, `fuel_consumption_used`, `notes`, `created_at`) VALUES
(1, 1, NULL, 'Balaka, Malawi', -14.98820810, 34.95610990, 'Lilongwe, Malawi', -13.98652020, 33.76807860, 203.43, 192, 'petrol', 19.33, 67641.14, 3500.00, 9.50, NULL, '2026-01-04 13:56:59'),
(2, 36, NULL, 'Lilongwe, Malawi', -13.98652020, 33.76807860, 'Blantyre, Malawi', -15.78796040, 35.01333310, 311.16, 285, 'diesel', 33.61, 117585.63, 3499.00, 10.80, NULL, '2026-01-04 22:54:17'),
(3, 1, NULL, 'Lilongwe, Malawi', -13.98652020, 33.76807860, 'Kasungu, Malawi', -13.03465690, 33.47239610, 149.01, 135, 'petrol', 16.09, 56325.78, 3500.00, 10.80, NULL, '2026-01-05 09:57:33'),
(4, 36, NULL, 'Lilongwe, Malawi', -13.98652020, 33.76807860, 'Dedza, Malawi', -14.38170290, 34.32534720, 89.65, 90, 'petrol', 6.36, 22277.03, 3500.00, 7.10, NULL, '2026-01-07 20:52:24'),
(5, 1, NULL, 'Lilongwe, Malawi', -13.98652020, 33.76807860, 'Blantyre, Malawi', -15.78796040, 35.01333310, 311.16, 284, 'diesel', 33.61, 117585.63, 3499.00, 10.80, NULL, '2026-01-08 17:10:59'),
(6, 1, NULL, 'Blantyre, Malawi', -15.78796040, 35.01333310, 'Lilongwe, Malawi', -13.98652020, 33.76807860, 312.51, 284, 'diesel', 33.75, 118096.54, 3499.00, 10.80, NULL, '2026-01-10 15:43:22'),
(7, 1, NULL, 'Lilongwe, Malawi', -13.98652020, 33.76807860, 'Blantyre, Malawi', -15.78796040, 35.01333310, 311.16, 284, 'diesel', 33.61, 117619.24, 3500.00, 10.80, NULL, '2026-01-10 15:45:14'),
(8, 36, NULL, 'Lilongwe, Malawi', -13.98652020, 33.76807860, 'Dedza District, Malawi', -14.18952510, 34.24324170, 69.69, 90, 'diesel', 7.53, 26341.69, 3500.00, 10.80, NULL, '2026-01-10 19:31:27'),
(9, 1, NULL, 'Dedza, Malawi', -14.38170290, 34.32534720, 'Dedza Border, Malawi., Dedza, Malawi', -14.40085270, 34.32415800, 2.96, 10, 'diesel', 0.32, 1119.26, 3500.00, 10.80, NULL, '2026-01-10 23:52:54');

-- --------------------------------------------------------

--
-- Table structure for table `listing_approval_history`
--

CREATE TABLE `listing_approval_history` (
  `id` int NOT NULL,
  `listing_id` int NOT NULL,
  `admin_user_id` int NOT NULL,
  `action` enum('approved','denied','suspended','reactivated') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `listing_reports`
--

CREATE TABLE `listing_reports` (
  `id` int NOT NULL,
  `listing_id` int NOT NULL COMMENT 'ID of the reported car listing',
  `user_id` int DEFAULT NULL COMMENT 'ID of user who reported (NULL if guest)',
  `reason` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Reason category for report',
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Detailed description of the issue',
  `reporter_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Optional email of reporter',
  `reporter_ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP address of reporter',
  `status` enum('pending','reviewed','resolved','dismissed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'Status of the report',
  `admin_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Notes from admin review',
  `reviewed_by` int DEFAULT NULL COMMENT 'Admin user who reviewed',
  `reviewed_at` timestamp NULL DEFAULT NULL COMMENT 'When report was reviewed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks user reports/flags on car listings';

--
-- Dumping data for table `listing_reports`
--

INSERT INTO `listing_reports` (`id`, `listing_id`, `user_id`, `reason`, `details`, `reporter_email`, `reporter_ip`, `status`, `admin_notes`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at`) VALUES
(1, 1, 11, 'spam', 'SPAM TEST I THINK', NULL, '::1', 'reviewed', NULL, NULL, NULL, '2025-12-27 01:31:34', '2025-12-27 01:32:53');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `name`, `region`, `district`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Blantyre', 'Southern', 'Blantyre', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(2, 'Lilongwe', 'Central', 'Lilongwe', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(3, 'Mzuzu', 'Northern', 'Mzuzu', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(4, 'Zomba', 'Southern', 'Zomba', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(5, 'Kasungu', 'Central', 'Kasungu', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(6, 'Mangochi', 'Southern', 'Mangochi', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(7, 'Salima', 'Central', 'Salima', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(8, 'Balaka', 'Southern', 'Balaka', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(9, 'Karonga', 'Northern', 'Karonga', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(10, 'Dedza', 'Central', 'Dedza', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(11, 'Mchinji', 'Central', 'Mchinji', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(12, 'Ntcheu', 'Central', 'Ntcheu', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(13, 'Thyolo', 'Southern', 'Thyolo', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(14, 'Chiradzulu', 'Southern', 'Chiradzulu', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(15, 'Nsanje', 'Southern', 'Nsanje', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(16, 'Chitipa', 'Northern', 'Chitipa', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(17, 'Likoma', 'Northern', 'Likoma', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(18, 'Mzimba', 'Northern', 'Mzimba', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(19, 'Nkhata Bay', 'Northern', 'Nkhata Bay', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(20, 'Rumphi', 'Northern', 'Rumphi', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(21, 'Dowa', 'Central', 'Dowa', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(22, 'Nkhotakota', 'Central', 'Nkhotakota', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(23, 'Ntchisi', 'Central', 'Ntchisi', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(24, 'Chikwawa', 'Southern', 'Chikwawa', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(25, 'Machinga', 'Southern', 'Machinga', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(26, 'Mulanje', 'Southern', 'Mulanje', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(27, 'Mwanza', 'Southern', 'Mwanza', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(28, 'Neno', 'Southern', 'Neno', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30'),
(29, 'Phalombe', 'Southern', 'Phalombe', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `message`, `is_read`, `created_at`) VALUES
(1, 1, 12, 'Hi, I\'m interested in your 2017 Honda City Hybrid - Very Good Condition Cvt. Is it still available?', 1, '2026-01-02 01:22:19'),
(2, 1, 36, 'How much do you want for it', 1, '2026-01-02 01:22:49'),
(3, 1, 12, 'Depends', 1, '2026-01-02 01:31:42'),
(4, 1, 36, 'On what', 0, '2026-01-02 01:31:50'),
(5, 1, 12, 'EVerything', 1, '2026-01-02 01:31:59'),
(6, 1, 36, 'Where can we meet', 0, '2026-01-02 01:33:36'),
(7, 1, 12, 'LLZ in 5mins', 1, '2026-01-02 01:33:52');

-- --------------------------------------------------------

--
-- Table structure for table `saved_listings`
--

CREATE TABLE `saved_listings` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `listing_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `saved_listings`
--

INSERT INTO `saved_listings` (`id`, `user_id`, `listing_id`, `created_at`) VALUES
(1, 2, 1, '2025-12-27 21:23:44'),
(2, 2, 5, '2025-12-27 21:23:56'),
(3, 2, 3, '2025-12-27 21:32:00'),
(4, 2, 13, '2025-12-27 21:32:19'),
(5, 36, 5, '2026-01-01 23:22:53');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int NOT NULL,
  `setting_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `setting_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `site_settings`
--

CREATE TABLE `site_settings` (
  `id` int NOT NULL,
  `setting_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `setting_group` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'general' COMMENT 'Groups: general, footer, social, contact, business',
  `setting_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'string' COMMENT 'string, text, url, email, phone, boolean, json',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '1' COMMENT 'Whether setting is visible on frontend',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `site_settings`
--

INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`, `updated_by`) VALUES
(1, 'site_name', 'MotorLink Malawi', 'general', 'string', 'Website name', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(2, 'site_tagline', 'Buy & Sell Cars in Malawi - Your Trusted Automotive Marketplace', 'general', 'string', 'Website tagline', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(3, 'site_description', 'MotorLink is Malawi\'s premier online automotive marketplace connecting buyers with trusted car dealers, garages, and car hire services across all 28 districts.', 'general', 'text', 'Website description', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(4, 'site_keywords', 'cars malawi, buy car malawi, sell car malawi, car dealers malawi, garages malawi, car hire malawi', 'general', 'text', 'SEO keywords', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(5, 'contact_phone', '+265 991 234 567', 'contact', 'phone', 'Primary contact phone', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(6, 'contact_phone_secondary', NULL, 'contact', 'phone', 'Secondary contact phone', 1, '2025-12-18 19:04:30', '2025-12-18 21:58:46', NULL),
(7, 'contact_email', 'info@motorlink.mw', 'contact', 'email', 'Primary contact email', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(8, 'contact_support_email', 'support@motorlink.mw', 'contact', 'email', 'Support email', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(9, 'contact_whatsapp', '+265 991 234 567', 'contact', 'phone', 'WhatsApp number', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(10, 'business_address', NULL, 'business', 'string', 'Street address', 1, '2025-12-18 19:04:30', '2025-12-18 21:59:04', NULL),
(11, 'business_city', NULL, 'business', 'string', 'City', 1, '2025-12-18 19:04:30', '2025-12-18 22:00:03', NULL),
(12, 'business_district', NULL, 'business', 'string', 'District', 1, '2025-12-18 19:04:30', '2025-12-18 21:59:59', NULL),
(13, 'business_country', NULL, 'business', 'string', 'Country', 1, '2025-12-18 19:04:30', '2025-12-18 22:00:08', NULL),
(14, 'business_postal_code', '', 'business', 'string', 'Postal code', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(15, 'business_hours_weekday', NULL, 'business', 'string', 'Weekday hours', 1, '2025-12-18 19:04:30', '2025-12-18 21:59:22', NULL),
(16, 'business_hours_saturday', NULL, 'business', 'string', 'Saturday hours', 1, '2025-12-18 19:04:30', '2025-12-18 21:59:28', NULL),
(17, 'business_hours_sunday', NULL, 'business', 'string', 'Sunday hours', 1, '2025-12-18 19:04:30', '2025-12-18 21:59:34', NULL),
(18, 'social_facebook', 'https://facebook.com/motorlinkmalawi', 'social', 'url', 'Facebook page URL', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(19, 'social_twitter', 'https://twitter.com/motorlinkmw', 'social', 'url', 'Twitter/X URL', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(20, 'social_instagram', 'https://instagram.com/motorlinkmalawi', 'social', 'url', 'Instagram profile URL', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(21, 'social_linkedin', 'https://linkedin.com/company/motorlink-malawi', 'social', 'url', 'LinkedIn company page', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(22, 'social_whatsapp', 'https://wa.me/265991234567', 'social', 'url', 'WhatsApp business link', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(23, 'social_youtube', 'https://youtube.com/@motorlinkmalawi', 'social', 'url', 'YouTube channel', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(24, 'footer_about_text', 'MotorLink Malawi is your trusted partner for buying and selling cars in Malawi. We connect buyers with verified sellers, trusted dealers, professional garages, and reliable car hire services across all 28 districts of Malawi.', 'footer', 'text', 'About text in footer', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(25, 'footer_copyright', '© 2025 MotorLink Malawi. All rights reserved.', 'footer', 'string', 'Copyright text', 1, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(26, 'listings_per_page', '12', 'general', 'string', 'Number of listings per page', 0, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(27, 'max_images_per_listing', '10', 'general', 'string', 'Maximum images per listing', 0, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(28, 'free_listing_duration_days', '60', 'general', 'string', 'Free listing duration in days', 0, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(29, 'smtp_host', 'mail.promanaged-it.com', 'smtp', 'string', 'SMTP host', 0, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(30, 'smtp_port', '465', 'smtp', 'string', 'SMTP port', 0, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(31, 'smtp_username', '_mainaccount@promanaged-it.com', 'smtp', 'string', 'SMTP username', 0, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(32, 'smtp_password', '', 'smtp', 'string', 'SMTP password (set securely)', 0, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(33, 'smtp_from_email', 'johnpaulchirwa@promanaged-it.com', 'smtp', 'string', 'SMTP from email', 0, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(34, 'smtp_from_name', 'MotorLink Malawi', 'smtp', 'string', 'SMTP from name', 0, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(35, 'smtp_reply_to', 'johnpaulchirwa@promanaged-it.com', 'smtp', 'string', 'SMTP reply-to email', 0, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL),
(36, 'google_maps_api_key', '', 'integrations', 'string', 'Google Maps JavaScript API key loaded at runtime', 0, '2026-04-08 00:00:00', '2026-04-08 00:00:00', NULL),
(37, 'google_maps_map_id', '', 'integrations', 'string', 'Google Maps mapId for styled maps', 0, '2026-04-08 00:00:00', '2026-04-08 00:00:00', NULL),
(38, 'openai_api_key', '', 'integrations', 'string', 'OpenAI API key for server-side AI calls', 0, '2026-04-08 00:00:00', '2026-04-08 00:00:00', NULL),
(39, 'deepseek_api_key', '', 'integrations', 'string', 'DeepSeek API key for server-side AI calls', 0, '2026-04-08 00:00:00', '2026-04-08 00:00:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `user_type` enum('individual','dealer','garage','car_hire','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'individual',
  `status` enum('active','pending','suspended','banned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `email_verified` tinyint(1) DEFAULT '0',
  `phone_verified` tinyint(1) DEFAULT '0',
  `profile_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `national_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'For dealer/garage/car_hire users - their business name',
  `business_registration` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_id` int DEFAULT NULL COMMENT 'References car_dealers.id, garages.id, or car_hire_companies.id based on user_type',
  `verification_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `login_count` int DEFAULT '0',
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `auto_reply_enabled` tinyint(1) DEFAULT '0',
  `auto_reply_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `phone`, `whatsapp`, `city`, `address`, `user_type`, `status`, `email_verified`, `phone_verified`, `profile_image`, `date_of_birth`, `national_id`, `business_name`, `business_registration`, `business_id`, `verification_token`, `reset_token`, `reset_token_expires`, `created_at`, `updated_at`, `last_login`, `login_count`, `bio`, `auto_reply_enabled`, `auto_reply_message`) VALUES
(1, 'admin', 'admin@motorlink.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', '+265991000000', '+265991000000', 'Lilongwe', 'MotorLink HQ, Area 47', 'admin', 'active', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(2, 'john_banda', 'john.banda@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Banda', '+265991234567', '+265991234567', 'Blantyre', '123 Glyn Jones Road', 'individual', 'active', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(3, 'mary_tembo', 'mary.tembo@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mary Tembo', '+265881234567', '+265881234567', 'Lilongwe', '456 Kamuzu Procession Road', 'individual', 'active', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(4, 'peter_mwale', 'peter.mwale@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Peter Mwale', '+265991345678', '+265991345678', 'Mzuzu', '789 Orton Chirwa Avenue', 'individual', 'active', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(5, 'grace_phiri', 'grace.phiri@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Grace Phiri', '+265881345678', '+265881345678', 'Zomba', '321 Chipembere Highway', 'individual', 'active', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(6, 'james_chirwa', 'james.chirwa@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'James Chirwa', '+265991456789', '+265991456789', 'Kasungu', '555 Main Street', 'individual', 'active', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(7, 'susan_kachingwe', 'susan.k@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Susan Kachingwe', '+265881456789', '+265881456789', 'Mangochi', '111 Lakeshore Drive', 'individual', 'active', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(8, 'david_banda', 'david.banda@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David Banda', '+265991567890', '+265991567890', 'Salima', '222 Beach Road', 'individual', 'active', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(9, 'patricia_mkandawire', 'patricia.m@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Patricia Mkandawire', '+265881567890', '+265881567890', 'Blantyre', '333 Victoria Avenue', 'individual', 'active', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(10, 'robert_kamwendo', 'robert.k@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Robert Kamwendo', '+265991678901', '+265991678901', 'Lilongwe', '444 City Centre', 'individual', 'active', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(11, 'premium_auto', 'info@premiumauto.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Peter Mwale', '+265991234567', '+265991234567', 'Lilongwe', '789 Kamuzu Procession Road', 'dealer', 'active', 1, 1, NULL, NULL, NULL, 'Premium Auto Malawi', NULL, 1, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(12, 'southern_motors', 'info@southernmotors.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Grace Tembo', '+265881234567', '+265881234567', 'Blantyre', '321 Victoria Avenue', 'dealer', 'active', 1, 1, NULL, NULL, NULL, 'Southern Motors Ltd', NULL, 2, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(13, 'capital_cars', 'info@capitalcars.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael Phiri', '+265991345678', '+265991345678', 'Lilongwe', '123 City Centre', 'dealer', 'active', 1, 1, NULL, NULL, NULL, 'Capital Car Center', NULL, 3, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(14, 'northern_auto', 'info@northernauto.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Patricia Banda', '+265881345678', '+265881345678', 'Mzuzu', '456 Independence Drive', 'dealer', 'active', 1, 1, NULL, NULL, NULL, 'Northern Auto Sales', NULL, 4, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(15, 'elite_motors', 'info@elitemotors.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'James Chirwa', '+265991456789', '+265991456789', 'Blantyre', '789 Glyn Jones Road', 'dealer', 'active', 1, 1, NULL, NULL, NULL, 'Blantyre Elite Motors', NULL, 5, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(16, 'autocare_malawi', 'info@autocare.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Banda', '+265991234567', '+265991234567', 'Blantyre', '123 Industrial Area', 'garage', 'active', 1, 1, NULL, NULL, NULL, 'AutoCare Malawi', NULL, 1, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(17, 'quality_motors', 'info@qualitymotors.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mary Phiri', '+265881234567', '+265881234567', 'Lilongwe', '456 Area 47', 'garage', 'active', 1, 1, NULL, NULL, NULL, 'Quality Motors Workshop', NULL, 2, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(18, 'precision_auto', 'info@precision.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David Chirwa', '+265991567890', '+265991567890', 'Lilongwe', '789 Kamuzu Procession Road', 'garage', 'active', 1, 1, NULL, NULL, NULL, 'Precision Auto Services', NULL, 3, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(19, 'mzuzu_auto', 'info@mzuzuauto.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'James Tembo', '+265881567890', '+265881567890', 'Mzuzu', '321 Orton Chirwa Avenue', 'garage', 'active', 1, 1, NULL, NULL, NULL, 'Mzuzu Auto Repair', NULL, 4, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(20, 'executive_auto', 'info@executiveauto.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Susan Kachingwe', '+265991789123', '+265991789123', 'Blantyre', '555 Victoria Avenue', 'garage', 'active', 1, 1, NULL, NULL, NULL, 'Executive Auto Care', NULL, 5, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(21, 'premier_rentals', 'info@premierrentals.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David Chirwa', '+265991234567', '+265991234567', 'Lilongwe', '555 City Centre', 'car_hire', 'active', 1, 1, NULL, NULL, NULL, 'Malawi Premier Car Rentals', NULL, 1, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(22, 'blantyre_rentals', 'info@blantyrerentals.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Susan Kachingwe', '+265881234567', '+265881234567', 'Blantyre', '777 Glyn Jones Road', 'car_hire', 'active', 1, 1, NULL, NULL, NULL, 'Blantyre Rent-a-Car', NULL, 2, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(23, 'capital_rentals', 'info@capitalrentals.mw', '$2y$10$rdrxj8AlNULriO72o7NUNusbQDrnjHMH8Ducifruhv/.D/KGr.wJa', 'Andrew Mwale', '+265991345678', '+265991345678', 'Lilongwe', '123 Area 47', 'car_hire', 'active', 1, 1, NULL, NULL, NULL, 'Capital Auto Rentals', NULL, 3, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-29 00:34:57', NULL, 0, NULL, 0, NULL),
(24, 'northern_hire', 'info@northernhire.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jennifer Banda', '+265881345678', '+265881345678', 'Mzuzu', '456 Orton Chirwa Avenue', 'car_hire', 'active', 1, 1, NULL, NULL, NULL, 'Northern Car Hire', NULL, 4, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(25, 'executive_rentals', 'info@executiverentals.mw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charles Tembo', '+265991456789', '+265991456789', 'Blantyre', '888 Independence Drive', 'car_hire', 'active', 1, 1, NULL, NULL, NULL, 'Executive Rentals Malawi', NULL, 5, NULL, NULL, NULL, '2025-12-18 19:04:30', '2025-12-18 19:04:30', NULL, 0, NULL, 0, NULL),
(36, 'johnpaulchirwa', 'johnpaulchirwa@gmail.com', '$2y$12$VV0BnybbGa9SyMDDL7fdfuze2iZ28faPttpsChGfmqbqXrFMNLQ0e', 'JOHN-PAUL CHIRWA', '+353860081635', NULL, 'Mzuzu', NULL, 'individual', 'active', 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-31 03:26:51', '2026-01-01 23:58:44', NULL, 0, NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_business_view`
-- (See below for the actual view)
--
CREATE TABLE `user_business_view` (
`user_id` int
,`username` varchar(50)
,`email` varchar(100)
,`full_name` varchar(100)
,`phone` varchar(20)
,`whatsapp` varchar(20)
,`user_type` enum('individual','dealer','garage','car_hire','admin')
,`business_name` varchar(100)
,`business_id` int
,`user_status` enum('active','pending','suspended','banned')
,`display_business_name` varchar(200)
,`business_entity_id` bigint
,`dealer_owner_name` varchar(100)
,`dealer_verified` tinyint(1)
,`garage_owner_name` varchar(100)
,`garage_services` json
,`car_hire_owner_name` varchar(100)
,`car_hire_total_vehicles` int
);

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `preferences` json DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_vehicles`
--

CREATE TABLE `user_vehicles` (
  `id` int NOT NULL,
  `user_id` int NOT NULL COMMENT 'Foreign key to users table',
  `vin` varchar(17) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'VIN number if decoded (optional, only for existing vehicles)',
  `make` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Vehicle make/brand',
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Vehicle model',
  `year` int NOT NULL COMMENT 'Manufacturing year',
  `fuel_type` enum('petrol','diesel','electric','hybrid','lpg','cng') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'petrol' COMMENT 'AI populated from global dataset',
  `engine_size_liters` decimal(4,2) DEFAULT NULL COMMENT 'Engine displacement in liters (e.g., 1.6, 2.0) - AI populated from global dataset',
  `engine_size_cc` int DEFAULT NULL COMMENT 'Engine displacement in cubic centimeters - AI populated',
  `transmission` enum('manual','automatic','cvt','semi-automatic') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'AI populated from global dataset',
  `body_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'sedan, suv, hatchback, etc.',
  `fuel_consumption_liters_per_100km` decimal(5,2) NOT NULL COMMENT 'Average fuel consumption (L/100km) - AI populated from global dataset',
  `fuel_tank_capacity_liters` decimal(5,2) NOT NULL COMMENT 'Fuel tank capacity - AI populated from global dataset',
  `is_primary` tinyint(1) DEFAULT '0' COMMENT 'Primary/default vehicle for user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_vehicles`
--

INSERT INTO `user_vehicles` (`id`, `user_id`, `vin`, `make`, `model`, `year`, `fuel_type`, `engine_size_liters`, `engine_size_cc`, `transmission`, `body_type`, `fuel_consumption_liters_per_100km`, `fuel_tank_capacity_liters`, `is_primary`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'Toyota', 'Fortuner', 2020, 'diesel', 2.80, NULL, 'automatic', 'suv', 10.80, 80.00, 0, '2026-01-04 21:33:51', '2026-01-04 21:33:51'),
(2, 36, NULL, 'Toyota', 'Fortuner', 2020, 'diesel', 2.80, NULL, 'automatic', 'suv', 10.80, 80.00, 1, '2026-01-04 22:53:51', '2026-01-04 22:53:51'),
(3, 36, NULL, 'Toyota', 'Corolla', 2020, 'petrol', 1.80, NULL, 'cvt', 'sedan', 7.10, 50.00, 0, '2026-01-07 20:52:12', '2026-01-07 20:52:12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_id` (`admin_id`),
  ADD KEY `idx_action_type` (`action_type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `ai_chat_settings`
--
ALTER TABLE `ai_chat_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ai_chat_usage`
--
ALTER TABLE `ai_chat_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_date` (`user_id`,`created_at`);

--
-- Indexes for table `ai_chat_user_restrictions`
--
ALTER TABLE `ai_chat_user_restrictions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_disabled` (`disabled`),
  ADD KEY `idx_user_disabled` (`user_id`,`disabled`);

--
-- Indexes for table `ai_learning_status`
--
ALTER TABLE `ai_learning_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `learning_date` (`learning_date`),
  ADD KEY `learning_date_2` (`learning_date`);

--
-- Indexes for table `ai_parts_cache`
--
ALTER TABLE `ai_parts_cache`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_make_model` (`make_name`,`model_name`),
  ADD KEY `idx_part_name` (`part_name`),
  ADD KEY `idx_part_number` (`part_number`),
  ADD KEY `idx_oem_number` (`oem_number`),
  ADD KEY `idx_query_hash` (`query_hash`),
  ADD KEY `idx_last_used` (`last_used_at`);

--
-- Indexes for table `ai_web_cache`
--
ALTER TABLE `ai_web_cache`
  ADD PRIMARY KEY (`id`),
  ADD KEY `query_hash` (`query_hash`),
  ADD KEY `last_used_at` (`last_used_at`),
  ADD KEY `last_used_at_2` (`last_used_at`),
  ADD KEY `last_used_at_3` (`last_used_at`),
  ADD KEY `last_used_at_4` (`last_used_at`),
  ADD KEY `last_used_at_5` (`last_used_at`),
  ADD KEY `last_used_at_6` (`last_used_at`),
  ADD KEY `last_used_at_7` (`last_used_at`),
  ADD KEY `last_used_at_8` (`last_used_at`),
  ADD KEY `last_used_at_9` (`last_used_at`),
  ADD KEY `last_used_at_10` (`last_used_at`),
  ADD KEY `last_used_at_11` (`last_used_at`),
  ADD KEY `last_used_at_12` (`last_used_at`),
  ADD KEY `last_used_at_13` (`last_used_at`),
  ADD KEY `last_used_at_14` (`last_used_at`),
  ADD KEY `last_used_at_15` (`last_used_at`),
  ADD KEY `idx_last_used` (`last_used_at`);

--
-- Indexes for table `car_dealers`
--
ALTER TABLE `car_dealers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_verified` (`verified`),
  ADD KEY `idx_certified` (`certified`),
  ADD KEY `idx_location` (`location_id`),
  ADD KEY `idx_featured` (`featured`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `car_hire_companies`
--
ALTER TABLE `car_hire_companies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_verified` (`verified`),
  ADD KEY `idx_certified` (`certified`),
  ADD KEY `idx_featured` (`featured`),
  ADD KEY `idx_location` (`location_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `car_hire_fleet`
--
ALTER TABLE `car_hire_fleet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `make_id` (`make_id`),
  ADD KEY `model_id` (`model_id`),
  ADD KEY `is_available` (`is_available`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_registration` (`registration_number`),
  ADD KEY `idx_company_name` (`company_name`),
  ADD KEY `idx_make_name` (`make_name`),
  ADD KEY `idx_model_name` (`model_name`),
  ADD KEY `idx_company_location` (`company_location_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `car_listings`
--
ALTER TABLE `car_listings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference_number` (`reference_number`),
  ADD KEY `model_id` (`model_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_listing_type` (`listing_type`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_price` (`price`),
  ADD KEY `idx_year` (`year`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_make_model` (`make_id`,`model_id`),
  ADD KEY `idx_location` (`location_id`),
  ADD KEY `idx_featured` (`listing_type`,`featured_until`),
  ADD KEY `idx_is_guest` (`is_guest`),
  ADD KEY `fk_listings_dealer` (`dealer_id`),
  ADD KEY `fk_car_listings_featured_image` (`featured_image_id`),
  ADD KEY `idx_report_count` (`report_count`);
ALTER TABLE `car_listings` ADD FULLTEXT KEY `idx_search_content` (`title`,`description`);

--
-- Indexes for table `car_listing_images`
--
ALTER TABLE `car_listing_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_listing_id` (`listing_id`),
  ADD KEY `idx_primary` (`is_primary`),
  ADD KEY `idx_sort` (`sort_order`);

--
-- Indexes for table `car_makes`
--
ALTER TABLE `car_makes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_sort` (`sort_order`);

--
-- Indexes for table `car_models`
--
ALTER TABLE `car_models`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_make_id` (`make_id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_body_type` (`body_type`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_make_active` (`make_id`,`is_active`),
  ADD KEY `idx_year_range` (`year_start`,`year_end`),
  ADD KEY `idx_fuel_type` (`fuel_type`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `buyer_id` (`buyer_id`),
  ADD KEY `seller_id` (`seller_id`),
  ADD KEY `conversations_ibfk_1` (`listing_id`);

--
-- Indexes for table `fuel_prices`
--
ALTER TABLE `fuel_prices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_fuel_date` (`fuel_type`,`date`),
  ADD KEY `idx_fuel_type` (`fuel_type`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `garages`
--
ALTER TABLE `garages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_verified` (`verified`),
  ADD KEY `idx_location` (`location_id`),
  ADD KEY `idx_featured` (`featured`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `guest_preferences`
--
ALTER TABLE `guest_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_id` (`session_id`);

--
-- Indexes for table `guest_viewing_history`
--
ALTER TABLE `guest_viewing_history`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_session_listing` (`session_id`,`listing_id`),
  ADD KEY `idx_session` (`session_id`),
  ADD KEY `idx_listing` (`listing_id`);

--
-- Indexes for table `journey_history`
--
ALTER TABLE `journey_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_vehicle_id` (`vehicle_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `listing_approval_history`
--
ALTER TABLE `listing_approval_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_listing_id` (`listing_id`),
  ADD KEY `idx_admin_user_id` (`admin_user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `listing_reports`
--
ALTER TABLE `listing_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_listing_id` (`listing_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_region` (`region`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversation_id` (`conversation_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `saved_listings`
--
ALTER TABLE `saved_listings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_save` (`user_id`,`listing_id`),
  ADD KEY `saved_listings_ibfk_2` (`listing_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_key` (`setting_key`);

--
-- Indexes for table `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_key` (`setting_key`),
  ADD KEY `idx_group` (`setting_group`),
  ADD KEY `idx_public` (`is_public`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_business_id` (`business_id`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `user_vehicles`
--
ALTER TABLE `user_vehicles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_vin` (`vin`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `ai_chat_usage`
--
ALTER TABLE `ai_chat_usage`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT for table `ai_chat_user_restrictions`
--
ALTER TABLE `ai_chat_user_restrictions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ai_learning_status`
--
ALTER TABLE `ai_learning_status`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `ai_parts_cache`
--
ALTER TABLE `ai_parts_cache`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ai_web_cache`
--
ALTER TABLE `ai_web_cache`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `car_dealers`
--
ALTER TABLE `car_dealers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `car_hire_companies`
--
ALTER TABLE `car_hire_companies`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `car_hire_fleet`
--
ALTER TABLE `car_hire_fleet`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `car_listings`
--
ALTER TABLE `car_listings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `car_listing_images`
--
ALTER TABLE `car_listing_images`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `car_makes`
--
ALTER TABLE `car_makes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `car_models`
--
ALTER TABLE `car_models`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=334;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `fuel_prices`
--
ALTER TABLE `fuel_prices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `garages`
--
ALTER TABLE `garages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `guest_preferences`
--
ALTER TABLE `guest_preferences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guest_viewing_history`
--
ALTER TABLE `guest_viewing_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `journey_history`
--
ALTER TABLE `journey_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `listing_approval_history`
--
ALTER TABLE `listing_approval_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `listing_reports`
--
ALTER TABLE `listing_reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `saved_listings`
--
ALTER TABLE `saved_listings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `site_settings`
--
ALTER TABLE `site_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_vehicles`
--
ALTER TABLE `user_vehicles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

-- --------------------------------------------------------

--
-- Structure for view `car_hire_fleet_details`
--
DROP TABLE IF EXISTS `car_hire_fleet_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`p601229`@`localhost` SQL SECURITY DEFINER VIEW `car_hire_fleet_details`  AS SELECT `chf`.`id` AS `id`, `chf`.`company_id` AS `company_id`, `chf`.`company_name` AS `company_name`, `chf`.`company_phone` AS `company_phone`, `chf`.`company_email` AS `company_email`, `chf`.`company_location_id` AS `company_location_id`, `chf`.`make_id` AS `make_id`, `chf`.`model_id` AS `model_id`, `chf`.`make_name` AS `make_name`, `chf`.`model_name` AS `model_name`, `chf`.`year` AS `year`, `chf`.`vehicle_name` AS `vehicle_name`, `chf`.`registration_number` AS `registration_number`, `chf`.`image` AS `image`, `chf`.`transmission` AS `transmission`, `chf`.`fuel_type` AS `fuel_type`, `chf`.`seats` AS `seats`, `chf`.`features` AS `features`, `chf`.`daily_rate` AS `daily_rate`, `chf`.`weekly_rate` AS `weekly_rate`, `chf`.`monthly_rate` AS `monthly_rate`, `chf`.`is_available` AS `is_available`, `chf`.`is_active` AS `is_active`, `chf`.`created_at` AS `created_at`, `chf`.`updated_at` AS `updated_at`, `chc`.`business_name` AS `business_name`, `chc`.`owner_name` AS `owner_name`, `chc`.`phone` AS `company_contact_phone`, `chc`.`whatsapp` AS `company_whatsapp`, `chc`.`address` AS `company_address`, `loc`.`name` AS `location_name`, `loc`.`region` AS `location_region`, `cm`.`country` AS `make_country`, `cmo`.`body_type` AS `body_type` FROM ((((`car_hire_fleet` `chf` join `car_hire_companies` `chc` on((`chf`.`company_id` = `chc`.`id`))) join `locations` `loc` on((`chc`.`location_id` = `loc`.`id`))) join `car_makes` `cm` on((`chf`.`make_id` = `cm`.`id`))) join `car_models` `cmo` on((`chf`.`model_id` = `cmo`.`id`))) ;

-- --------------------------------------------------------

--
-- Structure for view `company_fleet_summary`
--
DROP TABLE IF EXISTS `company_fleet_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`p601229`@`localhost` SQL SECURITY DEFINER VIEW `company_fleet_summary`  AS SELECT `chc`.`id` AS `id`, `chc`.`business_name` AS `business_name`, `chc`.`phone` AS `phone`, `chc`.`email` AS `email`, `chc`.`location_id` AS `location_id`, `loc`.`name` AS `location_name`, `chc`.`total_vehicles` AS `total_vehicles`, `chc`.`available_vehicles` AS `available_vehicles`, `chc`.`daily_rate_from` AS `daily_rate_from`, `chc`.`weekly_rate_from` AS `weekly_rate_from`, `chc`.`monthly_rate_from` AS `monthly_rate_from`, `chc`.`verified` AS `verified`, `chc`.`featured` AS `featured`, group_concat(distinct `cm`.`name` separator ',') AS `fleet_makes`, count(`chf`.`id`) AS `actual_fleet_count`, min(`chf`.`daily_rate`) AS `min_daily_rate`, max(`chf`.`daily_rate`) AS `max_daily_rate` FROM (((`car_hire_companies` `chc` join `locations` `loc` on((`chc`.`location_id` = `loc`.`id`))) left join `car_hire_fleet` `chf` on(((`chc`.`id` = `chf`.`company_id`) and (`chf`.`is_active` = 1)))) left join `car_makes` `cm` on((`chf`.`make_id` = `cm`.`id`))) GROUP BY `chc`.`id`, `chc`.`business_name`, `chc`.`phone`, `chc`.`email`, `chc`.`location_id`, `loc`.`name`, `chc`.`total_vehicles`, `chc`.`available_vehicles`, `chc`.`daily_rate_from`, `chc`.`weekly_rate_from`, `chc`.`monthly_rate_from`, `chc`.`verified`, `chc`.`featured` ;

-- --------------------------------------------------------

--
-- Structure for view `user_business_view`
--
DROP TABLE IF EXISTS `user_business_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`p601229`@`localhost` SQL SECURITY DEFINER VIEW `user_business_view`  AS SELECT `u`.`id` AS `user_id`, `u`.`username` AS `username`, `u`.`email` AS `email`, `u`.`full_name` AS `full_name`, `u`.`phone` AS `phone`, `u`.`whatsapp` AS `whatsapp`, `u`.`user_type` AS `user_type`, `u`.`business_name` AS `business_name`, `u`.`business_id` AS `business_id`, `u`.`status` AS `user_status`, (case when (`u`.`user_type` = 'dealer') then `d`.`business_name` when (`u`.`user_type` = 'garage') then `g`.`name` when (`u`.`user_type` = 'car_hire') then `c`.`business_name` else `u`.`business_name` end) AS `display_business_name`, (case when (`u`.`user_type` = 'dealer') then `d`.`id` when (`u`.`user_type` = 'garage') then `g`.`id` when (`u`.`user_type` = 'car_hire') then `c`.`id` else NULL end) AS `business_entity_id`, `d`.`owner_name` AS `dealer_owner_name`, `d`.`verified` AS `dealer_verified`, `g`.`owner_name` AS `garage_owner_name`, `g`.`services` AS `garage_services`, `c`.`owner_name` AS `car_hire_owner_name`, `c`.`total_vehicles` AS `car_hire_total_vehicles` FROM (((`users` `u` left join `car_dealers` `d` on(((`u`.`user_type` = 'dealer') and (`u`.`business_id` = `d`.`id`)))) left join `garages` `g` on(((`u`.`user_type` = 'garage') and (`u`.`business_id` = `g`.`id`)))) left join `car_hire_companies` `c` on(((`u`.`user_type` = 'car_hire') and (`u`.`business_id` = `c`.`id`)))) ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `car_dealers`
--
ALTER TABLE `car_dealers`
  ADD CONSTRAINT `car_dealers_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `car_dealers_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `car_dealers_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `car_hire_companies`
--
ALTER TABLE `car_hire_companies`
  ADD CONSTRAINT `car_hire_companies_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `car_hire_companies_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `car_hire_companies_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `car_hire_fleet`
--
ALTER TABLE `car_hire_fleet`
  ADD CONSTRAINT `car_hire_fleet_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `car_hire_companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `car_hire_fleet_ibfk_2` FOREIGN KEY (`make_id`) REFERENCES `car_makes` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `car_hire_fleet_ibfk_3` FOREIGN KEY (`model_id`) REFERENCES `car_models` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `car_listings`
--
ALTER TABLE `car_listings`
  ADD CONSTRAINT `car_listings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `car_listings_ibfk_2` FOREIGN KEY (`make_id`) REFERENCES `car_makes` (`id`),
  ADD CONSTRAINT `car_listings_ibfk_3` FOREIGN KEY (`model_id`) REFERENCES `car_models` (`id`),
  ADD CONSTRAINT `car_listings_ibfk_4` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `car_listings_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_car_listings_featured_image` FOREIGN KEY (`featured_image_id`) REFERENCES `car_listing_images` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_listings_dealer` FOREIGN KEY (`dealer_id`) REFERENCES `car_dealers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `car_listing_images`
--
ALTER TABLE `car_listing_images`
  ADD CONSTRAINT `car_listing_images_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `car_listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `car_models`
--
ALTER TABLE `car_models`
  ADD CONSTRAINT `car_models_ibfk_1` FOREIGN KEY (`make_id`) REFERENCES `car_makes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `car_listings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `garages`
--
ALTER TABLE `garages`
  ADD CONSTRAINT `garages_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `garages_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `garages_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `journey_history`
--
ALTER TABLE `journey_history`
  ADD CONSTRAINT `fk_journey_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_journey_history_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `user_vehicles` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `listing_approval_history`
--
ALTER TABLE `listing_approval_history`
  ADD CONSTRAINT `listing_approval_history_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `car_listings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `listing_approval_history_ibfk_2` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `saved_listings`
--
ALTER TABLE `saved_listings`
  ADD CONSTRAINT `saved_listings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saved_listings_ibfk_2` FOREIGN KEY (`listing_id`) REFERENCES `car_listings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_vehicles`
--
ALTER TABLE `user_vehicles`
  ADD CONSTRAINT `fk_user_vehicles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
