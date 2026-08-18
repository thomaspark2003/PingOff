const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");

const sock = require("ws")

const server = http.createServer(app);
const websock_serv = new sock.WebSocketServer({ server });

app.use(cors()); //Express middleware
app.use(express.json());

websock_serv.on("connection", (sock) => {
    console.log("Client connection occurred")
});

server.listen(5000, () => {
    console.log("server has been initialized at port 5000")
})

