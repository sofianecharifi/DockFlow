const { createOSUtils } = require('node-os-utils');
const osUtils = createOSUtils({
    cpu: {
        samplingInterval: 500, // temps de calcul du CPU (ms)
        cacheTTL: 500          // durée du cache (ms)
    }
});

async function getSystemStats() {
    try {
        const cpuResult = await osUtils.cpu.usage();
        const memResult = await osUtils.memory.info();
        
        let diskPercentage = 0;
        try {
            const fs = require('fs');
            const path = require('path');
            const rootDir = path.parse(process.cwd()).root;
            const stats = await fs.promises.statfs(rootDir);
            const used = stats.blocks - stats.bfree;
            const totalForNonRoot = used + stats.bavail;
            diskPercentage = (used / totalForNonRoot) * 100;
            if (isNaN(diskPercentage)) diskPercentage = 0;
        } catch (e) {
            console.error("Erreur stats disque:", e);
        }

        let cpuPercentage = 0;
        let ramPercentage = 0;
        if (cpuResult.success) {
            cpuPercentage = cpuResult.data;
        }

        if (memResult.success && memResult.data) {
            ramPercentage = memResult.data.usagePercentage || 0;
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
