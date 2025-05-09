document.addEventListener('DOMContentLoaded', function() {
    // Affiche l'email de l'utilisateur
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        // Mise à jour du message de bienvenue
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.innerHTML = `Bienvenue, ${userEmail} !`;

        // Mise à jour de l'email dans la navbar
        const userEmailElement = document.getElementById('userEmail');
        userEmailElement.innerHTML = `<i class="bi bi-person-fill"></i> ${userEmail}`;
    }

    // Active le lien actuel dans la navbar
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});