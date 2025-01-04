<?php
class PaymentValidator
{
  private static $cardPatterns = [
    'visa' => '/^4[0-9]{12}(?:[0-9]{3})?$/',
    'mastercard' => '/^5[1-5][0-9]{14}$/',
    'amex' => '/^3[47][0-9]{13}$/'
  ];

  public static function validateCard($cardNumber, $expiryDate, $cvv)
  {
    // 카드 번호 검증
    $cardNumber = preg_replace('/\D/', '', $cardNumber);
    if (!self::validateCardNumber($cardNumber)) {
      throw new ValidationException('Invalid card number');
    }

    // 만료일 검증
    if (!self::validateExpiryDate($expiryDate)) {
      throw new ValidationException('Invalid expiry date');
    }

    // CVV 검증
    if (!self::validateCVV($cvv)) {
      throw new ValidationException('Invalid CVV');
    }

    return true;
  }

  private static function validateCardNumber($number)
  {
    // Luhn 알고리즘 검증
    $sum = 0;
    $length = strlen($number);
    $parity = $length % 2;

    for ($i = $length - 1; $i >= 0; $i--) {
      $digit = intval($number[$i]);
      if ($i % 2 != $parity) {
        $digit *= 2;
        if ($digit > 9) {
          $digit -= 9;
        }
      }
      $sum += $digit;
    }

    return ($sum % 10 == 0);
  }

  private static function validateExpiryDate($expiryDate)
  {
    if (!preg_match('/^(0[1-9]|1[0-2])\/([0-9]{2})$/', $expiryDate, $matches)) {
      return false;
    }

    $month = $matches[1];
    $year = '20' . $matches[2];
    $expiry = \DateTime::createFromFormat('Y-m', $year . '-' . $month);
    $now = new \DateTime();

    return $expiry > $now;
  }

  private static function validateCVV($cvv)
  {
    return preg_match('/^[0-9]{3,4}$/', $cvv);
  }
}
