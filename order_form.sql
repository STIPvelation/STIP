-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- 생성 시간: 25-01-14 17:56
-- 서버 버전: 10.1.13-MariaDB
-- PHP 버전: 7.4.5p1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 데이터베이스: `sharetheipp`
--

-- --------------------------------------------------------

--
-- 테이블 구조 `order_form`
--

CREATE TABLE `order_form` (
  `id` int(11) NOT NULL,
  `order_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '주문번호',
  `contact_form_id` int(11) DEFAULT NULL COMMENT 'contact_form 테이블 참조 ID',
  `order_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '주문자명',
  `order_email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '주문자 이메일',
  `order_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '주문자 연락처',
  `order_memo` text COLLATE utf8mb4_unicode_ci COMMENT '주문 메모',
  `product_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '상품 코드',
  `product_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '상품명',
  `quantity` int(11) NOT NULL DEFAULT '1' COMMENT '수량',
  `price` decimal(10,2) NOT NULL COMMENT '가격',
  `payment_method` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '결제 수단',
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '결제 거래 ID',
  `payment_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '결제 상태(pending, completed, failed, cancelled)',
  `paid_amount` decimal(10,2) DEFAULT NULL COMMENT '실제 결제 금액',
  `payment_response_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '결제 응답 코드',
  `payment_response_message` text COLLATE utf8mb4_unicode_ci COMMENT '결제 응답 메시지',
  `privacy_consent` char(1) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Y' COMMENT '개인정보 수집 동의(Y/N)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  `paid_at` timestamp NULL DEFAULT NULL COMMENT '결제 완료 시간'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='주문 정보 테이블';

--
-- 테이블의 덤프 데이터 `order_form`
--

INSERT INTO `order_form` (`id`, `order_id`, `contact_form_id`, `order_name`, `order_email`, `order_phone`, `order_memo`, `product_code`, `product_name`, `quantity`, `price`, `payment_method`, `transaction_id`, `payment_status`, `paid_amount`, `payment_response_code`, `payment_response_message`, `privacy_consent`, `created_at`, `updated_at`, `paid_at`) VALUES
(1, 'G202412310148476696', NULL, 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', 'test', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2024-12-30 16:48:47', '2024-12-30 16:48:47', NULL),
(2, 'G202412310444121788', NULL, 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', 'test', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2024-12-30 19:44:12', '2024-12-30 19:44:12', NULL),
(3, 'G202412310928126399', NULL, 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', 'test', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2024-12-31 00:28:12', '2024-12-31 00:28:12', NULL),
(4, 'G202412311031135767', NULL, '나이스', 'skdltm@naver.com', '01026481482', '', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2024-12-31 01:31:13', '2024-12-31 01:31:13', NULL),
(5, 'G202412311043376988', NULL, '나이스', 'skdltm@naver.com', '01026481482', '', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2024-12-31 01:43:37', '2024-12-31 01:43:37', NULL),
(6, 'G202412312123536095', NULL, 'Lee dong hyeon', 'ymhpro@naver.com', '01095938514', 'Thank you.', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2024-12-31 12:23:53', '2024-12-31 12:23:53', NULL),
(7, 'G202501020959154878', NULL, 'sd', 'jhdoup@gmail.com', '01021160257', '', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2025-01-02 00:59:15', '2025-01-02 00:59:15', NULL),
(8, 'G202501021849005934', NULL, '정현도', 'jhdoup@gmail.com', '01021160257', '', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2025-01-02 09:49:00', '2025-01-02 09:49:00', NULL),
(9, 'G202501031726180868', NULL, 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', '', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2025-01-03 08:26:18', '2025-01-03 08:26:18', NULL),
(10, 'G202501040937367391', NULL, 'Fg', 'jh@gmail.com', '01021160257', '', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2025-01-04 00:37:36', '2025-01-04 00:37:36', NULL),
(11, 'G202501071651517876', NULL, '정현도', 'khdoyp@gmil.com', '01021150257', '', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2025-01-07 07:51:51', '2025-01-07 07:51:51', NULL),
(12, 'G202501071656205376', NULL, '정현도', 'jhdoup@gmail.com', '01021160257', '', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2025-01-07 07:56:20', '2025-01-07 07:56:20', NULL),
(13, 'G202501071657278046', NULL, '정현도', 'jhdoup@gmail.com', '01021160257', '', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2025-01-07 07:57:27', '2025-01-07 07:57:27', NULL),
(14, 'G202501071818294618', NULL, 'Lee dong hyeon', 'ymhproenator@gmail.com', '01095938514', '', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2025-01-07 09:18:29', '2025-01-07 09:18:29', NULL),
(15, 'G202501081712483126', NULL, '정현도', 'jhdoup@gmail.com', '01021160257', '', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2025-01-08 08:12:48', '2025-01-08 08:12:48', NULL),
(16, 'G202501141730577884', NULL, 'lee dong hyeon', 'ymhpro@naver.com', '01095938514', 'test', '0001', '특허뉴스PDF', 1, '99000.00', 'card', NULL, 'pending', NULL, NULL, NULL, 'Y', '2025-01-14 08:30:57', '2025-01-14 08:30:57', NULL);

--
-- 덤프된 테이블의 인덱스
--

--
-- 테이블의 인덱스 `order_form`
--
ALTER TABLE `order_form`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_contact_form_id` (`contact_form_id`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- 덤프된 테이블의 AUTO_INCREMENT
--

--
-- 테이블의 AUTO_INCREMENT `order_form`
--
ALTER TABLE `order_form`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- 덤프된 테이블의 제약사항
--

--
-- 테이블의 제약사항 `order_form`
--
ALTER TABLE `order_form`
  ADD CONSTRAINT `fk_contact_form_id` FOREIGN KEY (`contact_form_id`) REFERENCES `contact_form` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
