-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- 생성 시간: 24-12-30 14:41
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
-- 테이블 구조 `order_form`
--

CREATE TABLE `order_form` (
  `id` int(11) NOT NULL,
  `order_id` varchar(50) NOT NULL COMMENT '주문번호',
  `contact_form_id` int(11) DEFAULT NULL COMMENT 'contact_form 테이블 참조 ID',
  `order_name` varchar(100) NOT NULL COMMENT '주문자명',
  `order_email` varchar(100) NOT NULL COMMENT '주문자 이메일',
  `order_phone` varchar(20) NOT NULL COMMENT '주문자 연락처',
  `order_memo` text DEFAULT NULL COMMENT '주문 메모',
  `product_code` varchar(10) NOT NULL COMMENT '상품 코드',
  `product_name` varchar(100) NOT NULL COMMENT '상품명',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT '수량',
  `price` decimal(10,2) NOT NULL COMMENT '가격',
  `payment_method` varchar(20) NOT NULL COMMENT '결제 수단',
  `transaction_id` varchar(100) DEFAULT NULL COMMENT '결제 거래 ID',
  `payment_status` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '결제 상태(pending, completed, failed, cancelled)',
  `paid_amount` decimal(10,2) DEFAULT NULL COMMENT '실제 결제 금액',
  `payment_response_code` varchar(10) DEFAULT NULL COMMENT '결제 응답 코드',
  `payment_response_message` text DEFAULT NULL COMMENT '결제 응답 메시지',
  `privacy_consent` char(1) NOT NULL DEFAULT 'Y' COMMENT '개인정보 수집 동의(Y/N)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '생성 시간',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정 시간',
  `paid_at` timestamp NULL DEFAULT NULL COMMENT '결제 완료 시간'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='주문 정보 테이블';

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
