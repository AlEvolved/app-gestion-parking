document.addEventListener('DOMContentLoaded', function() {
    const BASE_URL = '/app-gestion-parking/';
    const RESERVATION_API = BASE_URL + 'BackEnd/Controllers/AdminReservationController.php';
    const reservationsTable = document.getElementById('reservationsTable');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchFilter = document.getElementById('searchFilter');
    const filterButton = document.getElementById('filterButton');
    const pagination = document.getElementById('pagination');

    // Modale et formulaire d'édition
    const editModal = new bootstrap.Modal(document.getElementById('editReservationModal'));
    const editReservationForm = document.getElementById('editReservationForm');
    const updateReservationBtn = document.getElementById('updateReservation');

    // Pagination
    let currentPage = 1;
    let pageSize = 10;
    let allReservations = [];

    // Initialisation
    loadReservations();
    loadClients();
    loadPlaces();

    // Filtres
    filterButton.addEventListener('click', function() {
        displayReservations(filterReservations(allReservations));
    });

    // Edition réservation
    updateReservationBtn.addEventListener('click', function() {
        updateReservation();
    });

    // Remplir les clients dans le formulaire d'édition
    function loadClients() {
        fetch(BASE_URL + 'BackEnd/Controllers/UserController.php?role=client', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                let clients = [];
                if (data.success && Array.isArray(data.data)) {
                    clients = data.data;
                }
                const select = document.getElementById('editClient');
                select.innerHTML = '<option value="">Sélectionner un client</option>';
                clients.forEach(c => {
                    select.innerHTML += `<option value="${c.id}">${c.prenom} ${c.nom} (${c.email})</option>`;
                });
            });
    }

    // Remplir les places dans le formulaire d'édition
    function loadPlaces(dateDebut = '', dateFin = '', selectId = 'editPlace') {
        let url = BASE_URL + 'BackEnd/Controllers/PlaceController.php';
        if (dateDebut && dateFin) {
            url += `?disponible=1&date_debut=${encodeURIComponent(dateDebut)}&date_fin=${encodeURIComponent(dateFin)}`;
        }
        fetch(url, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                let places = [];
                if (data.success && Array.isArray(data.data)) {
                    places = data.data;
                }
                const select = document.getElementById(selectId);
                select.innerHTML = '<option value="">Sélectionner une place</option>';
                places.forEach(p => {
                    select.innerHTML += `<option value="${p.id}">#${p.numero}</option>`;
                });
            });
    }

    // Recharge les places quand les dates changent (édition)
    document.getElementById('editDateDebut').addEventListener('change', function() {
        loadPlaces(this.value, document.getElementById('editDateFin').value, 'editPlace');
    });
    document.getElementById('editDateFin').addEventListener('change', function() {
        loadPlaces(document.getElementById('editDateDebut').value, this.value, 'editPlace');
    });

    // Chargement des réservations
    function loadReservations() {
        fetch(RESERVATION_API, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    allReservations = data.data;
                    displayReservations(filterReservations(allReservations));
                } else {
                    allReservations = [];
                    reservationsTable.innerHTML = '<tr><td colspan="8" class="text-center">Aucune réservation trouvée.</td></tr>';
                }
            })
            .catch(() => {
                allReservations = [];
                reservationsTable.innerHTML = '<tr><td colspan="8" class="text-center">Erreur de chargement.</td></tr>';
            });
    }

    // Filtrage
    function filterReservations(reservations) {
        let filtered = reservations;
        if (statusFilter.value) {
            filtered = filtered.filter(r => r.statut === statusFilter.value);
        }
        if (dateFilter.value) {
            filtered = filtered.filter(r => r.date_debut && r.date_debut.startsWith(dateFilter.value));
        }
        if (searchFilter.value) {
            const search = searchFilter.value.toLowerCase();
            filtered = filtered.filter(r =>
                (r.utilisateur_nom_complet && r.utilisateur_nom_complet.toLowerCase().includes(search)) ||
                (r.nom && r.nom.toLowerCase().includes(search)) ||
                (r.prenom && r.prenom.toLowerCase().includes(search))
            );
        }
        return filtered;
    }

    // Affichage des réservations avec pagination
    function displayReservations(reservations) {
        reservationsTable.innerHTML = '';
        if (reservations.length === 0) {
            reservationsTable.innerHTML = '<tr><td colspan="8" class="text-center">Aucune réservation trouvée.</td></tr>';
            pagination.innerHTML = '';
            return;
        }
        const totalPages = Math.ceil(reservations.length / pageSize);
        if (currentPage > totalPages) currentPage = 1;
        const start = (currentPage - 1) * pageSize;
        const pageReservations = reservations.slice(start, start + pageSize);

        pageReservations.forEach(res => {
            reservationsTable.innerHTML += `
                <tr>
                    <td>${res.id}</td>
                    <td>#${res.place_numero || res.place_id}</td>
                    <td>${res.utilisateur_nom_complet || res.prenom + ' ' + res.nom}</td>
                    <td>${res.date_debut ? res.date_debut.replace('T', ' ').substring(0, 16) : '-'}</td>
                    <td>${res.date_fin ? res.date_fin.replace('T', ' ').substring(0, 16) : '-'}</td>
                    <td>${res.montant ? res.montant + ' €' : '-'}</td>
                    <td><span class="badge ${getStatusClass(res.statut)}">${formatStatus(res.statut)}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="editReservation(${res.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteReservation(${res.id})"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        renderPagination(totalPages);
    }

    // Pagination Bootstrap
    function renderPagination(totalPages) {
        pagination.innerHTML = '';
        if (totalPages <= 1) return;
        for (let i = 1; i <= totalPages; i++) {
            pagination.innerHTML += `
                <li class="page-item${i === currentPage ? ' active' : ''}">
                    <a class="page-link" href="#" onclick="goToPage(${i});return false;">${i}</a>
                </li>
            `;
        }
    }

    // Pour la pagination (exposé sur window)
    window.goToPage = function(page) {
        currentPage = page;
        displayReservations(filterReservations(allReservations));
    };

    // Statut badge
    function getStatusClass(statut) {
        if (!statut) return 'bg-secondary';
        if (statut === 'en_cours') return 'bg-primary';
        if (statut === 'terminee') return 'bg-success';
        if (statut === 'annulee') return 'bg-danger';
        return 'bg-secondary';
    }
    function formatStatus(statut) {
        if (statut === 'en_cours') return 'En cours';
        if (statut === 'terminee') return 'Terminée';
        if (statut === 'annulee') return 'Annulée';
        return statut || '-';
    }

    // Pré-remplir et ouvrir la modale d’édition
    window.editReservation = function(id) {
        const res = allReservations.find(r => r.id == id);
        if (!res) return;
        document.getElementById('editId').value = res.id;
        document.getElementById('editClient').value = res.utilisateur_id || '';
        document.getElementById('editPlace').value = res.place_id || '';
        document.getElementById('editDateDebut').value = res.date_debut ? res.date_debut.substring(0,16) : '';
        document.getElementById('editDateFin').value = res.date_fin ? res.date_fin.substring(0,16) : '';
        document.getElementById('editStatut').value = res.statut || 'en_cours';
        editModal.show();
        loadPlaces(document.getElementById('editDateDebut').value, document.getElementById('editDateFin').value, 'editPlace');
    };

    // Mise à jour réservation
    function updateReservation() {
        errorMessage.classList.add('d-none');
        successMessage.classList.add('d-none');
        const data = {
            id: document.getElementById('editId').value,
            utilisateur_id: document.getElementById('editClient').value,
            place_id: document.getElementById('editPlace').value,
            date_debut: document.getElementById('editDateDebut').value,
            date_fin: document.getElementById('editDateFin').value,
            statut: document.getElementById('editStatut').value
        };
        if (!data.id || !data.utilisateur_id || !data.place_id || !data.date_debut || !data.date_fin) {
            errorMessage.textContent = 'Veuillez remplir tous les champs.';
            errorMessage.classList.remove('d-none');
            return;
        }
        fetch(RESERVATION_API, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(resp => {
                if (resp.success) {
                    successMessage.textContent = 'Réservation mise à jour.';
                    successMessage.classList.remove('d-none');
                    editModal.hide();
                    loadReservations();
                } else {
                    errorMessage.textContent = resp.message || 'Erreur lors de la mise à jour.';
                    errorMessage.classList.remove('d-none');
                }
            })
            .catch(() => {
                errorMessage.textContent = 'Erreur de connexion au serveur.';
                errorMessage.classList.remove('d-none');
            });
    }

    // Suppression réservation
    window.deleteReservation = function(id) {
        if (!confirm('Supprimer cette réservation ?')) return;
        fetch(RESERVATION_API, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id })
        })
            .then(res => res.json())
            .then(resp => {
                if (resp.success) {
                    successMessage.textContent = 'Réservation supprimée.';
                    successMessage.classList.remove('d-none');
                    loadReservations();
                } else {
                    errorMessage.textContent = resp.message || 'Erreur lors de la suppression.';
                    errorMessage.classList.remove('d-none');
                }
            })
            .catch(() => {
                errorMessage.textContent = 'Erreur de connexion au serveur.';
                errorMessage.classList.remove('d-none');
            });
    };
});