<?php

/**
 * 파라미터명	파라미터설명
 * TID	30 byte 필수 거래 ID
 * MID	10 byte 필수 가맹점 ID
 * EdiDate	14 byte 필수 전문생성일시 (YYYYMMDDHHMMSS)
 * Moid	64 byte 필수 가맹점에서 부여한 주문번호 (Unique하게 구성)
 * Amt	12 byte 필수 결제 금액 (숫자만 입력)
 * EncData	512 byte 필수 결제 정보 암호화 데이터
 * 
 * - 암호화 알고리즘: AES128/ECB/PKCSpadding
 * - 암호화 결과 인코딩: Hex Encoding
 * - 암호 Key: 가맹점에 부여된 MerchantKey 앞 16자리
 * 
 * 결제정보 암호화 생성 규칙: Hex(AES(CardNo=value&CardExpire=YYMM&BuyerAuthNum=value&CardPwd=value))
 * 파라미터 상세 정보는 아래 "EncData 하위 파라미터 상세" 내용 참고
 * CardInterest	1 byte 필수 가맹점 분담 무이자 할부 이벤트 사용 여부 (0: 미사용, 1: 사용(무이자))
 * CardQuota	2 byte 필수 할부개월 (00: 일시불, 02: 2개월, 03: 3개월, ...)
 * SignData	256 byte 필수 hex(sha256(MID + Amt + EdiDate + Moid + MerchantKey)), 위변조 검증 데이터
 * BuyerEmail	60 byte 메일주소, 예) test@abc.com
 * BuyerTel	20 byte 구매자 연락처
 * BuyerName	30 byte 구매자명
 * CharSet	10 byte 인증 응답 인코딩 (euc-kr(default) / utf-8)
 * EdiType	10 byte 응답전문 유형 (JSON / KV) *KV:Key=value
 * MallReserved	500 byte 가맹점 여분필드 (나이스페이 가공 없음)
 * 
 * EncData 하위 파라미터 상세
 * 결제 고객께서 입력한 카드 정보가 외부로 노출되지 않도로 주의해야 합니다.
 * 파라미터명	파라미터설명
 * CardNo	16 byte 필수 카드번호
 * CardExpire	4 byte 필수 카드 유효기간 (YYMM)
 * BuyerAuthNum	13 byte 계약 현황에 따라 전달 필요(영업담당자 협의) 생년월일(6자리, YYMMDD) 또는 사업자번호(10자리)
 * CardPwd	2 byte 계약 현황에 따라 전달 필요(영업담당자 협의) 카드 비밀번호 앞 2자리
 * 
 * 카드키인 응답 명세
 * PG사의 기능 추가에 따라 응답 필드가 추가될 수 있습니다. 이에 따라 가맹점에서 응답 필드가 추가될 수 있음을 고려해야 합니다.
 * 파라미터명	파라미터설명
 * ResultCode	4 byte 필수 결과코드 (3001: 성공 / 그외 실패)
 * ResultMsg	100 byte 필수 결과 메시지
 * TID	30 byte 필수 거래 ID
 * Moid	64 byte 필수 주문번호
 * Amt	12 byte 필수 금액, 예)1000원인 경우 -> 000000001000
 * AuthCode	30 byte 승인번호
 * AuthDate	14 byte 승인일시(YYYYMMDDHHMISS)
 * AcquCardCode	4 byte 매입 카드사 코드
 * AcquCardName	20 byte 매입 카드사명
 * CardNo	20 byte 카드번호, 예) 12345678****1234
 * CardCode	4 byte 카드사 코드
 * CardName	20 byte 카드사명
 * CardQuota	2 byte 할부개월
 * CardCl	1 byte 카드타입 (0: 신용카드, 1: 체크카드)
 * CcPartCl	1 byte 부분취소 가능 여부 (0: 불가능, 1: 가능)
 * CardInterest	1 byte 무이자 여부 (0: 이자, 1: 무이자)
 * MallReserved	500 byte 가맹점 여분필드 (요청 시 Data 그대로 전달)
 */


header("Content-Type:text/html; charset=euc-kr;");

// 키인 결제(승인) API 요청 URL
$postURL = "https://webapi.nicepay.co.kr/webapi/card_keyin.jsp";

/*
****************************************************************************************
* <요청 값 정보>
* 아래 파라미터에 요청할 값을 알맞게 입력합니다. 
****************************************************************************************
*/
// 644-86-01439
// mid = stipv0202m
// 주식회사 아이피미디어그룹
// 8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug==

