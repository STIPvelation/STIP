<?php
header('Content-Type: application/json; charset=UTF-8');

// 데이터베이스 연결 설정
// require_once 'config/db_config.php';
// require_once 'config/database.php';


// 데이터베이스 연결 설정
// $db_user = 'sharetheipp';
// $db_pass = 'Leon0202!@';
// $db_name = 'sharetheipp';

// require 'vendor/autoload.php';

// use VendorName\ValidationException;
// use VendorName\PaymentException;

// ValidationException과 PaymentException 정의
class ValidationException extends Exception {}
class PaymentException extends Exception {}
class SecurityException extends Exception {}

require_once 'config/database.php';
require_once 'config/security.php';
require_once 'classes/Logger.php';
require_once 'classes/ErrorHandler.php';
require_once 'classes/PaymentValidator.php';

$db_host = 'localhost';
$db_user = 'root';
$db_pass = '1234';
$db_name = 'stipvelation';

// 세션 시작
session_start();


try {

  // API 요청 검증
  Security::validateApiRequest();

  // CSRF 토큰 검증
  if (
    !isset($_POST['csrf_token']) ||
    !Security::verifyCsrfToken($_POST['csrf_token'])
  ) {
    throw new SecurityException('Invalid CSRF token');
  }

  // 요청 데이터 검증
  $requestData = [
    'card_number' => $_POST['cardNumber'] ?? '',
    'expiry_date' => $_POST['expiryDate'] ?? '',
    'cvv' => $_POST['cvv'] ?? '',
    'cardholder_name' => $_POST['cardholderName'] ?? '',
    'contact_form_id' => $_POST['contactFormId'] ?? '',
    'amount' => '99000',
    'lang' => $_POST['lang'] ?? 'ko'
  ];

  Logger::info('Payment process started', [
    'contact_form_id' => $requestData['contact_form_id'],
    'cardholder_name' => $requestData['cardholder_name']
  ]);

  // 카드 유효성 검증
  PaymentValidator::validateCard(
    $requestData['card_number'],
    $requestData['expiry_date'],
    $requestData['cvv']
  );

  // 데이터베이스 연결
  $pdo = new PDO(
    "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
    DB_USER,
    DB_PASSWORD,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );

  // 트랜잭션 시작
  $pdo->beginTransaction();

  try {
    // 카드 정보 암호화
    $encryptedCardNumber = Security::encryptCardNumber($requestData['card_number']);

    // payment_info 테이블에 데이터 저장
    $sql = "INSERT INTO payment_info (
            contact_form_id, card_number, expiry_date,
            cardholder_name, amount, status,
            created_at, updated_at
        ) VALUES (
            :contact_form_id, :card_number, :expiry_date,
            :cardholder_name, :amount, 'pending',
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
      ':contact_form_id' => $requestData['contact_form_id'],
      ':card_number' => $encryptedCardNumber,
      ':expiry_date' => $requestData['expiry_date'],
      ':cardholder_name' => $requestData['cardholder_name'],
      ':amount' => $requestData['amount']
    ]);

    $paymentId = $pdo->lastInsertId();

    // Nice Pay 결제 파라미터 준비
    $nicePayParams = [
      'PayMethod' => 'CARD',
      'GoodsName' => '특허뉴스PDF',
      'Amt' => $requestData['amount'],
      'BuyerName' => $requestData['cardholder_name'],
      'Moid' => 'ORD_' . $paymentId,
      'MID' => 'stipv0202m'
    ];

    // Nice Pay 결제창 HTML 생성
    $nicePayForm = generateNicePayForm($nicePayParams);

    // 트랜잭션 커밋
    $pdo->commit();

    // 성공 응답
    echo json_encode([
      'success' => true,
      'payment_id' => $paymentId,
      'nice_pay_form' => $nicePayForm,
      'message' => getSuccessMessage($requestData['lang'])
    ]);
  } catch (Exception $e) {
    // 트랜잭션 롤백
    $pdo->rollBack();
    throw $e;
  }

} catch (Exception $e) {  

  $errorResponse = ErrorHandler::handleException($e, $requestData['lang'] ?? 'ko');
  Logger::error('Payment process failed', [
    'error' => $e->getMessage(),
    'trace' => $e->getTraceAsString()
  ]);
  echo json_encode($errorResponse);
}

function generateNicePayForm($params)
{
  $merchantKey = "8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug==";
  $ediDate = date("YmdHis");
  $hashString = bin2hex(hash('sha256', $ediDate . $params['MID'] . $params['Amt'] . $merchantKey, true));

  ob_start();
?>
  <div class="nice-pay-modal">
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <form name="payForm" method="post" action="payResult_utf.php" target="nice_pay_frame">
        <input type="hidden" name="PayMethod" value="<?php echo htmlspecialchars($params['PayMethod']); ?>">
        <input type="hidden" name="GoodsName" value="<?php echo htmlspecialchars($params['GoodsName']); ?>">
        <input type="hidden" name="Amt" value="<?php echo htmlspecialchars($params['Amt']); ?>">
        <input type="hidden" name="BuyerName" value="<?php echo htmlspecialchars($params['BuyerName']); ?>">
        <input type="hidden" name="Moid" value="<?php echo htmlspecialchars($params['Moid']); ?>">
        <input type="hidden" name="MID" value="<?php echo htmlspecialchars($params['MID']); ?>">
        <input type="hidden" name="EdiDate" value="<?php echo $ediDate; ?>">
        <input type="hidden" name="SignData" value="<?php echo $hashString; ?>">
        <input type="hidden" name="CharSet" value="utf-8">
      </form>
      <iframe name="nice_pay_frame" style="width:100%;height:600px;border:none;"></iframe>
    </div>
    <button class="modal-close" onclick="closeNicePayModal()">×</button>
  </div>
<?php
  return ob_get_clean();
}

function getSuccessMessage($lang)
{
  $messages = [
    'ko' => '결제창을 불러오는 중입니다...',
    'en' => 'Loading payment window...',
    'ja' => '決済画面を読み込んでいます...',
    'zh' => '正在加载支付窗口...'
  ];
  return $messages[$lang] ?? $messages['en'];
}
