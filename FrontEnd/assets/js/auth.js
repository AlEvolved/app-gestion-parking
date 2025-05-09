document.addEventListener('DOMContentLoaded', function() {
    // Vérifie si l'utilisateur est connecté
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
    }

    // Gestion de la déconnexion
    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    });
});