<?php
session_start();
require_once __DIR__ . '/../config/Database.php';

// Augmenter la durée de vie de la session à 2 heures
ini_set('session.gc_maxlifetime', 7200);
session_set_cookie_params(7200, '/');

// Déterminer l'origine de la requête
$allowedOrigins = [
    'http://localhost',
    'http://localhost:8000',
    'http://127.0.0.1',
    'http://127.0.0.1:8000'
];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Headers CORS
header('Content-Type: application/json');
if(in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Traitement des requêtes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Récupération des données
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Email et mot de passe requis'
    ]);
    exit;
}

try {
    $database = new Database();
    $conn = $database->getConnection();

    // Vérifiez d'abord si l'email existe
    $checkEmail = $conn->prepare("SELECT COUNT(*) as count FROM users WHERE email = ?");
    $checkEmail->bind_param('s', $email);
    $checkEmail->execute();
    $emailResult = $checkEmail->get_result()->fetch_assoc();

    if ($emailResult['count'] == 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Email ou mot de passe incorrect'
        ]);
        exit;
    }

    // Si l'email existe, vérifiez les identifiants
    $stmt = $conn->prepare('SELECT id, email, mot_de_passe, role FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user && password_verify($password, $user['mot_de_passe'])) {
        // Connexion réussie
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];

        // Régénérer l'ID de session pour éviter la fixation de session
        session_regenerate_id(true);

        // Réinitialiser le cookie de session
        setcookie(session_name(), session_id(), time() + 7200, '/');

        echo json_encode([
            'success' => true,
            'message' => 'Connexion réussie',
            'role' => $user['role'],
            'user_id' => $user['id']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Email ou mot de passe incorrect'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
?>