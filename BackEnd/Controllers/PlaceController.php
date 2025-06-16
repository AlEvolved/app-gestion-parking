<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Non authentifié']);
    exit;
}

require_once '../config/Database.php';
require_once '../Models/Place.php';
$database = new Database();
$conn = $database->getConnection();
$place = new Place($conn);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['id'])) {
            $result = $place->getById($_GET['id']);
        } else {
            $result = $place->getAll();
        }
        echo json_encode($result);
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $result = $place->create($data);
        echo json_encode($result);
        break;
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $result = $place->update($data);
        echo json_encode($result);
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            $result = $place->delete($_GET['id']);
            echo json_encode($result);
        } else {
            echo json_encode(['success' => false, 'message' => 'ID non spécifié']);
        }
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Méthode non supportée']);
}
$conn->close();