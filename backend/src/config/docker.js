const Docker = require("dockerode");

const docker = new Docker({
    socketPath: "/var/run/docker.sock" // Linux
    // socketPath: "//./pipe/docker_engine" // Windows
});

module.exports = docker;