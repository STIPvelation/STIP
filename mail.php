<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 입력 값 가져오기
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);

    // 이메일 설정
    $to = "support@stipvelation.com";
    $subject = "New Inquiry from Website";
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // 이메일 내용
    $body = "Name: $name\n";
    $body .= "Email: $email\n";
    $body .= "Message:\n$message\n";

    // 메일 전송
    if (mail($to, $subject, $body, $headers)) {
        echo "메일이 성공적으로 전송되었습니다.";
    } else {
        echo "메일 전송에 실패했습니다. 다시 시도해주세요.";
    }
} else {
    echo "잘못된 요청입니다.";
}
?>
