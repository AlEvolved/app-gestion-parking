document.addEventListener('DOMContentLoaded', function() {
    // Charger les clients au démarrage
    loadClients();

    // Configurer les gestionnaires d'événements
    document.getElementById('filterButton').addEventListener('click', loadClients);

    // Gestionnaire pour le formulaire d'ajout
    document.getElementById('addClientForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const client = {
            nom: document.getElementById('nom').value,
            prenom: document.getElementById('prenom').value,
            email: document.getElementById('email').value,
            mot_de_passe: document.getElementById('mot_de_passe').value,
            role: document.getElementById('role').value
        };

        fetch('../../BackEnd/Controllers/UserController.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(client)
        })
            .then(response => {
                console.log('Statut de réponse (création):', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Données reçues (création):', data);
                if(data.success) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addClientModal'));
                    modal.hide();
                    document.getElementById('addClientForm').reset();
                    loadClients();
                } else {
                    alert('Erreur: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erreur détaillée (création):', error);
                alert('Une erreur est survenue lors de l\'ajout du client');
            });
    });

    // Gestionnaire pour le formulaire d'édition
    document.getElementById('editClientForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const client = {
            id: document.getElementById('editId').value,
            nom: document.getElementById('editNom').value,
            prenom: document.getElementById('editPrenom').value,
            email: document.getElementById('editEmail').value,
            mot_de_passe: document.getElementById('editMotDePasse').value,
            role: document.getElementById('editRole').value
        };

        // Utiliser POST avec _method=PUT au lieu de PUT directement
        fetch('../../BackEnd/Controllers/UserController.php?_method=PUT', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(client)
        })
            .then(response => {
                console.log('Statut de réponse (modification):', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Données reçues (modification):', data);
                if(data.success) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editClientModal'));
                    modal.hide();
                    loadClients();
                } else {
                    alert('Erreur: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erreur détaillée (modification):', error);
                alert('Une erreur est survenue lors de la modification du client');
            });
    });
});

// Fonction pour charger les clients
function loadClients() {
    const role = document.getElementById('roleFilter').value;
    const search = document.getElementById('searchFilter').value;

    let url = '../../BackEnd/Controllers/UserController.php';
    if (role) url += `?role=${role}`;
    if (search) url += (role ? '&' : '?') + `search=${search}`;

    fetch(url)
        .then(response => {
            console.log('Statut de réponse (chargement):', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(response => {
            console.log('Données reçues (chargement):', response);
            if (!response.success) {
                throw new Error(response.message || 'Erreur serveur');
            }

            const data = response.data;
            const tbody = document.getElementById('clientsTable');
            tbody.innerHTML = '';

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucun client trouvé</td></tr>';
                return;
            }

            data.forEach(client => {
                tbody.innerHTML += `
                    <tr>
                        <td>${client.id}</td>
                        <td>${client.nom}</td>
                        <td>${client.prenom}</td>
                        <td>${client.email}</td>
                        <td><span class="badge ${client.role === 'admin' ? 'bg-danger' : 'bg-primary'}">${client.role}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editClient(${client.id})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteClient(${client.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error('Erreur lors du chargement des clients:', error);
            document.getElementById('clientsTable').innerHTML =
                '<tr><td colspan="6" class="text-center text-danger">Erreur lors du chargement des données</td></tr>';
        });
}

// Fonction pour éditer un client
function editClient(id) {
    fetch(`../../BackEnd/Controllers/UserController.php?id=${id}`)
        .then(response => {
            console.log('Statut de réponse (récupération client):', response.status);
            return response.json();
        })
        .then(response => {
            console.log('Données reçues (récupération client):', response);
            if (!response.success) {
                throw new Error(response.message || 'Erreur serveur');
            }

            const client = response.data;
            document.getElementById('editId').value = client.id;
            document.getElementById('editNom').value = client.nom;
            document.getElementById('editPrenom').value = client.prenom;
            document.getElementById('editEmail').value = client.email;
            document.getElementById('editRole').value = client.role;
            document.getElementById('editMotDePasse').value = '';

            const modal = new bootstrap.Modal(document.getElementById('editClientModal'));
            modal.show();
        })
        .catch(error => {
            console.error('Erreur détaillée (récupération client):', error);
            alert('Une erreur est survenue lors de la récupération des données du client');
        });
}

// Fonction pour supprimer un client
function deleteClient(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
        // Utiliser POST avec _method=DELETE au lieu de DELETE directement
        fetch(`../../BackEnd/Controllers/UserController.php?id=${id}&_method=DELETE`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log('Statut de réponse (suppression):', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Données reçues (suppression):', data);
                if (data.success) {
                    loadClients();
                } else {
                    alert('Erreur: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erreur détaillée (suppression):', error);
                alert('Une erreur est survenue lors de la suppression du client');
            });
    }
}