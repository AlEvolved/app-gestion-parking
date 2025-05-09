document.addEventListener('DOMContentLoaded', function() {
    const userRole = localStorage.getItem('userRole');
    const currentPage = window.location.pathname;

    // Protection des routes admin
    if (currentPage.includes('home.html') ||
        currentPage.includes('parking.html') ||
        currentPage.includes('reservation.html')) {
        if (userRole !== 'admin') {
            window.location.href = 'client-accueil.html';
        }
    }

    // Protection des routes client
    if (currentPage.includes('client-')) {
        if (userRole !== 'client') {
            window.location.href = 'home.html';
        }
    }

    // Si non connecté
    if (!userRole) {
        window.location.href = 'login.html';
    }
});