<?php
session_start();
header('Content-Type: application/json');

// Autoloader
spl_autoload_register(function ($class_name) {
    // Chercher le contrôleur dans le dossier Controllers
    $controller_path = __DIR__ . '/Controllers/' . $class_name . '.php';
    if (file_exists($controller_path)) {
        require_once $controller_path;
        return;
    }

    // Chercher le modèle dans le dossier Models
    $model_path = __DIR__ . '/Models/' . $class_name . '.php';
    if (file_exists($model_path)) {
        require_once $model_path;
        return;
    }
});

// Vérifier si les paramètres controller et action sont présents
if (!isset($_GET['controller']) || !isset($_GET['action'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Paramètres manquants'
    ]);
    exit;
}

// Récupérer le contrôleur et l'action
$controller_name = $_GET['controller'] . 'Controller';
$action = $_GET['action'];

// Vérifier si le contrôleur existe
if (!class_exists($controller_name)) {
    echo json_encode([
        'success' => false,
        'message' => 'Contrôleur inexistant'
    ]);
    exit;
}

// Connexion à la base de données
require_once 'config/Database.php';
$database = new Database();
$db = $database->getConnection();

// Instancier le contrôleur
$controller = new $controller_name($db);

// Vérifier si la méthode existe
if (!method_exists($controller, $action)) {
    echo json_encode([
        'success' => false,
        'message' => 'Action inexistante'
    ]);
    exit;
}

// Exécuter l'action et renvoyer le résultat
$result = $controller->$action();
echo json_encode($result);