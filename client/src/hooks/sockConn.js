import { useEffect, useRef, useState } from "react";

export function useSockConn(roomCode) {
    const sockEnd = useRef(null)

    const [matched, setMatched] = useState(false);

    useEffect(() => {
        if (!roomCode) {
            return;
        }

        const sock = new WebSocket("ws://localhost:5000");

        sockEnd.current = sock;

        sock.onopen = () => {
            sock.send(JSON.stringify({ type: "join", roomCode }))
        };

        sock.onmessage = (event) => {
            const server_msg = JSON.parse(event.data);
            if (server_msg.type == "matched") {
                setMatched(true);
            }
        };

        return () => sock.close();

    }, [roomCode]);

    return { matched };
}