$tid       = "";          // 거래번호
$mid       = "stipv0202m";          // 가맹점 아이디
$moid       = "";          // 가맹점 주문번호
$amt       = "";          // 금액
$goodsName     = "특허뉴스PDF";          // 상품명
$cardInterest   = "0";          // 무이자 여부
$cardQuota     = "0";          // 할부 개월
$cardNo     = "";          // 카드번호
$cardExpire     = "";          // 유효기간(YYMM)
$buyerAuthNum   = "";          // 생년월일 / 사업자번호
$cardPwd     = "";          // 카드 비밀번호 앞 2자리

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
// 8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug==
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
jsonRespDump($response);               //결과 데이터를 브라우저에 노출합니다.



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

/**
 * 승인 취소 요청 명세
 * 결제 취소 API는 서비스에 따라 도메인이 다를 수 있습니다.
 * 원활한 연동을 위해 반드시 각 서비스의 가이드에 명시된 도메인을 확인하고, 
 * 정확히 연동을 진행해 주시기 바랍니다.
 * 결제 취소 요청 및 응답 시 모든 값은 server-side에서 처리해야 하며 
 * 민감 정보가 외부에 노출되지 않도록 주의해야 합니다.
 * 
 * API https://webapi.nicepay.co.kr/webapi/cancel_process.jsp
 * Method POST
 * Content-Type application/x-www-form-urlencoded
 * Encoding euc-kr 
 * 파라미터명	파라미터설명
 * TID	30 byte 필수 거래 ID
 * MID	10 byte 필수 가맹점 ID
 * Moid	64 byte 필수 주문번호 (부분 취소 시 중복취소 방지를 위해 설정) (별도 계약 필요)
 * CancelAmt	12 byte 필수 취소금액
 * CancelMsg	100 byte 필수 취소사유 (euc-kr)
 * PartialCancelCode	1 byte 필수 0:전체 취소, 1:부분 취소(별도 계약 필요)
 * EdiDate	14 byte 필수 전문생성일시 (YYYYMMDDHHMMSS)
 * SignData	256 byte 필수 hex(sha256(MID + CancelAmt + EdiDate + MerchantKey))
 * CharSet	10 byte 인증 응답 인코딩 (euc-kr(default) / utf-8)
 * EdiType	10 byte 응답전문 유형 (JSON / KV) *KV:Key=value
 * MallReserved	500 byte 가맹점 여분 필드
 * RefundAcctNo	16 byte 가상계좌, 휴대폰 익월 환불 Only 환불계좌번호 (숫자만)
 * RefundBankCd	3 byte 가상계좌, 휴대폰 익월 환불 Only 환불계좌코드 (*은행코드 참고)
 * RefundAcctNm	10 byte 가상계좌, 휴대폰 익월 환불 Only 환불계좌주명 (euc-kr)
 * 
 * 승인 취소 응답 명세
 * PG사의 기능 추가에 따라 응답 필드가 추가될 수 있습니다. 
 * 이에 따라 가맹점에서 응답 필드가 추가될 수 있음을 고려해야 합니다.
 * 파라미터명	파라미터설명
 * ResultCode	4 byte 필수 취소 결과 코드 예) 2001 *상세 내용 결과코드 참조
 * ResultMsg	100 byte 필수 취소 결과 메시지 예) 취소 성공 *상세 내용 결과코드 참조
 * CancelAmt	12 byte 필수 취소 금액 예) 1000원인 경우 -> 000000001000
 * MID	10 byte 필수 가맹점 ID 예) nictest00m
 * Moid	64 byte 필수 가맹점 주문번호
 * Signature	500 byte hex(sha256(TID + MID + CancelAmt + MerchantKey)), 위변조 검증 데이터
 * 응답 데이터 유효성 검증을 위해 가맹점 수준에서 비교하는 로직 구현을 권고합니다.
 * PayMethod	10 byte
 * CARD : 신용카드
 * BANK : 계좌이체
 * VBANK : 가상계좌
 * CELLPHONE : 휴대폰결제
 * TID	30 byte 거래 ID
 * CancelDate	8 byte 취소일자 (YYYYMMDD)
 * CancelTime	6 byte 취소시간 (HHmmss)
 * CancelNum	8 byte 취소번호
 * RemainAmt	12 byte 취소 후 잔액 예) 잔액이 1000원인 경우 -> 000000001000
 * MallReserved	500 byte 가맹점 여분 필드
 */
?>


