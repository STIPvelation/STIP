<?php
// db_config.php

// 데이터베이스 접속 정보를 환경 변수에서 로드
function getDbConfig()
{
  return [
    'host' => getenv('DB_HOST') ?: 'localhost',
    // 'username' => getenv('DB_USER') ?: 'sharetheipp',
    // 'password' => getenv('DB_PASSWORD') ?: 'Leon0202!@',
    // 'database' => getenv('DB_NAME') ?: 'sharetheipp',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASSWORD') ?: '1234',
    'database' => getenv('DB_NAME') ?: 'stipvelation',
    'charset' => 'utf8mb4',
    'port' => getenv('DB_PORT') ?: 3306
  ];
}

// 데이터베이스 연결 클래스
class Database
{
  private $conn;
  private static $instance = null;
  private $config;

  public function __construct()
  {
    $this->config = getDbConfig();
    $this->connect();
  }

  // 데이터베이스 연결
  private function connect()
  {
    try {
      $this->conn = new mysqli(
        $this->config['host'],
        $this->config['username'],
        $this->config['password'],
        $this->config['database'],
        $this->config['port']
      );

      // 연결 오류 확인
      if ($this->conn->connect_error) {
        throw new Exception("Connection failed: " . $this->conn->connect_error);
      }

      // 문자셋 설정
      $this->conn->set_charset($this->config['charset']);

      // 타임존 설정
      $this->conn->query("SET time_zone = '+09:00'");
    } catch (Exception $e) {
      error_log("Database Connection Error: " . $e->getMessage());
      throw new Exception("Database connection failed");
    }
  }

  // 싱글톤 패턴 구현
  public static function getInstance()
  {
    if (self::$instance === null) {
      self::$instance = new self();
    }
    return self::$instance;
  }

  // 쿼리 실행
  public function query($sql)
  {
    try {
      $result = $this->conn->query($sql);
      if ($result === false) {
        throw new Exception("Query failed: " . $this->conn->error);
      }
      return $result;
    } catch (Exception $e) {
      error_log("Query Error: " . $e->getMessage());
      throw new Exception("Query execution failed");
    }
  }

  // Prepared Statement 생성
  public function prepare($sql)
  {
    try {
      $stmt = $this->conn->prepare($sql);
      if ($stmt === false) {
        throw new Exception("Prepare failed: " . $this->conn->error);
      }
      return $stmt;
    } catch (Exception $e) {
      error_log("Prepare Error: " . $e->getMessage());
      throw new Exception("Statement preparation failed");
    }
  }

  // 트랜잭션 시작
  public function beginTransaction()
  {
    $this->conn->begin_transaction();
  }

  // 트랜잭션 커밋
  public function commit()
  {
    $this->conn->commit();
  }

  // 트랜잭션 롤백
  public function rollback()
  {
    $this->conn->rollback();
  }

  // 마지막 삽입 ID 반환
  public function lastInsertId()
  {
    return $this->conn->insert_id;
  }

  // 연결 종료
  public function close()
  {
    if ($this->conn) {
      $this->conn->close();
    }
  }

  // 연결 객체 반환
  public function getConnection()
  {
    return $this->conn;
  }

  // 에러 메시지 반환
  public function getError()
  {
    return $this->conn->error;
  }

  // 데이터 이스케이프 처리
  public function escape($string)
  {
    return $this->conn->real_escape_string($string);
  }
}

// 환경 변수 설정 (개발 환경용)
if (!getenv('DB_HOST')) {
  // .env 파일이 있다면 로드
  if (file_exists(__DIR__ . '/.env')) {
    $envFile = file_get_contents(__DIR__ . '/.env');
    $lines = explode("\n", $envFile);
    foreach ($lines as $line) {
      if (strpos($line, '=') !== false) {
        list($key, $value) = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($value));
      }
    }
  }
}

// 데이터베이스 설정 배열
$config = getDbConfig();

// 전역 에러 핸들러 설정
function handleDatabaseError($errno, $errstr, $errfile, $errline)
{
  error_log("Database Error [$errno]: $errstr in $errfile on line $errline");
  header('HTTP/1.1 500 Internal Server Error');
  if (getenv('ENVIRONMENT') === 'development') {
    echo json_encode([
      'error' => 'Database error occurred',
      'message' => $errstr,
      'file' => $errfile,
      'line' => $errline
    ]);
  } else {
    echo json_encode([
      'error' => 'An internal error occurred'
    ]);
  }
  exit;
}
set_error_handler('handleDatabaseError', E_ALL & ~E_NOTICE & ~E_WARNING);
