<?php
require_once 'database/database.php';
// 데이터베이스 연결 설정
$dbConfig = [
  'host' => 'localhost',
  'dbname' => DB_NAME,
  'username' => DB_USER,
  'password' => DB_PASS,
  'charset' => 'utf8mb4'
];

// PDO 옵션 설정
$pdoOptions = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false
];

try {
  // PDO 연결 생성
  $dsn = "mysql:host={$dbConfig['host']};dbname={$dbConfig['dbname']};charset={$dbConfig['charset']}";
  $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], $pdoOptions);

  // 테이블 존재 여부 확인 및 생성
  $tableCheck = $pdo->query("SHOW TABLES LIKE 'contact_contact_form'");
  if ($tableCheck->rowCount() == 0) {
    // 테이블이 없는 경우 생성
    $createTable = "CREATE TABLE contact_contact_form (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            company VARCHAR(100) NOT NULL,
            job_title VARCHAR(100) NOT NULL,
            mobile VARCHAR(20) NOT NULL,
            country VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL,
            subject VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45),
            user_agent TEXT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($createTable);
  }

  // POST 요청 처리
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // CSRF 방지를 위한 Origin 확인
    $allowedOrigins = ['http://your-domain.com', 'https://your-domain.com'];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!in_array($origin, $allowedOrigins)) {
      throw new Exception('Invalid origin');
    }

    // 입력값 검증
    $requiredFields = ['firstName', 'lastName', 'company', 'jobTitle', 'mobile', 'country', 'email', 'subject', 'message'];
    foreach ($requiredFields as $field) {
      if (empty($_POST[$field])) {
        throw new Exception("Required field missing: {$field}");
      }
    }

    // 이메일 형식 검증
    if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
      throw new Exception('Invalid email format');
    }

    // SQL 인젝션 방지를 위한 prepared statement 사용
    $sql = "INSERT INTO contact_contact_form 
                (first_name, last_name, company, job_title, mobile, country, email, subject, message, ip_address, user_agent) 
                VALUES 
                (:firstName, :lastName, :company, :jobTitle, :mobile, :country, :email, :subject, :message, :ipAddress, :userAgent)";

    $stmt = $pdo->prepare($sql);

    // 데이터 바인딩 및 실행
    $result = $stmt->execute([
      'firstName' => $_POST['firstName'],
      'lastName' => $_POST['lastName'],
      'company' => $_POST['company'],
      'jobTitle' => $_POST['jobTitle'],
      'mobile' => $_POST['mobile'],
      'country' => $_POST['country'],
      'email' => $_POST['email'],
      'subject' => $_POST['subject'],
      'message' => $_POST['message'],
      'ipAddress' => $_SERVER['REMOTE_ADDR'],
      'userAgent' => $_SERVER['HTTP_USER_AGENT']
    ]);

    // 응답 전송
    header('Content-Type: application/json');
    if ($result) {
      echo json_encode(['success' => true]);
    } else {
      throw new Exception('Failed to insert data');
    }
  }
} catch (Exception $e) {
  // 오류 처리
  header('Content-Type: application/json');
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'message' => $e->getMessage()
  ]);
}
