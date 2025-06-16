<?php
class Reservation {
    private $conn;
    public function __construct($db) { $this->conn = $db; }

    public function getAll($filters = []) {
        $query = "SELECT r.*, u.nom, u.prenom, CONCAT(u.prenom, ' ', u.nom) AS utilisateur_nom_complet, p.numero as place_numero
                  FROM reservations r
                  LEFT JOIN users u ON r.utilisateur_id = u.id
                  LEFT JOIN places p ON r.place_id = p.id
                  WHERE 1=1";
        $params = [];
        if (!empty($filters['statut'])) {
            $query .= " AND r.statut = ?";
            $params[] = $filters['statut'];
        }
        if (!empty($filters['date'])) {
            $query .= " AND (DATE(r.date_debut) = ? OR DATE(r.date_fin) = ?)";
            $params[] = $filters['date'];
            $params[] = $filters['date'];
        }
        if (!empty($filters['search'])) {
            $query .= " AND (u.nom LIKE ? OR u.prenom LIKE ?)";
            $params[] = "%".$filters['search']."%";
            $params[] = "%".$filters['search']."%";
        }
        $query .= " ORDER BY r.date_debut DESC";
        $stmt = $this->conn->prepare($query);
        if ($params) {
            $types = str_repeat('s', count($params));
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $reservations = [];
        while ($row = $result->fetch_assoc()) {
            $reservations[] = $row;
        }
        return ['success' => true, 'data' => $reservations];
    }

    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT r.*, u.nom, u.prenom, CONCAT(u.prenom, ' ', u.nom) AS utilisateur_nom_complet, p.numero as place_numero
                                      FROM reservations r
                                      LEFT JOIN users u ON r.utilisateur_id = u.id
                                      LEFT JOIN places p ON r.place_id = p.id
                                      WHERE r.id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return ['success' => true, 'data' => $row];
        }
        return ['success' => false, 'message' => 'Réservation non trouvée'];
    }

    public function create($data) {
        $stmt = $this->conn->prepare("INSERT INTO reservations (utilisateur_id, place_id, date_debut, date_fin, montant, statut) VALUES (?, ?, ?, ?, ?, ?)");
        $montant = 10; // À calculer selon la logique métier
        $stmt->bind_param("iissds", $data['utilisateur_id'], $data['place_id'], $data['date_debut'], $data['date_fin'], $montant, $data['statut']);
        if ($stmt->execute()) {
            return ['success' => true];
        }
        return ['success' => false, 'message' => 'Erreur lors de la création'];
    }

    public function update($data) {
        $stmt = $this->conn->prepare("UPDATE reservations SET utilisateur_id=?, place_id=?, date_debut=?, date_fin=?, statut=? WHERE id=?");
        $stmt->bind_param("iisssi", $data['utilisateur_id'], $data['place_id'], $data['date_debut'], $data['date_fin'], $data['statut'], $data['id']);
        if ($stmt->execute()) {
            return ['success' => true];
        }
        return ['success' => false, 'message' => 'Erreur lors de la mise à jour'];
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM reservations WHERE id=?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            return ['success' => true];
        }
        return ['success' => false, 'message' => 'Erreur lors de la suppression'];
    }
}