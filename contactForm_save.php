<?php
// 데이터베이스 연결 설정
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '1234';
$db_name = 'stipvelation';

// $db_user = 'sharetheipp';
// $db_pass = 'Leon0202!@';
// $db_name = 'sharetheipp';


// 에러 메시지 설정
$response = array(
  'success' => false,
  'message' => ''
);

try {
  // 데이터베이스 연결
  $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

  // 연결 체크
  if ($conn->connect_error) {
    throw new Exception("Database connection failed: " . $conn->connect_error);
  }

  // UTF-8 설정
  $conn->set_charset("utf8mb4");

  // POST 데이터 검증 및 정제
  $name = isset($_POST['name']) ? $conn->real_escape_string(trim($_POST['name'])) : '';
  $email = isset($_POST['email']) ? $conn->real_escape_string(trim($_POST['email'])) : '';
  $mobile = isset($_POST['mobile']) ? $conn->real_escape_string(trim($_POST['mobile'])) : '';
  $submit_date = date('Y-m-d H:i:s');
  $ip_address = $_SERVER['REMOTE_ADDR'];

  // 필수 필드 검증
  if (empty($name) || empty($email) || empty($mobile)) {
    throw new Exception("All fields are required");
  }

  // 이메일 형식 검증
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    throw new Exception("Invalid email format");
  }

  // SQL 쿼리 준비
  $sql = "INSERT INTO contact_form (
                name, 
                email, 
                mobile, 
                submit_date, 
                ip_address
            ) VALUES (
                ?, ?, ?, ?, ?
            )";

  // Prepared Statement 생성
  $stmt = $conn->prepare($sql);
  if (!$stmt) {
    throw new Exception("Query preparation failed: " . $conn->error);
  }

  // 파라미터 바인딩
  $stmt->bind_param(
    "sssss",
    $name,
    $email,
    $mobile,
    $submit_date,
    $ip_address
  );

  // 쿼리 실행
  if (!$stmt->execute()) {
    throw new Exception("Query execution failed: " . $stmt->error);
  }

  // 데이터 저장 성공
  $response['success'] = true;
  $response['message'] = "Data saved successfully";
  $response['contact_id'] = $conn->insert_id;

  // Statement 종료
  $stmt->close();
} catch (Exception $e) {
  $response['message'] = $e->getMessage();
  error_log("Error in contactForm_save.php: " . $e->getMessage());
} finally {
  // 데이터베이스 연결 종료
  if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
  }

  // JSON 응답 전송
  header('Content-Type: application/json');
  echo json_encode($response);
}
