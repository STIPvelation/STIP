<?php
// 데이터베이스 연결 정보
$host = "localhost";
$dbname = "your_database_name";
$username = "your_username";
$password = "your_password";

// 데이터베이스 연결
$conn = new mysqli($host, $username, $password, $dbname);

// 연결 오류 확인
if ($conn->connect_error) {
  http_response_code(500);
  die("Database connection failed.");
}

// 국가 정보를 가져오는 SQL 쿼리
$sql = "SELECT country_code, country_name FROM iso_countries ORDER BY country_name";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
  $countries = [];

  while ($row = $result->fetch_assoc()) {
    $countries[] = [
      "code" => $row["country_code"],
      "name" => $row["country_name"]
    ];
  }

  // JSON 형식으로 반환
  header("Content-Type: application/json");
  echo json_encode($countries);
} else {
  http_response_code(404);
  echo json_encode(["message" => "No countries found."]);
}

// 연결 종료
$conn->close();
