<?php
// 1. 기본 설정
session_start();
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// 2. 로그 설정
function writeLog($message, $type = 'info') {
    $logFile = __DIR__ . '/logs/processOrder_' . date('Y-m-d') . '.log';
    $logMessage = date('Y-m-d H:i:s') . " [{$type}] " . $message . PHP_EOL;
    error_log($logMessage, 3, $logFile);
}

// 3. 주문 처리 로직
try {
    // 입력 데이터 받기
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data received');
    }

    writeLog('Received order data: ' . json_encode($data));
    // price 값을 orderData에서 가져오기
    $price = $data['price'] ?? 0;
    $price_krw = $data['price_krw'] ?? 0;
    $currency = $data['currency'] ?? 'KRW';
    // $exchange_free = $data['free'] ?? 0;

    if ($price <= 0) {
        throw new Exception('Invalid price value');
    }

    // 필수 입력값 검증
    $requiredFields = ['productCode', 'price', 'currency'];
    // $requiredFields = ['orderName', 'orderEmail', 'orderPhone', 'productCode', 'price', 'currency'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {  // $input을 $data로 수정
            throw new Exception("Missing required field: {$field}");
        }
    }

    // $price = $data['price'] ?? 0;
    // $price_krw = $data['price_krw'] ?? 0;

    // if ($price <= 0) {
    //     throw new Exception('Invalid price value');
    // }

    // $price = $input['price'];
    // $currency = $data['currency'];

    // 결제 금액을 원화로 변환 (다시 한번 검증)
    // $priceInKRW = $price;

    // if ($currency !== 'KRW') {
    //     // 여기서는 원화 기준 가격을 저장
    //     $priceInKRW = $price; // 이미 listing.html에서 변환된 금액
    // }

    // // price_krw 처리
    // $price_krw = ($data['currency'] === 'KRW') ? 
    // str_replace(',', '', $data['price']) : 
    // str_replace(',', '', $data['price']); // 여기서 환율 적용된 금액이 이미 KRW로 전달됨

    // 아래와 같은 체크 로직 필요:
    if (!isset($_ENV['NICE_MERCHANT_KEY']) || !isset($_ENV['NICE_MERCHANT_ID']) || !isset($_ENV['NICE_RETURN_URL'])) {
        throw new Exception('필수 환경 설정이 누락되었습니다.');
    }

    // 데이터 유효성 검사 필요:
    if (empty($data['orderName']) || empty($data['orderEmail']) || empty($data['orderPhone'])) {
        throw new Exception('필수 입력값이 누락되었습니다.');
    }

    // 1. SQL Injection 방지를 위한 price 값 검증 필요
    if (!is_numeric(str_replace(',', '', $data['price']))) {
        throw new Exception('유효하지 않은 가격입니다.');
    }

    // 2. XSS 방지를 위한 데이터 이스케이프 처리 필요
    $data = array_map('htmlspecialchars', $data);
    
    // 주문번호 생성
    // function generateCode() {
    //     $dateTime = date("YmdHis");
    //     $sequence = str_pad(mt_rand(0, 9999), 4, "0", STR_PAD_LEFT);
    //     return 'G' . $dateTime . $sequence;
    // }

    // 더 안전한 방식:
    function generateCode() {
        return 'G' . date("YmdHis") . substr(uniqid(), -4);
    }

    // 거래번호 생성
    $orderId = $data['order_id']; //generateCode();
    
    // DB 연결
    // PDO 연결 (.env 파일의 변수 사용)
    $dsn = "mysql:host=".$_ENV['DB_HOST'].";dbname=".$_ENV['DB_NAME'].";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ];

    $pdo = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], $options);
    
    // 트랜잭션 시작
    $pdo->beginTransaction();
    
    // 주문 정보 저장
    $sql = "INSERT INTO order_form (
    order_id,
    product_code, product_name, price, base_price_krw, calc_price,
    currency, exchange_rate,
    payment_status, privacy_consent, exchange_free
) VALUES (
    :order_id,
    :product_code, :product_name, :price, :base_price_krw, :calc_price,
    :currency, :exchange_rate,
    'pending', :privacy_consent, :exchange_free
    )";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':order_id' => $data['order_id'],
        // ':order_name' => $data['orderName'],
        // ':order_email' => $data['orderEmail'],
        // ':order_phone' => $data['orderPhone'],
        ':product_code' => $data['productCode'],
        ':product_name' => $data['productName'],
        ':price' => $data['price'],                       // 변환된 가격
        ':base_price_krw' => $data['price_krw'],               // 원화 가격
        ':calc_price' => $data['price'],                       // 변환된 가격
        ':currency' => $data['currency'],                 // 통화
        ':exchange_rate' => $data['exchange_rate'],
        // ':order_memo' => $data['orderMemo'] ?? '',
        ':privacy_consent' => $data['privacyConsent'],
        ':exchange_free' => $data['exchange_free'] ?? 0
    ]);

    
    // 나이스페이 결제 정보 준비
    $ediDate = date("YmdHis");
    $merchantKey = $_ENV['NICE_MERCHANT_KEY'];
    $MID = $_ENV['NICE_MERCHANT_ID'];
    // $price = (int)str_replace(',', '', $data['price']);
    // $price = $input['price'];
    $price = str_replace(',', '', $data['price_krw']); // KRW 가격으로 설정
    $hashString = bin2hex(hash('sha256', $ediDate . $MID . $price . $merchantKey, true));
    
    // 결제 파라미터 설정
    $paymentData = [
        'PayMethod' => 'CARD',
        'MID' => $MID,
        'Moid' => $data['order_id'],
        'GoodsName' => $data['productName'],
        'Amt' => $price,              // 환율 적용된 금액
        // 'BuyerName' => $data['orderName'],
        // 'BuyerEmail' => $data['orderEmail'],
        // 'BuyerTel' => $data['orderPhone'],
        'EdiDate' => $ediDate,
        'SignData' => $hashString,
        'ReturnURL' => $_ENV['NICE_RETURN_URL'],
        'CharSet' => 'utf-8'
    ];
    
    $pdo->commit();

    // 주문 정보를 세션에 저장하여 결제 완료 후 검증에 사용
    $_SESSION['order_' . $orderId] = [
        'amount' => $price,
        'status' => 'pending'
    ];
    
    // 응답 전송
    echo json_encode([
        'success' => true,
        'message' => '데이터가 성공적으로 저장되었습니다.',
        'order_id' => $orderId,
        'paymentData' => $paymentData
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->rollBack();
    }
    writeLog("Error: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString(), 'error');
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
