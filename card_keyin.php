<?php
header("Content-Type:text/html; charset=euc-kr;");

// 키인 결제(승인) API 요청 URL
$postURL = "https://webapi.nicepay.co.kr/webapi/card_keyin.jsp";

/*
****************************************************************************************
* <요청 값 정보>
* 아래 파라미터에 요청할 값을 알맞게 입력합니다. 
* STIPvelation NicePay key
* $merchantKey = "8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug=="
* $mid = "stipv0202m" 상호 = "주식회사 아이피미디어그룹"
****************************************************************************************
*/
function generateCode()
{
  // 현재 날짜 및 시간 가져오기
  $dateTime = date("YmdHis"); // 형식: YYYYMMDDHHMMSS

  // 랜덤한 4자리 시퀀스 번호 생성
  $sequence = str_pad(mt_rand(0,
    9999
  ), 4, "0", STR_PAD_LEFT);

  // 코드 생성
  $code = 'G'. $dateTime . $sequence;

  return $code;
}

$ediDate = date("YmdHis");
$tid       = generateCode();           // 거래번호
$mid       = "stipv0202m";             // 가맹점 아이디
$moid       = 'STIP'. generateCode();  // 가맹점 주문번호
$amt       = "99000";          // 금액
$goodsCode     = "";           // 상품명  0001, 특허뉴스PDF
$goodsName     = "";           // 상품명  0001, 특허뉴스PDF
$cardInterest   = "";          // 무이자 여부
$cardQuota     = "";           // 할부 개월
$cardNo     = "";              // 카드번호
$cardExpire     = "";          // 유효기간(YYMM)
$buyerAuthNum   = "";          // 생년월일 / 사업자번호
$cardPwd     = "";             // 카드 비밀번호 앞 2자리

// Key=Value 형태의 Plain-Text로 카드정보를 나열합니다.
// BuyerAuthNum과 CardPwd는 MID에 설정된 인증방식에 따라 필수 여부가 결정됩니다. 
$plainText = "CardNo=" . $cardNo . "&CardExpire=" . $cardExpire . "&BuyerAuthNum=" . $buyerAuthNum . "&CardPwd=" . $cardPwd;

// 결과 데이터를 저장할 변수를 미리 선언합니다.
$response = "";

/*
****************************************************************************************
* (위변조 검증값 및 카드 정보 암호화 - 수정하지 마세요)
* SHA-256 해쉬 암호화는 거래 위변조를 막기 위한 방법입니다. 
****************************************************************************************
*/
$ediDate = date("YmdHis");                                          // API 요청 전문 생성일시
$merchantKey = "8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug==";   // 가맹점 키
$encData = bin2hex(aesEncryptSSL($plainText, substr($merchantKey, 0, 16)));                  // 카드정보 암호화																										
$signData = bin2hex(hash('sha256', $mid . $amt . $ediDate . $moid . $merchantKey, true));          // 위변조 데이터 검증 값 암호화 

/*
****************************************************************************************
* (API 요청부)
* 명세서를 참고하여 필요에 따라 파라미터와 값을 'key'=>'value' 형태로 추가해주세요
****************************************************************************************
*/

$data = array(
  'TID' => $tid,
  'MID' => $mid,
  'EdiDate' => $ediDate,
  'Moid' => $moid,
  'Amt' => $amt,
  'GoodsName' => $goodsName,
  'SignData' => $signData,
  'CardInterest' => $cardInterest,
  'CardQuota' => $cardQuota
);

$response = reqPost($data, $postURL);         //API 호출, 결과 데이터가 $response 변수에 저장됩니다.
jsonRespDump($response);                      //결과 데이터를 브라우저에 노출합니다.



// 카드 정보를 암호화할 때 사용하는 AES 암호화 (opnessl) 함수입니다. 	
function aesEncryptSSL($data, $key)
{
  $iv = openssl_random_pseudo_bytes(16);
  $encdata = @openssl_encrypt($data, "AES-128-ECB", $key, true, $iv);
  return $encdata;
}

// json으로 응답된 결과 데이터를 배열 형태로 변환하여 출력하는 함수입니다. 
// 응답 데이터 출력을 위한 예시로 테스트 이후 가맹점 상황에 맞게 변경합니다. 
function jsonRespDump($resp)
{
  $resp_utf = iconv("EUC-KR", "UTF-8", $resp);
  $respArr = json_decode($resp_utf);
  foreach ($respArr as $key => $value) {
    echo "$key=" . iconv("UTF-8", "EUC-KR", $value) . "";
  }
}

// API를 POST 형태로 호출하는 함수입니다. 
function reqPost(array $data, $url)
{
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);          //connection timeout 15 
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));  //POST data
  curl_setopt($ch, CURLOPT_POST, true);
  $response = curl_exec($ch);
  curl_close($ch);
  return $response;
}
