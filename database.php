<?php
// Database.php
class Database
{
  private $conn;
  private $logger;

  public function __construct($config, Logger $logger)
  {
    $this->logger = $logger;

    try {
      $this->conn = new mysqli(
        $config['localhost'],
        // $config['root'],
        // $config['1234'],
        // $config['stipvelation']
        $config['sharetheipp'],
        $config['Leon0202!@'],
        $config['sharetheipp']
      );

      if ($this->conn->connect_error) {
        throw new Exception("Connection failed: " . $this->conn->connect_error);
      }

      $this->conn->set_charset("utf8mb4");
    } catch (Exception $e) {
      $this->logger->log($e->getMessage(), Logger::ERROR);
      throw $e;
    }
  }

  public function prepare($query)
  {
    $stmt = $this->conn->prepare($query);
    if (!$stmt) {
      $this->logger->log(
        "Prepare failed: " . $this->conn->error,
        Logger::ERROR,
        ['query' => $query]
      );
      throw new Exception("Prepare failed: " . $this->conn->error);
    }
    return $stmt;
  }

  public function beginTransaction()
  {
    $this->conn->begin_transaction();
  }

  public function commit()
  {
    $this->conn->commit();
  }

  public function rollback()
  {
    $this->conn->rollback();
  }
}