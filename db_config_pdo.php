<?php
// db_config.php PDO 스타일

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

// PDO 데이터베이스 연결 클래스
class Database
{
    private $pdo;
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
            $dsn = "mysql:host={$this->config['host']};dbname={$this->config['database']};charset={$this->config['charset']};port={$this->config['port']}";
            
            // PDO 옵션 설정
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            $this->pdo = new PDO(
                $dsn,
                $this->config['username'],
                $this->config['password'],
                $options
            );

            // 타임존 설정
            $this->pdo->exec("SET time_zone = '+09:00'");
            
        } catch (PDOException $e) {
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
    public function query($sql, $params = [])
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query Error: " . $e->getMessage());
            throw new Exception("Query execution failed");
        }
    }

    // Prepared Statement 생성
    public function prepare($sql)
    {
        try {
            return $this->pdo->prepare($sql);
        } catch (PDOException $e) {
            error_log("Prepare Error: " . $e->getMessage());
            throw new Exception("Statement preparation failed");
        }
    }

    // 트랜잭션 시작
    public function beginTransaction()
    {
        return $this->pdo->beginTransaction();
    }

    // 트랜잭션 커밋
    public function commit()
    {
        return $this->pdo->commit();
    }

    // 트랜잭션 롤백
    public function rollback()
    {
        return $this->pdo->rollBack();
    }

    // 마지막 삽입 ID 반환
    public function lastInsertId()
    {
        return $this->pdo->lastInsertId();
    }

    // 연결 종료
    public function close()
    {
        $this->pdo = null;
    }

    // PDO 객체 반환
    public function getPdo()
    {
        return $this->pdo;
    }

    // 데이터 바인딩 실행
    public function execute($stmt, $params = [])
    {
        try {
            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Execute Error: " . $e->getMessage());
            throw new Exception("Statement execution failed");
        }
    }

    // 단일 행 조회
    public function fetchOne($sql, $params = [])
    {
        try {
            $stmt = $this->query($sql, $params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("FetchOne Error: " . $e->getMessage());
            throw new Exception("Fetch operation failed");
        }
    }

    // 전체 행 조회
    public function fetchAll($sql, $params = [])
    {
        try {
            $stmt = $this->query($sql, $params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("FetchAll Error: " . $e->getMessage());
            throw new Exception("FetchAll operation failed");
        }
    }

    // 데이터 이스케이프 처리
    public function quote($value)
    {
        return $this->pdo->quote($value);
    }
}

// 환경 변수 설정 (개발 환경용)
if (!getenv('DB_HOST')) {
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