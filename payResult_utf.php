<?php
header("Content-Type:text/html; charset=utf-8;"); 

// 1. 로깅 함수 추가
function writeLog($message, $type = 'info') {
    $logFile = __DIR__ . '/logs/payment_' . date('Y-m-d') . '.log';
    $logMessage = date('Y-m-d H:i:s') . " [{$type}] " . $message . PHP_EOL;
    error_log($logMessage, 3, $logFile);
}

// 2. 결제 결과 파라미터 받기
$authResultCode = $_POST['AuthResultCode'];
$authResultMsg = $_POST['AuthResultMsg'];
$txTid = $_POST['TxTid'];
$authToken = $_POST['AuthToken'];
$payMethod = $_POST['PayMethod'];
$mid = $_POST['MID'];
$moid = $_POST['Moid'];
$amt = $_POST['Amt'];

// 3. 결제 검증
try {
    // 해시 검증
    $merchantKey = $_ENV['NICE_MERCHANT_KEY'];
    $ediDate = date("YmdHis");
    $signData = bin2hex(hash('sha256', $authToken . $mid . $amt . $ediDate . $merchantKey, true));

    // 결제 성공 시
    if($authResultCode === "0000") {
        // 결제 승인 요청
        $data = [
            'TID' => $txTid,
            'AuthToken' => $authToken,
            'MID' => $mid,
            'Amt' => $amt,
            'EdiDate' => $ediDate,
            'SignData' => $signData,
            'CharSet' => 'utf-8'
        ];
        
        // 승인 요청
        $response = reqPost($data, $_POST['NextAppURL']);
        writeLog("Payment approval response: " . json_encode($response), 'info');

        // DB 업데이트
        require_once 'config/db_config_pdo.php';
        $pdo->beginTransaction();
        
        try {
            // 주문 상태 업데이트
            $sql = "UPDATE order_form SET 
                payment_status = 'completed',
                transaction_id = :tid,
                paid_amount = :amount,
                payment_date = NOW(),
                payment_result_code = :result_code,
                payment_result_msg = :result_msg
                WHERE order_id = :moid";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':tid' => $txTid,
                ':amount' => $amt,
                ':result_code' => $authResultCode,
                ':result_msg' => $authResultMsg,
                ':moid' => $moid
            ]);
            
            $pdo->commit();

            // 성공 응답
            $successResponse = [
                'success' => true,
                'message' => '결제가 완료되었습니다.',
                'data' => [
                    'orderId' => $moid,
                    'transactionId' => $txTid,
                    'amount' => $amt,
                    'paymentMethod' => $payMethod
                ]
            ];
            
            echo "<script>
                if (window.opener && window.opener.paymentHandler) {
                    window.opener.paymentHandler.handlePaymentSuccess(" . json_encode($successResponse) . ");
                    window.close();
                } else {
                    window.location.href = 'listing.html?payment=success&order_id=" . $moid . "';
                }
            </script>";

        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }

    } else {
        // 결제 실패 처리
        writeLog("Payment failed: " . $authResultMsg, 'error');
        
        $errorResponse = [
            'success' => false,
            'message' => $authResultMsg,
            'code' => $authResultCode
        ];
        
        echo "<script>
            if (window.opener && window.opener.paymentHandler) {
                window.opener.paymentHandler.handlePaymentError(" . json_encode($errorResponse) . ");
                window.close();
            } else {
                window.location.href = 'listing.html?payment=error&message=" . urlencode($authResultMsg) . "';
            }
        </script>";
    }

} catch (Exception $e) {
    writeLog("Error in payment processing: " . $e->getMessage(), 'error');
    
    // 망취소 처리
    if (isset($txTid)) {
        $cancelData = [
            'TID' => $txTid,
            'AuthToken' => $authToken,
            'MID' => $mid,
            'Amt' => $amt,
            'EdiDate' => $ediDate,
            'SignData' => $signData,
            'NetCancel' => '1',
            'CharSet' => 'utf-8'
        ];
        reqPost($cancelData, $_POST['NetCancelURL']);
    }
    
    // 에러 응답
    $errorResponse = [
        'success' => false,
        'message' => '결제 처리 중 오류가 발생했습니다.',
        'error' => $e->getMessage()
    ];
    
    echo "<script>
        if (window.opener && window.opener.paymentHandler) {
            window.opener.paymentHandler.handlePaymentError(" . json_encode($errorResponse) . ");
            window.close();
        } else {
            window.location.href = 'listing.html?payment=error&message=" . urlencode($e->getMessage()) . "';
        }
    </script>";
}

// API 호출 함수
function reqPost(Array $data, $url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_POST, true);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

?>