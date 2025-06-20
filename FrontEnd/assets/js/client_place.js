document.addEventListener('DOMContentLoaded', function() {
    const BASE_URL = '/app-gestion-parking/';
    const placesList = document.getElementById('placesList');
    const errorMessage = document.getElementById('errorMessage');

    fetch(BASE_URL + 'BackEnd/Controllers/PlaceController.php', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            const places = Array.isArray(data) ? data : (data.data || []);
            const disponibles = places.filter(
                p => p.statut && (p.statut.toLowerCase() === 'disponible' || p.statut.toLowerCase() === 'libre')
            );
            if (disponibles.length === 0) {
                placesList.innerHTML = '<div class="col-12 text-center text-muted">Aucune place disponible.</div>';
                return;
            }
            placesList.innerHTML = '';
            disponibles.forEach(place => {
                placesList.innerHTML += `
                    <div class="col-md-4">
                        <div class="card spot-card h-100">
                            <div class="card-body text-center">
                                <h5 class="card-title">Place ${place.numero}</h5>
                                <p class="mb-2"><i class="bi bi-building"></i> Parking ${place.parking_nom || '#' + place.parking_id}</p>
                                <span class="badge bg-success mb-3">Disponible</span>
                                <a href="client_reservation_place.html?place_id=${place.id}" class="btn btn-primary">
                                    <i class="bi bi-calendar-plus"></i> Réserver
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            });
        })
        .catch(error => {
            errorMessage.textContent = 'Erreur lors du chargement des places : ' + error.message;
            errorMessage.classList.remove('d-none');
        });
});