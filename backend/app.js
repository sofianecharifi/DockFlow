require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { getSystemStats } = require("./src/modules/system/system.service");
const containersRoutes = require("./src/modules/containers/containers.routes");
const authRoutes = require("./src/modules/auth/auth.routes");
const docker = require("./src/config/docker");
const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Création du serveur HTTP et initialisation de Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
    // Envoi périodique des statistiques système
    let isConnected = true;

    const sendStats = async () => {
        if (!isConnected) return;

        try {
            const stats = await getSystemStats();
            socket.emit('system-stats', stats);
        } catch (err) {
            console.error("Erreur stats:", err);
        }

        // On attend 1 seconde avant de relancer pour éviter de surcharger l'Event Loop
        // tout en gardant une interface fluide et réactive.
        setTimeout(sendStats, 1000);
    };

    sendStats();

    socket.on('disconnect', () => {
        isConnected = false;
    });
});

// Middleware pour parser le JSON du body
app.use(express.json());

// Routes d'authentification
app.use('/api/auth', authRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.use(express.static(path.join(__dirname, "../frontend"), { index: false }));

app.get("/api/images", (req, res) => {
    docker.listImages({ all: true }, (err, images) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error listing images");
        } else {
            const mappedImages = images.map((image) => ({
                id: image.Id,
                names: image.RepoTags,
            }));
            res.json(mappedImages);
        }
    });
});

// Routes pour les conteneurs (protégées par requireAuth)
app.use('/api/containers', containersRoutes);

// Lancement du serveur sur le port spécifié
server.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});