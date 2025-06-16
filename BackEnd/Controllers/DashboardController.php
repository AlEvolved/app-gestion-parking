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

$database = new Database();
$conn = $database->getConnection();

try {
    // Statistiques sur les places
    $places = [
        'total' => 0,
        'disponible' => 0,
        'occupee' => 0,
        'indisponible' => 0
    ];
    $res = $conn->query("SELECT COUNT(*) as total,
        SUM(statut = 'disponible') as disponible,
        SUM(statut = 'occupee') as occupee,
        SUM(statut = 'indisponible') as indisponible
        FROM places");
    if ($row = $res->fetch_assoc()) {
        $places = [
            'total' => (int)$row['total'],
            'disponible' => (int)$row['disponible'],
            'occupee' => (int)$row['occupee'],
            'indisponible' => (int)$row['indisponible']
        ];
    }

    // Statistiques sur les réservations
    $reservations = [
        'en_cours' => 0,
        'terminee' => 0,
        'annulee' => 0,
        'par_jour' => [
            'labels' => [],
            'values' => []
        ]
    ];
    $res = $conn->query("SELECT
        SUM(statut = 'en_cours') as en_cours,
        SUM(statut = 'terminee') as terminee,
        SUM(statut = 'annulee') as annulee
        FROM reservations");
    if ($row = $res->fetch_assoc()) {
        $reservations['en_cours'] = (int)$row['en_cours'];
        $reservations['terminee'] = (int)$row['terminee'];
        $reservations['annulee'] = (int)$row['annulee'];
    }

    // Réservations par jour (7 derniers jours)
    $res = $conn->query("
        SELECT DATE(date_debut) as jour, COUNT(*) as nb
        FROM reservations
        WHERE date_debut >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY jour
        ORDER BY jour ASC
    ");
    $labels = [];
    $values = [];
    $dates = [];
    for ($i = 6; $i >= 0; $i--) {
        $dates[date('Y-m-d', strtotime("-$i days"))] = 0;
    }
    while ($row = $res->fetch_assoc()) {
        $dates[$row['jour']] = (int)$row['nb'];
    }
    foreach ($dates as $d => $v) {
        $labels[] = $d;
        $values[] = $v;
    }
    $reservations['par_jour'] = [
        'labels' => $labels,
        'values' => $values
    ];

    // 5 dernières réservations
    $recentReservations = [];
    $res = $conn->query("
        SELECT r.id, CONCAT(u.prenom, ' ', u.nom) as utilisateur, p.numero as place, r.date_debut, r.statut
        FROM reservations r
        LEFT JOIN users u ON r.utilisateur_id = u.id
        LEFT JOIN places p ON r.place_id = p.id
        ORDER BY r.date_debut DESC
        LIMIT 5
    ");
    while ($row = $res->fetch_assoc()) {
        $recentReservations[] = $row;
    }

    // 5 derniers utilisateurs
    $recentUsers = [];
    $res = $conn->query("
        SELECT id, nom, prenom, email, role
        FROM users
        ORDER BY id DESC
        LIMIT 5
    ");
    while ($row = $res->fetch_assoc()) {
        $recentUsers[] = $row;
    }

    echo json_encode([
        'success' => true,
        'places' => $places,
        'reservations' => $reservations,
        'recent' => [
            'reservations' => $recentReservations,
            'users' => $recentUsers
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
$conn->close();