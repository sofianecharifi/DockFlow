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
// import { createContainerCard } from '../components/card.js'; // (Bientôt !)

function renderContainersGrid(containers) {
    // Le ciblage
    const grid = document.getElementById('containers-grid');
    if (!grid) return;

    // Le nettoyage : on vide la grille (méthode sécurisée sans innerHTML)
    grid.replaceChildren();

    // La boucle : on affiche chaque conteneur
    containers.forEach(container => {
        // En attendant d'avoir card.js, on met un bloc temporaire
        // Plus tard, on créera le DOM via createElement dans card.js pour éviter les failles XSS
        const placeholder = document.createElement('div');
        placeholder.className = "bg-slate-800 p-4 rounded-xl text-center text-slate-300 border border-slate-700";
        placeholder.textContent = `⏳ En attente du composant Card pour : ${container.name || container.Names[0]}`;
        grid.appendChild(placeholder);
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
// import { fetchContainers } from '../api/containers.api.js'; // (Bientôt !)

async function initializeDashboard() {
    try {
        // 1. Lancer le monitoring WebSocket
        initWebSockets();

        // 2. Récupérer les conteneurs depuis l'API (Simulé pour l'instant)
        // const containers = await fetchContainers(token);

        // Simulation d'une liste vide/test en attendant la vraie API
        const containersTest = [{ Names: ['/App_Test_1'] }, { Names: ['/Serveur_Minecraft'] }];

        // 3. Afficher la grille
        renderContainersGrid(containersTest);

    } catch (error) {
        console.error("Erreur lors de l'initialisation du tableau de bord :", error);
    }
}

// Lancement direct puisque le Gardien (Étape 1) a validé le token !
initializeDashboard();