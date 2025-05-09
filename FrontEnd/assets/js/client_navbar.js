document.addEventListener('DOMContentLoaded', function() {
    const navbarHtml = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Mon Parking</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link" href="home_client.html">Accueil</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="client_reservations.html">Mes réservations</a>
                        </li>
                    </ul>
                    <div class="d-flex align-items-center">
                        <span class="navbar-text me-3" id="userEmail"></span>
                        <button type="button" class="btn btn-danger" id="logoutBtn">Déconnexion</button>
                    </div>
                </div>
            </div>
        </nav>
    `;

    document.getElementById('navbar-container').innerHTML = navbarHtml;
    document.getElementById('userEmail').textContent = localStorage.getItem('userEmail');
});