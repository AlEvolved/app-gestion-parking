<?php
namespace App\Models;

class User {
    private $conn;

    public function __construct() {
        $host = 'localhost';
        $user = 'root';
        $pass = 'Radioactive45@';
        $db = 'app_gestion_parking';

        try {
            $this->conn = new \mysqli($host, $user, $pass, $db);
            $this->conn->set_charset("utf8mb4");
        } catch (\Exception $e) {
            error_log("Erreur connexion BD: " . $e->getMessage());
            throw $e;
        }
    }

    public function authenticate($email, $password) {
        $query = "SELECT * FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($user = $result->fetch_assoc()) {
            if (password_verify($password, $user['password'])) {
                return ['id' => $user['id'], 'email' => $user['email']];
            }
        }
        return false;
    }
}