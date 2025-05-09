<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode([
        'authenticated' => false
    ]);
    exit;
}

echo json_encode([
    'authenticated' => true,
    'user' => [
        'email' => $_SESSION['email']
    ]
]);