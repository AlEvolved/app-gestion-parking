document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const prenom = document.getElementById('prenom').value.trim();
            const nom = document.getElementById('nom').value.trim();
            const email = document.getElementById('email').value.trim();
            const mot_de_passe = document.getElementById('mdp').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            errorMessage.classList.add('d-none');
            successMessage.classList.add('d-none');

            if (!prenom || !nom || !email || !mot_de_passe || !confirmPassword) {
                errorMessage.textContent = "Tous les champs sont obligatoires.";
                errorMessage.classList.remove('d-none');
                return;
            }
            if (mot_de_passe !== confirmPassword) {
                errorMessage.textContent = "Les mots de passe ne correspondent pas.";
                errorMessage.classList.remove('d-none');
                return;
            }

            try {
                const response = await fetch('/app-gestion-parking/BackEnd/Controllers/RegisterController.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prenom, nom, email, mot_de_passe }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (data.success) {
                    successMessage.textContent = "Inscription réussie ! Vous pouvez vous connecter.";
                    successMessage.classList.remove('d-none');
                    registerForm.reset();
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    errorMessage.textContent = data.message || "Erreur lors de l'inscription.";
                    errorMessage.classList.remove('d-none');
                }
            } catch (error) {
                errorMessage.textContent = "Erreur de connexion au serveur.";
                errorMessage.classList.remove('d-none');
            }
        });
    }
});