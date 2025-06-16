<?php
session_start();
header('Content-Type: application/json');

// Exemple de connexion (à adapter avec ta base de données)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    // Ici, tu dois vérifier l'utilisateur dans la base de données
    // Exemple fictif :
    if ($email === 'admin@admin.com' && $password === 'admin') {
        $_SESSION['user_id'] = 1;
        $_SESSION['role'] = 'admin';
        $_SESSION['email'] = $email;
        echo json_encode(['success' => true, 'role' => 'admin']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Identifiants invalides']);
    }
    exit;
}

// Déconnexion
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}
?>