document.addEventListener('DOMContentLoaded', function() {
    const navbarHtml = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="#">Gestion Parking</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link" href="home.html">
                                <i class="bi bi-house-door"></i> Accueil
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="parking.html">
                                <i class="bi bi-p-square"></i> Parking
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="reservations.html">
                                <i class="bi bi-calendar-check"></i> Réservations
                            </a>
                        </li>
                    </ul>
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="#" id="logoutBtn">
                                <i class="bi bi-box-arrow-right"></i> Déconnexion
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', navbarHtml);

    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});