<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/Database.php';

class UserController {
    private $conn;
    private $input;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->input = $this->getInputData();
    }

    private function getInputData() {
        $inputData = null;
        if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE'])) {
            $rawData = file_get_contents('php://input');
            if (!empty($rawData)) {
                $inputData = json_decode($rawData, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    error_log('Erreur JSON: ' . json_last_error_msg());
                }
            }
        }
        return $inputData;
    }

    private function getAllowedRoles() {
        $roles = [];
        $result = $this->conn->query("SHOW COLUMNS FROM users LIKE 'role'");
        if ($result) {
            $row = $result->fetch_assoc();
            if (preg_match("/^enum\((.*)\)$/", $row['Type'], $matches)) {
                $enums = str_getcsv($matches[1], ',', "'");
                foreach ($enums as $enum) {
                    $roles[] = strtolower(trim($enum));
                }
            }
        }
        return $roles;
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        if ($method === 'POST' && isset($_GET['_method'])) {
            $method = strtoupper($_GET['_method']);
        }
        try {
            switch ($method) {
                case 'GET':
                    if (isset($_GET['id'])) {
                        $this->getOne($_GET['id']);
                    } else {
                        $this->getAll();
                    }
                    break;
                case 'POST':
                    $this->create();
                    break;
                case 'PUT':
                    $this->update();
                    break;
                case 'DELETE':
                    if (isset($_GET['id'])) {
                        $this->delete($_GET['id']);
                    } else {
                        $this->sendResponse(false, 'ID manquant');
                    }
                    break;
                default:
                    $this->sendResponse(false, 'Méthode non supportée');
            }
        } catch (Exception $e) {
            error_log('Exception: ' . $e->getMessage());
            $this->sendResponse(false, 'Erreur serveur: ' . $e->getMessage());
        }
    }

    private function getAll() {
        try {
            $query = "SELECT id, nom, prenom, email, role FROM users WHERE 1=1";
            if (isset($_GET['role']) && !empty($_GET['role'])) {
                $role = $this->conn->real_escape_string($_GET['role']);
                $query .= " AND role = '$role'";
            }
            if (isset($_GET['search']) && !empty($_GET['search'])) {
                $search = $this->conn->real_escape_string($_GET['search']);
                $query .= " AND (nom LIKE '%$search%' OR prenom LIKE '%$search%' OR email LIKE '%$search%')";
            }
            $query .= " ORDER BY nom, prenom";
            $result = $this->conn->query($query);
            if (!$result) throw new Exception($this->conn->error);
            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            $this->sendResponse(true, '', $users);
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur lors de la récupération des utilisateurs: ' . $e->getMessage());
        }
    }

    private function getOne($id) {
        try {
            $id = intval($id);
            $stmt = $this->conn->prepare("SELECT id, nom, prenom, email, role FROM users WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $this->sendResponse(true, '', $result->fetch_assoc());
            } else {
                $this->sendResponse(false, 'Utilisateur non trouvé');
            }
            $stmt->close();
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur lors de la récupération de l\'utilisateur: ' . $e->getMessage());
        }
    }

    private function create() {
        try {
            if (!$this->input) {
                $this->sendResponse(false, 'Aucune donnée reçue');
                return;
            }
            if (!isset($this->input['nom'], $this->input['prenom'], $this->input['email'], $this->input['mot_de_passe'], $this->input['role'])) {
                $this->sendResponse(false, 'Données incomplètes');
                return;
            }
            $nom = trim($this->input['nom']);
            $prenom = trim($this->input['prenom']);
            $email = trim($this->input['email']);
            $mot_de_passe = password_hash($this->input['mot_de_passe'], PASSWORD_DEFAULT);
            $role = strtolower(trim($this->input['role']));

            $allowed_roles = $this->getAllowedRoles();
            if (!in_array($role, $allowed_roles)) {
                $this->sendResponse(false, "Le rôle '$role' n'est pas valide. Valeurs autorisées : " . implode(', ', $allowed_roles));
                return;
            }

            $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $stmt->close();
                $this->sendResponse(false, 'Cette adresse email est déjà utilisée');
                return;
            }
            $stmt->close();

            $stmt = $this->conn->prepare("INSERT INTO users (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("sssss", $nom, $prenom, $email, $mot_de_passe, $role);
            if ($stmt->execute()) {
                $stmt->close();
                $this->sendResponse(true, 'Utilisateur créé avec succès');
            } else {
                $error = $stmt->error;
                $stmt->close();
                throw new Exception($error);
            }
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur lors de la création: ' . $e->getMessage());
        }
    }

    private function update() {
        try {
            if (!$this->input) {
                $this->sendResponse(false, 'Aucune donnée reçue');
                return;
            }
            if (!isset($this->input['id'], $this->input['nom'], $this->input['prenom'], $this->input['email'], $this->input['role'])) {
                $this->sendResponse(false, 'Données incomplètes');
                return;
            }
            $id = intval($this->input['id']);
            $nom = trim($this->input['nom']);
            $prenom = trim($this->input['prenom']);
            $email = trim($this->input['email']);
            $role = strtolower(trim($this->input['role']));

            $allowed_roles = $this->getAllowedRoles();
            if (!in_array($role, $allowed_roles)) {
                $this->sendResponse(false, "Le rôle '$role' n'est pas valide. Valeurs autorisées : " . implode(', ', $allowed_roles));
                return;
            }

            $checkStmt = $this->conn->prepare("SELECT id FROM users WHERE id = ?");
            $checkStmt->bind_param("i", $id);
            $checkStmt->execute();
            $result = $checkStmt->get_result();
            if ($result->num_rows === 0) {
                $checkStmt->close();
                $this->sendResponse(false, 'Utilisateur non trouvé');
                return;
            }
            $checkStmt->close();

            $emailStmt = $this->conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $emailStmt->bind_param("si", $email, $id);
            $emailStmt->execute();
            $emailResult = $emailStmt->get_result();
            if ($emailResult->num_rows > 0) {
                $emailStmt->close();
                $this->sendResponse(false, 'Cette adresse email est déjà utilisée');
                return;
            }
            $emailStmt->close();

            if (isset($this->input['mot_de_passe']) && !empty($this->input['mot_de_passe'])) {
                $mot_de_passe = password_hash($this->input['mot_de_passe'], PASSWORD_DEFAULT);
                $updateStmt = $this->conn->prepare("UPDATE users SET nom=?, prenom=?, email=?, mot_de_passe=?, role=? WHERE id=?");
                $updateStmt->bind_param("sssssi", $nom, $prenom, $email, $mot_de_passe, $role, $id);
            } else {
                $updateStmt = $this->conn->prepare("UPDATE users SET nom=?, prenom=?, email=?, role=? WHERE id=?");
                $updateStmt->bind_param("ssssi", $nom, $prenom, $email, $role, $id);
            }
            if ($updateStmt->execute()) {
                $updateStmt->close();
                $this->sendResponse(true, 'Utilisateur mis à jour avec succès');
            } else {
                $error = $updateStmt->error;
                $updateStmt->close();
                throw new Exception($error);
            }
        } catch (Exception $e) {
            $this->sendResponse(false, 'Erreur lors de la mise à jour: ' . $e->getMessage());
        }
    }

    private function delete($id) {
        try {
            if (empty($id) || !is_numeric($id)) {
                $this->sendResponse(false, 'ID invalide');
                return;
            }
            $id = intval($id);
            $this->conn->begin_transaction();

            $checkStmt = $this->conn->prepare("SELECT id, role FROM users WHERE id = ?");
            $checkStmt->bind_param("i", $id);
            $checkStmt->execute();
            $result = $checkStmt->get_result();
            if ($result->num_rows === 0) {
                $checkStmt->close();
                $this->conn->rollback();
                $this->sendResponse(false, 'Utilisateur non trouvé');
                return;
            }
            $user = $result->fetch_assoc();
            $is_admin = ($user['role'] === 'admin');
            $checkStmt->close();

            if ($is_admin) {
                $adminCountStmt = $this->conn->prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
                $adminCountStmt->execute();
                $countResult = $adminCountStmt->get_result();
                $admin_count = $countResult->fetch_assoc()['count'];
                $adminCountStmt->close();
                if ($admin_count <= 1) {
                    $this->conn->rollback();
                    $this->sendResponse(false, 'Impossible de supprimer le dernier administrateur');
                    return;
                }
            }

            $delReservStmt = $this->conn->prepare("DELETE FROM reservations WHERE utilisateur_id = ?");
            $delReservStmt->bind_param("i", $id);
            if (!$delReservStmt->execute()) {
                $error = $delReservStmt->error;
                $delReservStmt->close();
                $this->conn->rollback();
                throw new Exception("Erreur lors de la suppression des réservations: " . $error);
            }
            $delReservStmt->close();

            $delUserStmt = $this->conn->prepare("DELETE FROM users WHERE id = ?");
            $delUserStmt->bind_param("i", $id);
            if (!$delUserStmt->execute()) {
                $error = $delUserStmt->error;
                $delUserStmt->close();
                $this->conn->rollback();
                throw new Exception("Erreur lors de la suppression de l'utilisateur: " . $error);
            }
            $delUserStmt->close();

            $this->conn->commit();
            $this->sendResponse(true, 'Utilisateur supprimé avec succès');
        } catch (Exception $e) {
            $this->conn->rollback();
            $this->sendResponse(false, 'Erreur lors de la suppression: ' . $e->getMessage());
        }
    }

    private function sendResponse($success, $message, $data = null) {
        $response = ['success' => $success];
        if (!empty($message)) $response['message'] = $message;
        if ($data !== null) $response['data'] = $data;
        echo json_encode($response);
    }

    public function __destruct() {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}

$controller = new UserController();
$controller->handleRequest();