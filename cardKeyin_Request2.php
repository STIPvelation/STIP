<?php

header("Content-Type:text/html; charset=utf-8;");

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();


/**
 * Nice Pay Payment Integration Script
 * This script handles card key-in requests and integrates with the Nice Pay API.
 */

// Error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Load required libraries or helpers (if needed)
// Example: require 'vendor/autoload.php';

// Define constants for API credentials and endpoints
define('NICEPAY_API_URL', 'https://api.nicepay.co.kr/v1/payments'); // Replace with the correct Nice Pay endpoint
define('MERCHANT_ID', $_ENV['NICE_MERCHANT_ID']);
define('MERCHANT_KEY', $_ENV['NICE_MERCHANT_KEY']);

define('LOG_FILE', 'logs/nicepay.log'); // Log file path

/**
 * Utility function to log messages
 *
 * @param string $message
 */
function logMessage($message)
{
    file_put_contents(LOG_FILE, date('[Y-m-d H:i:s]') . ' ' . $message . PHP_EOL, FILE_APPEND);
}

// 거래번호 생성 함수
function generateTID() {
    $dateTime = date("YmdHis");
    $sequence = str_pad(mt_rand(0, 9999), 4, "0", STR_PAD_LEFT);
    return 'G' . $dateTime . $sequence;
}

// Check if the form is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve POST data securely
    $cardNumber = $_POST['cardNumber'] ?? '';
    $expiryDate = $_POST['expiryDate'] ?? '';
    $cvv = $_POST['cvv'] ?? '';
    $amount = $_POST['amount'] ?? '';
    $currency = $_POST['currency'] ?? 'KRW';
    $customerName = $_POST['customerName'] ?? '';
    $transactionId = generateTID(); //uniqid('NICEPAY_', true); // Generate unique transaction ID

    // Validate input
    if (!$cardNumber || !$expiryDate || !$cvv || !$amount || !$customerName) {
        logMessage('Validation error: Missing required fields');
        die(json_encode(['status' => 'error', 'message' => 'Invalid input']));
    }

    // Prepare data payload for Nice Pay API
    $requestPayload = [
        'merchantId' => MERCHANT_ID,
        'transactionId' => $transactionId,
        'cardNumber' => $cardNumber,
        'expiryDate' => $expiryDate,
        'cvv' => $cvv,
        'amount' => $amount,
        'currency' => $currency,
        'customerName' => $customerName,
        'timestamp' => date('YmdHis'),
        'signature' => hash_hmac('sha256', MERCHANT_ID . $transactionId . $amount, MERCHANT_KEY)
    ];

    logMessage('Request payload prepared: ' . json_encode($requestPayload));

    // cURL setup to send the API request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, NICEPAY_API_URL);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestPayload));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);

    $response = curl_exec($ch);
    $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_errno($ch)) {
        $errorMsg = curl_error($ch);
        logMessage('cURL error: ' . $errorMsg);
        die(json_encode(['status' => 'error', 'message' => $errorMsg]));
    }

    curl_close($ch);

    logMessage('Response received: ' . $response);

    $responseData = json_decode($response, true);

    // Check API response status
    if ($httpStatus === 200 && isset($responseData['status']) && $responseData['status'] === 'success') {
        logMessage('Payment successful: ' . $responseData['transactionId']);
        echo json_encode(['status' => 'success', 'data' => $responseData]);
    } else {
        $errorDetails = $responseData['message'] ?? 'Unknown error';
        logMessage('Payment failed: ' . $errorDetails);
        echo json_encode(['status' => 'error', 'message' => $errorDetails]);
    }
} else {
    // Display the input form
    echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card Payment Form</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 0;
        }
        form {
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        input[type="text"], input[type="number"] {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            padding: 10px 15px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>
    <h2>Enter Card Information</h2>
    <form method="POST" action="">
        <label for="customerName">Name:</label>
        <input type="text" id="customerName" name="customerName" required>

        <label for="cardNumber">Card Number:</label>
        <input type="text" id="cardNumber" name="cardNumber" maxlength="16" required>

        <label for="expiryDate">Expiry Date (MMYY):</label>
        <input type="text" id="expiryDate" name="expiryDate" maxlength="4" required>

        <label for="cvv">CVV:</label>
        <input type="number" id="cvv" name="cvv" maxlength="3" required>

        <label for="amount">Amount:</label>
        <input type="number" id="amount" name="amount" required>

        <button type="submit">Submit Payment</button>
    </form>
</body>
</html>';
}

?>
