/**
 * Gestionnaire de la barre de navigation
 */
document.addEventListener('DOMContentLoaded', function() {
    const navbarHtml = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
            <div class="container">
                <a class="navbar-brand" href="dashboard.html">
                    <i class="bi bi-p-circle-fill"></i> MyPark
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="dashboard.html">
                                <i class="bi bi-speedometer2"></i> Tableau de bord
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="parking.html">
                                <i class="bi bi-grid-3x3"></i> Plan du parking
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="reservations.html">
                                <i class="bi bi-calendar-check"></i> Réservations
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="client.html">
                                <i class="bi bi-people"></i> Clients
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="place.html">
                                <i class="bi bi-p-square"></i> Places
                            </a>
                        </li>
                    </ul>
                    <div class="d-flex align-items-center">
                        <span class="navbar-text me-3 text-white" id="adminName">
                            <i class="bi bi-person-circle"></i> Admin
                        </span>
                        <button type="button" class="btn btn-outline-light" id="logoutBtn">
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
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });

    // Gestionnaire de déconnexion
    document.getElementById('logoutBtn').addEventListener('click', function() {
        fetch('../../BackEnd/Controllers/LogoutController.php', {
            credentials: 'include'
        })
            .then(() => {
                localStorage.clear();
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error('Erreur lors de la déconnexion:', error);
                localStorage.clear();
                window.location.href = 'login.html';
            });
    });

    // Afficher le nom de l'administrateur
    if (localStorage.getItem('userName')) {
        document.getElementById('adminName').textContent = localStorage.getItem('userName');
    }
});