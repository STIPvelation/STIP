-- order_form 테이블 생성
CREATE TABLE order_form (
id INT AUTO_INCREMENT PRIMARY KEY,
order_id VARCHAR(50) NOT NULL COMMENT '주문번호',
contact_form_id INT NULL COMMENT 'contact_form 테이블 참조 ID',
order_name VARCHAR(100) NOT NULL COMMENT '주문자명',
order_email VARCHAR(100) NOT NULL COMMENT '주문자 이메일',
order_phone VARCHAR(20) NOT NULL COMMENT '주문자 연락처',
order_memo TEXT NULL COMMENT '주문 메모',

-- 상품 정보
product_code VARCHAR(10) NOT NULL COMMENT '상품 코드',
product_name VARCHAR(100) NOT NULL COMMENT '상품명',
quantity INT NOT NULL DEFAULT 1 COMMENT '수량',
price DECIMAL(10,2) NOT NULL COMMENT '가격',

-- 결제 정보
payment_method VARCHAR(20) NOT NULL COMMENT '결제 수단',
transaction_id VARCHAR(100) NULL COMMENT '결제 거래 ID',
payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
COMMENT '결제 상태(pending, completed, failed, cancelled)',
paid_amount DECIMAL(10,2) NULL COMMENT '실제 결제 금액',

-- 결제 응답 정보
payment_response_code VARCHAR(10) NULL COMMENT '결제 응답 코드',
payment_response_message TEXT NULL COMMENT '결제 응답 메시지',

-- 개인정보 수집 동의
privacy_consent CHAR(1) NOT NULL DEFAULT 'Y' COMMENT '개인정보 수집 동의(Y/N)',

-- 시간 정보
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
paid_at TIMESTAMP NULL COMMENT '결제 완료 시간',

-- 인덱스
INDEX idx_order_id (order_id),
INDEX idx_contact_form_id (contact_form_id),
INDEX idx_payment_status (payment_status),
INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='주문 정보 테이블';

-- 외래 키 제약 조건 추가 (contact_form 테이블이 있는 경우)
ALTER TABLE order_form
ADD CONSTRAINT fk_contact_form_id
FOREIGN KEY (contact_form_id)
REFERENCES contact_form(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 기본 CRUD 쿼리

-- 1. 주문 정보 입력
INSERT INTO order_form (
order_id, order_name, order_email, order_phone,
product_code, product_name, price, payment_method,
order_memo, privacy_consent
) VALUES (
?, ?, ?, ?,
?, ?, ?, ?,
?, ?
);

-- 2. 결제 상태 업데이트
UPDATE order_form
SET
payment_status = ?,
transaction_id = ?,
paid_amount = ?,
payment_response_code = ?,
payment_response_message = ?,
paid_at = CURRENT_TIMESTAMP
WHERE order_id = ?;

-- 3. contact_form_id 업데이트
UPDATE order_form
SET contact_form_id = ?
WHERE order_id = ?;

-- 4. 주문 조회
SELECT * FROM order_form
WHERE order_id = ?;

-- 5. 주문 목록 조회 (최근 순)
SELECT *
FROM order_form
ORDER BY created_at DESC
LIMIT ? OFFSET ?;

-- 6. 결제 상태별 주문 조회
SELECT *
FROM order_form
WHERE payment_status = ?
ORDER BY created_at DESC;

-- 7. 기간별 주문 통계
SELECT
DATE(created_at) as order_date,
COUNT(*) as total_orders,
SUM(CASE WHEN payment_status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
SUM(CASE WHEN payment_status = 'completed' THEN paid_amount ELSE 0 END) as total_sales
FROM order_form
WHERE created_at BETWEEN ? AND ?
GROUP BY DATE(created_at)
ORDER BY order_date DESC;