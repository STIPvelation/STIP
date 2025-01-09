<?php
session_start();
require_once 'security_utils.php';

class PaymentStatusHandler
{
  private $pdo;
  private $securityUtils;

  public function __construct(PDO $pdo)
  {
    $this->pdo = $pdo;
    $this->securityUtils = new SecurityUtils();
  }

  // 결제 상태 업데이트
  public function updatePaymentStatus($orderId, $paymentData)
  {
    try {
      $this->pdo->beginTransaction();

      // 주문 정보 조회
      $stmt = $this->pdo->prepare("
                SELECT * FROM order_form 
                WHERE order_id = ? AND payment_status = 'pending'
            ");
      $stmt->execute([$orderId]);
      $order = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$order) {
        throw new Exception('유효하지 않은 주문입니다.');
      }

      // 결제 금액 검증
      if (!SecurityUtils::validatePaymentAmount($paymentData['Amt'], $order['price'])) {
        throw new Exception('결제 금액이 일치하지 않습니다.');
      }

      // 결제 상태 업데이트
      $stmt = $this->pdo->prepare("
                UPDATE order_form SET
                    payment_status = :status,
                    transaction_id = :tid,
                    paid_amount = :amount,
                    payment_response_code = :response_code,
                    payment_response_message = :response_msg,
                    paid_at = NOW(),
                    updated_at = NOW()
                WHERE order_id = :order_id
            ");

      $stmt->execute([
        ':status' => 'completed',
        ':tid' => $paymentData['TxTid'],
        ':amount' => $paymentData['Amt'],
        ':response_code' => $paymentData['AuthCode'],
        ':response_msg' => $paymentData['AuthMsg'],
        ':order_id' => $orderId
      ]);

      // 결제 로그 기록
      $this->logPaymentResult($orderId, $paymentData);

      $this->pdo->commit();
      return true;
    } catch (Exception $e) {
      $this->pdo->rollBack();
      $this->logError($e->getMessage(), $orderId);
      throw $e;
    }
  }

  // 결제 로그 기록
  private function logPaymentResult($orderId, $paymentData)
  {
    $stmt = $this->pdo->prepare("
            INSERT INTO payment_logs (
                order_id,
                transaction_id,
                payment_method,
                amount,
                response_code,
                response_message,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");

    $stmt->execute([
      $orderId,
      $paymentData['TxTid'],
      $paymentData['PayMethod'],
      $paymentData['Amt'],
      $paymentData['AuthCode'],
      $paymentData['AuthMsg']
    ]);
  }

  // 에러 로그 기록
  private function logError($message, $orderId)
  {
    $stmt = $this->pdo->prepare("
            INSERT INTO error_logs (
                order_id,
                error_message,
                created_at
            ) VALUES (?, ?, NOW())
        ");

    $stmt->execute([$orderId, $message]);
  }
}
