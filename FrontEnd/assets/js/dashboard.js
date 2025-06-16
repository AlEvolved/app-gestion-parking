// FrontEnd/assets/js/dashboard.js

class DashboardManager {
    constructor() {
        // Chemin correct vers le contrôleur
        this.statsUrl = '../../BackEnd/Controllers/DashboardController.php?action=getStats';
        this.charts = {
            reservations: null,
            places: null
        };
        this.init();
    }

    init() {
        this.loadDashboardData();

        // Bouton d'actualisation
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDashboardData());
        }
    }

    loadDashboardData() {
        fetch(this.statsUrl, { credentials: 'include' })
            .then(response => {
                if (!response.ok) throw new Error('Erreur HTTP: ' + response.status);
                return response.json();
            })
            .then(data => {
                if (!data.success) throw new Error(data.message || 'Erreur serveur');
                this.updateStatCards(data);
                this.updateCharts(data);
                this.updateRecentTables(data.recent);
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur de connexion au serveur');
            });
    }

    updateStatCards(data) {
        document.getElementById('totalPlaces').textContent = data.places.total;
        document.getElementById('availablePlaces').textContent = data.places.disponible;
        document.getElementById('occupiedPlaces').textContent = data.places.occupee;
        document.getElementById('activeReservations').textContent = data.reservations.en_cours;
    }

    updateCharts(data) {
        this.updateReservationsChart(data.reservations.par_jour);
        this.updatePlacesChart(data.places);
    }

    updateReservationsChart(reservationsData) {
        const ctx = document.getElementById('reservationsChart').getContext('2d');
        const labels = reservationsData.labels.map(date =>
            new Date(date).toLocaleDateString('fr-FR', {
                weekday: 'short', day: 'numeric', month: 'short'
            })
        );
        if (this.charts.reservations) this.charts.reservations.destroy();
        this.charts.reservations = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nombre de réservations',
                    data: reservationsData.values,
                    backgroundColor: 'rgba(13, 110, 253, 0.7)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Réservations par jour' }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        });
    }

    updatePlacesChart(placesData) {
        const ctx = document.getElementById('placesChart').getContext('2d');
        if (this.charts.places) this.charts.places.destroy();
        this.charts.places = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Disponible', 'Occupée', 'Indisponible'],
                datasets: [{
                    data: [
                        placesData.disponible,
                        placesData.occupee,
                        placesData.indisponible
                    ],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(220, 53, 69, 0.7)',
                        'rgba(108, 117, 125, 0.7)'
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(108, 117, 125, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'right' } }
            }
        });
    }

    updateRecentTables(recentData) {
        this.updateRecentReservations(recentData.reservations);
        this.updateRecentUsers(recentData.users);
    }

    updateRecentReservations(reservations) {
        const tbody = document.getElementById('recentReservations');
        tbody.innerHTML = '';
        if (reservations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Aucune réservation récente</td></tr>';
            return;
        }
        reservations.forEach(reservation => {
            const row = document.createElement('tr');
            if (reservation.statut === 'en_cours') row.classList.add('table-primary');
            else if (reservation.statut === 'terminee') row.classList.add('table-success');
            else if (reservation.statut === 'annulee') row.classList.add('table-danger');
            const date = new Date(reservation.date_debut);
            const dateFormatted = date.toLocaleDateString('fr-FR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            let statut;
            switch (reservation.statut) {
                case 'en_cours': statut = '<span class="badge bg-primary">En cours</span>'; break;
                case 'terminee': statut = '<span class="badge bg-success">Terminée</span>'; break;
                case 'annulee': statut = '<span class="badge bg-danger">Annulée</span>'; break;
                default: statut = reservation.statut;
            }
            row.innerHTML = `
                <td>${reservation.id}</td>
                <td>${reservation.utilisateur}</td>
                <td>${reservation.place}</td>
                <td>${dateFormatted}</td>
                <td>${statut}</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateRecentUsers(users) {
        const tbody = document.getElementById('recentUsers');
        tbody.innerHTML = '';
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Aucun utilisateur récent</td></tr>';
            return;
        }
        users.forEach(user => {
            const row = document.createElement('tr');
            if (user.role === 'admin') row.classList.add('table-info');
            let role;
            switch (user.role) {
                case 'admin': role = '<span class="badge bg-info">Admin</span>'; break;
                case 'utilisateur': role = '<span class="badge bg-secondary">Utilisateur</span>'; break;
                default: role = user.role;
            }
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.nom} ${user.prenom}</td>
                <td>${user.email}</td>
                <td>${role}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new DashboardManager();
});