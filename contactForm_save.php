<?php
// 모든 PHP 에러 출력 방지
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=UTF-8');

// 출력 버퍼링 시작
ob_start();

// 설정 파일 포함
// require_once 'config/database.php';

// 데이터베이스 연결 설정
// $db_user = 'sharetheipp';
// $db_pass = 'Leon0202!@';
// $db_name = 'sharetheipp';

// $db_host = 'localhost';
// $db_user = 'root';
// $db_pass = '1234';
// $db_name = 'stipvelation';

// 다국어 에러 메시지 정의
$error_messages = [
  'ko' => [
    'db_connection_failed' => '데이터베이스 연결에 실패했습니다: ',
    'required_fields' => '모든 필드를 입력해주세요.',
    'invalid_email' => '올바른 이메일 형식이 아닙니다.',
    'table_creation_failed' => '테이블 생성에 실패했습니다: ',
    'query_preparation_failed' => '쿼리 준비에 실패했습니다: ',
    'query_execution_failed' => '쿼리 실행에 실패했습니다: ',
    'success' => '데이터가 성공적으로 저장되었습니다.',
    'file_info_missing' => '파일 정보가 누락되었습니다.'
  ],
  'en' => [
    'db_connection_failed' => 'Database connection failed: ',
    'required_fields' => 'All fields are required.',
    'invalid_email' => 'Invalid email format.',
    'table_creation_failed' => 'Table creation failed: ',
    'query_preparation_failed' => 'Query preparation failed: ',
    'query_execution_failed' => 'Query execution failed: ',
    'success' => 'Data saved successfully',
    'file_info_missing' => 'File information is missing.'
  ],
  'ja' => [
    'db_connection_failed' => 'データベース接続に失敗しました: ',
    'required_fields' => '全ての項目を入力してください。',
    'invalid_email' => 'メールアドレスの形式が正しくありません。',
    'table_creation_failed' => 'テーブルの作成に失敗しました: ',
    'query_preparation_failed' => 'クエリの準備に失敗しました: ',
    'query_execution_failed' => 'クエリの実行に失敗しました: ',
    'success' => 'データが正常に保存されました。',
    'file_info_missing' => 'File information is missing.'
  ],
  'zh' => [
    'db_connection_failed' => '数据库连接失败: ',
    'required_fields' => '请填写所有字段。',
    'invalid_email' => '邮箱格式不正确。',
    'table_creation_failed' => '创建表失败: ',
    'query_preparation_failed' => '查询准备失败: ',
    'query_execution_failed' => '查询执行失败: ',
    'success' => '数据保存成功',
    'file_info_missing' => 'File information is missing.'
  ]
];

// 언어 설정 가져오기 (기본값: ko)
$lang = isset($_POST['lang']) ? $_POST['lang'] : 'ko';
if (!array_key_exists($lang, $error_messages)) {
  $lang = 'ko';
}

// 응답 초기화
$response = [
  'success' => false,
  'message' => '',
  'data' => null,
  'debug' => []
];

