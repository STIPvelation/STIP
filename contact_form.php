<?php
// 디버깅을 위한 에러 표시 설정
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 데이터베이스 설정 파일 포함
require_once 'config/db_config.php';
require_once 'includes/validation.php';
require_once 'includes/notifications.php';

// CORS 헤더 설정
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

// OPTIONS 요청 처리
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// JSON 응답 헤더 설정
header('Content-Type: application/json; charset=UTF-8');

try {
    // 입력 데이터 확인
    $input = file_get_contents('php://input');
    if (empty($input)) {
        throw new Exception('No data received');
    }

    // JSON 디코딩
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    // 데이터 유효성 검사
    $data = Validator::sanitizeInput($data);
    
    // 이메일 및 전화번호 검증
    if (!Validator::validateEmail($data['email'])) {
        throw new Exception('올바른 이메일 형식이 아닙니다.');
    }

    if (!Validator::validatePhone($data['mobile'])) {
        throw new Exception('올바른 전화번호 형식이 아닙니다.');
    }

    // 필수 필드 확인
    $requiredFields = ['firstName', 'lastName', 'company', 'jobTitle', 'mobile', 'country', 'email', 'subject', 'message'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing required field: {$field}");
        }
    }

    // 데이터베이스 연결
    $db = Database::getInstance();

    // 트랜잭션 시작
    $db->beginTransaction();

    try {
        // 데이터 삽입
        $sql = "INSERT INTO contact_contact_form (
                    first_name, last_name, company, job_title, 
                    mobile, country, email, subject, message, 
                    ip_address, user_agent
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $db->prepare($sql);
        $stmt->bind_param("sssssssssss",
            $data['firstName'],
            $data['lastName'],
            $data['company'],
            $data['jobTitle'],
            $data['mobile'],
            $data['country'],
            $data['email'],
            $data['subject'],
            $data['message'],
            $_SERVER['REMOTE_ADDR'],
            $_SERVER['HTTP_USER_AGENT']
        );

        // 데이터 저장
        if ($stmt->execute()) {
            // 관리자 알림 발송
            NotificationManager::sendEmailNotification($data);
            NotificationManager::createDashboardNotification($data, $db);
            
            // 트랜잭션 커밋
            $db->commit();

            echo json_encode([
                'success' => true,
                'message' => '문의가 성공적으로 접수되었습니다.'
            ]);
        } else {
            throw new Exception('데이터 저장 중 오류가 발생했습니다.');
        }

    } catch (Exception $e) {
        // 오류 발생 시 롤백
        $db->rollback();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>