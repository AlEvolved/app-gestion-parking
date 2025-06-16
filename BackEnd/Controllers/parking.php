<?php
/**
 * API de gestion des places de parking
 */

// Configurer les headers pour CORS et JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Se connecter à la base de données
require_once '../config/database.php';
require_once '../models/Place.php';
require_once '../models/Parking.php';

// Initialiser la connexion
$database = new Database();
$db = $database->getConnection();

// Créer les instances des modèles
$placeModel = new Place($db);
$parkingModel = new Parking($db);

// Récupérer la méthode HTTP et l'action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Traiter la requête en fonction de la méthode et de l'action
try {
    switch ($method) {
        case 'GET':
            handleGet($action, $placeModel, $parkingModel);
            break;

        case 'POST':
            handlePost($action, $placeModel);
            break;

        case 'PUT':
            handlePut($action, $placeModel);
            break;

        case 'DELETE':
            handleDelete($action, $placeModel);
            break;

        default:
            sendResponse(false, "Méthode non autorisée", null, 405);
    }
} catch (Exception $e) {
    sendResponse(false, "Erreur serveur: " . $e->getMessage(), null, 500);
}

/**
 * Gère les requêtes GET
 */
function handleGet($action, $placeModel, $parkingModel) {
    switch ($action) {
        case 'getAllPlaces':
            $result = $placeModel->getAll();
            sendResponse($result['success'], $result['message'] ?? '', $result['data'] ?? null);
            break;

        case 'getPlaceById':
            if (!isset($_GET['id'])) {
                sendResponse(false, "ID de place manquant", null, 400);
                break;
            }
            $id = intval($_GET['id']);
            $result = $placeModel->getById($id);
            sendResponse($result['success'], $result['message'] ?? '', $result['data'] ?? null);
            break;

        case 'getAllParkings':
            $result = $parkingModel->getAll();
            sendResponse($result['success'], $result['message'] ?? '', $result['data'] ?? null);
            break;

        default:
            sendResponse(false, "Action inconnue", null, 400);
    }
}

/**
 * Gère les requêtes POST
 */
function handlePost($action, $placeModel) {
    // Récupérer les données envoyées
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        sendResponse(false, "Aucune donnée reçue ou format JSON invalide", null, 400);
        return;
    }

    switch ($action) {
        case 'createPlace':
            $result = $placeModel->create($data);
            sendResponse($result['success'], $result['message'] ?? '', $result['data'] ?? null);
            break;

        default:
            sendResponse(false, "Action inconnue", null, 400);
    }
}

/**
 * Gère les requêtes PUT
 */
function handlePut($action, $placeModel) {
    // Récupérer les données envoyées
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        sendResponse(false, "Aucune donnée reçue ou format JSON invalide", null, 400);
        return;
    }

    switch ($action) {
        case 'updatePlace':
            if (!isset($data['id'])) {
                sendResponse(false, "ID de place manquant", null, 400);
                break;
            }
            $result = $placeModel->update($data);
            sendResponse($result['success'], $result['message'] ?? '', $result['data'] ?? null);
            break;

        default:
            sendResponse(false, "Action inconnue", null, 400);
    }
}

/**
 * Gère les requêtes DELETE
 */
function handleDelete($action, $placeModel) {
    switch ($action) {
        case 'deletePlace':
            if (!isset($_GET['id'])) {
                sendResponse(false, "ID de place manquant", null, 400);
                break;
            }
            $id = intval($_GET['id']);
            $result = $placeModel->delete($id);
            sendResponse($result['success'], $result['message'] ?? '', $result['data'] ?? null);
            break;

        default:
            sendResponse(false, "Action inconnue", null, 400);
    }
}

/**
 * Envoie une réponse JSON
 */
function sendResponse($success, $message, $data = null, $httpCode = 200) {
    http_response_code($httpCode);

    $response = [
        'success' => $success,
        'timestamp' => date('Y-m-d H:i:s')
    ];

    if (!empty($message)) {
        $response['message'] = $message;
    }

    if ($data !== null) {
        $response['data'] = $data;
    }

    echo json_encode($response);
    exit;
}