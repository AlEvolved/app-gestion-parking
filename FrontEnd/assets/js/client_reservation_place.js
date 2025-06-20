document.addEventListener('DOMContentLoaded', function() {
    const BASE_URL = '/app-gestion-parking/';
    const reservationForm = document.getElementById('reservationForm');
    const placeSelect = document.getElementById('place');
    const dateDebutInput = document.getElementById('dateDebut');
    const dateFinInput = document.getElementById('dateFin');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    loadAvailablePlaces();

    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createReservation();
    });

    function loadAvailablePlaces() {
        placeSelect.innerHTML = '<option value="">Chargement des places...</option>';
        errorMessage.classList.add('d-none');

        fetch(BASE_URL + 'BackEnd/Controllers/PlaceController.php', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                const places = Array.isArray(data) ? data : (data.data || []);
                const placesDisponibles = places.filter(place =>
                        place.statut && (
                            place.statut.toLowerCase() === 'disponible' ||
                            place.statut.toLowerCase() === 'libre'
                        )
                );
                if (placesDisponibles.length > 0) {
                    populatePlaceSelect(placesDisponibles);
                    errorMessage.classList.add('d-none');
                } else {
                    placeSelect.innerHTML = '<option value="">Aucune place disponible</option>';
                    errorMessage.textContent = 'Aucune place disponible pour réservation.';
                    errorMessage.classList.remove('d-none');
                }
            })
            .catch(error => {
                placeSelect.innerHTML = '<option value="">Erreur de connexion</option>';
                errorMessage.textContent = 'Erreur lors du chargement des places: ' + error.message;
                errorMessage.classList.remove('d-none');
            });
    }

    function populatePlaceSelect(places) {
        placeSelect.innerHTML = '<option value="">Sélectionner une place</option>';
        places.forEach(place => {
            placeSelect.innerHTML += `<option value="${place.id}">Place ${place.numero} (${place.parking_nom || 'Parking #' + place.parking_id})</option>`;
        });
    }

    function createReservation() {
        errorMessage.classList.add('d-none');
        successMessage.classList.add('d-none');

        let userId = null;
        if (document.cookie.includes('user_id=')) {
            userId = document.cookie.split('user_id=')[1].split(';')[0];
        } else {
            userId = localStorage.getItem('user_id') || localStorage.getItem('userId') || sessionStorage.getItem('user_id');
        }

        if (!userId) {
            errorMessage.textContent = 'Vous devez être connecté pour effectuer une réservation.';
            errorMessage.classList.remove('d-none');
            return;
        }

        const placeId = placeSelect.value;
        const dateDebut = dateDebutInput.value;
        const dateFin = dateFinInput.value;

        if (!placeId || !dateDebut || !dateFin) {
            errorMessage.textContent = 'Veuillez remplir tous les champs.';
            errorMessage.classList.remove('d-none');
            return;
        }

        const now = new Date();
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);

        if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
            errorMessage.textContent = 'Veuillez saisir des dates valides.';
            errorMessage.classList.remove('d-none');
            return;
        }

        if (debut < now) {
            errorMessage.textContent = 'La date de début doit être dans le futur.';
            errorMessage.classList.remove('d-none');
            return;
        }
        if (fin <= debut) {
            errorMessage.textContent = 'La date de fin doit être après la date de début.';
            errorMessage.classList.remove('d-none');
            return;
        }

        const data = {
            utilisateur_id: userId,
            place_id: placeId,
            date_debut: dateDebut,
            date_fin: dateFin,
            statut: 'en_cours'
        };

        fetch(BASE_URL + 'BackEnd/Controllers/ReservationController.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                const reservationId = data.id || (data.data && data.data.id);
                if (data.success && reservationId) {
                    window.location.href = '../Views/client_paiement.html?id=' + reservationId;
                } else if (data.success) {
                    successMessage.textContent = 'Réservation créée. Veuillez payer depuis vos réservations.';
                    successMessage.classList.remove('d-none');
                } else {
                    errorMessage.textContent = data.message || 'Erreur lors de la création de la réservation.';
                    errorMessage.classList.remove('d-none');
                }
            })
            .catch(error => {
                errorMessage.textContent = 'Erreur de connexion au serveur.';
                errorMessage.classList.remove('d-none');
            });
    }
});