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

// 3. 주문 처리 로직
try {
    // 입력 데이터 받기
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // 주문번호 생성
    function generateCode() {
        $dateTime = date("YmdHis");
        $sequence = str_pad(mt_rand(0, 9999), 4, "0", STR_PAD_LEFT);
        return 'G' . $dateTime . $sequence;
    }
    $orderId = generateCode();
    
    // DB 연결
    $pdo = new PDO(
        "mysql:host=" . $_ENV['DB_HOST'] . ";dbname=" . $_ENV['DB_NAME'] . ";charset=utf8mb4",
        $_ENV['DB_USER'],
        $_ENV['DB_PASS'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // 트랜잭션 시작
    $pdo->beginTransaction();
    
    // 주문 정보 저장
    $sql = "INSERT INTO order_form (
        order_id, order_name, order_email, order_phone, 
        product_code, product_name, price, payment_status
    ) VALUES (
        :order_id, :order_name, :order_email, :order_phone,
        :product_code, :product_name, :price, 'pending'
    )";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':order_id' => $orderId,
        ':order_name' => $data['orderName'],
        ':order_email' => $data['orderEmail'],
        ':order_phone' => $data['orderPhone'],
        ':product_code' => $data['productCode'],
        ':product_name' => $data['productName'],
        ':price' => str_replace(',', '', $data['price'])
    ]);
    
    // 나이스페이 결제 정보 준비
    $ediDate = date("YmdHis");
    $merchantKey = $_ENV['NICE_MERCHANT_KEY'];
    $MID = $_ENV['NICE_MERCHANT_ID'];
    $price = (int)str_replace(',', '', $data['price']);
    $hashString = bin2hex(hash('sha256', $ediDate . $MID . $price . $merchantKey, true));
    
    // 결제 파라미터 설정
    $paymentData = [
        'PayMethod' => 'CARD',
        'MID' => $MID,
        'Moid' => $orderId,
        'GoodsName' => $data['productName'],
        'Amt' => $price,
        'BuyerName' => $data['orderName'],
        'BuyerEmail' => $data['orderEmail'],
        'BuyerTel' => $data['orderPhone'],
        'EdiDate' => $ediDate,
        'SignData' => $hashString,
        'ReturnURL' => $_ENV['NICE_RETURN_URL'],
        'CharSet' => 'utf-8'
    ];
    
    $pdo->commit();
    
    // 응답 전송
    echo json_encode([
        'success' => true,
        'message' => '주문이 성공적으로 처리되었습니다.',
        'order_id' => $orderId,
        'paymentData' => $paymentData
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    writeLog("Error: " . $e->getMessage(), 'error');
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
