<?php

// defined('DEBUG_MODE', true);
define('DEBUG_MODE', true); // DEBUG_MODE 상수 정의
class Logger {
    private static $logFile = 'logs/payment.log';

    public static function init() {
        $logDir = dirname(self::$logFile);
        if (!file_exists($logDir)) {
            mkdir($logDir, 0777, true);
        }
    }

    public static function log($message, $level = 'INFO', $context = []) {
        self::init();
        
        $timestamp = date('Y-m-d H:i:s');
        $contextString = !empty($context) ? json_encode($context) : '';
        $logMessage = "[$timestamp] [$level] $message $contextString\n";
        
        file_put_contents(self::$logFile, $logMessage, FILE_APPEND);
    }

    public static function error($message, $context = []) {
        self::log($message, 'ERROR', $context);
    }

    public static function info($message, $context = []) {
        self::log($message, 'INFO', $context);
    }

    public static function debug($message, $context = []) {
        if (defined('DEBUG_MODE') && DEBUG_MODE) {
            self::log($message, 'DEBUG', $context);
        }
    }
}