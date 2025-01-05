<?php
header("Content-Type:text/html; charset=euc-kr;"); 
/*
****************************************************************************************
* <���� ��� �Ķ����>
****************************************************************************************
*/
$authResultCode = $_POST['AuthResultCode'];		// ������� : 0000(����)
$authResultMsg = $_POST['AuthResultMsg'];		// ������� �޽���
$nextAppURL = $_POST['NextAppURL'];				// ���� ��û URL
$txTid = $_POST['TxTid'];						// �ŷ� ID
$authToken = $_POST['AuthToken'];				// ���� TOKEN
$payMethod = $_POST['PayMethod'];				// ��������
$mid = $_POST['MID'];							// ���� ���̵�
$moid = $_POST['Moid'];							// ���� �ֹ���ȣ
$amt = $_POST['Amt'];							// ���� �ݾ�
$reqReserved = $_POST['ReqReserved'];			// ���� �����ʵ�
$netCancelURL = $_POST['NetCancelURL'];			// ����� ��û URL
//$authSignature = $_POST['Signature'];			// Nicepay���� ������ ���䰪�� ���Ἲ ���� Data

/*  
****************************************************************************************
* Signature : ��û �����Ϳ� ���� ���Ἲ ������ ���� �����ϴ� �Ķ���ͷ� ���� ���� ��û �� ���� �� ���� ���� �̽��� �߻��� ���� ��Ҹ� �����ϱ� ���� ���� �� ����Ͻñ� �ٶ�� 
* ������ ���� �̻������ ���� �߻��ϴ� �̽��� ����� å���� ���� �����Ͻñ� �ٶ��ϴ�.
****************************************************************************************
 */
$merchantKey = "EYzu8jGGMfqaDEp76gSckuvnaHHu+bC4opsSN6lHv3b2lurNYkVXrZ7Z1AoqQnXI3eLuaUFyoRNC6FkrzVjceg=="; // ����Ű

// ���� ���� Signature = hex(sha256(AuthToken + MID + Amt + MerchantKey)
//$authComparisonSignature = bin2hex(hash('sha256', $authToken. $mid. $amt. $merchantKey, true)); 

/*
****************************************************************************************
* <���� ��� �Ķ���� ����>
* ���������������� ���� ��� �Ķ���� �� �Ϻθ� ���õǾ� ������, 
* �߰������� ����Ͻ� �Ķ���ʹ� �����޴����� �����ϼ���.
****************************************************************************************
*/

$response = "";

// ���� �������� ���� Signature ������ ���� ���Ἲ ������ �����Ͽ��� �մϴ�.
if($authResultCode === "0000" /* && $authSignature == $authComparisonSignature*/){	
	/*
	****************************************************************************************
	* <�ؽ���ȣȭ> (�������� ������)
	* SHA-256 �ؽ���ȣȭ�� �ŷ� �������� �������� ����Դϴ�. 
	****************************************************************************************
	*/	
	$ediDate = date("YmdHis");
	$signData = bin2hex(hash('sha256', $authToken . $mid . $amt . $ediDate . $merchantKey, true));

	try{
		$data = Array(
			'TID' => $txTid,
			'AuthToken' => $authToken,
			'MID' => $mid,
			'Amt' => $amt,
			'EdiDate' => $ediDate,
			'SignData' => $signData
		);		
		$response = reqPost($data, $nextAppURL); //���� ȣ��
		
		jsonRespDump($response); //response json dump example
		
	}catch(Exception $e){
		$e->getMessage();
		$data = Array(
			'TID' => $txTid,
			'AuthToken' => $authToken,
			'MID' => $mid,
			'Amt' => $amt,
			'EdiDate' => $ediDate,
			'SignData' => $signData,
			'NetCancel' => '1'
		);
		$response = reqPost($data, $netCancelURL); //���� �߻��� ����� ����
		
		jsonRespDump($response); //response json dump example
	}	
	
}else /*if($authComparisonSignature == $authSignature)*/{
	//���� ���� �ϴ� ��� ����ڵ�, �޽���
	$ResultCode = $authResultCode; 	
	$ResultMsg = $authResultMsg;
}/*else{
	echo('���� ���� Signature : '. $authSignature.'</br');
	echo('���� ���� Signature : '. $authComparisonSignature);
}*/

// API CALL foreach ����
function jsonRespDump($resp){
	//global $mid, $merchantKey;
	$resp_utf = iconv("EUC-KR", "UTF-8", $resp); 
	$respArr = json_decode($resp_utf);
	foreach ( $respArr as $key => $value ){
		/*if($key == "Amt" || $key == "CancelAmt"){
			$payAmt = $value;
		}
		/*if($key == "TID"){
			$tid = $value;
		}
		// ���� �������� ���� Signature ������ ���� ���Ἲ ������ �����Ͽ��� �մϴ�.
		if($key == "Signature"){
			$paySignature = bin2hex(hash('sha256', $tid. $mid. $payAmt. $merchantKey, true));
			if($value != $pay_Signature){
				echo '������ �ŷ�! ��� ��û�� �ʿ��մϴ�.</br>';
				echo '���� ���� Signature : '. $value. '</br>';
				echo '���� ���� Signature : '. $paySignature. '</br>';
			}
		}*/
		echo "$key=". iconv("UTF-8", "EUC-KR", $value)."<br />";
	}
}

//Post api call
function reqPost(Array $data, $url){
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);					//connection timeout 15 
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));	//POST data
	curl_setopt($ch, CURLOPT_POST, true);
	$response = curl_exec($ch);
	curl_close($ch);	 
	return $response;
}
?>