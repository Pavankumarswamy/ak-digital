<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Ensure it is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed"]);
    exit;
}

// Get POST input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data || !isset($data['messages'])) {
    http_response_code(400);
    echo json_encode(["error" => "Bad Request: Missing messages"]);
    exit;
}

$apiKey = "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";

// Call NVIDIA API
$ch = curl_init("https://integrate.api.nvidia.com/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "model" => "openai/gpt-oss-120b",
    "messages" => $data['messages'],
    "temperature" => 1,
    "top_p" => 1,
    "max_tokens" => 4096,
    "stream" => false
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer " . $apiKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Output response
header("Content-Type: application/json");
http_response_code($httpCode);
echo $response;
