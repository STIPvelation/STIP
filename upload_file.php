<?php
// upload_file.php
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

// 업로드 디렉토리 설정
$uploadDir = '../uploads/' . date('Y/m/d') . '/'; // 날짜별 디렉토리 구조
if (!file_exists($uploadDir)) {
  mkdir($uploadDir, 0777, true);
}

// $response = array(
//   'success' => false,
//   'message' => '',
//   'files' => array()
// );

$response = [
  'success' => false,
  'message' => '',
  'files' => [],
  'debug' => []
];

try {
  // 디버그 정보 저장
  $response['debug']['request'] = $_FILES;
  $response['debug']['upload_dir'] = $uploadDir;

  if (!isset($_FILES['files'])) {
    throw new Exception($error_messages[$lang]['no_file']);
  }

  $files = $_FILES['files'];
  $allowedTypes = ['pdf', 'doc', 'docx'];
  $maxSize = 5 * 1024 * 1024; // 5MB

  // 파일 배열 정규화
  $filesArray = [];
  if (is_array($files['name'])) {
    for ($i = 0; $i < count($files['name']); $i++) {
      $filesArray[] = [
        'name' => $files['name'][$i],
        'type' => $files['type'][$i],
        'tmp_name' => $files['tmp_name'][$i],
        'error' => $files['error'][$i],
        'size' => $files['size'][$i]
      ];
    }
  } else {
    $filesArray[] = $files;
  }

  foreach ($filesArray as $file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
      throw new Exception("Upload error: " . $file['error']);
    }

    // 파일 유효성 검사
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedTypes)) {
      throw new Exception($error_messages[$lang]['invalid_type'] . $file['name']);
    }

    if ($file['size'] > $maxSize) {
      throw new Exception($error_messages[$lang]['size_exceeded'] . $file['name']);
    }

    // 안전한 파일명 생성
    $newFileName = uniqid('file_') . '_' . preg_replace('/[^a-zA-Z0-9\.]/', '_', $file['name']);
    $targetPath = $uploadDir . $newFileName;

    // 파일 업로드
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
      throw new Exception($error_messages[$lang]['upload_failed'] . $file['name']);
    }

    // 파일 정보 저장
    $response['files'][] = [
      'original_name' => $file['name'],
      'saved_name' => $newFileName,
      'path' => str_replace('../', '', $targetPath), // 상대 경로로 변환
      'size' => $file['size'],
      'type' => $file['type']
    ];
  }

  $response['success'] = true;
  $response['message'] = $error_messages[$lang]['success'];
  
} catch (Exception $e) {
  // $response['message'] = $e->getMessage();
  $response['success'] = false;
  $response['message'] = $e->getMessage();
  $response['error'] = [
    'type' => 'upload_error',
    'details' => $e->getMessage(),
    'file' => $e->getFile(),
    'line' => $e->getLine()
  ];

  // 에러 로깅
  error_log("File upload error: " . $e->getMessage());
} finally {
  // 디버그 정보 추가
  $response['debug']['server_time'] = date('Y-m-d H:i:s');
  $response['debug']['memory_usage'] = memory_get_usage(true);
  // echo json_encode($response);
}

echo json_encode($response);

ob_clean();
