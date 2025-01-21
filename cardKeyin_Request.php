<?php
header("Content-Type:text/html; charset=utf-8;");

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// 상수 정의
define('MINIMUM_PAYMENT_AMOUNT', 1000);
define('MAXIMUM_PAYMENT_AMOUNT', 1000000000);


// 로깅 함수
function writeLog($message, $type = 'info') {
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }
    $logFile = $logDir . '/card_keyin_' . date('Y-m-d') . '.log';
    $logMessage = date('Y-m-d H:i:s') . " [{$type}] " . $message . PHP_EOL;
    error_log($logMessage, 3, $logFile);
}

// 거래번호 생성 함수
function generateTID() {
    $dateTime = date("YmdHis");
    $sequence = str_pad(mt_rand(0, 9999), 4, "0", STR_PAD_LEFT);
    return 'G' . $dateTime . $sequence;
}


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


// $ediDate = date("YmdHis");
// $tid       = generateCode();           // 거래번호
// $mid       = "stipv0202m";             // 가맹점 아이디
// $moid       = htmlspecialchars($_POST['order_id']);  // 가맹점 주문번호
// $amt       = "99000";          // 금액
// $goodsCode     = "0001";           // 상품코드:  0001
// $goodsName     = "특허뉴스PDF";           // 상품명: 특허뉴스PDF
// $cardInterest   = "0";          // 무이자 여부
// $cardQuota     = "00";           // 할부 개월
// $cardNo     = "";               // 카드번호
// $cardExpire     = "";          // 유효기간(YYMM)
// $buyerAuthNum   = "";          // 생년월일 / 사업자번호
// $cardPwd     = "";             // 카드 비밀번호 앞 2자리

// Key=Value 형태의 Plain-Text로 카드정보를 나열합니다.
// BuyerAuthNum과 CardPwd는 MID에 설정된 인증방식에 따라 필수 여부가 결정됩니다. 
// $plainText = "CardNo=" . $cardNo . "&CardExpire=" . $cardExpire . "&BuyerAuthNum=" . $buyerAuthNum . "&CardPwd=" . $cardPwd;

// 결과 데이터를 저장할 변수를 미리 선언합니다.
// $response = "";

/*
****************************************************************************************
* (위변조 검증값 및 카드 정보 암호화 - 수정하지 마세요)
* SHA-256 해쉬 암호화는 거래 위변조를 막기 위한 방법입니다. 
****************************************************************************************
*/
// $ediDate = date("YmdHis"); // API 요청 전문 생성일시
// $merchantKey = "8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug=="; // 가맹점 키
// $encData = bin2hex(aesEncryptSSL($plainText, substr($merchantKey, 0, 16))); // 카드정보 암호화																										
// $signData = bin2hex(hash('sha256', $mid . $amt . $ediDate . $moid . $merchantKey, true)); // 위변조 데이터 검증 값 암호화 

/*
****************************************************************************************
* (API 요청부)
* 명세서를 참고하여 필요에 따라 파라미터와 값을 'key'=>'value' 형태로 추가해주세요
****************************************************************************************
*/

// $data = array(
//   'TID' => $tid,
//   'MID' => $mid,
//   'EdiDate' => $ediDate,
//   'Moid' => $moid,
//   'Amt' => $amt,
//   'GoodsName' => $goodsName,
//   'SignData' => $signData,
//   'CardInterest' => $cardInterest,
//   'CardQuota' => $cardQuota
// );

// $response = reqPost($data, $postURL);         //API 호출, 결과 데이터가 $response 변수에 저장됩니다.
// jsonRespDump($response);                      //결과 데이터를 브라우저에 노출합니다.
// 기본 변수 초기화
// 결과 데이터를 저장할 변수를 미리 선언합니다.
// $response = "";
// $moid = '';
// $goodsName = '';
// $price = 0;
// $ediDate = date("YmdHis");
// 기본 변수 초기화
$moid = '';
$goodsName = '';
$price = 0;
$ediDate = date("YmdHis");
$MID = $_ENV['NICE_MERCHANT_ID'];
$merchantKey = $_ENV['NICE_MERCHANT_KEY'];
$tid = generateTID();
$encData = '';
$plainText = '';

