<?php
header('Content-Type: application/json; charset=UTF-8');

// 에러 출력 방지
error_reporting(0);
ini_set('display_errors', 0);

// 응답 초기화
$response = [
  'success' => false,
  'message' => '',
  'debug' => []
];

try {
  // JSON 요청 데이터 파싱
  $input = file_get_contents('php://input');
  $data = json_decode($input, true);

  // 디버깅을 위한 요청 데이터 로깅
  $response['debug']['request_data'] = $data;

  // 필수 필드 검증
  $requiredFields = ['orderName', 'orderEmail', 'orderPhone'];
  foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
      throw new Exception("필수 필드 누락: {$field}");
    }
  }

  // 이메일 형식 검증
  if (!filter_var($data['orderEmail'], FILTER_VALIDATE_EMAIL)) {
    throw new Exception('올바른 이메일 형식이 아닙니다.');
  }

  // 개인정보 동의 확인
  if ($data['privacyConsent'] !== 'Y') {
    throw new Exception('개인정보 수집 동의가 필요합니다.');
  }

  // 주문 ID 생성
  $orderId = 'ORD_' . time() . '_' . mt_rand(1000, 9999);

  // 여기에 데이터베이스 저장 로직 추가

  // 성공 응답
  $response['success'] = true;
  $response['message'] = '주문이 성공적으로 처리되었습니다.';
  $response['order_id'] = $orderId;
  $response['data'] = [
    'orderName' => $data['orderName'],
    'orderEmail' => $data['orderEmail'],
    'orderPhone' => $data['orderPhone'],
    'productName' => $data['productName'],
    'price' => $data['price']
  ];
} catch (Exception $e) {
  $response['message'] = $e->getMessage();
  $response['debug']['error'] = [
    'message' => $e->getMessage(),
    'file' => $e->getFile(),
    'line' => $e->getLine()
  ];
} finally {
  // JSON 응답 전송
  echo json_encode($response);
  exit;
}
