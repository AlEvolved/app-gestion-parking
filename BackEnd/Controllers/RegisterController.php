<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    $host = 'localhost';
    $db   = 'app_gestion_parking';
    $user = 'root';
    $pass = '1234@1234';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];

    $pdo = new PDO($dsn, $user, $pass, $options);

    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['prenom'], $data['nom'], $data['email'], $data['mot_de_passe'])) {
        echo json_encode(['success' => false, 'message' => 'Données manquantes ou JSON invalide.']);
        exit;
    }

    $prenom = trim($data['prenom']);
    $nom = trim($data['nom']);
    $email = trim($data['email']);
    $mot_de_passe = $data['mot_de_passe'];
    $role = isset($data['role']) && in_array($data['role'], ['admin', 'utilisateur']) ? $data['role'] : 'utilisateur';

    // Vérifier si l’email existe déjà
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé.']);
        exit;
    }

    // Hash du mot de passe
    $hashedPassword = password_hash($mot_de_passe, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO users (prenom, nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)');
    if ($stmt->execute([$prenom, $nom, $email, $hashedPassword, $role])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'inscription.']);
    }
} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur de connexion à la base de données : ' . $e->getMessage()]);
} catch (\Throwable $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur serveur : ' . $e->getMessage()]);
}