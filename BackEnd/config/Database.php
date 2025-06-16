<?php
class Database {
    private $host = "localhost:3306";
    private $db_name = "app_gestion_parking";
    private $username = "root";
    private $password = "1234@1234";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $host_parts = explode(':', $this->host);
            $host = $host_parts[0];
            $port = isset($host_parts[1]) ? (int)$host_parts[1] : 3306;

            $this->conn = new mysqli($host, $this->username, $this->password, $this->db_name, $port);

            if ($this->conn->connect_error) {
                throw new Exception("Erreur de connexion : " . $this->conn->connect_error);
            }

            $this->conn->set_charset("utf8");
        } catch(Exception $e) {
            echo $e->getMessage();
        }

        return $this->conn;
    }
}