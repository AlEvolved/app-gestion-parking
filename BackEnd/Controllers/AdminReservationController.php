<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
require_once '../config/Database.php';
require_once '../Models/Reservation.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérification admin
if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode([
        'success' => false,
        'message' => 'Accès refusé'
    ]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$reservation = new Reservation($db);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $filters = [];
        if (isset($_GET['statut']) && !empty($_GET['statut'])) $filters['statut'] = $_GET['statut'];
        if (isset($_GET['date']) && !empty($_GET['date'])) $filters['date'] = $_GET['date'];
        if (isset($_GET['search']) && !empty($_GET['search'])) $filters['search'] = $_GET['search'];
        // Ne jamais filtrer par user_id ici pour l'admin
        $result = $reservation->getAll($filters);
        echo json_encode($result);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['utilisateur_id'], $data['place_id'], $data['date_debut'], $data['date_fin'], $data['statut'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Données incomplètes'
            ]);
            exit;
        }
        $result = $reservation->create($data);
        echo json_encode($result);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['id'], $data['utilisateur_id'], $data['place_id'], $data['date_debut'], $data['date_fin'], $data['statut'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Données incomplètes'
            ]);
            exit;
        }
        $result = $reservation->update($data);
        echo json_encode($result);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['id'])) {
            $result = $reservation->delete($data['id']);
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