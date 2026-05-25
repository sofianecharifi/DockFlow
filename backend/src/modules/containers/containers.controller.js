const docker = require("../../config/docker");

async function listContainers() {
    try {
        const containers = await docker.listContainers({ all: true });
        return containers.map(container => ({
            id: container.Id,
            name: container.Names[0]?.replace("/", ""),
            image: container.Image,
            state: container.State,
            status: container.Status
        }));
    } catch (error) {
        console.error("Erreur Docker :", error);
        throw error;
    }
}

async function startContainer(req, res) {
    try {
        const id = req.params.id;
        const container = docker.getContainer(id);
        await container.start();
        return res.status(200).json({ message: "Conteneur démarré avec succès" });
    } catch (error) {
        if (error.statusCode === 304) {
            return res.status(304).json({ message: "Action impossible, le conteneur tourne déjà" });
        }
        console.error("Erreur startContainer:", error);
        return res.status(500).json({ message: "Erreur lors du démarrage du conteneur", error: error.message });
    }
}

async function stopContainer(req, res) {
    try {
        const id = req.params.id;
        const container = docker.getContainer(id);
        await container.stop();
        return res.status(200).json({ message: "Conteneur arrêté avec succès" });
    } catch (error) {
        if (error.statusCode === 304) {
            return res.status(304).json({ message: "Action impossible, le conteneur est déjà arrêté" });
        }
        console.error("Erreur stopContainer:", error);
        return res.status(500).json({ message: "Erreur lors de l'arrêt du conteneur", error: error.message });
    }
}

async function restartContainer(req, res) {
    try {
        const id = req.params.id;
        const container = docker.getContainer(id);
        await container.restart();
        return res.status(200).json({ message: "Conteneur redémarré avec succès" });
    } catch (error) {
        console.error("Erreur restartContainer:", error);
        return res.status(500).json({ message: "Erreur lors du redémarrage du conteneur", error: error.message });
    }
}

async function removeContainer(req, res) {
    try {
        const id = req.params.id;
        const container = docker.getContainer(id);
        await container.remove();
        return res.status(200).json({ message: "Conteneur supprimé avec succès" });
    } catch (error) {
        if (error.statusCode === 409) {
            return res.status(409).json({ message: "Action impossible, le conteneur est en cours d'exécution" });
        }
        console.error("Erreur removeContainer:", error);
        return res.status(500).json({ message: "Erreur lors de la suppression du conteneur", error: error.message });
    }
}

module.exports = {
    listContainers,
    startContainer,
    stopContainer,
    restartContainer,
    removeContainer
};