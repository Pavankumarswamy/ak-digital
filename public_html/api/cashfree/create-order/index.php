<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed"]);
    exit;
}

$input = file_get_contents("php://input");
$body = json_decode($input, true);

if (!$body || !isset($body['order_amount'])) {
    http_response_code(400);
    echo json_encode(["error" => "Bad Request: Missing order_amount"]);
    exit;
}

$appId = "dummy_app_id";
$secretKey = "dummy_secret_key";

$customerId = isset($body['customer_id']) ? $body['customer_id'] : "cust_" . time();
$customerName = isset($body['customer_name']) ? $body['customer_name'] : "Customer";
$customerEmail = isset($body['customer_email']) ? $body['customer_email'] : "no-reply@akdigitalhub.com";
$customerPhone = isset($body['customer_phone']) ? $body['customer_phone'] : "9999999999";
$returnUrl = isset($body['return_url']) ? $body['return_url'] : "https://akdigitalhub.com/success";
$orderNote = isset($body['order_note']) ? $body['order_note'] : "";

$payload = [
    "order_amount" => $body['order_amount'],
    "order_currency" => "INR",
    "customer_details" => [
        "customer_id" => $customerId,
        "customer_name" => $customerName,
        "customer_email" => $customerEmail,
        "customer_phone" => $customerPhone
    ],
    "order_meta" => [
        "return_url" => $returnUrl
    ],
    "order_note" => $orderNote
];

$ch = curl_init("https://api.cashfree.com/pg/orders");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "x-client-id: " . $appId,
    "x-client-secret: " . $secretKey,
    "x-api-version: 2023-08-01"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

header("Content-Type: application/json");
http_response_code($httpCode);
echo $response;
