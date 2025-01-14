-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- 생성 시간: 24-12-30 14:40
-- 서버 버전: 10.4.27-MariaDB
-- PHP 버전: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 데이터베이스: `stipvelation`
--

-- --------------------------------------------------------

--
-- 테이블 구조 `contact_form`
--

CREATE TABLE `contact_form` (
  `id` int(11) NOT NULL,
  `country_code` varchar(2) NOT NULL DEFAULT '' COMMENT '국가 코드',
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `product_code` varchar(10) NOT NULL DEFAULT '' COMMENT '상품 코드',
  `product_name` varchar(100) NOT NULL DEFAULT '' COMMENT '상품명',
  `submit_date` datetime NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 테이블의 덤프 데이터 `contact_form`
--

INSERT INTO `contact_form` (`id`, `country_code`, `name`, `email`, `mobile`, `product_code`, `product_name`, `submit_date`, `ip_address`, `status`, `created_at`, `updated_at`, `file_name`, `file_path`, `file_size`, `file_type`) VALUES
(1, 'KR', '이동현', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-15 09:58:03', '::1', 'pending', '2024-12-15 08:58:03', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(2, 'KR', '이동현', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-15 10:15:00', '::1', 'pending', '2024-12-15 09:15:00', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(3, 'KR', '이동현', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-15 10:15:00', '::1', 'pending', '2024-12-15 09:15:00', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(4, 'KR', '이동현', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-15 10:37:03', '::1', 'pending', '2024-12-15 09:37:03', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(5, 'KR', 'dlehdgus', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-15 10:44:53', '::1', 'pending', '2024-12-15 09:44:53', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(6, 'KR', 'dlehdgus', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-15 10:44:53', '::1', 'pending', '2024-12-15 09:44:53', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(7, 'KR', 'dlehdgus', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-15 10:52:04', '::1', 'pending', '2024-12-15 09:52:04', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(8, 'KR', 'dlehdgus', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-15 10:52:04', '::1', 'pending', '2024-12-15 09:52:04', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(9, 'KR', 'dlehdgus', 'ymhpro@naver.com', '010', '0001', '특허뉴스PDF', '2024-12-15 10:54:54', '::1', 'pending', '2024-12-15 09:54:54', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(10, 'KR', 'dlehdgus', 'ymhpro@naver.com', '010', '0001', '특허뉴스PDF', '2024-12-15 10:54:54', '::1', 'pending', '2024-12-15 09:54:54', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(11, 'KR', 'dlehdgus', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 03:57:25', '::1', 'pending', '2024-12-16 02:57:25', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(12, 'KR', 'dlehdgus', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 03:57:25', '::1', 'pending', '2024-12-16 02:57:25', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(13, 'KR', '이동현', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 05:12:03', '::1', 'pending', '2024-12-16 04:12:03', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(14, 'KR', '이동현', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 05:12:03', '::1', 'pending', '2024-12-16 04:12:03', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(15, 'KR', '이동현', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 05:15:52', '::1', 'pending', '2024-12-16 04:15:52', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(16, 'KR', '이동현', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 05:15:52', '::1', 'pending', '2024-12-16 04:15:52', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(17, 'KR', '이동현', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 05:16:41', '::1', 'pending', '2024-12-16 04:16:41', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(18, 'KR', '이동현', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 05:16:41', '::1', 'pending', '2024-12-16 04:16:41', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(19, 'KR', '이동현', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 10:13:51', '::1', 'pending', '2024-12-16 09:13:51', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(20, 'KR', 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 11:13:13', '::1', 'pending', '2024-12-16 10:13:13', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(21, 'KR', 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 11:13:13', '::1', 'pending', '2024-12-16 10:13:13', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(22, 'KR', 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 11:32:51', '::1', 'pending', '2024-12-16 10:32:51', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(23, 'KR', 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 11:32:51', '::1', 'pending', '2024-12-16 10:32:51', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(24, 'KR', 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-16 11:48:45', '::1', 'pending', '2024-12-16 10:48:45', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(25, 'KR', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-17 05:46:52', '::1', 'pending', '2024-12-17 04:46:52', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(26, 'KR', 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-17 05:57:21', '::1', 'pending', '2024-12-17 04:57:21', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(27, 'KR', 'lee dddd.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-17 06:07:07', '::1', 'pending', '2024-12-17 05:07:07', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(28, 'KR', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-17 06:10:04', '::1', 'pending', '2024-12-17 05:10:04', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(29, 'KR', 'lee d.h', 'ymhproenator@gmail.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-17 06:32:53', '::1', 'pending', '2024-12-17 05:32:53', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(30, 'KR', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-18 07:51:13', '::1', 'pending', '2024-12-18 06:51:13', '2024-12-25 03:04:23', NULL, NULL, NULL, NULL),
(31, 'KR', '이동현', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-25 07:52:32', '::1', 'pending', '2024-12-25 06:52:32', '2024-12-25 06:52:32', NULL, NULL, NULL, NULL),
(32, 'KR', 'lee d h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 06:29:20', '::1', 'pending', '2024-12-26 05:29:20', '2024-12-26 05:29:20', NULL, NULL, NULL, NULL),
(33, 'KR', 'lee d h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 06:29:40', '::1', 'pending', '2024-12-26 05:29:40', '2024-12-26 05:29:40', NULL, NULL, NULL, NULL),
(34, 'NL', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 06:48:17', '::1', 'pending', '2024-12-26 05:48:17', '2024-12-26 05:48:17', NULL, NULL, NULL, NULL),
(35, 'NL', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 06:48:25', '::1', 'pending', '2024-12-26 05:48:25', '2024-12-26 05:48:25', NULL, NULL, NULL, NULL),
(36, 'AR', 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 06:56:40', '::1', 'pending', '2024-12-26 05:56:40', '2024-12-26 05:56:40', NULL, NULL, NULL, NULL),
(37, 'FR', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 07:02:56', '::1', 'pending', '2024-12-26 06:02:56', '2024-12-26 06:02:56', NULL, NULL, NULL, NULL),
(38, 'GR', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 07:14:00', '::1', 'pending', '2024-12-26 06:14:00', '2024-12-26 06:14:00', NULL, NULL, NULL, NULL),
(39, 'BE', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 07:18:09', '::1', 'pending', '2024-12-26 06:18:09', '2024-12-26 06:18:09', NULL, NULL, NULL, NULL),
(40, 'AU', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 07:19:02', '::1', 'pending', '2024-12-26 06:19:02', '2024-12-26 06:19:02', NULL, NULL, NULL, NULL),
(41, 'AR', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 07:25:44', '::1', 'pending', '2024-12-26 06:25:44', '2024-12-26 06:25:44', NULL, NULL, NULL, NULL),
(42, 'AU', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 07:31:25', '::1', 'pending', '2024-12-26 06:31:25', '2024-12-26 06:31:25', NULL, NULL, NULL, NULL),
(43, 'AR', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 07:38:29', '::1', 'pending', '2024-12-26 06:38:29', '2024-12-26 06:38:29', NULL, NULL, NULL, NULL),
(44, 'AR', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 07:41:52', '::1', 'pending', '2024-12-26 06:41:52', '2024-12-26 06:41:52', NULL, NULL, NULL, NULL),
(45, 'IL', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 07:48:49', '::1', 'pending', '2024-12-26 06:48:49', '2024-12-26 06:48:49', NULL, NULL, NULL, NULL),
(46, 'AU', 'lee d.h', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-26 07:54:21', '::1', 'pending', '2024-12-26 06:54:21', '2024-12-26 06:54:21', NULL, NULL, NULL, NULL),
(47, 'KR', 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-27 06:52:05', '::1', 'pending', '2024-12-27 05:52:05', '2024-12-27 05:52:05', '사업설명20240902.docx', 'uploads/2024/12/27file_676e4085d6822_____________20240902.docx', 471564, '0'),
(48, 'US', 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', '0001', '특허뉴스PDF', '2024-12-27 06:55:32', '::1', 'pending', '2024-12-27 05:55:32', '2024-12-27 05:55:32', '사업설명20240902.docx', 'uploads/2024/12/27/file_676e415445d90_____________20240902.docx', 471564, '0');

--
-- 덤프된 테이블의 인덱스
--

--
-- 테이블의 인덱스 `contact_form`
--
ALTER TABLE `contact_form`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`);

--
-- 덤프된 테이블의 AUTO_INCREMENT
--

--
-- 테이블의 AUTO_INCREMENT `contact_form`
--
ALTER TABLE `contact_form`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
