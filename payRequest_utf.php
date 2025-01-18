<?php
header("Content-Type:text/html; charset=utf-8;");

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

define('MINIMUM_PAYMENT_AMOUNT', 1000);
define('MAXIMUM_PAYMENT_AMOUNT', 1000000000);

// 1. 로깅 함수
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

/*
*******************************************************
* <결제요청 파라미터>
* 결제시 Form 에 보내는 결제요청 파라미터입니다.
* 샘플페이지에서는 기본(필수) 파라미터만 예시되어 있으며, 
* 추가 가능한 옵션 파라미터는 연동메뉴얼을 참고하세요.
* STIPvelation NicePay key
* $merchantKey = "8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug=="
* $mid = "stipv0202m" 상호 = "주식회사 아이피미디어그룹"
*******************************************************
*/
function generateCode()
{
	// 현재 날짜 및 시간 가져오기
	$dateTime = date("YmdHis"); // 형식: YYYYMMDDHHMMSS

	// 랜덤한 4자리 시퀀스 번호 생성
	$sequence = str_pad(mt_rand(0,9999), 4, "0", STR_PAD_LEFT);

	// 코드 생성
	$code = 'G' . $dateTime . $sequence;

	return $code;
}

// 주문번호 생성 함수
function generateOrderId() {
    $dateTime = date("YmdHis");
    $sequence = str_pad(mt_rand(0, 9999), 4, "0", STR_PAD_LEFT);
    return 'ORD' . $dateTime . $sequence;
}


try {
    // 환경 변수에서 설정 가져오기
    $merchantKey = $_ENV['NICE_MERCHANT_KEY'];
    $MID = $_ENV['NICE_MERCHANT_ID'];
    
    // POST 데이터 검증
    $requiredFields = ['productCode','productName', 'orderName', 'orderPhone', 'orderEmail', 'convertedAmount'];
		$missingFields = [];
    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            $missingFields[] = $field;
        }
    }
		if (!empty($missingFields)) {
        writeLog("Missing required fields: " . implode(', ', $missingFields), 'error');
        throw new Exception("Required payment information is missing");
    }

		
    // 결제 정보 설정
    $goodsName = htmlspecialchars($_POST['productName']);
    $price = round(filter_var($_POST['convertedAmount'], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION));
		// 또는 더 안전하게:
		$price = (int)round(filter_var(
				$_POST['convertedAmount'], 
				FILTER_SANITIZE_NUMBER_FLOAT, 
				FILTER_FLAG_ALLOW_FRACTION
		));
		// 유효성 검사 추가
		if (!is_numeric($price) || $price <= 0) {
				throw new Exception("Invalid payment amount");
		}

		// 금액 검증 로직 강화
		if ($price < MINIMUM_PAYMENT_AMOUNT || $price > MAXIMUM_PAYMENT_AMOUNT) {
				throw new Exception("유효하지 않은 결제 금액입니다. (허용 범위: " . number_format(MINIMUM_PAYMENT_AMOUNT) . "원 ~ " . number_format(MAXIMUM_PAYMENT_AMOUNT) . "원)");
		}
		
    $buyerName = htmlspecialchars($_POST['orderName']);
    $buyerTel = htmlspecialchars($_POST['orderPhone']);
    $buyerEmail = htmlspecialchars($_POST['orderEmail']);
    $moid = htmlspecialchars($_POST['order_id']);
    $returnURL = $_ENV['NICE_RETURN_URL'] ?? "http://localhost:8080/payResult_utf.php";

		// 금액 유효성 검증
    if (!is_numeric($price) || $price <= 0) {
        throw new Exception("Invalid payment amount");
    }

    // 해시 암호화
    $ediDate = date("YmdHis");
    $hashString = bin2hex(hash('sha256', $ediDate.$MID.$price.$merchantKey, true));

    // 결제 요청 로깅
    writeLog("Payment Request - OrderID: {$moid}, Amount: {$price}, Buyer: {$buyerName}");

    // DB에 결제 요청 정보 저장
    $pdo = new PDO(
        "mysql:host=".$_ENV['DB_HOST'].";dbname=".$_ENV['DB_NAME'].";charset=utf8mb4",
        $_ENV['DB_USER'],
        $_ENV['DB_PASS']
    );
    
    $sql = "INSERT INTO payment_requests (
        order_id, amount, buyer_name, buyer_email, buyer_tel,
        product_name, merchant_id, status, request_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'REQUESTED', NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $moid, $price, $buyerName, $buyerEmail, $buyerTel,
        $goodsName, $MID
    ]);

} catch (Exception $e) {
    writeLog("Error in payment request: " . $e->getMessage(), 'error');
    echo "<script>
		    alert('결제 처리 중 오류가 발생했습니다." . addslashes($e->getMessage()) . "');
        window.location.href = 'listing.html';</script>";
    exit;
}

// $merchantKey = $_ENV['NICE_MERCHANT_KEY'];
// $MID         = $_ENV['NICE_MERCHANT_ID'];     // 상점아이디
// $goodsName   = $_POST['productName'];         // 결제상품명
// $price       = $_POST['convertedAmount'];     // 결제상품금액
// $buyerName   = $_POST['orderName'];           // 구매자명 
// $buyerTel	   = $_POST['orderPhone'];          // 구매자연락처
// $buyerEmail  = $_POST['orderEmail'];          // 구매자메일주소        
// $moid        = $_POST['productCode'];         // 상품주문번호                     
// $returnURL	 = "http://localhost:8080/payResult.php"; // 결과페이지(절대경로) - 모바일 결제창 전용



