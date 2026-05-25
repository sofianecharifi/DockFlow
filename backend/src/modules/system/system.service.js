const { createOSUtils } = require('node-os-utils');
const osUtils = createOSUtils();

async function getSystemStats() {
    try {
        // Collecte des données avec la nouvelle API
        const cpuResult = await osUtils.cpu.usage();
        const memResult = await osUtils.memory.info();
        const diskResult = await osUtils.disk.info();

        let cpuPercentage = 0;
        let ramPercentage = 0;
        let diskPercentage = 0;

        if (cpuResult.success) {
            cpuPercentage = cpuResult.data;
        }

        if (memResult.success && memResult.data) {
            ramPercentage = memResult.data.usagePercentage || 0;
        }

        if (diskResult.success && Array.isArray(diskResult.data)) {
            // Trouver le disque principal ('/') ou prendre le premier
            const mainDisk = diskResult.data.find(d => d.mountpoint === '/') || diskResult.data[0];
            if (mainDisk) {
                diskPercentage = mainDisk.usagePercentage || 0;
            }
        }

        // Formatage pour correspondre au frontend
        return {
            cpu: Math.round(cpuPercentage),
            ram: Math.round(ramPercentage),
            disk: Math.round(diskPercentage)
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques système :", error);
        // Valeurs par défaut en cas d'erreur
        return { cpu: 0, ram: 0, disk: 0 };
    }
}

module.exports = {
    getSystemStats
};
