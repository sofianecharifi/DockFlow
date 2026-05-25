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

// ÉTAPE 3 : La Métamorphose - Création du serveur HTTP et initialisation de Socket.io
const server = http.createServer(app);
const io = new Server(server);

// L'écoute des connexions
io.on('connection', (socket) => {
    // La boucle d'envoi (toutes les 2 secondes)
    const statsInterval = setInterval(async () => {
        const stats = await getSystemStats();
        // L'émission des données vers le frontend
        socket.emit('system-stats', stats);
    }, 2000);

    // Le piège mortel : on coupe la boucle quand le client quitte la page
    socket.on('disconnect', () => {
        clearInterval(statsInterval);
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

// Le lancement final : on utilise server au lieu de app !
server.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});