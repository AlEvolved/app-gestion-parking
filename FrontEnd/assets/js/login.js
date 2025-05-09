document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value.trim()
    };

    const errorMessage = document.getElementById('errorMessage');
    errorMessage.classList.add('d-none');

    try {
        const response = await fetch('http://localhost:8000/BackEnd/Controllers/LoginController.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', formData.email);
            window.location.href = 'home.html';
        } else {
            errorMessage.textContent = data.message;
            errorMessage.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Erreur:', error);
        errorMessage.textContent = 'Erreur de connexion au serveur';
        errorMessage.classList.remove('d-none');
    }
});