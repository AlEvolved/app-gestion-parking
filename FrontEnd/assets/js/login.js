document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.replace('bi-eye', 'bi-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.replace('bi-eye-slash', 'bi-eye');
            }
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = {
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value.trim()
            };

            const errorMessage = document.getElementById('errorMessage');
            errorMessage.classList.add('d-none');

            try {
                const response = await fetch('/app-gestion-parking/BackEnd/Controllers/LoginController.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData),
                    credentials: 'include'
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', formData.email);
                    localStorage.setItem('userId', data.user_id);
                    localStorage.setItem('user_id', data.user_id);
                    localStorage.setItem('user_role', data.role);

                    if (data.role === 'admin') {
                        window.location.href = '/app-gestion-parking/FrontEnd/Views/dashboard.html';
                    } else {
                        window.location.href = '/app-gestion-parking/FrontEnd/Views/home_client.html';
                    }
                } else {
                    errorMessage.textContent = data.message || 'Identifiants incorrects';
                    errorMessage.classList.remove('d-none');
                }
            } catch (error) {
                console.error('Erreur:', error);
                errorMessage.textContent = 'Erreur de connexion au serveur';
                errorMessage.classList.remove('d-none');
            }
        });
    }
});