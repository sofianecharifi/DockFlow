// Vérification de l'authentification de l'utilisateur
const token = localStorage.getItem('dockflow_token');

// Redirection vers la page de connexion si le token est manquant
if (!token) {
    window.location.href = '/login.html';
}

// Gestion de la déconnexion
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // Suppression du token
        localStorage.removeItem('dockflow_token');
        // Redirection vers le login
        window.location.href = '/login.html';
    });
}

// Fonctionnalités de rendu de la liste des conteneurs
import { createContainerCard } from '../components/card.js';

function renderContainersGrid(containers) {
    // Récupération du conteneur de la grille
    const grid = document.getElementById('containers-grid');
    if (!grid) return;

    // Nettoyage de la grille avant injection
    grid.replaceChildren();

    // Itération sur les conteneurs pour les afficher
    containers.forEach(container => {
        // Création de l'élément carte du conteneur
        const cardElement = createContainerCard(container);
        grid.appendChild(cardElement);
    });
}

// Initialisation de la connexion WebSockets
function initWebSockets() {
    // Vérifie si Socket.io est bien chargé dans le HTML
    if (typeof io !== 'undefined') {
        const socket = io(); // Connexion au serveur

        // L'écouteur de stats
        socket.on('system-stats', (stats) => {
            // CPU
            const cpuGauge = document.getElementById('cpu-gauge');
            const cpuText = document.getElementById('cpu-text');
            if (cpuGauge && cpuText && stats.cpu !== undefined) {
                cpuGauge.style.width = `${stats.cpu}%`;
                cpuText.textContent = `${stats.cpu}%`;
            }

            // RAM
            const ramGauge = document.getElementById('ram-gauge');
            const ramText = document.getElementById('ram-text');
            if (ramGauge && ramText && stats.ram !== undefined) {
                ramGauge.style.width = `${stats.ram}%`;
                ramText.textContent = `${stats.ram}%`;
            }

            // DISK
            const diskGauge = document.getElementById('disk-gauge');
            const diskText = document.getElementById('disk-text');
            if (diskGauge && diskText && stats.disk !== undefined) {
                diskGauge.style.width = `${stats.disk}%`;
                diskText.textContent = `${stats.disk}%`;
            }
        });
    } else {
        console.warn("Socket.io n'est pas encore inclus dans la page !");
    }
}

// Importation des services API
import { getContainers, actionContainer } from '../api/containers.api.js';

// Gestion des événements d'action sur les conteneurs
const gridContainer = document.getElementById('containers-grid');
if (gridContainer) {
    gridContainer.addEventListener('click', async (event) => {
        // Vérification du bouton cliqué
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const action = button.dataset.action;
        const id = button.dataset.id;

        if (!action || !id) return;

        // On ignore le bouton logs pour le moment
        if (action === 'logs') {
            console.log("Ouverture des logs pour le conteneur", id);
            return;
        }

        try {
            // Appel à l'API pour exécuter l'action
            button.disabled = true;
            await actionContainer(id, action);
            
            // Rafraîchissement global de la page
            await initializeDashboard();
        } catch (error) {
            console.error(`Erreur lors de l'action ${action}:`, error);
            alert(error.message);
            button.disabled = false;
        }
    });
}

async function initializeDashboard() {
    try {
        // 1. Lancer le monitoring WebSocket
        initWebSockets();

        // 2. Récupérer les vrais conteneurs depuis l'API
        const containers = await getContainers();

        // 3. Afficher la grille
        renderContainersGrid(containers);

    } catch (error) {
        console.error("Erreur lors de l'initialisation du tableau de bord :", error);
    }
}

// Initialisation du tableau de bord au chargement de la page
initializeDashboard();