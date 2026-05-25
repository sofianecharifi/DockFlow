export async function getContainers() {
    // Étape 1 : La fouille (récupération du token)
    const token = localStorage.getItem('dockflow_token');

    // Étape 2 : L'appel sécurisé au serveur
    const response = await fetch('/api/containers', {
        method: 'GET', // (optionnel car GET est la méthode par défaut, mais c'est bien de le préciser)
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // Étape 3 : Le traitement de la réponse (Gestion des erreurs)
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