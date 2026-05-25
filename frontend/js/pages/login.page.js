import { loginRequest } from '../api/auth.api.js';

// Le ciblage
const form = document.querySelector('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Création d'une zone pour le message d'erreur
let errorDiv = document.getElementById('error-message');
if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.className = 'text-red-500 text-sm font-medium mb-4 text-center hidden';
    form.prepend(errorDiv);
}

// L'interception
form.addEventListener('submit', async (e) => {
    // Le blocage : empêcher la page de se recharger
    e.preventDefault();
    
    // On cache le message d'erreur lors d'une nouvelle tentative
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';

    // L'action : on récupère les valeurs
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        // On appelle l'API d'authentification
        const data = await loginRequest(email, password);
        
        // Le stockage : on met le token bien au chaud
        localStorage.setItem('dockflow_token', data.token);
        
        // La redirection : direction la page principale
        window.location.href = '/index.html';
        
    } catch (error) {
        // En cas d'échec : on affiche le message rouge
        console.error('Erreur lors de la connexion :', error);
        errorDiv.textContent = error.message || 'Erreur de connexion. Vérifiez vos identifiants.';
        errorDiv.classList.remove('hidden');
    }
});