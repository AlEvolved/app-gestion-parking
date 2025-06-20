document.addEventListener('DOMContentLoaded', function() {
    loadPlaces();
    loadParkings();


    document.getElementById('editPlaceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const data = {
            id: document.getElementById('editId').value,
            numero: document.getElementById('editNumero').value,
            parking_id: document.getElementById('editParking').value,
            statut: document.getElementById('editStatut').value
        };
        fetch('../../BackEnd/Controllers/PlaceController.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    bootstrap.Modal.getInstance(document.getElementById('editPlaceModal')).hide();
                    loadPlaces();
                } else {
                    alert('Erreur: ' + data.message);
                }
            });
    });
});

function loadPlaces() {
    fetch('../../BackEnd/Controllers/PlaceController.php', { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
            const tbody = document.getElementById('placesTable');
            tbody.innerHTML = '';
            if (!data.success || !data.data.length) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">Aucune place trouvée</td></tr>';
                return;
            }
            data.data.forEach(place => {
                tbody.innerHTML += `
                    <tr>
                        <td>${place.id}</td>
                        <td>${place.numero}</td>
                        <td>${place.parking_nom || place.parking_id}</td>
                        <td><span class="badge ${getStatutClass(place.statut)}">${place.statut}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editPlace(${place.id})"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="deletePlace(${place.id})"><i class="bi bi-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        });
}

function loadParkings() {
    fetch('../../BackEnd/Controllers/ParkingController.php', { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
            const selects = [document.getElementById('editParking')];
            selects.forEach(select => {
                if (!select) return;
                select.innerHTML = '<option value="">Sélectionner un parking</option>';
                if (data.success && data.data) {
                    data.data.forEach(pk => {
                        select.innerHTML += `<option value="${pk.id}">${pk.nom}</option>`;
                    });
                }
            });
        });
}

function editPlace(id) {
    fetch(`../../BackEnd/Controllers/PlaceController.php?id=${id}`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
            if (!data.success) return alert('Erreur: ' + data.message);
            const place = data.data;
            document.getElementById('editId').value = place.id;
            document.getElementById('editNumero').value = place.numero;
            document.getElementById('editParking').value = place.parking_id;
            document.getElementById('editStatut').value = place.statut;
            new bootstrap.Modal(document.getElementById('editPlaceModal')).show();
        });
}

function deletePlace(id) {
    if (!confirm('Supprimer cette place ?')) return;
    fetch(`../../BackEnd/Controllers/PlaceController.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) loadPlaces();
            else alert('Erreur: ' + data.message);
        });
}

function getStatutClass(statut) {
    switch (statut) {
        case 'disponible': return 'bg-success';
        case 'occupee': return 'bg-warning text-dark';
        case 'indisponible': return 'bg-secondary';
        default: return 'bg-light text-dark';
    }
}