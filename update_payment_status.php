<?php
header('Content-Type: application/json; charset=UTF-8');
require_once 'config.php';

// 다국어 에러 메시지
$error_messages = [
  'ko' => [
    'db_error' => '데이터베이스 오류가 발생했습니다.',
    'payment_not_found' => '결제 정보를 찾을 수 없습니다.',
    'invalid_status' => '잘못된 상태값입니다.',
    'update_success' => '결제 상태가 업데이트되었습니다.'
  ],
  'en' => [
    'db_error' => 'A database error occurred.',
    'payment_not_found' => 'Payment information not found.',
    'invalid_status' => 'Invalid status value.',
    'update_success' => 'Payment status has been updated.'
  ],
  'ja' => [
    'db_error' => 'A database error occurred.',
    'payment_not_found' => 'Payment information not found.',
    'invalid_status' => 'Invalid status value.',
    'update_success' => 'Payment status has been updated.'
  ],
  'jz' => [
    'db_error' => 'A database error occurred.',
    'payment_not_found' => 'Payment information not found.',
    'invalid_status' => 'Invalid status value.',
    'update_success' => 'Payment status has been updated.'
  ]
  // 다른 언어 추가...
];

try {
  $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASSWORD);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  // POST 데이터 받기
  $payment_id = $_POST['payment_id'] ?? null;
  $status = $_POST['status'] ?? null;
  $transaction_id = $_POST['TID'] ?? null;
  $error_message = $_POST['ResultMsg'] ?? null;

  if (!$payment_id) {
    throw new Exception($error_messages[$lang]['payment_not_found']);
  }

  // 결제 상태 업데이트
  $sql = "UPDATE payment_info SET 
        status = :status,
        transaction_id = :transaction_id,
        error_message = :error_message,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = :payment_id";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':status' => $status,
    ':transaction_id' => $transaction_id,
    ':error_message' => $error_message,
    ':payment_id' => $payment_id
  ]);

  // contact_form 상태도 업데이트
  $sql = "UPDATE contact_form SET 
        status = :status 
        WHERE id = (
            SELECT contact_form_id 
            FROM payment_info 
            WHERE id = :payment_id
        )";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':status' => $status === 'completed' ? 'completed' : 'pending',
    ':payment_id' => $payment_id
  ]);

  echo json_encode([
    'success' => true,
    'message' => $error_messages[$lang]['update_success']
  ]);
} catch (Exception $e) {
  error_log("Payment status update error: " . $e->getMessage());
  echo json_encode([
    'success' => false,
    'message' => $error_messages[$lang]['db_error']
  ]);
}
