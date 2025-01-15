<?php
// save_product_preview.php

// 1. 기본 설정
session_start();
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// 2. 디버그 모드 설정
define('DEBUG_MODE', true);

// 3. 로그 함수 정의
function writeLog($message, $type = 'info') {
    $logFile = __DIR__ . '/logs/product_preview_' . date('Y-m-d') . '.log';
    $logMessage = date('Y-m-d H:i:s') . " [{$type}] " . $message . PHP_EOL;
    error_log($logMessage, 3, $logFile);
}

// 4. 가격 정리 함수
function cleanPrice($price) {
    return (float)str_replace(['₩', ','], '', $price);
}

// 5. 메인 로직
try {
    // 입력 데이터 받기
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input: ' . json_last_error_msg());
    }

    // PDO 연결 (.env 파일의 변수 사용)
    $dsn = "mysql:host=".$_ENV['DB_HOST'].";dbname=".$_ENV['DB_NAME'].";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ];

    $pdo = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], $options);

    // 트랜잭션 시작
    $pdo->beginTransaction();

    try {
        // 가격 정리
        $cleanPrice = cleanPrice($input['price']);

        // SQL 쿼리 준비 및 실행
        $sql = "INSERT INTO product_preview (
            product_code, 
            product_name, 
            quantity, 
            price,
            currency,
            created_at
        ) VALUES (
            :product_code,
            :product_name,
            :quantity,
            :price,
            :currency,
            NOW()
        )";

        $stmt = $pdo->prepare($sql);
        
        $result = $stmt->execute([
            ':product_code' => $input['productCode'],
            ':product_name' => $input['productName'],
            ':quantity' => $input['quantity'],
            ':price' => $cleanPrice,
            ':currency' => $input['currency']  // 통화 정보 추가
        ]);

        if (!$result) {
            throw new Exception('Failed to insert data');
        }

        $insertId = $pdo->lastInsertId();
        
        // 트랜잭션 커밋
        $pdo->commit();

        // 성공 응답
        echo json_encode([
            'success' => true,
            'message' => 'Data saved successfully',
            'data' => [
                'id' => $insertId,
                'productCode' => $input['productCode'],
                'currency' => $input['currency']  // 응답에 통화 정보 포함
            ]
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    writeLog("Error: " . $e->getMessage(), 'error');
    
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];

    if (DEBUG_MODE) {
        $response['debug'] = [
            'error_type' => get_class($e),
            'error_trace' => $e->getTraceAsString(),
            'error_file' => $e->getFile(),
            'error_line' => $e->getLine()
        ];
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

if (DEBUG_MODE) {
    writeLog(json_encode([
        'execution_time' => microtime(true) - $_SERVER["REQUEST_TIME_FLOAT"],
        'memory_usage' => memory_get_usage(true),
        'peak_memory_usage' => memory_get_peak_usage(true)
    ]), 'debug');
}