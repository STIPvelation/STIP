<?php
// update_order.php
require_once 'config.php';
header('Content-Type: application/json; charset=UTF-8');

// 데이터베이스 연결 설정
// $db_host = 'localhost';
// $db_user = 'root';
// $db_pass = '1234';
// $db_name = 'stipvelation';

try {
  // JSON 데이터 받기
  $data = json_decode(file_get_contents('php://input'), true);

  // 데이터베이스 연결
  // $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
  $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

  if ($conn->connect_error) {
    throw new Exception('Database connection failed: ' . $conn->connect_error);
  }

  // UTF-8 설정
  $conn->set_charset("utf8mb4");

  // order_form 테이블 업데이트
  $sql = "UPDATE order_form SET contact_form_id = ? WHERE id = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param('ii', $data['contact_form_id'], $data['order_id']);

  if (!$stmt->execute()) {
    throw new Exception('Failed to update order: ' . $stmt->error);
  }

  echo json_encode([
    'success' => true,
    'message' => 'Order updated successfully'
  ]);
} catch (Exception $e) {
  echo json_encode([
    'success' => false,
    'message' => $e->getMessage()
  ]);
} finally {
  if (isset($conn)) {
    $conn->close();
  }
}
