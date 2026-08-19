const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");

const sock = require("ws")

const server = http.createServer(app);
const websock_serv = new sock.WebSocketServer({ server });

const hash_rooms = new Map();

app.use(cors()); //Express middleware
app.use(express.json());

app.post("/pingroom", (request, response) => {
    const unique_code = uniqueRoom();
    hash_rooms.set(unique_code, []);
    response.json({ roomCode: unique_code });
})

websock_serv.on("connection", (sock) => {
    console.log("Client connection occurred")

    sock.on("message", (unparsed_data) => {
        const client_msg = JSON.parse(unparsed_data);

        if (client_msg.type == "join") {
            const unique_room = hash_rooms.get(client_msg.roomCode);

            if (!unique_room) {
                return;
            }

            unique_room.push(sock);
            sock.roomCode = client_msg.roomCode;

            if (unique_room.length == 2) {
                for (let i=0; i<unique_room.length; i++) {
                    const s = unique_room[i];
                    s.send(JSON.stringify( { type: "matched" } ))
                }
            }
        }

        if (client_msg.type == "ping") {
            sock.send(JSON.stringify({
                type: "reply",
                seq: client_msg.seq,
                clientTime: client_msg.clientTime
            }));
        }

        if (client_msg.type == "stats") {
            const room = hash_rooms.get(sock.roomCode);

            if (!room) {
                return;
            }

            const opp = room.find((s) => !(s == sock));

            if (opp) {
                opp.send(JSON.stringify({ type: "Opponent_ping", ...client_msg}))
            }
        }

    });
});

server.listen(5000, () => {
    console.log("server has been initialized at port 5000")
})

function generateRoom(code_length) {

    let chars = [];
    let digits = [];

    let room_code = ""

    for (let i=65; i<=90; i++) {
        chars.push(String.fromCharCode(i));
    }

    for (let i=0; i<=9; i++) {
        digits.push(i.toString());
    }

    const alphanum = chars.concat(digits);

    if (code_length == 6) {
        for (let i=0; i<code_length; i++) {
            const random_index = Math.floor(Math.random() * alphanum.length);
            room_code += alphanum[random_index]
        }
    }

    return room_code;

}

function uniqueRoom() {

    let code = generateRoom(6);

    while (hash_rooms.has(code)) {
        code = generateRoom(6);
    }

    return code;
}



