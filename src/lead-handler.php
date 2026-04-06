<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method Not Allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody ?: '{}', true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Bad Request'], JSON_UNESCAPED_UNICODE);
    exit;
}

$phone = trim((string)($data['phone'] ?? ''));
if ($phone === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Phone is required'], JSON_UNESCAPED_UNICODE);
    exit;
}

date_default_timezone_set('Europe/Moscow');
$timestamp = date('d.m.Y H:i:s') . ' МСК';
$line = $timestamp . ' | новая заявка! - номер: ' . $phone . PHP_EOL;

$filePath = __DIR__ . DIRECTORY_SEPARATOR . 'leads.txt';
$fp = fopen($filePath, 'ab');

if ($fp === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Cannot open leads file'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (flock($fp, LOCK_EX)) {
    fwrite($fp, $line);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    http_response_code(200);
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

fclose($fp);
http_response_code(500);
echo json_encode(['ok' => false, 'error' => 'Cannot lock leads file'], JSON_UNESCAPED_UNICODE);
