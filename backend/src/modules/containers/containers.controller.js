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

module.exports = listContainers;