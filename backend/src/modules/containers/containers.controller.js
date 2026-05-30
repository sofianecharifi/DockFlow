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

async function pullAndRecreateContainer(req, res) {
    try {
        const id = req.params.id;
        const container = docker.getContainer(id);
        const info = await container.inspect();

        const image = info.Config.Image;
        const name = info.Name.substring(1); // remove leading slash

        // Pull new image
        await new Promise((resolve, reject) => {
            docker.pull(image, (err, stream) => {
                if (err) return reject(err);
                docker.modem.followProgress(stream, onFinished);
                function onFinished(err, output) {
                    if (err) return reject(err);
                    resolve(output);
                }
            });
        });

        // Stop if running
        if (info.State.Running) {
            await container.stop();
        }

        // Remove container
        await container.remove();

        // Create new container
        const newContainer = await docker.createContainer({
            ...info.Config,
            HostConfig: info.HostConfig,
            name: name
        });

        // Start new container
        await newContainer.start();

        return res.status(200).json({ message: "Conteneur mis à jour et recréé avec succès" });
    } catch (error) {
        console.error("Erreur pullAndRecreateContainer:", error);
        return res.status(500).json({ message: "Erreur lors de la mise à jour du conteneur", error: error.message });
    }
}

module.exports = {
    listContainers,
    startContainer,
    stopContainer,
    restartContainer,
    removeContainer,
    pullAndRecreateContainer
};