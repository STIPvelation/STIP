<?php
// 1. 기본 설정
session_start();
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/vendor/autoload.php';
require_once 'config/database.php';

// 환경 변수 로드
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// 2. 로그 설정
function writeLog($message, $type = 'info') {
    $logFile = __DIR__ . '/logs/contact_' . date('Y-m-d') . '.log';
    $logMessage = date('Y-m-d H:i:s') . " [{$type}] " . $message . PHP_EOL;
    error_log($logMessage, 3, $logFile);
}

// 3. 연락처 폼 처리 로직
try {
    // 입력 데이터 받기
    $formData = [
        'country_code' => filter_input(INPUT_POST, 'country', FILTER_SANITIZE_STRING),
        'name' => filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING),
        'email' => filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL),
        'mobile' => filter_input(INPUT_POST, 'mobile', FILTER_SANITIZE_STRING),
        'product_code' => filter_input(INPUT_POST, 'productCode', FILTER_SANITIZE_STRING),
        'product_name' => filter_input(INPUT_POST, 'productName', FILTER_SANITIZE_STRING),
        'submit_date' => date('Y-m-d H:i:s'),
        'ip_address' => $_SERVER['REMOTE_ADDR']
    ];

    writeLog('Received contact form data: ' . json_encode($formData));

    // 필수 입력값 검증
    $requiredFields = ['country_code', 'name', 'email', 'mobile'];
    foreach ($requiredFields as $field) {
        if (empty($formData[$field])) {
            throw new Exception("Missing required field: {$field}");
        }
    }

    // 이메일 유효성 검증
    if (!filter_var($formData['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // 파일 정보 처리
    $fileInfo = isset($_POST['fileInfo']) ? json_decode($_POST['fileInfo'], true) : null;
    if ($fileInfo) {
        // XSS 방지를 위한 파일 정보 이스케이프 처리
        $formData = array_merge($formData, [
            'file_name' => htmlspecialchars($fileInfo[0]['original_name'] ?? ''),
            'file_path' => htmlspecialchars($fileInfo[0]['path'] ?? ''),
            'file_size' => intval($fileInfo[0]['size'] ?? 0),
            'file_type' => htmlspecialchars($fileInfo[0]['type'] ?? '')
        ]);
    }

    // DB 연결
    $dsn = sprintf("mysql:host=%s;dbname=%s;charset=utf8mb4", 
        $_ENV['DB_HOST'], 
        $_ENV['DB_NAME']
    );
    
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ];
    
    $pdo = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], $options);

    // 트랜잭션 시작
    $pdo->beginTransaction();

    // 데이터 삽입
    $sql = "INSERT INTO contact_form (
        country_code, name, email, mobile,
        product_code, product_name, submit_date, ip_address,
        file_name, file_path, file_size, file_type, status
    ) VALUES (
        :country_code, :name, :email, :mobile,
        :product_code, :product_name, :submit_date, :ip_address,
        :file_name, :file_path, :file_size, :file_type, 'pending'
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($formData);
    
    $contactId = $pdo->lastInsertId();
    
    $pdo->commit();
    
    writeLog("Contact form saved successfully. ID: {$contactId}");
    
    // 응답 전송
    echo json_encode([
        'success' => true,
        'message' => '연락처가 성공적으로 저장되었습니다.',
        'contact_id' => $contactId
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    writeLog("Database error: " . $e->getMessage(), 'error');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '데이터베이스 오류가 발생했습니다.'
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    writeLog("Error: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString(), 'error');
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}