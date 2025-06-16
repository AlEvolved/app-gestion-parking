<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/Database.php';
require_once '../Models/Place.php';

$database = new Database();
$conn = $database->getConnection();
$placeModel = new Place($conn);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $placeModel->getAll();
    echo json_encode($result);
    $conn->close();
    exit;
}

echo json_encode(['success' => false, 'message' => 'Méthode non supportée']);
$conn->close();
?>