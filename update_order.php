<?php
// update_order.php
require_once __DIR__ . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

header('Content-Type: application/json; charset=UTF-8');

try {
    // PDO 데이터베이스 연결
    $dsn = sprintf("mysql:host=%s;dbname=%s;charset=utf8mb4", 
        $_ENV['DB_HOST'], 
        $_ENV['DB_NAME']
    );
    
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $pdo = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], $options);

    // JSON 데이터 받기
    $data = json_decode(file_get_contents('php://input'), true);
    
    // 데이터 검증
    if (!isset($data['contact_form_id']) || !isset($data['order_id'])) {
        throw new ValidationException('필수 데이터가 누락되었습니다.');
    }

    // Order 업데이트
    $sql = "UPDATE order_form 
            SET contact_form_id = :contact_form_id,
                updated_at = NOW() 
            WHERE id = :order_id";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'contact_form_id' => $data['contact_form_id'],
        'order_id' => $data['order_id']
    ]);
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('해당하는 주문을 찾을 수 없습니다.');
    }
    
    echo json_encode([
        'success' => true,
        'message' => '주문이 성공적으로 업데이트되었습니다.'
    ]);

} catch (PDOException $e) {
    Logger::error('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '데이터베이스 오류가 발생했습니다.'
    ]);
} catch (Exception $e) {
    Logger::error('General error: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}