document.addEventListener('DOMContentLoaded', function() {
    const userRole = localStorage.getItem('user_role');
    const currentPage = window.location.pathname;

    // Protection des routes admin
    if (
        currentPage.includes('home.html') ||
        currentPage.includes('parking.html') ||
        currentPage.includes('reservation.html') ||
        currentPage.includes('dashboard.html') ||
        currentPage.includes('client.html') ||
        currentPage.includes('place.html') ||
    ) {
        if (userRole !== 'admin') {
            window.location.href = 'home_client.html';
        }
    }

    // Protection des routes client
    if (
        currentPage.includes('client_') ||
        currentPage.includes('client_reservations.html')
    ) {
        if (userRole !== 'client') {
            window.location.href = 'home.html';
        }
    }

    // Si non connecté
    if (!userRole) {
        window.location.href = 'login.html';
    }
});