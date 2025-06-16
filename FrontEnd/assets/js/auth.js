// FrontEnd/assets/js/auth.js
// Script de vérification d'authentification global

document.addEventListener('DOMContentLoaded', function() {
    // Une référence au bouton de déconnexion pour l'ajouter dynamiquement si nécessaire
    const logoutBtn = document.getElementById('logoutBtn');

    // Vérifier d'abord si l'utilisateur a des informations dans le localStorage
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');

    if (!userId) {
        // Si pas d'infos dans localStorage, vérifier avec le serveur
        checkServerAuthentication();
    } else {
        // Définir le gestionnaire pour le bouton de déconnexion si présent
        setupLogoutButton();
    }

    function checkServerAuthentication() {
        // Vérifier l'authentification auprès du serveur
        fetch('/app-gestion-parking/BackEnd/Controllers/AuthCheckController.php', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (!data.authenticated) {
                    // Rediriger vers la page de connexion si on n'est pas sur la page de login
                    if (!window.location.href.includes('login.html')) {
                        window.location.href = '/app-gestion-parking/FrontEnd/Views/login.html';
                    }
                } else {
                    // Stocker les informations dans localStorage
                    localStorage.setItem('user_id', data.user_id);
                    localStorage.setItem('user_role', data.role);

                    // Configurer le bouton de déconnexion
                    setupLogoutButton();
                }
            })
            .catch(error => {
                console.error('Erreur de vérification d\'authentification:', error);
            });
    }

    function setupLogoutButton() {
        // Ajouter un gestionnaire d'événement pour la déconnexion si le bouton existe
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                fetch('/app-gestion-parking/BackEnd/Controllers/LogoutController.php', {
                    credentials: 'include'
                })
                    .then(response => response.json())
                    .then(() => {
                        localStorage.removeItem('user_id');
                        localStorage.removeItem('user_role');
                        window.location.href = '/app-gestion-parking/FrontEnd/Views/login.html';
                    })
                    .catch(error => {
                        console.error('Erreur de déconnexion:', error);
                        localStorage.removeItem('user_id');
                        localStorage.removeItem('user_role');
                        window.location.href = '/app-gestion-parking/FrontEnd/Views/login.html';
                    });
            });
        }
    }
});