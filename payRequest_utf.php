<?php
header("Content-Type:text/html; charset=utf-8;");
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
	$sequence = str_pad(mt_rand(
		0,
		9999
	), 4, "0", STR_PAD_LEFT);

	// 코드 생성
	$code = 'G' . $dateTime . $sequence;

	return $code;
}


$merchantKey = "8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug=="; // 상점키
$MID         = "stipv0202m";        // 상점아이디
$goodsName   = "특허뉴스PDF";         // 결제상품명
$price       = "99000";             // 결제상품금액
$buyerName   = $_POST['name'];      // 구매자명 
$buyerTel	 = $_POST['mobile'];      // 구매자연락처
$buyerEmail  = $_POST['email'];     // 구매자메일주소        
$moid        = generateCode();      // 상품주문번호                     
$returnURL	 = "http://localhost:8080/payResult.php"; // 결과페이지(절대경로) - 모바일 결제창 전용

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
<html>
<head>
<title>NICEPAY PAY REQUEST(EUC-KR)</title>
<meta charset="utf-8">
<style>
	html,body {height: 100%;}
	form {overflow: hidden;}
</style>
<script src="https://pg-web.nicepay.co.kr/v3/common/js/nicepay-pgweb.js" type="text/javascript"></script>
<script type="text/javascript">
//결제창 최초 요청시 실행됩니다.
function nicepayStart(){
	goPay(document.payForm);
}

//[PC 결제창 전용]결제 최종 요청시 실행됩니다. <<'nicepaySubmit()' 이름 수정 불가능>>
function nicepaySubmit(){
	document.payForm.submit();
}

//[PC 결제창 전용]결제창 종료 함수 <<'nicepayClose()' 이름 수정 불가능>>
function nicepayClose(){
	alert("결제가 취소 되었습니다");
	
	// 부모 창이 있는 경우 부모 창으로 이동
	if (window.opener) {
		window.opener.location.href = 'listing.html';
		window.close();
	} else {
		// 부모 창이 없는 경우 현재 창에서 이동
		window.location.href = 'listing.html';
	}
}
</script>
</head>
<body>
<form name="payForm" method="post" action="payResult_utf.php">
	<table>
		<tr>
			<th>결제 수단</th>
			<td><input type="text" name="PayMethod" value=""></td>
		</tr>
		<tr>
			<th>결제 상품명</th>
			<td><input type="text" name="GoodsName" value="<?php echo($goodsName)?>"></td>
		</tr>
		<tr>
			<th>결제 상품금액</th>
			<td><input type="text" name="Amt" value="<?php echo($price)?>"></td>
		</tr>				
		<tr>
			<th>상점 아이디</th>
			<td><input type="text" name="MID" value="<?php echo($MID)?>"></td>
		</tr>	
		<tr>
			<th>상품 주문번호</th>
			<td><input type="text" name="Moid" value="<?php echo($moid)?>"></td>
		</tr> 
		<tr>
			<th>구매자명</th>
			<td><input type="text" name="BuyerName" value="<?php echo($buyerName)?>"></td>
		</tr>
		<tr>
			<th>구매자명 이메일</th>
			<td><input type="text" name="BuyerEmail" value="<?php echo($buyerEmail)?>"></td>
		</tr>		
		<tr>
			<th>구매자 연락처</th>
			<td><input type="text" name="BuyerTel" value="<?php echo($buyerTel)?>"></td>
		</tr>	 
		<tr>
			<th>인증완료 결과처리 URL<!-- (모바일 결제창 전용)PC 결제창 사용시 필요 없음 --></th>
			<td><input type="text" name="ReturnURL" value="<?php echo($returnURL)?>"></td>
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