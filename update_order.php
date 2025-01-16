<?php
// 1. 기본 설정
session_start();
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// 2. 로그 설정
function writeLog($message, $type = 'info') {
    $logFile = __DIR__ . '/logs/payment_' . date('Y-m-d') . '.log';
    $logMessage = date('Y-m-d H:i:s') . " [{$type}] " . $message . PHP_EOL;
    error_log($logMessage, 3, $logFile);
}

// 3. 주문 업데이트 로직
try {
    // 입력 데이터 받기
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data received');
    }

    writeLog('Received update data: ' . $input);

    // 필수 입력값 검증
    $requiredFields = ['order_id', 'transaction_id', 'tid', 'amount', 'result_code', 'result_msg', 'auth_token'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing required field: {$field}");
        }
    }

    // 금액 데이터 검증
    if (!is_numeric($data['amount'])) {
        throw new Exception('Invalid amount value');
    }

    // 환경 설정 검증
    if (!isset($_ENV['DB_HOST']) || !isset($_ENV['DB_NAME']) || !isset($_ENV['DB_USER']) || !isset($_ENV['DB_PASS'])) {
        throw new Exception('Required environment configuration is missing');
    }

    // DB 연결
    $dsn = "mysql:host=".$_ENV['DB_HOST'].";dbname=".$_ENV['DB_NAME'].";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ];

    $pdo = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], $options);
    
    // 트랜잭션 시작
    $pdo->beginTransaction();

    // 주문 존재 여부 확인
    $checkSql = "SELECT order_id, payment_status FROM order_form WHERE order_id = :order_id";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([':order_id' => $data['order_id']]);
    $order = $checkStmt->fetch();

    if (!$order) {
        throw new Exception('Order not found: ' . $data['order_id']);
    }

    if ($order['payment_status'] === 'completed') {
        throw new Exception('Order already completed: ' . $data['order_id']);
    }

    // XSS 방지를 위한 데이터 이스케이프 처리
    $data = array_map('htmlspecialchars', $data);

    // 주문 정보 업데이트
    $sql = "UPDATE order_form SET 
        payment_status = :status,
        transaction_id = :transaction_id,
        tid = :tid,
        paid_amount = :amount,
        payment_result_code = :result_code,
        payment_result_msg = :result_msg,
        payment_date = :payment_date,
        paid_at = NOW(),
        auth_token = :auth_token,
        updated_at = NOW()
        WHERE order_id = :order_id";

    $stmt = $pdo->prepare($sql);
    $updateData = [
        ':status' => 'completed',
        ':transaction_id' => $data['transaction_id'],
        ':tid' => $data['tid'],
        ':amount' => $data['amount'],
        ':result_code' => $data['result_code'],
        ':result_msg' => $data['result_msg'],
        ':payment_date' => date('Y-m-d H:i:s'),
        ':auth_token' => $data['auth_token'],
        ':order_id' => $data['order_id']
    ];

    $stmt->execute($updateData);
    
    // 세션에서 주문 정보 업데이트
    if (isset($_SESSION['order_' . $data['order_id']])) {
        $_SESSION['order_' . $data['order_id']]['status'] = 'completed';
    }
    
    $pdo->commit();

    writeLog("Payment update successful for order: " . $data['order_id']);
    
    // 응답 전송
    echo json_encode([
        'success' => true,
        'message' => '결제 정보가 성공적으로 업데이트되었습니다.',
        'order_id' => $data['order_id']
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    writeLog("Database error: " . $e->getMessage(), 'error');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '데이터베이스 오류가 발생했습니다.',
        'error' => $_ENV['APP_DEBUG'] ? $e->getMessage() : null
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    writeLog("Error: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString(), 'error');
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error' => $_ENV['APP_DEBUG'] ? $e->getTraceAsString() : null
    ], JSON_UNESCAPED_UNICODE);
}