/*
*******************************************************
* <해쉬암호화> (수정하지 마세요)
* SHA-256 해쉬암호화는 거래 위변조를 막기위한 방법입니다. 
*******************************************************
*/ 
$ediDate = date("YmdHis");
$hashString = bin2hex(hash('sha256', $ediDate.$MID.$price.$merchantKey, true));
?>
<!DOCTYPE html>
<html lang="ko">
<head>
<title>NICEPAY PAY REQUEST(EUC-KR)</title>
<meta charset="UTF-8">
<style>
	html,body {height: 100%;}
	/* form {overflow: hidden;} */
	body { background: #f8f9fa; }
	.loading {
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			text-align: center;
	}
	form { display: none; }
</style>
<script src="https://pg-web.nicepay.co.kr/v3/common/js/nicepay-pgweb.js" type="text/javascript"></script>
<script type="text/javascript">
	window.onerror = function(msg, url, line) {
			alert("결제 처리 중 오류가 발생했습니다.");
			window.location.href = 'listing.html';
			return false;
	};

	// 결제 창 호출 실패 시 처리
	function failPayment(error) {
			console.error('Payment failed:', error);
			alert("결제 처리에 실패했습니다.");
			window.location.href = 'listing.html';
	}

	// 나이스페이 에러 처리
	if (typeof nicepay !== 'undefined') {
			nicepay.fn_error = function(str) {
					alert(str);
					window.location.href = 'listing.html';
			};
	}

	window.onload = function() {
			nicepayStart();
	}

	function nicepayStart() {
			goPay(document.payForm);
	}

	function nicepaySubmit() {
			document.payForm.submit();
	}

	function nicepayClose() {
			if (confirm("결제를 취소하시겠습니까?")) {
					if (window.opener) {
							window.opener.location.href = 'listing.html?status=cancel';
							window.close();
					} else {
							window.location.href = 'listing.html?status=cancel';
					}
			}
	}


// //결제창 최초 요청시 실행됩니다.
// function nicepayStart(){
// 	goPay(document.payForm);
// }

// //[PC 결제창 전용]결제 최종 요청시 실행됩니다. <<'nicepaySubmit()' 이름 수정 불가능>>
// function nicepaySubmit(){
// 	document.payForm.submit();
// }

// //[PC 결제창 전용]결제창 종료 함수 <<'nicepayClose()' 이름 수정 불가능>>
// function nicepayClose(){
// 	alert("결제가 취소 되었습니다");
	
// 	// 부모 창이 있는 경우 부모 창으로 이동
// 	if (window.opener) {
// 		window.opener.location.href = 'listing.html';
// 		window.close();
// 	} else {
// 		// 부모 창이 없는 경우 현재 창에서 이동
// 		window.location.href = 'listing.html';
// 	}
// }
</script>
</head>
<body>
<form name="payForm" method="post" action="payResult_utf.php">
	<table>
		<tr>
			<th>결제 수단</th>
			<td><input type="text" name="PayMethod" value="CARD"></td>
		</tr>
		<tr>
			<th>결제 상품명</th>
			<td><input type="text" name="GoodsName" value="<?php echo ($goodsName) ?>"></td>
		</tr>
		<tr>
			<th>결제 상품금액</th>
			<td><input type="text" name="Amt" value="<?php echo ($price) ?>"></td>
		</tr>				
		<tr>
			<th>상점 아이디</th>
			<td><input type="text" name="MID" value="<?php echo ($MID) ?>"></td>
		</tr>	
		<tr>
			<th>상품 주문번호</th>
			<td><input type="text" name="Moid" value="<?php echo ($moid) ?>"></td>
		</tr> 
		<tr>
			<th>구매자명</th>
			<td><input type="text" name="BuyerName" value="<?php echo ($buyerName) ?>"></td>
		</tr>
		<tr>
			<th>구매자명 이메일</th>
			<td><input type="text" name="BuyerEmail" value="<?php echo ($buyerEmail) ?>"></td>
		</tr>		
		<tr>
			<th>구매자 연락처</th>
			<td><input type="text" name="BuyerTel" value="<?php echo ($buyerTel) ?>"></td>
		</tr>	 
		<tr>
			<th>인증완료 결과처리 URL<!-- (모바일 결제창 전용)PC 결제창 사용시 필요 없음 --></th>
			<td><input type="text" name="ReturnURL" value="<?php echo ($returnURL) ?>"></td>
		</tr>
		<tr>
			<th>가상계좌입금만료일(YYYYMMDD)</th>
			<td><input type="text" name="VbankExpDate" value=""></td>
		</tr>		
					
		<!-- 옵션 -->	 
		<input type="hidden" name="GoodsCl" value="1"/>						<!-- 상품구분(실물(1),컨텐츠(0)) -->
		<input type="hidden" name="TransType" value="0"/>					<!-- 일반(0)/에스크로(1) --> 
		<input type="hidden" name="CharSet" value="utf-8"/>				<!-- 응답 파라미터 인코딩 방식 -->
		<input type="hidden" name="ReqReserved" value=""/>					<!-- 상점 예약필드 -->
					
		<!-- 변경 불가능 -->
		<input type="hidden" name="EdiDate" value="<?php echo($ediDate)?>"/>			<!-- 전문 생성일시 -->
		<input type="hidden" name="SignData" value="<?php echo($hashString)?>"/>	<!-- 해쉬값 -->
	</table>
	<a href="#" class="btn_blue" onClick="nicepayStart();">요 청</a>
</form>
</body>
</html>