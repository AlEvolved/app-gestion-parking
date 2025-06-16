<?php
class Place {
    public $conn;
    public function __construct($db) { $this->conn = $db; }

    public function getAll() {
        $query = "SELECT p.*, pk.nom as parking_nom FROM places p LEFT JOIN parkings pk ON p.parking_id = pk.id ORDER BY p.numero";
        $result = $this->conn->query($query);
        $places = [];
        while ($row = $result->fetch_assoc()) {
            $places[] = $row;
        }
        return ['success' => true, 'data' => $places];
    }

    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT p.*, pk.nom as parking_nom FROM places p LEFT JOIN parkings pk ON p.parking_id = pk.id WHERE p.id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return ['success' => true, 'data' => $row];
        }
        return ['success' => false, 'message' => 'Place non trouvée'];
    }

    public function create($data) {
        $stmt = $this->conn->prepare("INSERT INTO places (numero, parking_id, statut) VALUES (?, ?, ?)");
        $stmt->bind_param("sis", $data['numero'], $data['parking_id'], $data['statut']);
        if ($stmt->execute()) {
            return ['success' => true];
        }
        return ['success' => false, 'message' => 'Erreur lors de la création'];
    }

    public function update($data) {
        $stmt = $this->conn->prepare("UPDATE places SET numero=?, parking_id=?, statut=? WHERE id=?");
        $stmt->bind_param("sisi", $data['numero'], $data['parking_id'], $data['statut'], $data['id']);
        if ($stmt->execute()) {
            return ['success' => true];
        }
        return ['success' => false, 'message' => 'Erreur lors de la mise à jour'];
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM places WHERE id=?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            return ['success' => true];
        }
        return ['success' => false, 'message' => 'Erreur lors de la suppression'];
    }
}
?>