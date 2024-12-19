<?php
header("Content-Type:text/html; charset=utf-8;");

$merchantKey = "EYzu8jGGMfqaDEp76gSckuvnaHHu+bC4opsSN6lHv3b2lurNYkVXrZ7Z1AoqQnXI3eLuaUFyoRNC6FkrzVjceg==";
$mid = "nicepay00m";
$moid = "nicepay_api_3.0_test";
$cancelMsg = "고객요청";
$tid = $_POST['TID'];
$cancelAmt = $_POST['CancelAmt'];
$partialCancelCode = $_POST['PartialCancelCode'];

$ediDate = date("YmdHis");
$signData = bin2hex(hash('sha256', $mid . $cancelAmt . $ediDate . $merchantKey, true));

try {
  $data = array(
    'TID' => $tid,
    'MID' => $mid,
    'Moid' => $moid,
    'CancelAmt' => $cancelAmt,
    'CancelMsg' => iconv("UTF-8", "EUC-KR", $cancelMsg),
    'PartialCancelCode' => $partialCancelCode,
    'EdiDate' => $ediDate,
    'SignData' => $signData,
    'CharSet' => 'utf-8'
  );
  $response = reqPost($data, "https://webapi.nicepay.co.kr/webapi/cancel_process.jsp"); //취소 API 호출
  jsonRespDump($response);
} catch (Exception $e) {
  $e->getMessage();
  $ResultCode = "9999";
  $ResultMsg = "통신실패";
}

// API CALL foreach 예시
function jsonRespDump($resp)
{
  $respArr = json_decode($resp);
  foreach ($respArr as $key => $value) {
    if ($key == "Data") {
      echo decryptDump($value, $merchantKey) . "<br />";
    } else {
      echo "$key=" . $value . "<br />";
    }
  }
}

//Post api call
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