try {
  // 데이터베이스 연결
  $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

  // 연결 체크
  if ($conn->connect_error) {
    throw new Exception($error_messages[$lang]['db_connection_failed'] . $conn->connect_error);
  }


  // UTF-8 설정
  $conn->set_charset("utf8mb4");

  // POST 데이터 검증 및 정제
  $formData = array(
    'country_code' => isset($_POST['country']) ? $conn->real_escape_string(trim($_POST['country'])) : '',
    'name' => isset($_POST['name']) ? $conn->real_escape_string(trim($_POST['name'])) : '',
    'email' => isset($_POST['email']) ? $conn->real_escape_string(trim($_POST['email'])) : '',
    'mobile' => isset($_POST['mobile']) ? $conn->real_escape_string(trim($_POST['mobile'])) : '',
    'product_code' => isset($_POST['productCode']) ? $conn->real_escape_string(trim($_POST['productCode'])) : '',
    'product_name' => isset($_POST['productName']) ? $conn->real_escape_string(trim($_POST['productName'])) : '',
    'submit_date' => date('Y-m-d H:i:s'),
    'ip_address' => $_SERVER['REMOTE_ADDR']
  );


  // 필수 필드 검증
  $requiredFields = ['country_code', 'name', 'email', 'mobile'];
  foreach ($requiredFields as $field) {
    if (empty($formData[$field])) {
      throw new Exception($error_messages[$lang]['required_fields']);
    }
  }

  // 이메일 검증
  if (!filter_var($formData['email'], FILTER_VALIDATE_EMAIL)) {
    throw new Exception($error_messages[$lang]['invalid_email']);
  }

  // 파일 정보 처리
  $fileInfo = isset($_POST['fileInfo']) ? json_decode($_POST['fileInfo'], true) : null;
  if ($fileInfo) {
    foreach ($fileInfo as $file) {
      $formData['file_name'] = $conn->real_escape_string($file['original_name']);
      $formData['file_path'] = $conn->real_escape_string($file['path']);
      $formData['file_size'] = intval($file['size']);
      $formData['file_type'] = $conn->real_escape_string($file['type']);
    }
  }

  // 테이블 존재 여부 확인 및 생성
  $checkTableSQL = "SHOW TABLES LIKE 'contact_form'";
  $result = $conn->query($checkTableSQL);

  if ($result->num_rows == 0) {
    $createTableSQL = "CREATE TABLE contact_form (
            id INT(11) NOT NULL AUTO_INCREMENT,
            country_code VARCHAR(2) NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            mobile VARCHAR(20) NOT NULL,            
            product_code VARCHAR(10) NOT NULL,
            product_name VARCHAR(100) NOT NULL,
            submit_date DATETIME NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(255) NOT NULL,
            file_size INT(11) NOT NULL,
            file_type VARCHAR(50) NOT NULL,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    if (!$conn->query($createTableSQL)) {
      throw new Exception($error_messages[$lang]['table_creation_failed'] . $conn->error);
    }
  }  

  // SQL 쿼리 준비
  $sql = "INSERT INTO contact_form (
        country_code, name, email, mobile,
        product_code, product_name, submit_date,
        ip_address, status, file_name, file_path,
        file_size, file_type
    ) VALUES (
        ?, ?, ?, ?, 
        ?, ?, ?,
        ?, 'pending', ?, ?,
        ?, ?
    )";

  // Prepared Statement 생성
  $stmt = $conn->prepare($sql);
  if (!$stmt) {
    throw new Exception($error_messages[$lang]['query_preparation_failed'] . $conn->error);
  } 

  // 파라미터 바인딩
  $stmt->bind_param(
    'sssssssssssi',
    $formData['country_code'],
    $formData['name'],
    $formData['email'],
    $formData['mobile'],
    $formData['product_code'],
    $formData['product_name'],
    $formData['submit_date'],
    $formData['ip_address'],
    $formData['file_name'],
    $formData['file_path'],
    $formData['file_size'],
    $formData['file_type']
  );

  // 쿼리 실행
  if (!$stmt->execute()) {
    throw new Exception($error_messages[$lang]['query_execution_failed'] . $stmt->error);
  }

  // 성공 응답
  $response['success'] = true;
  $response['message'] = $error_messages[$lang]['success'];
  $response['data'] = [
    'id' => $conn->insert_id,
    'submit_date' => $formData['submit_date']
  ];

  // // 데이터 저장 성공
  // $response['success'] = true;
  // $response['message'] = "Data saved successfully";
  // $response['contact_id'] = $conn->insert_id;

  // // Statement 종료
  // $stmt->close();

  // 성공 응답
  $response['success'] = true;
  $response['message'] = $error_messages[$lang]['success'];
  $response['contact_id'] = $conn->insert_id;

  // Statement 종료
  $stmt->close();
} catch (Exception $e) {
  // $response['message'] = $e->getMessage();
  // error_log("Error in contactForm_save.php: " . $e->getMessage());
  $response['success'] = false;
  $response['message'] = $e->getMessage();
  $response['error'] = [
    'type' => 'database_error',
    'details' => $e->getMessage(),
    'file' => $e->getFile(),
    'line' => $e->getLine()
  ];
  error_log("Error in contactForm_save.php: " . $e->getMessage());
} finally {
  // 데이터베이스 연결 종료
  if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
  }

  // 출력 버퍼 클리어
  ob_clean();

  // 디버그 정보 추가
  $response['debug'] = [
    'post_data' => $_POST,
    'files_data' => $_FILES,
    'server_time' => date('Y-m-d H:i:s'),
    'memory_usage' => memory_get_usage(true)
  ];

  // JSON 응답 전송
  echo json_encode($response);
}
