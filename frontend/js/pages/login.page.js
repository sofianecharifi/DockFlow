import { loginRequest } from '../api/auth.api.js';

// Sélection des éléments du DOM
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

// Gestionnaire de l'événement de soumission du formulaire
form.addEventListener('submit', async (e) => {
    // Empêcher le rechargement de la page
    e.preventDefault();
    
    // On cache le message d'erreur lors d'une nouvelle tentative
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';

    // Récupération des valeurs du formulaire
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        // On appelle l'API d'authentification
        const data = await loginRequest(email, password);
        
        // Stockage du jeton d'authentification dans le localStorage
        localStorage.setItem('dockflow_token', data.token);
        
        // Redirection vers le tableau de bord
        window.location.href = '/index.html';
        
    } catch (error) {
        // Gestion des erreurs d'authentification et affichage du message
        console.error('Erreur lors de la connexion :', error);
        errorDiv.textContent = error.message || 'Erreur de connexion. Vérifiez vos identifiants.';
        errorDiv.classList.remove('hidden');
    }
});