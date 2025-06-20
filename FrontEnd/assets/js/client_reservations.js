document.addEventListener('DOMContentLoaded', function() {
    const BASE_URL = '/app-gestion-parking/';
    const reservationsTable = document.getElementById('reservationsTable');
    const filterButton = document.getElementById('filterButton');
    const dateFilter = document.getElementById('dateFilter');
    const statusFilter = document.getElementById('statusFilter');
    const errorMessage = document.getElementById('errorMessage');

    loadReservations();

    if (filterButton) {
        filterButton.addEventListener('click', loadReservations);
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('d-none');
        }
    }

    function hideError() {
        if (errorMessage) {
            errorMessage.classList.add('d-none');
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR');
    }

    function formatStatus(status) {
        switch (status) {
            case 'en_cours': return '<span class="badge bg-primary">En cours</span>';
            case 'terminee': return '<span class="badge bg-success">Terminée</span>';
            case 'annulee': return '<span class="badge bg-danger">Annulée</span>';
            default: return '<span class="badge bg-secondary">Inconnu</span>';
        }
    }

    function extractReservations(data) {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        if (data && typeof data === 'object') {
            for (const key in data) {
                if (Array.isArray(data[key])) return data[key];
            }
        }
        return [];
    }

    function loadReservations() {
        hideError();
        reservationsTable.innerHTML = '<tr><td colspan="7" class="text-center">Chargement des réservations...</td></tr>';

        const userId = localStorage.getItem('user_id');
        if (!userId) {
            showError('Utilisateur non identifié. Veuillez vous reconnecter.');
            reservationsTable.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Erreur d\'authentification</td></tr>';
            return;
        }

        let url = `${BASE_URL}BackEnd/Controllers/ReservationController.php?utilisateur_id=${userId}`;
        if (dateFilter && dateFilter.value) url += `&date=${dateFilter.value}`;
        if (statusFilter && statusFilter.value) url += `&statut=${statusFilter.value}`;

        fetch(url, { credentials: 'include' })
            .then(response => response.text())
            .then(text => {
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    throw new Error('Réponse serveur invalide: ' + text.substring(0, 100));
                }
                const reservations = extractReservations(data);
                if (!reservations.length) {
                    reservationsTable.innerHTML = '<tr><td colspan="7" class="text-center">Aucune réservation trouvée</td></tr>';
                    return;
                }
                reservationsTable.innerHTML = '';
                reservations.forEach(reservation => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-reservation-id', reservation.id);
                    row.setAttribute('data-place-id', reservation.place_id);
                    row.setAttribute('data-date-debut', reservation.date_debut || '');
                    row.setAttribute('data-date-fin', reservation.date_fin || '');
                    row.setAttribute('data-montant', reservation.montant || '');
                    row.innerHTML = `
                        <td>${reservation.id}</td>
                        <td>${reservation.place_numero || 'Place #' + reservation.place_id}</td>
                        <td>${formatDate(reservation.date_debut)}</td>
                        <td>${formatDate(reservation.date_fin)}</td>
                        <td>${reservation.montant ? reservation.montant + ' €' : 'N/A'}</td>
                        <td>${formatStatus(reservation.statut)}</td>
                        <td>
                            ${reservation.statut === 'en_cours' ?
                        `<button class="btn btn-sm btn-danger" onclick="cancelReservation(${reservation.id})">
                                <i class="bi bi-x-circle"></i> Annuler
                            </button>` : ''}
                        </td>
                    `;
                    reservationsTable.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Erreur:', error);
                showError(`Erreur lors du chargement des réservations: ${error.message}`);
                reservationsTable.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Erreur de chargement</td></tr>';
            });
    }

    window.cancelReservation = function(reservationId) {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
        hideError();

        const userId = localStorage.getItem('user_id');
        if (!userId) {
            showError('Utilisateur non identifié. Veuillez vous reconnecter.');
            return;
        }

        const row = document.querySelector(`tr[data-reservation-id="${reservationId}"]`);
        const placeId = row ? row.getAttribute('data-place-id') : null;
        if (!placeId) {
            showError('Impossible de trouver l\'ID de la place associée à cette réservation.');
            return;
        }

        // Récupérer les champs obligatoires depuis les attributs data
        const dateDebut = row.getAttribute('data-date-debut') || null;
        const dateFin = row.getAttribute('data-date-fin') || null;
        const montant = row.getAttribute('data-montant') || null;

        fetch(`${BASE_URL}BackEnd/Controllers/ReservationController.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                id: reservationId,
                utilisateur_id: userId,
                place_id: placeId,
                date_debut: dateDebut,
                date_fin: dateFin,
                montant: montant,
                statut: 'annulee'
            })
        })
            .then(response => response.text())
            .then(text => {
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    throw new Error('Réponse serveur invalide: ' + text.substring(0, 100));
                }
                if (!data.success) throw new Error(data.message || 'Erreur lors de l\'annulation');
                // Libérer la place
                return fetch(`${BASE_URL}BackEnd/Controllers/PlaceController.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        id: placeId,
                        statut: 'disponible'
                    })
                });
            })
            .then(() => loadReservations())
            .catch(error => {
                console.error('Erreur d\'annulation:', error);
                showError(`Erreur lors de l'annulation: ${error.message}`);
            });
    };
});