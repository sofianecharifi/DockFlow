const express = require('express');
const router = express.Router();
const { listContainers, startContainer, stopContainer, restartContainer, removeContainer } = require('./containers.controller');
const requireAuth = require('../../middlewares/requireAuth');

// Route pour lister tous les conteneurs (protégée par requireAuth)
router.get('/', requireAuth, async (req, res) => {
    try {
        const containers = await listContainers();
        res.json(containers);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Actions sur un conteneur spécifique (toutes protégées par requireAuth)
router.post('/:id/start', requireAuth, startContainer);
router.post('/:id/stop', requireAuth, stopContainer);
router.post('/:id/restart', requireAuth, restartContainer);
router.delete('/:id', requireAuth, removeContainer);

module.exports = router;
