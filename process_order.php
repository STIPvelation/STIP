<?php
// 에러 출력 방지
session_start();
header('Content-Type: application/json; charset=UTF-8');

// require_once 'security_utils.php';
// require_once 'payment_status_handler.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);
// 출력 버퍼링 시작
ob_start();

require_once 'config.php';

// // CSRF 토큰 검증
// if (!isset($_POST['csrf_token']) || !SecurityUtils::validateCSRFToken($_POST['csrf_token'])) {
//   throw new Exception('보안 검증에 실패했습니다.');
// }

// // 입력 데이터 정화
// $data = SecurityUtils::sanitizeInput($_POST);

// // SQL Injection 검증
// foreach ($data as $key => $value) {
//   if (!SecurityUtils::validateSQLInput($value)) {
//     throw new Exception('유효하지 않은 입력값이 포함되어 있습니다.');
//   }
// }

// // IP 접근 제한 검사
// $clientIP = $_SERVER['REMOTE_ADDR'];
// if (!filter_var($clientIP, FILTER_VALIDATE_IP)) {
//   throw new Exception('유효하지 않은 접근입니다.');
// }

// 응답 초기화
$response = [
  'success' => false,
  'message' => '',
  'debug' => []
];


try {
  // CSRF 검증은 일단 주석 처리
  /*
  if (!isset($_POST['csrf_token']) || !SecurityUtils::validateCSRFToken($_POST['csrf_token'])) {
      throw new Exception('보안 검증에 실패했습니다.');
  }
  */

  // JSON 요청 데이터 파싱
  $input = file_get_contents('php://input');

  // JSON 데이터 유효성 검증
  if (empty($input)) {
    throw new Exception('JSON 데이터가 비어 있습니다.');
  }

  // 디버깅을 위한 로깅
  error_log("Received input: " . $input);

  $data = json_decode($input, true);
  if (json_last_error() !== JSON_ERROR_NONE) {
    throw new Exception('JSON 디코딩 실패: ' . json_last_error_msg());
  }

  // 받은 데이터 로깅
  error_log("Decoded data: " . print_r($data, true));

  // JSON 디코딩
  // $data = json_decode($input, true);
  // if (json_last_error() !== JSON_ERROR_NONE) {
  //   throw new Exception('JSON 디코딩 실패: ' . json_last_error_msg());
  // }

  // 디버깅을 위한 요청 데이터 로깅
  // $response['debug']['request_data'] = $data;

  // 2. 필수 필드 검증
  $requiredFields = [
    'orderName',
    'orderEmail',
    'orderPhone',
    'productCode',
    'productName',
    'price'
  ];

  foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
      throw new Exception("필수 필드 누락: {$field}");
    }
  }

  // 3. 데이터 유효성 검증
  if (!filter_var($data['orderEmail'], FILTER_VALIDATE_EMAIL)) {
    throw new Exception('올바른 이메일 형식이 아닙니다.');
  }

  if (!preg_match('/^[0-9-+]{10,20}$/', preg_replace('/[^0-9-+]/', '', $data['orderPhone']))) {
    throw new Exception('올바른 전화번호 형식이 아닙니다.');
  }

  // 이메일 길이 검증 (선택 사항)
  // if (strlen($data['orderEmail']) > 100) {
  //   throw new Exception('이메일 길이는 100자를 초과할 수 없습니다.');
  // }

  // 개인정보 동의 확인
  // if ($data['privacyConsent'] !== 'Y') {
  //   throw new Exception('개인정보 수집 동의가 필요합니다.');
  // }

  // 주문 ID 생성
  // $orderId = uniqid('ORD_');
  // 4. 주문번호 생성 (년월일-시분초-랜덤6자리)
  // $orderId = date('Ymd-His-') . sprintf('%06d', rand(0, 999999));
  // 주문번호 생성 함수 추가
  function generateCode()
  {
    $dateTime = date("YmdHis");
    $sequence = str_pad(mt_rand(0, 9999), 4, "0",
        STR_PAD_LEFT
      );
    return 'G' . $dateTime . $sequence;
  }

  // 주문번호 생성 방식 변경
  // $orderId = date('Ymd-His-') . sprintf('%06d', rand(0, 999999));
  $orderId = generateCode(); // NicePay 형식에 맞게 주문번호 생성

  // 데이터베이스 연결
  // 5. 데이터베이스 연결
  // 데이터베이스 연결 설정
  // $db_host = 'localhost';
  // $db_user = 'root';
  // $db_pass = '1234';
  // $db_name = 'stipvelation';

  $pdo = new PDO(
    "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
    DB_USER,
    DB_PASS,    
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]
  );


  $pdo->beginTransaction();

  // 데이터베이스 저장
  // $stmt = $pdo->prepare('
  //       INSERT INTO order_form (order_id, order_name, order_email, order_phone, order_memo, product_code, product_name, quantity, price, privacy_consent)
  //       VALUES (:order_id, :order_name, :order_email, :order_phone, :order_memo, :product_code, :product_name, :quantity, :price, :privacy_consent)
  // ');

  // SQL 쿼리 작성
  $sql = "INSERT INTO order_form (
        order_id,
        order_name,
        order_email,
        order_phone,
        order_memo,
        product_code,
        product_name,
        quantity,
        price,
        payment_status,
        privacy_consent,
        payment_method
    ) VALUES (
        :order_id,
        :order_name,
        :order_email,
        :order_phone,
        :order_memo,
        :product_code,
        :product_name,
        :quantity,
        :price,
        'pending',
        'Y',
        'card'
    )";

  $stmt = $pdo->prepare($sql);

  $params = [
    ':order_id' => $orderId,
    ':order_name' => $data['orderName'],
    ':order_email' => $data['orderEmail'],
    ':order_phone' => $data['orderPhone'],
    ':order_memo' => isset($data['orderMemo']) ? $data['orderMemo'] : '',
    ':product_code' => $data['productCode'],
    ':product_name' => $data['productName'],
    ':quantity' => isset($data['quantity']) ? $data['quantity'] : 1,
    ':price' => $data['price']
  ];

  // 바인딩할 파라미터 로깅
  error_log("Parameters to bind: " . print_r($params, true));

  $stmt->execute($params);
  
  // 5. 결제 정보 저장
  // $stmt->execute([
  //   ':order_id' => $orderId,
  //   ':order_name' => $data['orderName'],
  //   ':order_email' => $data['orderEmail'],
  //   ':order_phone' => $data['orderPhone'],
  //   ':order_meno' => $data['orderMemo'] ?? '',
  //   ':product_code' => $data['productCode'],
  //   ':product_name' => $data['productName'],
  //   ':quantity' => $data['quantity'] ?? 1,
  //   ':price' => $data['price'],
  //   ':privacy_consent' => $data['privacyConsent']
  // ]);

  $pdo->commit();

  // 9. NICE Pay 결제 정보 준비
  // $paymentInfo = [
  //   'orderId' => $orderId,
  //   'amount' => $data['price'],
  //   'productName' => $data['productName'],
  //   'buyerName' => $data['orderName'],
  //   'buyerEmail' => $data['orderEmail'],
  //   'buyerTel' => $data['orderPhone']
  // ];

  /**
   * $merchantKey = "8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug=="; // 상점키
   * $MID         = "stipv0202m";        // 상점아이디
   * $goodsName   = "특허뉴스PDF";         // 결제상품명
   * $price       = "99000";             // 결제상품금액
   * $buyerName   = $_POST['name'];      // 구매자명 
   * $buyerTel	 = $_POST['mobile'];      // 구매자연락처
   * $buyerEmail  = $_POST['email'];     // 구매자메일주소        
   * $moid        = generateCode();      // 상품주문번호  
   */

  // 8. NicePay 결제 정보 준비
  // $merchantKey = "8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug=="; // 상점 키
  // $merchantID = "stipv0202m";   // 상점 ID
  // $ediDate = date("YmdHis");
  // $price = $data['price'];

  

  // 9. NicePay 결제 정보 준비
  $merchantKey = "8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug==";
  $MID = "stipv0202m";
  $ediDate = date("YmdHis");
  // $returnUrl = "payResult_utf.php";
  // $netCancelUrl = "cancelResult_utf.php";

  // Hash 데이터 생성
  // $hashString = bin2hex(hash('sha256', $merchantID . $price . $ediDate . $merchantKey, true));

  // SignData 생성 시에도 정수 값 사용
  $price = (int)str_replace(',', '', $data['price']);
  $hashString = bin2hex(hash('sha256', $ediDate . $MID . $price . $merchantKey, true));

  // SignData 생성
  // $signData = bin2hex(hash('sha256', $ediDate . $MID . $data['price'] . $merchantKey, true));

  // NicePay 결제 파라미터 설정
  // $paymentData = [
  //   'MID' => $merchantID,
  //   'Moid' => $orderId,
  //   'GoodsName' => $data['productName'],
  //   'Amt' => $price,
  //   'BuyerName' => $data['orderName'],
  //   'BuyerEmail' => $data['orderEmail'],
  //   'BuyerTel' => $data['orderPhone'],
  //   'EdiDate' => $ediDate,
  //   'SignData' => $hashString,
  //   'ReturnURL' => 'listing.html',
  //   'CharSet' => 'utf-8'
  // ];

  // 10. 결제 파라미터 설정
  // $paymentData = [
  //   'PayMethod' => 'CARD',
  //   'GoodsName' => $data['productName'],
  //   'Amt' => $data['price'],
  //   'BuyerName' => $data['orderName'],
  //   'BuyerTel' => $data['orderPhone'],
  //   'BuyerEmail' => $data['orderEmail'],
  //   'Moid' => 'STIP' . $ediDate,
  //   'MID' => $MID,
  //   'ReturnURL' => $returnUrl,
  //   'NetCancelURL' => $netCancelUrl,
  //   'CharSet' => 'utf-8',
  //   'EdiDate' => $ediDate,
  //   'SignData' => $signData,
  //   'GoodsCl' => '1',
  //   'TransType' => '0',
  //   'GoodsCnt' => '1'
  // ];

  // NicePay 결제 파라미터 설정
  $paymentData = [
    'PayMethod' => 'CARD',                // 결제수단
    'GoodsName' => $data['productName'],  // 상품명
    'GoodsCnt' => '1',                    // 상품개수
    // 가격을 정수로 변환
    'Amt' => (int)str_replace(',', '', $data['price']), // 콤마 제거 후 정수변환
    'BuyerName' => $data['orderName'],    // 구매자명
    'BuyerTel' => $data['orderPhone'],    // 구매자연락처
    'BuyerEmail' => $data['orderEmail'],  // 구매자메일주소
    'Moid' => $orderId,                   // 주문번호
    'MID' => $MID,                        // 상점아이디

    // 필수 파라미터 추가
    'GoodsCl' => '1',                     // 상품구분(실물(1),컨텐츠(0))
    'TransType' => '0',                   // 일반(0)/에스크로(1)
    'CharSet' => 'utf-8',                 // 인코딩 방식
    'ReturnURL' => 'payResult_utf.php',   // 결과페이지(절대경로)
    'EdiDate' => $ediDate,                // 전문 생성일시
    'SignData' => $hashString,            // 해시값
    'VbankExpDate' => '',                 // 가상계좌입금만료일
    'ReqReserved' => ''                   // 상점 예약필드
  ];


  // 성공 응답
  $response['success'] = true;
  $response['message'] = '주문이 성공적으로 처리되었습니다.';
  $response['order_id'] = $orderId;
  $response['paymentData'] = $paymentData;   

} catch (Exception $e) {
  // 11. 실패 처리
  if (isset($pdo)) {
    $pdo->rollBack();
  }

  $response['success'] = false;
  $response['message'] = $e->getMessage();
  $response['debug'] = [
    'error_message' => $e->getMessage(),
    'error_file' => $e->getFile(),
    'error_line' => $e->getLine()
  ];

  // 에러 로깅
  error_log("Order processing error: " . $e->getMessage());

} finally {
  // 12. JSON 응답 전송
  echo json_encode($response, JSON_UNESCAPED_UNICODE);
  exit;
}
