<?php
class SecurityUtils
{
  // CSRF 토큰 생성
  public static function generateCSRFToken()
  {
    if (empty($_SESSION['csrf_token'])) {
      $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
  }

  // CSRF 토큰 검증
  public static function validateCSRFToken($token)
  {
    if (empty($_SESSION['csrf_token']) || $token !== $_SESSION['csrf_token']) {
      throw new Exception('보안 토큰이 유효하지 않습니다.');
    }
  }

  // XSS 방지를 위한 데이터 정화
  public static function sanitizeInput($data)
  {
    if (is_array($data)) {
      return array_map([self::class, 'sanitizeInput'], $data);
    }
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
  }

  // SQL Injection 방지를 위한 데이터 검증
  public static function validateSQLInput($input)
  {
    return preg_match('/[\'^£$%&*()}{@#~?><>,|=_+¬-]/', $input) ? false : true;
  }

  // 결제 금액 검증
  public static function validatePaymentAmount($amount, $expectedAmount)
  {
    return bccomp($amount, $expectedAmount, 2) === 0;
  }
}
