<?php
// use PHPMailer\PHPMailer\PHPMailer;
// use PHPMailer\PHPMailer\Exception;

// PHPMailer 로드
// require 'vendor/PHPMailer/PHPMailer/src/Exception.php';
// require 'vendor/PHPMailer/PHPMailer/src/PHPMailer.php';
// require 'vendor/PHPMailer/PHPMailer/src/SMTP.php';

require 'vendor/autoload.php'; // PHPMailer autoload

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);

    // 이메일 유효성 검사
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $mail = new PHPMailer(true);

        try {
            // 서버 설정
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com'; // SMTP 서버 주소
            $mail->SMTPAuth = true;
            $mail->Username = 'support@stipvelation.com'; // SMTP 사용자명
            $mail->Password = 'leon0202!@';  // SMTP 비밀번호
            // $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // 암호화 방식 (STARTTLS)
            // $mail->Port = 587; // SMTP 포트 번호

            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL 암호화
            $mail->Port = 465;                               // SMTP 포트

            // 발신자 정보
            $mail->setFrom('support@stipvelation.com', 'STIP Newsletter');
            $mail->addAddress($email); // 수신자 이메일

            // 이메일 내용
            $mail->isHTML(true);
            $mail->Subject = 'Thank you for subscribing!';
            $mail->Body = '<h1>Welcome to STIP Newsletter</h1><p>Thank you for subscribing to our newsletter. Stay tuned for updates!</p>';
            $mail->AltBody = 'Thank you for subscribing to our newsletter. Stay tuned for updates!';

            // 이메일 전송
            if ($mail->send()) {
                echo '<script>alert("Subscription successful! Check your email."); window.location.href="index.html";</script>';
            } else {
                echo '<script>alert("Failed to send email. Please try again."); window.location.href="index.html";</script>';
            }
        } catch (Exception $e) {
            echo '<script>alert("Message could not be sent. Mailer Error: ' . $mail->ErrorInfo . '"); window.location.href="index.html";</script>';
        }
    } else {
        echo '<script>alert("Invalid email address. Please try again."); window.location.href="index.html";</script>';
    }
} else {
    echo '<script>alert("Invalid request method."); window.location.href="index.html";</script>';
}
?>
