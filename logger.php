<?php
// Logger.php
class Logger {
private $logFile;
private $logLevel;

const ERROR = 'ERROR';
const WARNING = 'WARNING';
const INFO = 'INFO';

public function __construct($logFile = null) {
$this->logFile = $logFile ?: __DIR__ . 'logs/app.log';
if (!file_exists(dirname($this->logFile))) {
mkdir(dirname($this->logFile), 0755, true);
}
}

public function log($message, $level = self::INFO, $context = []) {
$date = date('Y-m-d H:i:s');
$logMessage = sprintf(
"[%s] [%s] %s %s\n",
$date,
$level,
$message,
!empty($context) ? json_encode($context) : ''
);

error_log($logMessage, 3, $this->logFile);

if ($level === self::ERROR) {
// 심각한 오류일 경우 관리자에게 알림
$this->notifyAdmin($message, $context);
}
}

private function notifyAdmin($message, $context) {
// 이메일이나 슬랙 등으로 알림 구현
// ...
}
}