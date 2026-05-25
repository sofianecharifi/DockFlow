export function createContainerCard(container) {
    // Création du conteneur principal de la carte
    const card = document.createElement('div');
    card.className = "bg-[#1e293b] border border-slate-700 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all hover:border-slate-500";

    // Construction de l'en-tête de la carte
    const headerDiv = document.createElement('div');
    headerDiv.className = "p-5 flex-grow";

    const titleRow = document.createElement('div');
    titleRow.className = "flex justify-between items-start mb-4";

    const titleGroup = document.createElement('div');
    titleGroup.className = "min-w-0 flex-1 pr-4";

    // Le nom (h3)
    const title = document.createElement('h3');
    title.className = "text-lg font-bold text-white flex items-center gap-2 truncate";
    // Le backend renvoie container.name (sans le slash) 
    title.textContent = container.name || "App Inconnue";

    // La version ou l'image (span ou p)
    const subtitle = document.createElement('p');
    subtitle.className = "text-sm text-slate-400 mt-1 truncate";
    subtitle.textContent = container.image || "Image inconnue";

    titleGroup.appendChild(title);
    titleGroup.appendChild(subtitle);

    // Le badge de statut
    const badgeContainer = document.createElement('span');
    badgeContainer.className = "flex h-3 w-3 relative flex-shrink-0 mt-1.5";

    // Indicateurs d'état du conteneur
    const isRunning = container.state === 'running';

    if (isRunning) {
        // Effet radar vert (ping)
        const ping = document.createElement('span');
        ping.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75";
        const dot = document.createElement('span');
        dot.className = "relative inline-flex rounded-full h-3 w-3 bg-emerald-500";
        badgeContainer.appendChild(ping);
        badgeContainer.appendChild(dot);
    } else {
        // Point rouge simple
        const dot = document.createElement('span');
        dot.className = "relative inline-flex rounded-full h-3 w-3 bg-red-500";
        badgeContainer.appendChild(dot);
    }

    titleRow.appendChild(titleGroup);
    titleRow.appendChild(badgeContainer);

    // Le texte de statut
    const statusText = document.createElement('p');
    statusText.className = `text-sm font-medium ${isRunning ? 'text-emerald-400' : 'text-red-400'}`;
    // Le backend renvoie 'Up 2 hours' etc dans container.status
    statusText.textContent = container.status || (isRunning ? 'En ligne' : 'Stoppé');

    headerDiv.appendChild(titleRow);
    headerDiv.appendChild(statusText);

    // Boutons d'action dans le pied de la carte
    const actionsDiv = document.createElement('div');
    actionsDiv.className = "bg-slate-800/50 p-4 border-t border-slate-700 grid grid-cols-2 gap-2";

    // Fonction utilitaire pour éviter la répétition
    const createBtn = (text, customClasses, actionType) => {
        const btn = document.createElement('button');
        btn.className = `col-span-1 text-xs font-medium py-2 px-3 rounded-lg flex justify-center items-center gap-1 transition-colors ${customClasses}`;
        btn.textContent = text;

        btn.dataset.action = actionType;
        btn.dataset.id = container.id;
        return btn;
    };

    if (isRunning) {
        const stopBtn = createBtn('Stopper', 'bg-slate-700 hover:bg-slate-600 text-white', 'stop');
        const restartBtn = createBtn('Redémarrer', 'bg-slate-700 hover:bg-slate-600 text-white', 'restart');
        actionsDiv.appendChild(stopBtn);
        actionsDiv.appendChild(restartBtn);
    } else {
        const startBtn = createBtn('Démarrer', 'col-span-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30', 'start');
        actionsDiv.appendChild(startBtn);
    }

    // Le bouton logs (prend la place restante ou la nouvelle ligne)
    const logsBtn = createBtn('Logs', 'bg-slate-700 hover:bg-slate-600 text-white', 'logs');
    if (!isRunning) {
        logsBtn.classList.replace('col-span-1', 'col-span-2');
    }
    actionsDiv.appendChild(logsBtn);

    // Le bouton supprimer (prend toujours deux colonnes)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = "col-span-2 mt-1 text-red-400 hover:text-red-300 text-xs font-medium py-2 flex justify-center items-center gap-1 transition-colors";
    deleteBtn.textContent = "Supprimer l'application";
    deleteBtn.dataset.action = 'remove';
    deleteBtn.dataset.id = container.id;
    actionsDiv.appendChild(deleteBtn);

    card.appendChild(headerDiv);
    card.appendChild(actionsDiv);

    // Retour de l'élément carte
    return card;
}