<?php
// 사용자의 IP 주소를 가져오기
$ip = $_SERVER['REMOTE_ADDR'];

// IP-API 요청 URL
$apiUrl = "http://ip-api.com/json/{$ip}";

// cURL로 API 요청
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// API 응답 처리
$data = json_decode($response, true);

if ($data['status'] === 'success') {
  echo json_encode([
    'query' => $data['query'],
    'status' => $data['status'],
    'countryCode' => $data['countryCode'],
    'country' => $data['country'],
    'region' => $data['regionName'],
    'city' => $data['city'],
    'lat' => $data['lat'],
    'lon' => $data['lon']
  ]);
} else {
  echo json_encode(['error' => '위치 정보를 가져올 수 없습니다.']);
}
