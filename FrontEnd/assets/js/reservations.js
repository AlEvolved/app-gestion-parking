document.addEventListener('DOMContentLoaded', function() {
    const reservationsTable = document.getElementById('reservationsTable');
    const paginationElement = document.getElementById('pagination');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchFilter = document.getElementById('searchFilter');
    const filterButton = document.getElementById('filterButton');

    let currentPage = 1;
    const itemsPerPage = 10;
    let totalItems = 0;

    loadReservations();
    loadUsers();
    loadPlaces();

    if (filterButton) {
        filterButton.addEventListener('click', function() {
            currentPage = 1;
            loadReservations();
        });
    }

    document.getElementById('saveReservation')?.addEventListener('click', createReservation);
    document.getElementById('updateReservation')?.addEventListener('click', updateReservation);

    function loadReservations() {
        const statut = statusFilter ? statusFilter.value : '';
        const date = dateFilter ? dateFilter.value : '';
        const search = searchFilter ? searchFilter.value : '';

        const url = `/app-gestion-parking/BackEnd/Controllers/ReservationController.php?page=${currentPage}&statut=${statut}&date=${date}&search=${search}`;

        fetch(url, { credentials: 'include' })
            .then(response => {
                if (!response.ok) throw new Error('Erreur réseau');
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    displayReservations(data.data);
                    totalItems = data.total || data.data.length;
                    setupPagination();
                } else {
                    reservationsTable.innerHTML = `<tr><td colspan="8" class="text-center">${data.message || 'Erreur'}</td></tr>`;
                }
            })
            .catch(error => {
                reservationsTable.innerHTML = `<tr><td colspan="8" class="text-center">Une erreur s'est produite lors du chargement des réservations.</td></tr>`;
            });
    }

    function displayReservations(reservations) {
        if (!reservationsTable) return;
        reservationsTable.innerHTML = '';
        if (!reservations || reservations.length === 0) {
            reservationsTable.innerHTML = `<tr><td colspan="8" class="text-center">Aucune réservation trouvée</td></tr>`;
            return;
        }
        reservations.forEach(reservation => {
            const statusBadge = getStatusBadge(reservation.statut);
            const dateDebut = formatDateTime(reservation.date_debut);
            const dateFin = formatDateTime(reservation.date_fin);
            reservationsTable.innerHTML += `
                <tr>
                    <td>${reservation.id}</td>
                    <td>${reservation.place_numero || reservation.place_id}</td>
                    <td>${reservation.utilisateur_nom_complet || reservation.utilisateur_id}</td>
                    <td>${dateDebut}</td>
                    <td>${dateFin}</td>
                    <td>${reservation.montant}€</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editReservation(${reservation.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteReservation(${reservation.id})"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    }

    function setupPagination() {
        if (!paginationElement) return;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationElement.innerHTML = '';
        paginationElement.innerHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Précédent</a>
            </li>
        `;
        for (let i = 1; i <= totalPages; i++) {
            paginationElement.innerHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        paginationElement.innerHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Suivant</a>
            </li>
        `;
        document.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute('data-page'));
                if (!isNaN(page) && page > 0 && page <= totalPages && page !== currentPage) {
                    currentPage = page;
                    loadReservations();
                }
            });
        });
    }

    function loadUsers() {
        fetch('/app-gestion-parking/BackEnd/Controllers/UserController.php', { credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                if (data.success) populateUserDropdowns(data.data);
            });
    }

    function loadPlaces() {
        fetch('/app-gestion-parking/BackEnd/Controllers/PlaceController.php', { credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                if (data.success) populatePlaceDropdowns(data.data);
            });
    }

    function populateUserDropdowns(users) {
        const userDropdowns = [document.getElementById('client'), document.getElementById('editClient')];
        userDropdowns.forEach(dropdown => {
            if (!dropdown) return;
            dropdown.innerHTML = '<option value="">Sélectionner un client</option>';
            users.forEach(user => {
                dropdown.innerHTML += `<option value="${user.id}">${user.prenom} ${user.nom} (${user.email})</option>`;
            });
        });
    }

    function populatePlaceDropdowns(places) {
        const placeDropdowns = [document.getElementById('place'), document.getElementById('editPlace')];
        placeDropdowns.forEach(dropdown => {
            if (!dropdown) return;
            dropdown.innerHTML = '<option value="">Sélectionner une place</option>';
            places.forEach(place => {
                if (place.statut === 'disponible') {
                    dropdown.innerHTML += `<option value="${place.id}">Place ${place.numero} (${place.parking_nom})</option>`;
                }
            });
        });
    }

    function createReservation() {
        const data = {
            utilisateur_id: document.getElementById('client').value,
            place_id: document.getElementById('place').value,
            date_debut: document.getElementById('dateDebut').value,
            date_fin: document.getElementById('dateFin').value,
            statut: document.getElementById('statut').value
        };
        fetch('/app-gestion-parking/BackEnd/Controllers/ReservationController.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addReservationModal'));
                    modal?.hide();
                    loadReservations();
                    alert('Réservation créée avec succès');
                } else {
                    alert('Erreur: ' + data.message);
                }
            });
    }

    function updateReservation() {
        const data = {
            id: document.getElementById('editId').value,
            utilisateur_id: document.getElementById('editClient').value,
            place_id: document.getElementById('editPlace').value,
            date_debut: document.getElementById('editDateDebut').value,
            date_fin: document.getElementById('editDateFin').value,
            statut: document.getElementById('editStatut').value
        };
        fetch('/app-gestion-parking/BackEnd/Controllers/ReservationController.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editReservationModal'));
                    modal?.hide();
                    loadReservations();
                    alert('Réservation mise à jour avec succès');
                } else {
                    alert('Erreur: ' + data.message);
                }
            });
    }

    function formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '';
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function getStatusBadge(status) {
        const statusMap = {
            'en_cours': '<span class="badge bg-primary">En cours</span>',
            'terminee': '<span class="badge bg-success">Terminée</span>',
            'annulee': '<span class="badge bg-danger">Annulée</span>'
        };
        return statusMap[status] || `<span class="badge bg-secondary">${status}</span>`;
    }
});

function editReservation(id) {
    fetch(`/app-gestion-parking/BackEnd/Controllers/ReservationController.php?id=${id}`, { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const reservation = data.data;
                document.getElementById('editId').value = reservation.id;
                document.getElementById('editClient').value = reservation.utilisateur_id;
                document.getElementById('editPlace').value = reservation.place_id;
                document.getElementById('editDateDebut').value = reservation.date_debut.replace(' ', 'T');
                document.getElementById('editDateFin').value = reservation.date_fin.replace(' ', 'T');
                document.getElementById('editStatut').value = reservation.statut;
                const modal = new bootstrap.Modal(document.getElementById('editReservationModal'));
                modal.show();
            } else {
                alert('Erreur: ' + data.message);
            }
        });
}

function deleteReservation(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
        fetch(`/app-gestion-parking/BackEnd/Controllers/ReservationController.php?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Erreur: ' + data.message);
                }
            });
    }
}