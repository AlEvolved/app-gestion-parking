<?php
// Désactiver la mise en cache
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// Récupérer les données envoyées
$postData = file_get_contents('php://input');

// URL de l'API backend
$apiUrl = 'http://localhost/app_gestion_parking/BackEnd/Controllers/LoginController.php';

// Configuration de cURL
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

// Exécution de la requête
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Gestion des erreurs
if (curl_errno($ch)) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Erreur cURL: ' . curl_error($ch)
    ]);
    exit;
}

curl_close($ch);

// Renvoyer la réponse avec le même code HTTP et type de contenu
http_response_code($httpCode);
header('Content-Type: application/json');
echo $response;