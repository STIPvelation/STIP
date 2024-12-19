<?php
// 데이터베이스 연결 설정
require_once 'db_config.php';
require_once 'Encryption.php';
require_once 'Logger.php';
require_once 'Database.php';

class PaymentProcessor
{
  private $conn;
  private $response;

  private $db;
  private $encryption;
  private $logger;
  
  public function __construct($conn)
  {
    $this->conn = $conn;
    $this->response = [
      'success' => false,
      'message' => '',
      'error_code' => null
    ];
  }

  // Luhn 알고리즘으로 카드번호 유효성 검사
  private function validateCardNumber($number)
  {
    $number = preg_replace('/\D/', '', $number);
    $sum = 0;
    $length = strlen($number);
    $parity = $length % 2;

    for ($i = $length - 1; $i >= 0; $i--) {
      $digit = (int)$number[$i];
      if ($i % 2 === $parity) {
        $digit *= 2;
        if ($digit > 9) {
          $digit -= 9;
        }
      }
      $sum += $digit;
    }

    return ($sum % 10) === 0;
  }

  // 만료일 검사
  private function validateExpiryDate($month, $year)
  {
    $currentYear = (int)date('y');
    $currentMonth = (int)date('m');

    $month = (int)$month;
    $year = (int)$year;

    if (
      $year < $currentYear ||
      ($year === $currentYear && $month < $currentMonth) ||
      $month < 1 || $month > 12
    ) {
      return false;
    }
    return true;
  }

  // CVV 검증
  private function validateCVV($cvv, $cardType)
  {
    $cvv = preg_replace('/\D/', '', $cvv);
    $length = strlen($cvv);

    // AMEX는 4자리, 나머지는 3자리
    return ($cardType === 'AMEX' && $length === 4) ||
      ($cardType !== 'AMEX' && $length === 3);
  }

  // 카드 종류 확인
  private function detectCardType($number)
  {
    $patterns = [
      'VISA' => '/^4[0-9]{12}(?:[0-9]{3})?$/',
      'MASTERCARD' => '/^5[1-5][0-9]{14}$/',
      'AMEX' => '/^3[47][0-9]{13}$/',
      'DISCOVER' => '/^6(?:011|5[0-9]{2})[0-9]{12}$/'
    ];

    foreach ($patterns as $type => $pattern) {
      if (preg_match($pattern, $number)) {
        return $type;
      }
    }
    return 'UNKNOWN';
  }

  // 블랙리스트 카드 체크
  private function checkBlacklist($cardNumber)
  {
    $stmt = $this->conn->prepare("
            SELECT reason FROM card_blacklist 
            WHERE card_number = ? AND status = 'active'
        ");
    $stmt->bind_param('s', $cardNumber);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
      $row = $result->fetch_assoc();
      return $row['reason'];
    }
    return false;
  }

  // 결제 처리
  public function processPayment($paymentData)
  {
    try {
      // 입력값 정제
      $cardNumber = preg_replace('/\D/', '', $paymentData['cardNumber']);
      $expiryMonth = substr($paymentData['expiryDate'], 0, 2);
      $expiryYear = substr($paymentData['expiryDate'], -2);
      $cvv = $paymentData['cvv'];
      $amount = $paymentData['amount'];
      $cardType = $this->detectCardType($cardNumber);

      // 기본 유효성 검사
      if (!$this->validateCardNumber($cardNumber)) {
        throw new Exception("Invalid card number", 1001);
      }

      if (!$this->validateExpiryDate($expiryMonth, $expiryYear)) {
        throw new Exception("Card has expired", 1002);
      }

      if (!$this->validateCVV($cvv, $cardType)) {
        throw new Exception("Invalid CVV", 1003);
      }

      // 블랙리스트 체크
      $blacklistReason = $this->checkBlacklist($cardNumber);
      if ($blacklistReason) {
        throw new Exception("Card is blacklisted: " . $blacklistReason, 1004);
      }

      // 트랜잭션 시작
      $this->conn->begin_transaction();

      // 결제 정보 저장
      $stmt = $this->conn->prepare("
                INSERT INTO payment_transactions (
                    contact_form_id,
                    card_type,
                    card_last_four,
                    expiry_month,
                    expiry_year,
                    amount,
                    status,
                    transaction_date
                ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
            ");

      $contactFormId = $paymentData['contactFormId'];
      $lastFour = substr($cardNumber, -4);

      $stmt->bind_param(
        "issssd",
        $contactFormId,
        $cardType,
        $lastFour,
        $expiryMonth,
        $expiryYear,
        $amount
      );

      if (!$stmt->execute()) {
        throw new Exception("Failed to save payment information", 1005);
      }

      $transactionId = $this->conn->insert_id;

      // 여기에 실제 결제 게이트웨이 통신 코드 추가
      // ... 결제 게이트웨이 API 호출 ...

      // 결제 성공 처리
      $updateStmt = $this->conn->prepare("
                UPDATE payment_transactions 
                SET status = 'completed' 
                WHERE id = ?
            ");
      $updateStmt->bind_param("i", $transactionId);
      $updateStmt->execute();

      $this->conn->commit();

      $this->response['success'] = true;
      $this->response['message'] = "Payment processed successfully";
      $this->response['transaction_id'] = $transactionId;
    } catch (Exception $e) {
      $this->conn->rollback();
      $this->response['message'] = $e->getMessage();
      $this->response['error_code'] = $e->getCode();
      error_log("Payment Error: " . $e->getMessage());
    }

    return $this->response;
  }
}

// API 엔드포인트 처리
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  header('Content-Type: application/json');

  try {
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    $conn->set_charset("utf8mb4");

    $processor = new PaymentProcessor($conn);
    $result = $processor->processPayment($_POST);

    echo json_encode($result);
  } catch (Exception $e) {
    echo json_encode([
      'success' => false,
      'message' => "System error occurred",
      'error_code' => 500
    ]);
    error_log("System Error: " . $e->getMessage());
  } finally {
    if (isset($conn)) {
      $conn->close();
    }
  }
}
