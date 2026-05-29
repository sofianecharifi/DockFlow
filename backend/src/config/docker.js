const Docker = require("dockerode");

const isWindows = process.platform === "win32";

const docker = new Docker({
    socketPath: isWindows ? "//./pipe/docker_engine" : "/var/run/docker.sock"
});

module.exports = docker;