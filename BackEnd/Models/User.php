<?php
// BackEnd/Models/User.php
class User {
    private $conn;
    private $table = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll($role = null) {
        $query = "SELECT id, nom, prenom, email, role FROM {$this->table}";

        if ($role) {
            $query .= " WHERE role = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param('s', $role);
        } else {
            $stmt = $this->conn->prepare($query);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = [
                'id' => $row['id'],
                'nom' => $row['nom'],
                'prenom' => $row['prenom'],
                'email' => $row['email'],
                'role' => $row['role']
            ];
        }

        return [
            'success' => true,
            'data' => $users
        ];
    }

    public function getById($id) {
        $query = "SELECT id, nom, prenom, email, role FROM {$this->table} WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            return [
                'success' => true,
                'data' => [
                    'id' => $row['id'],
                    'nom' => $row['nom'],
                    'prenom' => $row['prenom'],
                    'email' => $row['email'],
                    'role' => $row['role']
                ]
            ];
        }

        return [
            'success' => false,
            'message' => 'Utilisateur non trouvé'
        ];
    }

    public function create($data) {
        // Vérifier les données obligatoires
        if (!isset($data['nom']) || !isset($data['prenom']) || !isset($data['email']) || !isset($data['mot_de_passe'])) {
            return [
                'success' => false,
                'message' => 'Données incomplètes'
            ];
        }

        // Vérifier si l'email existe déjà
        $checkQuery = "SELECT COUNT(*) as count FROM {$this->table} WHERE email = ?";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bind_param('s', $data['email']);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result()->fetch_assoc();

        if ($checkResult['count'] > 0) {
            return [
                'success' => false,
                'message' => 'Cet email est déjà utilisé'
            ];
        }

        // Hashage du mot de passe
        $hashedPassword = password_hash($data['mot_de_passe'], PASSWORD_DEFAULT);

        // Définir le rôle par défaut si non spécifié
        $role = isset($data['role']) ? $data['role'] : 'utilisateur';

        $query = "INSERT INTO {$this->table} (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('sssss',
            $data['nom'],
            $data['prenom'],
            $data['email'],
            $hashedPassword,
            $role
        );

        if ($stmt->execute()) {
            $id = $stmt->insert_id;
            return [
                'success' => true,
                'message' => 'Utilisateur créé avec succès',
                'id' => $id
            ];
        }

        return [
            'success' => false,
            'message' => 'Erreur lors de la création: ' . $stmt->error
        ];
    }

    public function update($data) {
        // Vérifier l'ID
        if (!isset($data['id'])) {
            return [
                'success' => false,
                'message' => 'ID utilisateur manquant'
            ];
        }

        // Commencer à construire la requête
        $query = "UPDATE {$this->table} SET ";
        $params = [];
        $types = "";

        // Ajouter les champs à mettre à jour
        if (isset($data['nom'])) {
            $query .= "nom = ?, ";
            $params[] = $data['nom'];
            $types .= "s";
        }

        if (isset($data['prenom'])) {
            $query .= "prenom = ?, ";
            $params[] = $data['prenom'];
            $types .= "s";
        }

        if (isset($data['email'])) {
            // Vérifier si l'email existe déjà pour un autre utilisateur
            $checkQuery = "SELECT COUNT(*) as count FROM {$this->table} WHERE email = ? AND id != ?";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bind_param('si', $data['email'], $data['id']);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result()->fetch_assoc();

            if ($checkResult['count'] > 0) {
                return [
                    'success' => false,
                    'message' => 'Cet email est déjà utilisé par un autre utilisateur'
                ];
            }

            $query .= "email = ?, ";
            $params[] = $data['email'];
            $types .= "s";
        }

        if (isset($data['mot_de_passe']) && !empty($data['mot_de_passe'])) {
            $hashedPassword = password_hash($data['mot_de_passe'], PASSWORD_DEFAULT);
            $query .= "mot_de_passe = ?, ";
            $params[] = $hashedPassword;
            $types .= "s";
        }

        if (isset($data['role'])) {
            $query .= "role = ?, ";
            $params[] = $data['role'];
            $types .= "s";
        }

        // Supprimer la virgule finale
        $query = rtrim($query, ", ");

        // Ajouter la condition WHERE
        $query .= " WHERE id = ?";
        $params[] = $data['id'];
        $types .= "i";

        if (count($params) <= 1) {
            return [
                'success' => false,
                'message' => 'Aucune donnée à mettre à jour'
            ];
        }

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            return [
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès'
            ];
        }

        return [
            'success' => false,
            'message' => 'Erreur lors de la mise à jour: ' . $stmt->error
        ];
    }

    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                return [
                    'success' => true,
                    'message' => 'Utilisateur supprimé avec succès'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ];
            }
        }

        return [
            'success' => false,
            'message' => 'Erreur lors de la suppression: ' . $stmt->error
        ];
    }
}