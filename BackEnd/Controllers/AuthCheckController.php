<?php
session_start();

// Durée de vie de la session
ini_set('session.gc_maxlifetime', 7200);
setcookie(session_name(), session_id(), time() + 7200, '/');

// CORS
$allowedOrigins = [
    'http://localhost',
    'http://localhost:8000',
    'http://127.0.0.1',
    'http://127.0.0.1:8000'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Content-Type: application/json');
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'authenticated' => true,
        'user_id' => $_SESSION['user_id'],
        'role' => $_SESSION['role'] ?? 'utilisateur',
        'email' => $_SESSION['email'] ?? ''
    ]);
} else {
    echo json_encode([
        'authenticated' => false,
        'message' => 'Non authentifié'
    ]);
}
?>