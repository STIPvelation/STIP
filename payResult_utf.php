<?php
header("Content-Type:text/html; charset=utf-8;");

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// 1. 로깅 함수 추가
// 로깅 함수
function writeLog($message, $type = 'info') {
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }
    $logFile = $logDir . '/payment_' . date('Y-m-d') . '.log';
    $logMessage = date('Y-m-d H:i:s') . " [{$type}] " . $message . PHP_EOL;
    error_log($logMessage, 3, $logFile);
}

// DB 연결 함수
function getDbConnection() {
    return new PDO(
        "mysql:host=".$_ENV['DB_HOST'].";dbname=".$_ENV['DB_NAME'].";charset=utf8mb4",
        $_ENV['DB_USER'],
        $_ENV['DB_PASS'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
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
// 결제 결과 파라미터 받기 부분에 추가
$nextAppURL = $_POST['NextAppURL'];       // 승인 요청 URL
$netCancelURL = $_POST['NetCancelURL'];   // 망취소 요청 URL
$reqReserved = $_POST['ReqReserved'];     // 상점 예약필드

// 결제 검증 try 블록 앞에 추가
$authSignature = $_POST['Signature'];   // Nicepay에서 내려준 응답값의 무결성 검증 Data
// 인증 응답 Signature 검증
$authComparisonSignature = bin2hex(hash('sha256', $authToken. $mid. $amt. $merchantKey, true));

// 3. 결제 검증
try {
    // 결제 결과 파라미터
    $authResultCode = $_POST['AuthResultCode'];
    $authResultMsg = $_POST['AuthResultMsg'];
    $nextAppURL = $_POST['NextAppURL'];
    $txTid = $_POST['TxTid'];
    $authToken = $_POST['AuthToken'];
    $payMethod = $_POST['PayMethod'];
    $mid = $_POST['MID'];
    $moid = $_POST['Moid'];
    $amt = $_POST['Amt'];
    $reqReserved = $_POST['ReqReserved'];
    $netCancelURL = $_POST['NetCancelURL'];
    $authSignature = $_POST['Signature'];

    // 설정 로드
    $merchantKey = $_ENV['NICE_MERCHANT_KEY'];

    // 로깅
    writeLog("Payment Result - OrderID: {$moid}, Amount: {$amt}, Result: {$authResultCode}");

    // 서명 검증
    $authComparisonSignature = bin2hex(hash('sha256', $authToken.$mid.$amt.$merchantKey, true));

    if($authResultCode === "0000" && $authSignature === $authComparisonSignature) {
        // 승인 요청
        $ediDate = date("YmdHis");
        $signData = bin2hex(hash('sha256', $authToken.$mid.$amt.$ediDate.$merchantKey, true));

        try {
            $pdo = getDbConnection();
            $pdo->beginTransaction();

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
            
            $response = reqPost($data, $nextAppURL);
            $responseData = json_decode($response, true);

            // 결제 결과 검증
            $paySignature = bin2hex(hash('sha256', $txTid.$mid.$amt.$merchantKey, true));
            
            if($responseData['ResultCode'] === '3001' && $responseData['Signature'] === $paySignature) {
                // 결제 성공 처리
                $sql = "UPDATE payment_requests SET 
                        status = 'PAID',
                        transaction_id = ?,
                        response_code = ?,
                        updated_at = NOW()
                        WHERE order_id = ?";
                        
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$txTid, $responseData['ResultCode'], $moid]);

                // 주문 상태 업데이트
                $sql = "UPDATE order_form SET 
                        status = 'PAID',
                        payment_date = NOW(),
                        payment_amount = ?,
                        payment_method = ?,
                        transaction_id = ?
                        WHERE order_id = ?";
                        
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$amt, $payMethod, $txTid, $moid]);

                $pdo->commit();

                // 성공 페이지로 리다이렉트
                echo "<script>
                    if(window.opener) {
                        window.opener.location.href = 'listing.html?status=success&orderid=".$moid."';
                        window.close();
                    } else {
                        window.location.href = 'listing.html?status=success&orderid=".$moid."';
                    }
                </script>";
            } else {
                throw new Exception("Payment verification failed");
            }

        } catch(Exception $e) {
            $pdo->rollBack();
            writeLog("Payment Error: " . $e->getMessage(), 'error');

            // 망취소 요청
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
            reqPost($cancelData, $netCancelURL);
            
            throw $e;
        }
    } else {
        throw new Exception($authResultMsg);
    }

} catch(Exception $e) {
    writeLog("Payment Error: " . $e->getMessage(), 'error');
    echo "<script>
        if(window.opener) {
            window.opener.location.href = 'listing.html?status=fail&message=".urlencode($e->getMessage())."';
            window.close();
        } else {
            window.location.href = 'listing.html?status=fail&message=".urlencode($e->getMessage())."';
        }
    </script>";
}
// API 호출 함수 위에 추가
function jsonRespDump($resp) {
    global $mid, $merchantKey;
    $respArr = json_decode($resp);
    foreach ($respArr as $key => $value) {
        // 승인 응답으로 받은 Signature 검증을 통해 무결성 검증 진행
        if($key == "Amt" || $key == "CancelAmt"){
			$payAmt = $value;
		}
		if($key == "TID"){
			$tid = $value;
		}
        if($key == "Signature") {
            $paySignature = bin2hex(hash('sha256', $tid. $mid. $payAmt. $merchantKey, true));
            if($value != $paySignature) {
                writeLog("Invalid transaction signature detected!", 'error');
            }
            if($value != $paySignature){
				echo '비정상 거래! 취소 요청이 필요합니다.</br>';
				echo '승인 응답 Signature : '. $value. '</br>';
				echo '승인 생성 Signature : '. $paySignature. '</br>';
			}
        }
        writeLog("$key: $value", 'info');
    }
    return $respArr;
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