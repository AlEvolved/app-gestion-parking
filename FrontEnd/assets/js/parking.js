document.addEventListener('DOMContentLoaded', function() {
    loadPlaces();
});

function loadPlaces() {
    fetch('/app-gestion-parking/BackEnd/Controllers/ParkingController.php', {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayPlaces(data.data);
            } else {
                document.getElementById('parkingContent').innerHTML = '<div class="alert alert-warning">Aucune place trouvée.</div>';
            }
        })
        .catch(() => {
            document.getElementById('parkingContent').innerHTML = '<div class="alert alert-danger">Erreur serveur</div>';
        });
}

function displayPlaces(places) {
    if (!places || places.length === 0) {
        document.getElementById('parkingContent').innerHTML = '<div class="alert alert-info">Aucune place à afficher.</div>';
        return;
    }
    let html = '<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4" id="gridView">';
    places.forEach(place => {
        let statusClass = '';
        let statusLabel = '';
        switch (place.statut) {
            case 'disponible':
                statusClass = 'bg-disponible text-success';
                statusLabel = 'Disponible';
                break;
            case 'occupee':
                statusClass = 'bg-occupee text-danger';
                statusLabel = 'Occupée';
                break;
            case 'indisponible':
                statusClass = 'bg-indisponible text-secondary';
                statusLabel = 'Indisponible';
                break;
            default:
                statusClass = 'bg-light text-muted';
                statusLabel = place.statut;
        }
        html += `
            <div class="col">
                <div class="card spot-card shadow-sm h-100">
                    <div class="card-body d-flex flex-column align-items-center justify-content-center">
                        <div class="mb-2">
                            <i class="bi bi-car-front-fill display-5 text-primary"></i>
                        </div>
                        <h5 class="card-title mb-1 fw-bold">Place ${place.numero}</h5>
                        <div class="mb-2 text-muted small">${place.parking_nom || 'Parking #' + place.parking_id}</div>
                        <span class="badge badge-statut ${statusClass} px-3 py-2">${statusLabel}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    document.getElementById('parkingContent').innerHTML = html;
}