try {
    // 환경 변수에서 설정 가져오기
    // $merchantKey = $_ENV['NICE_MERCHANT_KEY'];
    // $MID = $_ENV['NICE_MERCHANT_ID'];
    // $tid = generateTID();

    // POST 요청으로 들어온 경우 값 설정
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $moid = isset($_POST['order_id']) ? htmlspecialchars($_POST['order_id']) : '';
        $goodsName = isset($_POST['productName']) ? htmlspecialchars($_POST['productName']) : '';
        $price = isset($_POST['convertedAmount']) ? (int)round(filter_var($_POST['convertedAmount'], 
                           FILTER_SANITIZE_NUMBER_FLOAT, 
                           FILTER_FLAG_ALLOW_FRACTION)) : 0;
        $amt = $price;

        $ediDate = date("YmdHis");

        $signData = bin2hex(hash('sha256', $MID . $amt . $ediDate . $moid . $merchantKey, true));
        
        // 카드 정보가 있으면 암호화
        if (isset($_POST['cardNo'])) {
            // 카드 정보 암호화
            $cardNo = isset($_POST['cardNo']) ? htmlspecialchars($_POST['cardNo']) : '';
            $cardExpire = isset($_POST['cardExpire']) ? htmlspecialchars($_POST['cardExpire']) : '';
            $buyerAuthNum = isset($_POST['birthDate']) && $_POST['authType'] === 'birth' ? htmlspecialchars($_POST['birthDate']) : (isset($_POST['businessNumber']) ? htmlspecialchars($_POST['businessNumber']) : '');
            $cardPwd = isset($_POST['cardPwd']) ? htmlspecialchars($_POST['cardPwd']) : '';

             $plainText = "CardNo=" . $cardNo . "&CardExpire=" . $cardExpire . "&BuyerAuthNum=" . $buyerAuthNum . "&CardPwd=" . $cardPwd;

            $encData = bin2hex(aesEncryptSSL($plainText, substr($merchantKey, 0, 16)));

        }

        // API 요청 데이터 구성
        $data = array(
            'TID' => $tid,
            'MID' => $MID,
            'EdiDate' => $ediDate,
            'Moid' => $moid,
            'Amt' => $amt,
            'EncData' => $encData,
            'GoodsName' => $_POST['productName'],
            'CardInterest' => '0',
            'CardQuota' => '00',
            'SignData' => $signData,
            'BuyerEmail' => $_POST['buyerEmail'] ?? '',
            'BuyerTel' => $_POST['buyerTel'] ?? '',
            'BuyerName' => $_POST['buyerName'] ?? '',
            'CharSet' => 'utf-8',
            'EdiType' => 'JSON'
        );
        
        // API 호출
        $response = reqPost($data, $postURL);
        $result = json_decode($response, true);

        // 결과 처리
        if ($result['ResultCode'] === '3001') {
            // 성공 처리
            writeLog("Payment Success - TID: {$tid}", 'info');
            echo json_encode(['success' => true]);
            exit;
        } else {
            throw new Exception($result['ResultMsg'] ?? '결제 처리 중 오류가 발생했습니다.');
        }
    }
    

} catch (Exception $e) {
    writeLog("Error in payment process: " . $e->getMessage(), 'error');
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

$hashString = bin2hex(hash('sha256', $ediDate.$MID.$price.$merchantKey, true));


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

?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <!-- meta 태그를 통한 인코딩 명시 -->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

    <title>data-lang-ko="카드 결제 정보 입력" data-lang-en="Card Payment Information" 
           data-lang-ja="カード決済情報入力" data-lang-zh="信用卡支付信息">카드 결제 정보 입력</title>
    <link rel="stylesheet" href="assets/style/reset.css" />       
    <script src="js/services/language-service.js"></script>       
    <style>
        /* 기본 스타일 */
        body {
            background: #f8f9fa;
            font-family: "SUIT", sans-serif;
            margin: 0;
            padding: 20px;
        }
        
        /* 테이블 스타일링 */
        .payment-table {
            max-width: 500px;  /* 500px에서 400px로 변경 */
            margin: 30px auto;
            background: white;
            padding: 20px;     /* 30px에서 20px로 변경하여 좀 더 compact하게 */
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            width: 100%;
            border-collapse: collapse;
        }
        
        /* .payment-table td, 
        .payment-table th {
            padding: 8px;
            vertical-align: top;
            text-align: left;
            border-bottom: 1px solid #eee;
        } */
        
        /* thead 스타일 수정 */
        .payment-table thead th {
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            text-align: center;
            padding: 30px;  /* 패딩 증가 */
            border-radius: 8px 8px 0 0;
            font-size: 20px;  /* 폰트 크기 증가 */
            letter-spacing: 0.5px;  /* 글자 간격 살짝 추가 */
        }

        /* 결제 금액 행 스타일 수정 */
        .payment-amount-row {
            background-color: rgba(0, 0, 0, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 20px;  /* thead와의 간격 추가 */
        }

        .payment-amount-row th {
            background-color: transparent;  /* th 배경 투명하게 */
        }
        
        .payment-table tbody tr:last-child td,
        .payment-table tbody tr:last-child th {
            border-bottom: none;
        }
        
        /* 입력 필드 스타일 */
        .payment-table input[type="text"],
        .payment-table input[type="password"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
        }

        /* 테이블 헤더 스타일 */
        .payment-table tbody th {
            /* width: 30%; */
            font-weight: bold;
            background-color: #f8f9fa;
            vertical-align: middle;  /* 수직 가운데 정렬 */
            line-height: 40px;      /* input 높이와 동일하게 설정 */
            padding: 8px 0 8px 12px;
            position: relative;     /* 포지셔닝 컨텍스트 설정 */
            height: 40px;           /* input과 동일한 높이 */
            display: flex;          /* Flexbox 사용 */
            align-items: center;    /* 수직 가운데 정렬 */
        }

        /* 레이블 스타일 */
        .payment-table tbody th label {
            margin: 0;             /* 기본 마진 제거 */
            display: flex;         /* Flexbox 사용 */
            align-items: center;   /* 수직 가운데 정렬 */
            height: 100%;         /* 부모 높이 100% */
        }

        /* 도움말 텍스트 스타일 */
        .payment-table th .help-text {
            margin-top: 4px;       /* 도움말 텍스트 상단 여백 */
            line-height: 1.2;      /* 도움말 텍스트 줄 간격 조정 */
            font-size: 12px;
            color: #666;
            display: block;
        }

        /* 테이블 셀 스타일 */
        .payment-table td {
            padding: 8px;
            vertical-align: middle;  /* td도 수직 가운데 정렬 */
        }

        /* 입력 필드 공통 스타일 */
        .payment-table input[type="text"],
        .payment-table input[type="password"],
        .payment-table input[type="email"] {
            width: 100%;
            height: 40px;          /* 높이 통일 */
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
        }
        
        
        /* 버튼 스타일링 */
        .button-cell {
            padding-top: 20px;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
        }
        
        /* 버튼 스타일 유지 */
.submit-btn, 
.cancel-btn {
    flex: 1;
    padding: 14px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(5px);
}

.submit-btn:hover,
.cancel-btn:hover {
    background-color: rgba(0, 0, 0, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.submit-btn:active,
.cancel-btn:active {
    transform: translateY(1px);
}

/* 금액 셀 스타일 수정 */
.amount-cell {
    text-align: right;
    padding-right: 20px;
    white-space: nowrap;  /* 텍스트 줄바꿈 방지 */
}
.payment-amount-row .amount {
    font-size: 1.3em;
    font-weight: bold;
    color: #121111;
    padding: 10px 0;
    display: inline-block;
    white-space: nowrap;  /* 텍스트 줄바꿈 방지 */
}

/* 테이블 전체 레이아웃 조정 */
.payment-table {
    border-spacing: 0;  /* 셀 간격 제거 */
    border-collapse: separate;  /* 테두리 분리 */
    margin-bottom: 20px;  /* 테이블 하단 여백 */
}

/* 영문 텍스트를 위한 추가 스타일 */
[data-lang-en] {
    white-space: nowrap;  /* 영문 텍스트 줄바꿈 방지 */
}
        
        /* 비활성화 상태 스타일 */
        .submit-btn:disabled,
        .cancel-btn:disabled {
            background: #cccccc;
            cursor: not-allowed;
            opacity: 0.7;
        }
        
        /* 로딩 오버레이 스타일 */
        #loadingOverlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* 반응형 디자인 */
        @media (max-width: 768px) {
            .payment-table td {
                display: block;
                width: 100%;
            }
            
            .payment-table td:first-child {
                width: 100%;
                padding-bottom: 5px;
            }
            
            .button-group {
                flex-direction: column;
            }
        }
        .auth-inputs {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .auth-input-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .auth-input-group input[type="text"] {
            width: 200px;
        }

        .auth-input-group input[type="radio"] {
            margin: 0;
        }

        .auth-input-group label {
            min-width: 80px;
        }     
    </style>
</head>
<body>
    <form name="cardPaymentForm" method="post" action="" class="payment-form">
        <!-- 히든 필드 -->
        <input type="hidden" name="MID" value="<?php echo $MID ?>">
        <input type="hidden" name="Moid" value="<?php echo $moid ?>">
        <input type="hidden" name="EdiDate" value="<?php echo $ediDate ?>">
        <input type="hidden" name="SignData" value="<?php echo $hashString ?>">
        <input type="hidden" name="GoodsName" value="<?php echo $goodsName ?>">
        <input type="hidden" name="Amt" value="<?php echo $price ?>">
        <!-- 주문 정보 hidden 필드 추가 -->
        <input type="hidden" name="order_id" value="<?php echo htmlspecialchars($_POST['order_id']); ?>">
        <input type="hidden" name="productName" value="<?php echo htmlspecialchars($_POST['productName']); ?>">
        <input type="hidden" name="convertedAmount" value="<?php echo htmlspecialchars($_POST['convertedAmount']); ?>">
        
        <!-- 카드 정보 입력 필드 다국어 지원 -->
        <!-- <div class="input-group">
            <label for="cardNo" class="required">
                <span data-lang-ko="카드번호" data-lang-en="Card Number" 
                      data-lang-ja="カード番号" data-lang-zh="信用卡号"></span>
            </label>
            <input type="text" id="cardNo" name="cardNo" maxlength="16" required
                   data-lang-ko-placeholder="1234 5678 9012 3456" 
                   data-lang-en-placeholder="1234 5678 9012 3456"
                   data-lang-ja-placeholder="1234 5678 9012 3456"
                   data-lang-zh-placeholder="1234 5678 9012 3456">
        </div>
        
        <div class="input-group">
            <label for="cardExpire" class="required">
                <span data-lang-ko="유효기간" data-lang-en="Expiry Date" 
                      data-lang-ja="有効期限" data-lang-zh="有效期"></span>
            </label>
            <input type="text" id="cardExpire" name="cardExpire" maxlength="4" required
                   data-lang-ko-placeholder="MM/YY" 
                   data-lang-en-placeholder="MM/YY"
                   data-lang-ja-placeholder="MM/YY"
                   data-lang-zh-placeholder="MM/YY">
        </div>
        
        <div class="input-group">
            <label for="buyerAuthNum" class="required">
                <span data-lang-ko="생년월일/사업자번호" data-lang-en="Birth Date/Business Number" 
                    data-lang-ja="生年月日/事業者番号" data-lang-zh="出生日期/营业执照号"></span>
                <small class="help-text" 
                    data-lang-ko="(생년월일 6자리 또는 사업자번호 10자리)"
                    data-lang-en="(6 digits for birth date or 10 digits for business)"
                    data-lang-ja="(生年月日6桁または事業者番号10桁)"
                    data-lang-zh="(出生日期6位或营业执照号10位)"></small>
            </label>
            <input type="text" 
                id="buyerAuthNum" 
                name="buyerAuthNum" 
                maxlength="10" 
                required
                autocomplete="off"        
                autocorrect="off"             
                autocapitalize="off"          
                spellcheck="false"            
                data-form-type="other"        
                placeholder="생년월일 6자리 또는 사업자번호 10자리" value="" />                     
        </div>
        
        <div class="input-group">
            <label for="cardPwd" class="required">
                <span data-lang-ko="카드 비밀번호" data-lang-en="Card Password" 
                      data-lang-ja="カードパスワード" data-lang-zh="卡密码"></span>
                <small class="help-text"
                       data-lang-ko="(앞 2자리)"
                       data-lang-en="(First 2 digits)"
                       data-lang-ja="(最初の2桁)"
                       data-lang-zh="(前2位)"></small>
            </label>
            <input type="password" id="cardPwd" name="cardPwd" maxlength="2" required
                   data-lang-ko-placeholder="앞 2자리"
                   data-lang-en-placeholder="First 2 digits"
                   data-lang-ja-placeholder="最初の2桁"
                   data-lang-zh-placeholder="前2位" />
        </div>

        <div class="button-group">
            <button type="submit" class="submit-btn" id="paymentButton"
                    data-lang-ko="결제하기"
                    data-lang-en="Pay Now"
                    data-lang-ja="決済する"
                    data-lang-zh="立即支付">결제하기</button>
            <button type="button" class="cancel-btn" onclick="history.back()"
                    data-lang-ko="취소"
                    data-lang-en="Cancel"
                    data-lang-ja="キャンセル"
                    data-lang-zh="取消">취소</button>
        </div>
    </form>

    <div id="loadingOverlay" style="display: none;">
        <div class="spinner"></div>
        <p data-lang-ko="결제 처리 중입니다..."
           data-lang-en="Processing payment..."
           data-lang-ja="決済処理中です..."
           data-lang-zh="支付处理中...">결제 처리 중입니다...</p>
    </div> -->

    <table class="payment-table">
        <thead>
            <tr>
                <th colspan="2" class="table-title">
                    <span data-lang-ko="카드 결제 정보 입력" 
                            data-lang-en="Card Payment Information" 
                            data-lang-ja="カード決済情報入力" 
                            data-lang-zh="信用卡支付信息"></span>
                </th>
            </tr>
        </thead>
        <!-- 결제 금액 정보 추가 -->
        <tr class="payment-amount-row">
            <th>
                <label>
                    <span data-lang-ko="결제 금액" 
                        data-lang-en="Payment Amount" 
                        data-lang-ja="決済金額" 
                        data-lang-zh="支付金额"></span>
                </label>
            </th>
            <td>
                <span class="amount">₩99,000</span>
                <input type="hidden" name="amount" value="99000">
            </td>
        </tr>
        <tbody>
        <!-- 카드번호 -->
        <tr>
            <th>
                <label for="cardNo" class="required">
                    <span data-lang-ko="카드번호" data-lang-en="Card Number" 
                            data-lang-ja="カード番号" data-lang-zh="信用卡号"></span>
                </label>
            </th>
            <td>
                <input type="text" id="cardNo" name="cardNo" maxlength="19" required
                autocomplete="off"
                        data-lang-ko-placeholder="1234 5678 9012 3456" 
                        data-lang-en-placeholder="1234 5678 9012 3456"
                        data-lang-ja-placeholder="1234 5678 9012 3456"
                        data-lang-zh-placeholder="1234 5678 9012 3456">
            </td>
        </tr>
        
        <!-- 유효기간 -->
        <tr>
            <th>
                <label for="cardExpire" class="required">
                    <span data-lang-ko="유효기간" data-lang-en="Expiry Date" 
                            data-lang-ja="有効期限" data-lang-zh="有效期"></span>
                </label>
            </th>
            <td>
                <input type="text" id="cardExpire" name="cardExpire" maxlength="5" required
                autocomplete="off"
                        data-lang-ko-placeholder="MM/YY" 
                        data-lang-en-placeholder="MM/YY"
                        data-lang-ja-placeholder="MM/YY"
                        data-lang-zh-placeholder="MM/YY">
            </td>
        </tr>
        
        <!-- 생년월일/사업자번호 -->
        <tr>
            <th>
                <label class="required">
                    <span data-lang-ko="본인확인" 
                        data-lang-en="Verification" 
                        data-lang-ja="本人確認" 
                        data-lang-zh="身份验证"></span>
                </label>
            </th>
            <td>
                <div class="auth-inputs">
                    <div class="auth-input-group">
                        <input type="radio" id="birthType" name="authType" value="birth" checked>
                        <label for="birthType" data-lang-ko="생년월일" 
                            data-lang-en="Birth Date" 
                            data-lang-ja="生年月日" 
                            data-lang-zh="出生日期"></label>
                        <input type="text" id="birthDate" name="birthDate"
                        maxlength="6"
                        autocomplete="off"
                            data-lang-ko-placeholder="생년월일 6자리"
                            data-lang-en-placeholder="6-digit birth date"
                            data-lang-ja-placeholder="生年月日6桁"
                            data-lang-zh-placeholder="出生日期6位">
                    </div>
                    <div class="auth-input-group">
                        <input type="radio" id="businessType" name="authType" value="business">
                        <label for="businessType" data-lang-ko="사업자번호" 
                            data-lang-en="Business Number" 
                            data-lang-ja="事業者番号" 
                            data-lang-zh="营业执照号"></label>
                        <input type="text" id="businessNumber" name="businessNumber" 
                            maxlength="10" 
                            disabled
                            autocomplete="off"
                            data-lang-ko-placeholder="사업자번호 10자리"
                            data-lang-en-placeholder="10-digit business number"
                            data-lang-ja-placeholder="事業者番号10桁"
                            data-lang-zh-placeholder="营业执照号10位">
                    </div>
                </div>
                <small class="error-message" id="authError" style="display:none; color: #ff4444;">
                    <span data-lang-ko="생년월일 또는 사업자번호를 입력해주세요."
                        data-lang-en="Please enter either birth date or business number."
                        data-lang-ja="生年月日または事業者番号を入力してください。"
                        data-lang-zh="请输入出生日期或营业执照号。"></span>
                </small>
            </td>
        </tr>
        
        <!-- 카드 비밀번호 -->
        <tr>
            <th>
                <label for="cardPwd" class="required">
                    <span data-lang-ko="카드 비밀번호" data-lang-en="Card Password" 
                            data-lang-ja="カードパスワード" data-lang-zh="卡密码"></span>
                </label>
            </th>
            <td>
                <input type="password" 
                        id="cardPwd" 
                        name="cardPwd" 
                        maxlength="2" 
                        required
                        inputmode="numeric"
                        pattern="\d{2}"
                        autocomplete="new-password"
                        data-lang-ko-placeholder="앞 2자리"
                        data-lang-en-placeholder="First 2 digits"
                        data-lang-ja-placeholder="最初の2桁"
                        data-lang-zh-placeholder="前2位">
                <small class="help-text"
                        data-lang-ko="(앞 2자리)"
                        data-lang-en="(First 2 digits)"
                        data-lang-ja="(最初の2桁)"
                        data-lang-zh="(前2位)"></small>
            </td>
        </tr>
        <tr>
            <th>
                <label for="buyerEmail" class="required">
                    <span data-lang-ko="이메일" data-lang-en="Email" 
                        data-lang-ja="メール" data-lang-zh="电子邮箱"></span>
                </label>
            </th>
            <td>
                <!-- 이메일 input -->
                <input type="email" 
                    id="buyerEmail" 
                    name="buyerEmail" 
                    required 
                    pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                    data-lang-ko-placeholder="예: example@email.com"
                    data-lang-en-placeholder="e.g. example@email.com"
                    data-lang-ja-placeholder="例: example@email.com"
                    data-lang-zh-placeholder="例: example@email.com">
                <small class="help-text error-message" id="emailError" style="display:none; color: #ff4444;">
                    <span data-lang-ko="올바른 이메일 주소를 입력해주세요."
                        data-lang-en="Please enter a valid email address."
                        data-lang-ja="有効なメールアドレスを入力してください。"
                        data-lang-zh="请输入有效的电子邮箱地址。"></span>
                </small>
            </td>
        </tr>
        <!-- 기존 입력 필드들 다음에 추가 -->
        <tr style="display: none;">
            <td>
                <input type="text" 
                    name="username" 
                    id="username" 
                    autocomplete="username" 
                    style="display: none;" />
            </td>
        </tr>
        
        </tbody>
        <tfoot>
        <!-- 버튼 그룹 -->
        <tr>
            <td colspan="2" class="button-cell">
                <div class="button-group">
                    <button type="submit" class="submit-btn" id="paymentButton"
                            data-lang-ko="결제하기"
                            data-lang-en="Pay Now"
                            data-lang-ja="決済する"
                            data-lang-zh="立即支付">결제하기</button>
                    <button type="button" class="cancel-btn" onclick="history.back()"
                            data-lang-ko="취소"
                            data-lang-en="Cancel"
                            data-lang-ja="キャンセル"
                            data-lang-zh="取消">취소</button>
                </div>
            </td>
        </tr>
    </table>
    </form>

    <!-- 로딩 인디케이터 -->
    <div id="loadingOverlay" style="display: none;">
        <div class="spinner"></div>
        <p data-lang-ko="결제 처리 중입니다..."
           data-lang-en="Processing payment..."
           data-lang-ja="決済処理中です..."
           data-lang-zh="支付处理中...">결제 처리 중입니다...</p>
    </div>
    

    <script>
        // 전역 언어 변수 설정
        const defaultLang = 'ko';
        let currentLang = defaultLang;
        window.onload = function() {
			var buyerEmail = document.getElementById('buyerEmail');
            buyerEmail.type = 'text';
            buyerEmail.removeAttribute('autocomplete');
	    }


        // 언어 변경 함수
        function updateLanguage(lang) {
            currentLang = lang || defaultLang;
            
            document.querySelectorAll('[data-lang-' + currentLang + ']').forEach(element => {
                if (element.tagName === 'INPUT') {
                    // placeholder 업데이트
                    const placeholder = element.getAttribute('data-lang-' + currentLang + '-placeholder');
                    if (placeholder) {
                        element.placeholder = placeholder;
                    }
                } else {
                    // 텍스트 컨텐츠 업데이트
                    const text = element.getAttribute('data-lang-' + currentLang);
                    if (text) {
                        element.textContent = text;
                    }
                }
            });
        }
        // 페이지 로드 시 언어 설정
        document.addEventListener('DOMContentLoaded', function() {
            // URL 파라미터에서 언어 가져오기
            const urlParams = new URLSearchParams(window.location.search);
            const langParam = urlParams.get('lang');
            // hidden input에서 언어 가져오기
            const langInput = document.querySelector('input[name="lang"]');
            const langValue = langInput ? langInput.value : null;

            // localStorage에서 언어 가져오기
            const storedLang = localStorage.getItem('preferredLanguage');

            // 우선순위: URL 파라미터 > form input > localStorage > 기본값
            const lang = langParam || langValue || storedLang || defaultLang;
            // const lang = document.querySelector('input[name="lang"]').value || 'ko';
            updateLanguage(lang);
        });

        // 카드번호 포맷팅
        // 카드 번호 포맷팅 및 제어
        document.getElementById('cardNo').addEventListener('input', function(e) {
            // 현재 입력된 값에서 숫자만 추출
            let value = this.value.replace(/\D/g, '');
            
            // 콘솔에 현재 입력 길이 출력 (디버깅용)
            console.log('Current length:', value.length);
            
            // 16자리로 제한
            if (value.length > 16) {
                value = value.slice(0, 16);
            }
            
            // 4자리씩 공백으로 구분
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            // 값 설정
            this.value = formattedValue;
        });

        // 유효기간 포맷팅 및 제어
        document.getElementById('cardExpire').addEventListener('input', function(e) {
            // 숫자만 추출
            let value = this.value.replace(/\D/g, '');
            
            // 4자리로 제한
            if (value.length > 4) {
                value = value.slice(0, 4);
            }
            
            // MM/YY 형식으로 포맷팅
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            
            this.value = value;
        });

        // 카드 비밀번호 입력 제어
        document.getElementById('cardPwd').addEventListener('input', function(e) {
            // 숫자만 입력 가능하도록
            let value = this.value.replace(/\D/g, '');
            
            // 2자리로 제한
            if (value.length > 2) {
                value = value.slice(0, 2);
            }
            
            // 값 설정
            this.value = value;
            
            // 디버깅용 콘솔 출력
            console.log('Password length:', value.length);
        });

        // 라디오 버튼 이벤트 처리
        document.querySelectorAll('input[name="authType"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const birthDate = document.getElementById('birthDate');
                const businessNumber = document.getElementById('businessNumber');
                
                if (this.value === 'birth') {
                    birthDate.disabled = false;
                    businessNumber.disabled = true;
                    businessNumber.value = '';
                } else {
                    birthDate.disabled = true;
                    businessNumber.disabled = false;
                    birthDate.value = '';
                }
            });
        });

        // 이메일 유효성 검사 함수
        function validateEmail(email) {
            const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return re.test(String(email).toLowerCase());
        }

        // 이메일 입력 필드 이벤트 리스너
        document.getElementById('buyerEmail').addEventListener('input', function(e) {
            const emailError = document.getElementById('emailError');
            const isValid = validateEmail(this.value);
            
            if (!isValid && this.value) {
                emailError.style.display = 'block';
                this.classList.add('error');
            } else {
                emailError.style.display = 'none';
                this.classList.remove('error');
            }
        });

        // document.cardPaymentForm.addEventListener('submit', function(e) {
        //     e.preventDefault();
        //     if (validateForm()) {
        //         this.submit();
        //     }
        // });

        const existingFormSubmit = document.forms['cardPaymentForm'].onsubmit;
        document.forms['cardPaymentForm'].addEventListener('submit', async function(e) {
            e.preventDefault();

            const birthDate = document.getElementById('birthDate');
            const businessNumber = document.getElementById('businessNumber');
            const authError = document.getElementById('authError');
            const cardNo = document.getElementById('cardNo');
            const cardExpire = document.getElementById('cardExpire');

            console.log('click....');

            const cardNoValue = cardNo.value.replace(/\s/g, '');
            if (cardNoValue.length !== 16) {
                e.preventDefault();
                alert('카드번호 16자리를 모두 입력해주세요.');
                cardNo.focus();
                return false;
            }

            // 유효기간 검증
            const expireValue = cardExpire.value.replace('/', '');
            if (expireValue.length !== 4) {
                e.preventDefault();
                alert('유효기간을 정확히 입력해주세요. (MM/YY)');
                cardExpire.focus();
                return false;
            }

            // 월 검증 (01-12)
            const month = parseInt(expireValue.slice(0, 2));
            if (month < 1 || month > 12) {
                e.preventDefault();
                alert('올바른 월을 입력해주세요. (01-12)');
                cardExpire.focus();
                return false;
            }

            // 카드 비밀번호 검증
            const cardPwd = document.getElementById('cardPwd');
            if (cardPwd.value.length !== 2) {
                e.preventDefault();
                alert('카드 비밀번호 앞 2자리를 입력해주세요.');
                cardPwd.focus();
                return false;
            }
            
            // 숫자만 입력되었는지 확인
            if (!/^\d{2}$/.test(cardPwd.value)) {
                e.preventDefault();
                alert('카드 비밀번호는 숫자만 입력 가능합니다.');
                cardPwd.focus();
                return false;
            }

            // 숫자만 입력되었는지 체크
            const isNumeric = (value) => /^\d+$/.test(value);

            // 생년월일 또는 사업자번호 중 하나는 반드시 입력되어야 함
            if ((!birthDate.disabled && !birthDate.value) && 
                (!businessNumber.disabled && !businessNumber.value)) {
                e.preventDefault();
                authError.style.display = 'block';
                return;
            }
            
            // 생년월일 검증
            if (!birthDate.disabled && birthDate.value) {
                if (!isNumeric(birthDate.value) || birthDate.value.length !== 6) {
                    e.preventDefault();
                    authError.textContent = '생년월일은 6자리 숫자로 입력해주세요.';
                    authError.style.display = 'block';
                    birthDate.focus();
                    return;
                }
            }
    
            // 사업자번호 검증
            if (!businessNumber.disabled && businessNumber.value) {
                if (!isNumeric(businessNumber.value) || businessNumber.value.length !== 10) {
                    e.preventDefault();
                    authError.textContent = '사업자번호는 10자리 숫자로 입력해주세요.';
                    authError.style.display = 'block';
                    businessNumber.focus();
                    return;
                }
            }
    
            authError.style.display = 'none';

            // 숫자만 입력 가능하도록 제한
            ['birthDate', 'businessNumber'].forEach(id => {
                document.getElementById(id).addEventListener('input', function(e) {
                    this.value = this.value.replace(/[^\d]/g, '');
                });
            });

            const emailInput = document.getElementById('buyerEmail');
            if (!validateEmail(emailInput.value)) {
                e.preventDefault();
                const emailError = document.getElementById('emailError');
                emailError.style.display = 'block';
                emailInput.classList.add('error');
                emailInput.focus();
                return false;
            }
            // 기존 onsubmit 함수가 있다면 실행
            // return existingFormSubmit ? existingFormSubmit.call(this, e) : true;

            // 버튼 비활성화 및 로딩 표시
            document.getElementById('paymentButton').disabled = true;
            document.getElementById('loadingOverlay').style.display = 'block';

            const formData = new FormData(this);
            formData.append('lang', currentLang);
            
            try {
                // 폼 검증
                if (!validateForm()) {
                    return;
                }
                
                // 버튼 비활성화 및 로딩 표시
                // document.getElementById('paymentButton').disabled = true;
                // document.getElementById('loadingOverlay').style.display = 'block';
                
                // const formData = new FormData(this);
                // formData.append('lang', currentLang); // 현재 언어 추가
                
                // API 요청
                const response = await fetch('<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // alert('결제가 완료되었습니다.');
                    // alert('결제가 성공적으로 완료되었습니다.\n메인 페이지로 이동합니다.');
                    // window.location.href = 'payment_success.php?order_id=' + encodeURIComponent(formData.get('order_id'));
                    alert(getTranslation('paymentSuccess', currentLang));
                    window.location.href = 'listing.html';
                } else {
                    throw new Error(result.message || getTranslation('paymentError', currentLang));
                }
                
            } catch (error) {
                alert(error.message);
            } finally {
                // 버튼 활성화 및 로딩 제거
                document.getElementById('paymentButton').disabled = false;
                document.getElementById('loadingOverlay').style.display = 'none';
            }

            // return true;
        });

        // 다국어 메시지
        const translations = {
            paymentSuccess: {
                ko: '결제가 성공적으로 완료되었습니다.\n메인 페이지로 이동합니다.',
                en: 'Payment completed successfully.\nRedirecting to main page.',
                ja: '決済が正常に完了しました。\nメインページに移動します。',
                zh: '支付成功完成。\n正在跳转到主页。'
            },
            paymentError: {
                ko: '결제 처리 중 오류가 발생했습니다.',
                en: 'An error occurred during payment processing.',
                ja: '決済処理中にエラーが発生しました。',
                zh: '支付处理过程中发生错误。'
            }
        };

        function getTranslation(key, lang) {
            return translations[key]?.[lang] || translations[key]?.['ko'] || '';
        }


        // 폼 검증
        function validateForm() {
            const cardNo = document.getElementById('cardNo').value.replace(/\s/g, '');
            const cardExpire = document.getElementById('cardExpire').value;
            const buyerAuthNum = document.getElementById('buyerAuthNum').value;
            const cardPwd = document.getElementById('cardPwd').value;

            const validationMessages = {
                invalidCard: {
                    ko: '올바른 카드번호를 입력해주세요.',
                    en: 'Please enter a valid card number.',
                    ja: '正しいカード番号を入力してください。',
                    zh: '请输入正确的信用卡号。'
                },
                invalidExpiry: {
                    ko: '올바른 유효기간을 입력해주세요.',
                    en: 'Please enter a valid expiry date.',
                    ja: '正しい有効期限を入力してください。',
                    zh: '请输入正确的有效期。'
                },
                invalidAuthNum: {
                    ko: '올바른 생년월일 또는 사업자번호를 입력해주세요.',
                    en: 'Please enter a valid birth date or business number.',
                    ja: '正しい生年月日または事業者番号を入力してください。',
                    zh: '请输入正确的出生日期或营业执照号。'
                },
                invalidPwd: {
                    ko: '카드 비밀번호 앞 2자리를 입력해주세요.',
                    en: 'Please enter the first 2 digits of your card password.',
                    ja: 'カードパスワードの最初の2桁を入力してください。',
                    zh: '请输入信用卡密码前2位。'
                }
            };

            if (cardNo.length !== 16) {
                alert(validationMessages.invalidCard[currentLang]);
                return false;
            }
            if (cardExpire.length !== 5) {
                alert(validationMessages.invalidExpiry[currentLang]);
                return false;
            }
            if (buyerAuthNum.length !== 6 && buyerAuthNum.length !== 10) {
                alert(validationMessages.invalidAuthNum[currentLang]);
                return false;
            }
            if (cardPwd.length !== 2) {
                alert(validationMessages.invalidPwd[currentLang]);
                return false;
            }
            return true;
        }
    </script>
</body>
</html>
