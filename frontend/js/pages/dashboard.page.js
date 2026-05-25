// ==========================================
// ÉTAPE 1 : La barrière de sécurité (Le Gardien)
// ==========================================
const token = localStorage.getItem('dockflow_token');

// Le verdict : si pas de token, on dégage vers le login !
if (!token) {
    window.location.href = '/login.html';
}

// ==========================================
// ÉTAPE 2 : La logique de déconnexion (Logout)
// ==========================================
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // Suppression du token
        localStorage.removeItem('dockflow_token');
        // Redirection vers le login
        window.location.href = '/login.html';
    });
}

// ==========================================
// ÉTAPE 4 : La logique de rendu de la grille
// ==========================================
import { createContainerCard } from '../components/card.js';

function renderContainersGrid(containers) {
    // Le ciblage
    const grid = document.getElementById('containers-grid');
    if (!grid) return;

    // Le nettoyage : on vide la grille (méthode sécurisée sans innerHTML)
    grid.replaceChildren();

    // La boucle : on affiche chaque conteneur
    containers.forEach(container => {
        // Création de l'élément DOM sécurisé via notre usine à cartes
        const cardElement = createContainerCard(container);
        grid.appendChild(cardElement);
    });
}

// ==========================================
// ÉTAPE 5 : L'écoute du temps réel (WebSockets)
// ==========================================
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

// ==========================================
// ÉTAPE 3 : L'orchestration du chargement initial
// ==========================================
import { getContainers, actionContainer } from '../api/containers.api.js';

// ==========================================
// ÉTAPE 6 : L'orchestration des actions (Délégation)
// ==========================================
const gridContainer = document.getElementById('containers-grid');
if (gridContainer) {
    gridContainer.addEventListener('click', async (event) => {
        // Le filtrage : on cherche si le clic provient d'un bouton avec data-action
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
            // L'exécution : on appelle l'API
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

// Lancement direct puisque le Gardien (Étape 1) a validé le token !
initializeDashboard();