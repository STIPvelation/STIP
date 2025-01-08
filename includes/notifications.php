<?php
// notifications.php
class NotificationManager {
    public static function sendEmailNotification($formData) {
        $to = "support@stipvelation.com";
        $subject = "새로운 문의가 접수되었습니다.";
        
        $message = "
        <html>
        <head>
            <title>새로운 문의 접수</title>
        </head>
        <body>
            <h2>문의 내용</h2>
            <p><strong>이름:</strong> {$formData['firstName']} {$formData['lastName']}</p>
            <p><strong>회사:</strong> {$formData['company']}</p>
            <p><strong>이메일:</strong> {$formData['email']}</p>
            <p><strong>문의내용:</strong> {$formData['message']}</p>
        </body>
        </html>
        ";

        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=utf-8',
            'From: noreply@example.com'
        ];

        return mail($to, $subject, $message, implode("\r\n", $headers));
    }

    public static function createDashboardNotification($formData, $db) {
        $sql = "INSERT INTO admin_notifications (type, message, status) 
                VALUES ('contact_form', ?, 'unread')";
        $message = "새로운 문의: {$formData['firstName']} {$formData['lastName']}님으로부터";
        
        $stmt = $db->prepare($sql);
        $stmt->bind_param("s", $message);
        return $stmt->execute();
    }
}