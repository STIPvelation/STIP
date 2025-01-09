<?php
require_once 'config.php';

// 모든 PHP 에러 출력 방지
error_reporting(0);
ini_set('display_errors', 0);

// 출력 버퍼링 시작 - JSON 출력 전에 발생할 수 있는 불필요한 출력을 방지
ob_start();

// JSON 응답을 위한 헤더 설정
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-cache, must-revalidate');

// CORS 헤더 설정 (필요한 경우)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// 개발 모드 설정
define('DEBUG_MODE', true);  // 개발 환경에서는 true, 운영 환경에서는 false

// 디버그 모드에 따른 에러 표시 설정
if (DEBUG_MODE) {
  error_reporting(E_ALL);
  ini_set('display_errors', 1);
} else {
  error_reporting(0);
  ini_set('display_errors', 0);
}


// 콘솔 로그 함수 정의
function consoleLog($data, $type = 'log')
{
  if (DEBUG_MODE) {
    $jsonData = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $output = "<script>console.{$type}(" . $jsonData . ");</script>\n";
    echo $output;
  }
}

// 에러 로그 함수
function logError($message, $context = [])
{
  if (DEBUG_MODE) {
    $logData = [
      'timestamp' => date('Y-m-d H:i:s'),
      'message' => $message,
      'context' => $context
    ];
    consoleLog($logData, 'error');
  }
  error_log($message);
}

// 데이터베이스 연결 설정
// $db_host = 'localhost';
// $db_user = 'root';
// $db_pass = '1234';
// $db_name = 'stipvelation';

// JSON 디코딩 에러 처리 함수
function handleJsonError()
{
  switch (json_last_error()) {
    case JSON_ERROR_NONE:
      return null;
    case JSON_ERROR_DEPTH:
      return 'Maximum stack depth exceeded';
    case JSON_ERROR_STATE_MISMATCH:
      return 'Underflow or the modes mismatch';
    case JSON_ERROR_CTRL_CHAR:
      return 'Unexpected control character found';
    case JSON_ERROR_SYNTAX:
      return 'Syntax error, malformed JSON';
    case JSON_ERROR_UTF8:
      return 'Malformed UTF-8 characters';
    default:
      return 'Unknown JSON error';
  }
}

// 안전한 JSON 인코딩 함수
function safeJsonEncode($data)
{
  $encoded = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  if ($encoded === false) {
    $error = handleJsonError();
    error_log("JSON encoding error: " . $error);
    return json_encode([
      'success' => false,
      'message' => 'JSON encoding error: ' . $error
    ]);
  }
  return $encoded;
}

// UTF-8 문자열 검증 및 정제
function sanitizeUtf8String($string)
{
  // 유효하지 않은 UTF-8 시퀀스 제거
  $string = mb_convert_encoding($string, 'UTF-8', 'UTF-8');
  // 제어 문자 제거
  $string = preg_replace('/[\x00-\x1F\x7F]/u', '', $string);
  return $string;
}

// 응답 초기화
$response = [
  'success' => false,
  'message' => '',
  'data' => null,
  'debug' => []
];

try {
  // 요청 데이터 로깅
  if (DEBUG_MODE) {
    consoleLog([
      'Request Method' => $_SERVER['REQUEST_METHOD'],
      'Raw Input' => file_get_contents('php://input'),
      'POST Data' => $_POST,
      'Headers' => getallheaders()
    ], 'info');
  }

  // POST 데이터 확인
  $rawInput = file_get_contents('php://input');
  if (!$rawInput) {
    throw new Exception('No input data received');
  }

  // JSON 디코딩 및 에러 체크
  $input = json_decode($rawInput, true);
  $jsonError = handleJsonError();
  if ($jsonError !== null
  ) {
    throw new Exception('JSON decode error: ' . $jsonError);
  }

  // 입력 데이터 검증 및 정제
  foreach ($input as $key => $value) {
    if (is_string($value)) {
      $input[$key] = sanitizeUtf8String($value);
    }
  }

  // JSON 요청 데이터 파싱
  // $input = file_get_contents('php://input');
  $data = json_decode($input, true);

  // 디버깅을 위한 요청 데이터 로깅
  $response['debug']['request_data'] = $data;

  // 입력 데이터 로깅
  if (DEBUG_MODE) {
    consoleLog(['Decoded Input' => $input], 'info');
  }

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
  // $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
  $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
  
  if ($conn->connect_error) {
    throw new Exception("Database connection failed: " . $conn->connect_error);
  }

  // 데이터베이스 쿼리 로깅
  if (DEBUG_MODE) {
    $conn->query("SET profiling = 1");
  }

  // 트랜잭션 시작
  $conn->begin_transaction();

  try {
    // SQL 쿼리 실행
    $stmt = $conn->prepare("INSERT INTO product_preview (product_code, product_name, quantity, price) VALUES (?, ?, ?, ?)");

    if (DEBUG_MODE && !$stmt) {
      consoleLog(['SQL Error' => $conn->error], 'error');
    }

    $stmt->bind_param(
      'ssid',
      $input['productCode'],
      $input['productName'],
      $input['quantity'],
      $input['price']
    );

    $stmt->execute();

    if (DEBUG_MODE) {
      // 쿼리 프로파일링 결과
      $result = $conn->query("SHOW PROFILES");
      $profiles = [];
      while ($row = $result->fetch_assoc()) {
        $profiles[] = $row;
      }
      consoleLog(['Query Profiles' => $profiles], 'info');
    }

    $conn->commit();

    $response['success'] = true;
    $response['message'] = 'Data saved successfully';
    $response['data'] = [
      'id' => $conn->insert_id,
      'productCode' => $input['productCode']
    ];
  } catch (Exception $e) {
    $conn->rollback();
    throw $e;
  }

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
