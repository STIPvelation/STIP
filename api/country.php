<?php
header('Content-Type: application/json; charset=UTF-8');

// 설정 파일 포함
require_once '../database/database.php';

try {
  // 데이터베이스 연결
  $pdo = new PDO(
    "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
    DB_USER,
    DB_PASSWORD,
    array(
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    )
  );

  // 국가 목록 조회 쿼리
  $query = "SELECT country_code, country_name FROM country ORDER BY country_name";
  $stmt = $pdo->prepare($query);
  $stmt->execute();

  // 결과 가져오기
  $countries = $stmt->fetchAll();

  // JSON 응답
  echo json_encode([
    'success' => true,
    'data' => $countries
  ]);
} catch (PDOException $e) {
  // 에러 응답
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => '데이터를 가져오는 중 오류가 발생했습니다.',
    'error' => $e->getMessage()
  ]);
}
