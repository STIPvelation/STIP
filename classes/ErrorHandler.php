<?php
define('DEBUG_MODE', true); // DEBUG_MODE 상수 정의
// 필요한 예외 클래스 정의
class ValidationException extends Exception {}
class PaymentException extends Exception {}
class ErrorHandler
{
  private static $errorMessages = [
    'ko' => [
      'system_error' => '시스템 오류가 발생했습니다.',
      'invalid_request' => '잘못된 요청입니다.',
      'payment_failed' => '결제 처리 중 오류가 발생했습니다.',
      'database_error' => '데이터베이스 오류가 발생했습니다.',
      'validation_error' => '입력값 검증에 실패했습니다.'
    ],
    'en' => [
      'system_error' => 'A system error occurred.',
      'invalid_request' => 'Invalid request.',
      'payment_failed' => 'Payment processing failed.',
      'database_error' => 'Database error occurred.',
      'validation_error' => 'Validation failed.'
    ],
    'ja' => [
      'system_error' => 'A system error occurred.',
      'invalid_request' => 'Invalid request.',
      'payment_failed' => 'Payment processing failed.',
      'database_error' => 'Database error occurred.',
      'validation_error' => 'Validation failed.'
    ],
    'jz' => [
      'system_error' => 'A system error occurred.',
      'invalid_request' => 'Invalid request.',
      'payment_failed' => 'Payment processing failed.',
      'database_error' => 'Database error occurred.',
      'validation_error' => 'Validation failed.'
    ]
    // 다른 언어 추가...
  ];

  public static function handleException($e, $lang = 'ko')
  {
    Logger::error($e->getMessage(), [
      'file' => $e->getFile(),
      'line' => $e->getLine(),
      'trace' => $e->getTraceAsString()
    ]);

    $errorType = self::getErrorType($e);
    $userMessage = self::getUserMessage($errorType, $lang);

    return [
      'success' => false,
      'error' => [
        'type' => $errorType,
        'message' => $userMessage,
        'debug' => DEBUG_MODE ? $e->getMessage() : null
      ]
    ];
  }

  private static function getErrorType($e)
  {
    if ($e instanceof PDOException) {
      return 'database_error';
    }
    if ($e instanceof ValidationException) {
      return 'validation_error';
    }
    if ($e instanceof PaymentException) {
      return 'payment_failed';
    }
    return 'system_error';
  }

  private static function getUserMessage($errorType, $lang)
  {
    return self::$errorMessages[$lang][$errorType] ??
      self::$errorMessages['en'][$errorType] ??
      'An error occurred.';
  }
}
