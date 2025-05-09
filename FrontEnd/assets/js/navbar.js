document.addEventListener('DOMContentLoaded', function() {
    // Code de la navbar (comme avant)
    const navbarHtml = `
        <!-- Votre navbar HTML existant -->
    `;

    // Insérer la navbar au début du body
    document.body.insertAdjacentHTML('afterbegin', navbarHtml);

    // Gestion de la déconnexion
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();

        // Supprimer les données de session
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');

        // Rediriger vers la page de connexion
        window.location.href = 'login.html';
    });

    // Marquer l'onglet actif
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});