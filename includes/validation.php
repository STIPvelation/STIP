<?php
// validation.php
class Validator {
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        return $data;
    }

    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) &&
               preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/', $email);
    }

    public static function validatePhone($phone) {
        // 국제 전화번호 형식 허용
        return preg_match('/^\+?[1-9]\d{1,14}$/', preg_replace('/[\s-]/', '', $phone));
    }
}