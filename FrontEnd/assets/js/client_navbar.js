document.addEventListener('DOMContentLoaded', function() {
    const navbarHtml = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
            <div class="container">
                <a class="navbar-brand" href="home_client.html">
                    <i class="bi bi-p-circle-fill"></i> MyPark
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarClient">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarClient">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="home_client.html">
                                <i class="bi bi-house-door"></i> Accueil
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="client_reservations.html">
                                <i class="bi bi-calendar-check"></i> Mes réservations
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="client_profil.html">
                                <i class="bi bi-person"></i> Mon profil
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="client_reservation_place.html">
                                <i class="bi bi-plus-circle"></i> Réserver
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="place_clients.html">
                                <i class="bi bi-p-square"></i> Parking
                            </a>
                        </li>
                    </ul>
                    <div class="d-flex align-items-center">
                        <span class="navbar-text me-3 text-white" id="clientName">
                            <i class="bi bi-person-circle"></i> Client
                        </span>
                        <button class="btn btn-outline-danger" id="logoutBtn">
                            <i class="bi bi-box-arrow-right"></i> Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    `;
    document.getElementById('navbar-container').innerHTML = navbarHtml;

    // Mettre en surbrillance le lien actif
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Afficher le nom du client si disponible
    if (localStorage.getItem('userName')) {
        document.getElementById('clientName').textContent = localStorage.getItem('userName');
    }

    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', function() {
        fetch('../../BackEnd/Controllers/LogoutController.php', { credentials: 'include' })
            .then(() => {
                localStorage.clear();
                window.location.href = 'login.html';
            })
            .catch(() => {
                localStorage.clear();
                window.location.href = 'login.html';
            });
    });
});