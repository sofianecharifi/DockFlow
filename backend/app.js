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

// init http & ws
const server = http.createServer(app);
const io = new Server(server);

// broadcast stats loop
const broadcastStats = async () => {
    // limit to active clients
    if (io.engine.clientsCount > 0) {
        try {
            const stats = await getSystemStats();
            io.emit('system-stats', stats);
        } catch (err) {
            console.error("Erreur stats:", err);
        }
    }
    // 1 sec refresh
    setTimeout(broadcastStats, 1000);
};

// start loop
broadcastStats();

// ws handlers
io.on('connection', (socket) => {
    let logStream = null;

    // setup logs

    socket.on('request-logs', async (id) => {
        if (logStream) {
            logStream.destroy();
            logStream = null;
        }

        try {
            const container = docker.getContainer(id);
            logStream = await container.logs({ stdout: true, stderr: true, follow: true, tail: 100 });
            
            // bypass headers and split streams
            const { PassThrough } = require('stream');
            const stdoutPass = new PassThrough();
            const stderrPass = new PassThrough();

            stdoutPass.on('data', (chunk) => {
                socket.emit('container-logs', { type: 'stdout', text: chunk.toString('utf8') });
            });

            stderrPass.on('data', (chunk) => {
                socket.emit('container-logs', { type: 'stderr', text: chunk.toString('utf8') });
            });

            // demux docker stream
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
        if (logStream) {
            logStream.destroy();
            logStream = null;
        }
    });
});

// body parser
app.use(express.json());

// auth
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

// protected containers routes
app.use('/api/containers', containersRoutes);

// boot
server.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});