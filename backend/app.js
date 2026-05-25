const listContainers = require("./src/modules/containers/containers.controller");
const express = require("express");
const path = require("path");

const app = express();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.use(express.static(path.join(__dirname, "../frontend"), { index: false }));

app.get("/api/containers", async (req, res) => {
    try {
        const containers = await listContainers();
        res.json(containers);

    } catch (error) {
        res.status(500).json({
            error: "Erreur serveur"
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});