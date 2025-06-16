<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require_once '../config/Database.php';
require_once '../Models/Reservation.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Non authentifié'
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$reservation = new Reservation($db);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['id'])) {
            $result = $reservation->getById($_GET['id']);
            echo json_encode($result);
        } else {
            $filters = [];
            if (isset($_GET['statut']) && !empty($_GET['statut'])) $filters['statut'] = $_GET['statut'];
            if (isset($_GET['date']) && !empty($_GET['date'])) $filters['date'] = $_GET['date'];
            if (isset($_GET['search']) && !empty($_GET['search'])) $filters['search'] = $_GET['search'];
            if (isset($_GET['page'])) $filters['page'] = (int)$_GET['page'];
            if (isset($_GET['limit'])) $filters['limit'] = (int)$_GET['limit'];
            $result = $reservation->getAll($filters);
            echo json_encode($result);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $result = $reservation->create($data);
        echo json_encode($result);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $result = $reservation->update($data);
        echo json_encode($result);
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $result = $reservation->delete($_GET['id']);
            echo json_encode($result);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'ID non spécifié'
            ]);
        }
        break;

    default:
        echo json_encode([
            'success' => false,
            'message' => 'Méthode non supportée'
        ]);
        break;
}