require("dotenv").config({ override: true });
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

        // Intervalle de rafraîchissement des statistiques
        // Note : Un délai trop court peut induire une surcharge CPU côté serveur
        setTimeout(sendStats, 500);
    };

    sendStats();

    let logStream = null;

    // Initialisation du flux de logs Docker

    socket.on('request-logs', async (id) => {
        if (logStream) {
            logStream.destroy();
            logStream = null;
        }

        try {
            const container = docker.getContainer(id);
            logStream = await container.logs({ stdout: true, stderr: true, follow: true, tail: 100 });
            
            // Utilisation de flux PassThrough pour nettoyer les en-têtes Docker
            // et séparer la sortie standard des erreurs
            const { PassThrough } = require('stream');
            const stdoutPass = new PassThrough();
            const stderrPass = new PassThrough();

            stdoutPass.on('data', (chunk) => {
                socket.emit('container-logs', { type: 'stdout', text: chunk.toString('utf8') });
            });

            stderrPass.on('data', (chunk) => {
                socket.emit('container-logs', { type: 'stderr', text: chunk.toString('utf8') });
            });

            // Dé-multiplexage natif de dockerode
            container.modem.demuxStream(logStream, stdoutPass, stderrPass);
            
        } catch (err) {
            console.error("Erreur de récupération des logs:", err);
            socket.emit('container-logs', `Erreur: ${err.message}`);
        }
    });

    socket.on('stop-logs', () => {
        if (logStream) {
            logStream.destroy();
            logStream = null;
        }
    });

    socket.on('disconnect', () => {
        isConnected = false;
        if (logStream) {
            logStream.destroy();
            logStream = null;
        }
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