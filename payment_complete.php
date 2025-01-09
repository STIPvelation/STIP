<?php
session_start();

require_once 'config.php';
require_once 'security_utils.php';
require_once 'payment_status_handler.php';

header('Content-Type: application/json; charset=UTF-8');

try {
  // 결제 응답 데이터 검증
  $paymentData = SecurityUtils::sanitizeInput($_POST);

  // DB 연결
  $pdo = new PDO(
    "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
    DB_USER,
    DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );

  $paymentHandler = new PaymentStatusHandler($pdo);

  // 결제 상태 업데이트
  $paymentHandler->updatePaymentStatus($paymentData['Moid'], $paymentData);

  // 성공 응답
  echo json_encode([
    'success' => true,
    'message' => '결제가 완료되었습니다.',
    'redirect' => 'listing.html'
  ]);
} catch (Exception $e) {
  echo json_encode([
    'success' => false,
    'message' => $e->getMessage(),
    'redirect' => 'listing.html'
  ]);
}
