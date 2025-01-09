<?php
// 보안 관련 설정 및 유틸리티 함수
class Security
{
  // 암호화 키 (안전한 방법으로 관리 필요)
  private static $encryptionKey = '적절한 암호화 키를 입력하세요';

  // 카드 번호 암호화
  public static function encryptCardNumber($cardNumber)
  {
    $method = "AES-256-CBC";
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($method));
    $encrypted = openssl_encrypt($cardNumber, $method, self::$encryptionKey, 0, $iv);
    return base64_encode($iv . $encrypted);
  }

  // 카드 번호 복호화
  public static function decryptCardNumber($encryptedData)
  {
    $method = "AES-256-CBC";
    $data = base64_decode($encryptedData);
    $ivSize = openssl_cipher_iv_length($method);
    $iv = substr($data, 0, $ivSize);
    $encrypted = substr($data, $ivSize);
    return openssl_decrypt($encrypted, $method, self::$encryptionKey, 0, $iv);
  }

  // XSS 방지
  public static function sanitizeInput($data)
  {
    if (is_array($data)) {
      return array_map([self::class, 'sanitizeInput'], $data);
    }
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
  }

  // CSRF 토큰 생성
  public static function generateCsrfToken()
  {
    if (!isset($_SESSION['csrf_token'])) {
      $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
  }

  // CSRF 토큰 검증
  public static function verifyCsrfToken($token)
  {
    if (!isset($_SESSION['csrf_token']) || $token !== $_SESSION['csrf_token']) {
      throw new Exception('CSRF token validation failed');
    }
    return true;
  }

  // API 요청 검증
  public static function validateApiRequest()
  {
    $headers = getallheaders();
    if (
      !isset($headers['X-Requested-With']) ||
      $headers['X-Requested-With'] !== 'XMLHttpRequest'
    ) {
      throw new Exception('Invalid API request');
    }
  }
}
