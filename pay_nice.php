<?php
header("Content-Type:text/html; charset=utf-8;");
// 다국어 에러 메시지 정의
$error_messages = [
  'ko' => [
    '9999' => '통신실패',
    '3001' => '취소 성공',
    '4000' => '취소 실패',
    '4100' => '잘못된 요청',
    '4110' => '취소 금액 오류',
    '4120' => '부분취소 불가능한 거래',
    '4130' => '이미 취소된 거래',
    '4140' => '원거래 찾을 수 없음',
    '4150' => '취소 가능 금액 초과',
    '4160' => '취소 요청 금액 오류',
    'default' => '처리 중 오류가 발생했습니다',
    'invalid_json' => 'JSON 응답이 올바르지 않습니다',
    'curl_error' => 'API 통신 오류',
    'response_error' => '응답 처리 실패'
  ],
  'en' => [
    '9999' => 'Communication Failed',
    '3001' => 'Cancellation Successful',
    '4000' => 'Cancellation Failed',
    '4100' => 'Invalid Request',
    '4110' => 'Invalid Cancellation Amount',
    '4120' => 'Partial Cancellation Not Possible',
    '4130' => 'Already Cancelled Transaction',
    '4140' => 'Original Transaction Not Found',
    '4150' => 'Exceeded Cancellable Amount',
    '4160' => 'Invalid Cancellation Request Amount',
    'default' => 'An error occurred during processing',
    'invalid_json' => 'Invalid JSON response',
    'curl_error' => 'API Communication Error',
    'response_error' => 'Response Processing Failed'
  ],
  'ja' => [
    '9999' => '通信失敗',
    '3001' => 'キャンセル成功',
    '4000' => 'キャンセル失敗',
    '4100' => '無効なリクエスト',
    '4110' => 'キャンセル金額エラー',
    '4120' => '一部キャンセル不可能な取引',
    '4130' => '既にキャンセルされた取引',
    '4140' => '元の取引が見つかりません',
    '4150' => 'キャンセル可能金額超過',
    '4160' => 'キャンセル要求金額エラー',
    'default' => '処理中にエラーが発生しました',
    'invalid_json' => '無効なJSONレスポンス',
    'curl_error' => 'API通信エラー',
    'response_error' => 'レスポンス処理失敗'
  ],
  'zh' => [
    '9999' => '通信失败',
    '3001' => '取消成功',
    '4000' => '取消失败',
    '4100' => '无效请求',
    '4110' => '取消金额错误',
    '4120' => '不可部分取消的交易',
    '4130' => '已取消的交易',
    '4140' => '找不到原始交易',
    '4150' => '超过可取消金额',
    '4160' => '取消请求金额错误',
    'default' => '处理过程中发生错误',
    'invalid_json' => '无效的JSON响应',
    'curl_error' => 'API通信错误',
    'response_error' => '响应处理失败'
  ]
];
// STIP key
// $merchantKey = "8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug=="
// $mid = "stipv0202m" 상호 = "주식회사 아이피미디어그룹"
$merchantKey = "EYzu8jGGMfqaDEp76gSckuvnaHHu+bC4opsSN6lHv3b2lurNYkVXrZ7Z1AoqQnXI3eLuaUFyoRNC6FkrzVjceg==";
$mid = "nicepay00m";
$moid = "nicepay_api_3.0_test";
$cancelMsg = "고객요청";
$tid = $_POST['TID'];
$cancelAmt = $_POST['CancelAmt'];
$partialCancelCode = $_POST['PartialCancelCode'];

// POST 데이터 받기
$tid = $_POST['TID'];
$cancelAmt = $_POST['CancelAmt'];
$partialCancelCode = $_POST['PartialCancelCode'];
$lang = isset($_POST['lang']) ? $_POST['lang'] : 'ko'; 

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
  // jsonRespDump($response);
  $result = processResponse($response, $lang, $error_messages);

  header('Content-Type: application/json');
  echo json_encode($result);

} catch (Exception $e) {
  // $e->getMessage();
  // $ResultCode = "9999";
  // $ResultMsg = "통신실패";

  $result = array(
    'ResultCode' => '9999',
    'ResultMsg' => $error_messages[$lang]['9999'] . ': ' . $e->getMessage()
  );

  header('Content-Type: application/json');
  echo json_encode($result);
}

// 응답 처리 함수
function processResponse($resp, $lang, $error_messages)
{
  try {
    $respArr = json_decode($resp, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new Exception($error_messages[$lang]['invalid_json']);
    }

    // 결과 코드에 따른 메시지 설정
    $resultCode = isset($respArr['ResultCode']) ? $respArr['ResultCode'] : '9999';
    $resultMsg = isset($error_messages[$lang][$resultCode])
      ? $error_messages[$lang][$resultCode]
      : $error_messages[$lang]['default'];

    $result = array(
      'ResultCode' => $resultCode,
      'ResultMsg' => $resultMsg,
      'CancelAmt' => isset($respArr['CancelAmt']) ? $respArr['CancelAmt'] : '',
      'CancelDate' => isset($respArr['CancelDate']) ? $respArr['CancelDate'] : '',
      'CancelTime' => isset($respArr['CancelTime']) ? $respArr['CancelTime'] : '',
      'TID' => isset($respArr['TID']) ? $respArr['TID'] : ''
    );

    if (isset($respArr['Data'])) {
      $result['Data'] = $respArr['Data'];
    }

    return $result;
  } catch (Exception $e) {
    return array(
      'ResultCode' => '9999',
      'ResultMsg' => $error_messages[$lang]['response_error'] . ': ' . $e->getMessage()
    );
  }
}

// API CALL foreach 예시
// function jsonRespDump($resp)
// {
//   $respArr = json_decode($resp);
//   foreach ($respArr as $key => $value) {
//     if ($key == "Data") {
//       echo decryptDump($value, $merchantKey) . "<br />";
//     } else {
//       echo "$key=" . $value . "<br />";
//     }
//   }
// }

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
