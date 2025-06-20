document.addEventListener('DOMContentLoaded', function() {
    const BASE_URL = '/app-gestion-parking/';
    const recap = document.getElementById('recapitulatif');
    const paiementForm = document.getElementById('paiementForm');
    const payerBtn = document.getElementById('payerBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCVC = document.getElementById('cardCVC');

    // Récupère l'ID de réservation depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const reservationId = urlParams.get('id');

    if (!reservationId) {
        errorMessage.textContent = 'Aucune réservation sélectionnée.';
        errorMessage.classList.remove('d-none');
        return;
    }

    // Affiche le récapitulatif
    fetch(`${BASE_URL}BackEnd/Controllers/ReservationController.php?id=${reservationId}`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
            if (!data.success || !data.data) {
                errorMessage.textContent = data.message || 'Réservation introuvable.';
                errorMessage.classList.remove('d-none');
                return;
            }
            const res = data.data;
            recap.innerHTML = `
                <h5>Récapitulatif</h5>
                <ul class="list-group">
                    <li class="list-group-item"><b>Place :</b> ${res.place_numero || res.place_id}</li>
                    <li class="list-group-item"><b>Date début :</b> ${res.date_debut}</li>
                    <li class="list-group-item"><b>Date fin :</b> ${res.date_fin}</li>
                    <li class="list-group-item"><b>Montant :</b> ${res.montant} €</li>
                    <li class="list-group-item"><b>Statut :</b> ${res.paye == 1 ? 'Payé' : 'Non payé'}</li>
                </ul>
            `;
            if (res.paye == 0) {
                paiementForm.classList.remove('d-none');
            } else {
                successMessage.textContent = 'Réservation déjà payée.';
                successMessage.classList.remove('d-none');
            }
        })
        .catch(() => {
            errorMessage.textContent = 'Erreur lors du chargement.';
            errorMessage.classList.remove('d-none');
        });

    paiementForm.addEventListener('submit', function(e) {
        e.preventDefault();
        errorMessage.classList.add('d-none');
        payerBtn.disabled = true;

        // Validation simple des champs
        if (!cardNumber.value.match(/^\d{16}$/) && !cardNumber.value.match(/^(\d{4} ?){4}$/)) {
            errorMessage.textContent = 'Numéro de carte invalide.';
            errorMessage.classList.remove('d-none');
            payerBtn.disabled = false;
            return;
        }
        if (!cardExpiry.value.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
            errorMessage.textContent = 'Date d\'expiration invalide.';
            errorMessage.classList.remove('d-none');
            payerBtn.disabled = false;
            return;
        }
        if (!cardCVC.value.match(/^\d{3,4}$/)) {
            errorMessage.textContent = 'CVC invalide.';
            errorMessage.classList.remove('d-none');
            payerBtn.disabled = false;
            return;
        }

        // Simule le paiement (en vrai, tu ne dois jamais stocker ces infos côté JS)
        fetch(`${BASE_URL}BackEnd/Controllers/ReservationController.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ action: 'payer', id: reservationId })
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    successMessage.textContent = 'Paiement effectué. Redirection...';
                    successMessage.classList.remove('d-none');
                    paiementForm.classList.add('d-none');
                    setTimeout(() => {
                        window.location.href = 'client_reservations.html';
                    }, 1500);
                } else {
                    errorMessage.textContent = data.message || 'Erreur lors du paiement.';
                    errorMessage.classList.remove('d-none');
                    payerBtn.disabled = false;
                }
            })
            .catch(() => {
                errorMessage.textContent = 'Erreur lors du paiement.';
                errorMessage.classList.remove('d-none');
                payerBtn.disabled = false;
            });
    });
});