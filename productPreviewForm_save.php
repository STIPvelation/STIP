<?php
// productPreviewForm_save.php
error_reporting(0);
ini_set('display_errors', 0);

// 출력 버퍼링 시작
ob_start();

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

ob_start();
header('Content-Type: application/json; charset=UTF-8');

// 응답 초기화
$response = [
  'success' => false,
  'message' => '',
  'data' => null,
  'debug' => DEBUG_MODE ? [] : null
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

  $input = json_decode(file_get_contents('php://input'), true);
  if (json_last_error() !== JSON_ERROR_NONE) {
    throw new Exception('JSON decode error: ' . json_last_error_msg());
  }

  // 입력 데이터 로깅
  if (DEBUG_MODE) {
    consoleLog(['Decoded Input' => $input], 'info');
  }

  // [이전 데이터베이스 연결 코드...]
  $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

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
} catch (Exception $e) {
  $response['success'] = false;
  $response['message'] = $e->getMessage();

  if (DEBUG_MODE) {
    $response['debug'] = [
      'error_type' => get_class($e),
      'error_message' => $e->getMessage(),
      'error_file' => $e->getFile(),
      'error_line' => $e->getLine(),
      'error_trace' => $e->getTraceAsString(),
      'server_info' => [
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'],
        'request_time' => date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME'])
      ]
    ];

    consoleLog([
      'Error Details' => $response['debug']
    ], 'error');
  }
} finally {
  if (isset($conn)) {
    if (DEBUG_MODE) {
      consoleLog(['Connection Stats' => [
        'thread_id' => $conn->thread_id,
        'affected_rows' => $conn->affected_rows,
        'insert_id' => $conn->insert_id
      ]], 'info');
    }
    $conn->close();
  }

  // 출력 버퍼 정리
  $output = ob_get_clean();

  if (DEBUG_MODE && !empty($output)) {
    consoleLog(['Additional Output' => $output], 'warn');
  }

  echo json_encode($response, DEBUG_MODE ? JSON_PRETTY_PRINT : 0);
}

// 처리 시간 로깅
if (DEBUG_MODE) {
  $executionTime = microtime(true) - $_SERVER["REQUEST_TIME_FLOAT"];
  consoleLog([
    'Execution Time' => round($executionTime * 1000, 2) . 'ms',
    'Memory Usage' => [
      'current' => memory_get_usage(true),
      'peak' => memory_get_peak_usage(true)
    ]
  ], 'info');
}

ob_clean();