<?php
require_once 'config.php';

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_log("에러 메시지");


// 데이터베이스 연결 정보
$host = "localhost";
$dbname = "your_database_name";
$username = "your_username";
$password = "your_password";

// MySQL 연결
// $conn = new mysqli($host, $username, $password, $dbname);
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// 연결 오류 확인
if ($conn->connect_error) {
    http_response_code(500);
    die("Database connection failed.");
}

// POST 데이터 가져오기
$first_name = isset($_POST['first_name']) ? trim($_POST['first_name']) : '';
$last_name = isset($_POST['last_name']) ? trim($_POST['last_name']) : '';
$mobile = isset($_POST['mobile']) ? trim($_POST['mobile']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$country = isset($_POST['country']) ? trim($_POST['country']) : '';

// 서버 측 유효성 검사
if (empty($first_name) || empty($last_name) || empty($mobile) || empty($email)) {
    http_response_code(400);
    die("필수 입력값이 누락되었습니다.");
}

if (!preg_match('/^[0-9]{10,15}$/', $mobile)) {
    http_response_code(400);
    die("유효하지 않은 모바일 번호입니다.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    die("유효하지 않은 이메일 형식입니다.");
}

// 데이터 삽입
$sql = "INSERT INTO contact_contact (first_name, last_name, mobile, email, country) 
        VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    die("SQL 준비 중 오류가 발생했습니다.");
}

$stmt->bind_param("sssss", $first_name, $last_name, $mobile, $email, $country);

if ($stmt->execute()) {
    echo "데이터가 성공적으로 저장되었습니다.";
} else {
    http_response_code(500);
    echo "데이터 저장 중 오류가 발생했습니다.";
}

// 연결 종료
$stmt->close();
$conn->close();
?>
