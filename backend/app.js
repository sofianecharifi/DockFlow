const express = require("express");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/api/images", (req, res) => {
    docker.listImages({ all: true }, (err, images) => {
        if (err) {
            console.log(err);
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

app.listen(port, () => {
    console.log(`Example app listening on port localhost:${port}`);
});