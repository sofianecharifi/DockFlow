const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;
const drive = osu.drive;

async function getSystemStats() {
    try {
        // Collecte des données
        const cpuPercentage = await cpu.usage();
        const memInfo = await mem.info();
        // drive.info() retourne généralement les infos du disque principal ('/')
        const driveInfo = await drive.info();

        // Formatage pour correspondre au frontend
        return {
            cpu: Math.round(cpuPercentage),
            // mem.info() donne `usedMemPercentage` et `freeMemPercentage`
            ram: Math.round(memInfo.usedMemPercentage || (100 - memInfo.freeMemPercentage) || 0),
            // drive.info() donne `usedPercentage`
            disk: Math.round(driveInfo.usedPercentage || 0)
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
