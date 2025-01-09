<?php
require_once 'db_config.php';
require_once 'Logger.php';
require_once 'PaymentProcessor.php';

header('Content-Type: application/json');

try {
  $db = new Database($config);
  $logger = new Logger();
  $processor = new PaymentProcessor($db, $logger);

  // 결제 처리
  $result = $processor->processPayment($_POST);

  if ($result['success']) {
    // 결제 성공 시 contact_form 상태 업데이트
    $sql = "UPDATE contact_form SET status = 'paid' WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->bind_param("i", $_POST['contact_id']);
    $stmt->execute();

    echo json_encode([
      'success' => true,
      'message' => '결제가 완료되었습니다.'
    ]);
  } else {
    throw new Exception($result['message']);
  }
} catch (Exception $e) {
  $logger->log($e->getMessage(), Logger::ERROR);
  echo json_encode([
    'success' => false,
    'message' => $e->getMessage()
  ]);
}
