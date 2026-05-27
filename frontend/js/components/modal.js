export function closeLogsModal(socket) {
    const logsModal = document.getElementById('logs-modal');
    const logsStream = document.getElementById('logs-stream');

    if (logsModal) {
        logsModal.classList.add('hidden'); // Masquage de la modale
    }
    if (logsStream) {
        logsStream.textContent = ''; // Réinitialisation du buffer textuel
    }
    if (socket) {
        socket.emit('stop-logs'); // Signal d'arrêt du flux Docker vers le serveur
    }
}

export function openLogsModal(id, socket) {
    const logsModal = document.getElementById('logs-modal');
    if (logsModal && socket) {
        logsModal.classList.remove('hidden');
        socket.emit('request-logs', id);
    }
}

export function initLogsModalEvents(getSocket) {
    const closeLogsBtn = document.getElementById('close-logs-btn');
    const logsBackdrop = document.getElementById('logs-backdrop');

    const handleClose = () => closeLogsModal(getSocket());

    if (closeLogsBtn) {
        closeLogsBtn.addEventListener('click', handleClose);
    }

    if (logsBackdrop) {
        logsBackdrop.addEventListener('click', handleClose);
    }

    // Fermeture avec la touche Échap
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const logsModal = document.getElementById('logs-modal');
            if (logsModal && !logsModal.classList.contains('hidden')) {
                handleClose();
            }
        }
    });
}