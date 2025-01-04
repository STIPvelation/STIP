<?php
require_once 'config.php';

// 데이터베이스 연결 설정
// $db_host = 'localhost';
// $db_user = 'root';
// $db_pass = '1234';
// $db_name = 'stipvelation';

// $db_user = 'sharetheipp';
// $db_pass = 'Leon0202!@';
// $db_name = 'sharetheipp';


try {
    // 데이터베이스 연결
    // $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    // 연결 체크
    if ($conn->connect_error) {
        throw new Exception("데이터베이스 연결 실패: " . $conn->connect_error);
    }

    // UTF-8 설정
    $conn->set_charset("utf8mb4");

    // 테이블 변경 쿼리들
    $alterQueries = [
        // 새 컬럼이 없는 경우에만 추가하도록 체크
        "SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = '$db_name' 
         AND TABLE_NAME = 'contact_form' 
         AND COLUMN_NAME = 'country_code'",
        
        "ALTER TABLE contact_form
         ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) NOT NULL DEFAULT '' AFTER id",

        "ALTER TABLE contact_form
         ADD COLUMN IF NOT EXISTS product_code VARCHAR(10) NOT NULL DEFAULT '' AFTER mobile",

        "ALTER TABLE contact_form
         ADD COLUMN IF NOT EXISTS product_name VARCHAR(100) NOT NULL DEFAULT '' AFTER product_code",

        // 기존 데이터 업데이트
        "UPDATE contact_form 
         SET country_code = 'KR',
             product_code = '0001',
             product_name = '특허뉴스PDF'
         WHERE country_code = ''",

        // 컬럼 설명 추가
        "ALTER TABLE contact_form
         MODIFY COLUMN country_code VARCHAR(2) NOT NULL DEFAULT '' COMMENT '국가 코드'",

        "ALTER TABLE contact_form
         MODIFY COLUMN product_code VARCHAR(10) NOT NULL DEFAULT '' COMMENT '상품 코드'",

        "ALTER TABLE contact_form
         MODIFY COLUMN product_name VARCHAR(100) NOT NULL DEFAULT '' COMMENT '상품명'"
    ];

    // 각 쿼리 실행
    foreach ($alterQueries as $query) {
        if (!$conn->query($query)) {
            throw new Exception("쿼리 실행 실패: " . $conn->error . "\nQuery: " . $query);
        }
    }

    echo "테이블 업데이트가 성공적으로 완료되었습니다.";

} catch (Exception $e) {
    echo "에러 발생: " . $e->getMessage();
    error_log("테이블 업데이트 에러: " . $e->getMessage());
} finally {
    // 데이터베이스 연결 종료
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}