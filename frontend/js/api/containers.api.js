export async function getContainers() {
    // Récupération du jeton d'authentification
    const token = localStorage.getItem('dockflow_token');

    // Exécution de la requête API
    const response = await fetch('/api/containers', {
        method: 'GET', // (optionnel car GET est la méthode par défaut, mais c'est bien de le préciser)
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // Gestion de la réponse et des erreurs
    if (!response.ok) {
        // Si le token est invalide, expiré, ou absent
        if (response.status === 401) {
            throw new Error("Session expirée");
        }
        // Pour toute autre erreur du serveur
        throw new Error("Impossible de récupérer les conteneurs.");
    }

    // Si la réponse est valide (Code 200), on extrait et on retourne les données
    const data = await response.json();
    return data;
}

export async function actionContainer(id, action) {
    const token = localStorage.getItem('dockflow_token');
    
    // Détermination de la méthode HTTP selon l'action
    const method = action === 'remove' ? 'DELETE' : 'POST';
    
    // Construction dynamique de l'URL de l'API
    const url = action === 'remove' ? `/api/containers/${id}` : `/api/containers/${id}/${action}`;

    const response = await fetch(url, {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Session expirée");
        }
        // Tentative de récupération du message d'erreur du backend
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Erreur lors de l'action ${action}`);
    }

    return await response.json();
}