const API_BASE = window.Capacitor ? 'https://dockflow.mycharifi.ovh' : '';

export async function getContainers() {

    const token = localStorage.getItem('dockflow_token');


    const response = await fetch(`${API_BASE}/api/containers`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });


    if (!response.ok) {
        // invalid auth
        if (response.status === 401) {
            throw new Error("Session expirée");
        }
        // fallback
        throw new Error("Impossible de récupérer les conteneurs.");
    }


    const data = await response.json();
    return data;
}

export async function actionContainer(id, action) {
    const token = localStorage.getItem('dockflow_token');
    
    // map action to method
    const method = action === 'remove' ? 'DELETE' : 'POST';
    

    const url = action === 'remove' ? `${API_BASE}/api/containers/${id}` : `${API_BASE}/api/containers/${id}/${action}`;

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
        // get backend err
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Erreur lors de l'action ${action}`);
    }

    return await response.json();
}