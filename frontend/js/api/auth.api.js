const API_BASE = window.Capacitor ? 'http://IP_DE_TON_SERVEUR:3000' : '';

export async function loginRequest(email, password) {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    // Si le backend renvoie une erreur (401, 400, 500, etc.), on déclenche une exception
    if (!response.ok) {
        throw new Error(data.message || "Erreur de connexion");
    }

    return data;
}