const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.use(express.static(path.join(__dirname, "../frontend"), { index: false }));

app.get("/api/images", (req, res) => {
    
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});