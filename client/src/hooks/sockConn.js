import { useEffect, useRef, useState } from "react";

export function useSockConn(roomCode) {
    const sockEnd = useRef(null)

    const [matched, setMatched] = useState(false);

    const [myPing, setMyPing] = useState( { rtt: null, jitter: null } );

    const [oppPing, setOppPing] = useState( { rtt: null, jitter: null } );

    const rtt_log = useRef([]);

    useEffect(() => {
        if (!roomCode) {
            return;
        }

        const sock = new WebSocket("wss://pingoff.onrender.com");

        sockEnd.current = sock;

        let pingInterval;

        sock.onopen = () => {
            sock.send(JSON.stringify({ type: "join", roomCode }))
        };

        sock.onmessage = (event) => {
            const server_msg = JSON.parse(event.data);
            if (server_msg.type == "matched") {
                setMatched(true);
                pingInterval = setInterval(() => {
                    sock.send(JSON.stringify({
                        type: "ping",
                        clientTime: performance.now()
                    }));
                }, 1000);
            }

            if (server_msg.type == "reply") {
                const rtt = performance.now() - server_msg.clientTime;

                rtt_log.current.push(rtt);

                if (rtt_log.current.length > 10) {
                    rtt_log.current.shift();
                }

                const rtt_sample = rtt_log.current;
                const avg_rtt = rtt_sample.reduce((a,b) => a + b, 0) / rtt_sample.length;

                const jitter = Math.sqrt(rtt_sample.reduce((sum, rtt_x) => sum + (rtt_x - avg_rtt) ** 2, 0)/rtt_sample.length);

                const ping_stats = { rtt: Math.round(avg_rtt), jitter: Math.round(jitter) };
                setMyPing(ping_stats);

                sock.send(JSON.stringify({ type: "stats", ...ping_stats }))

            }

            if (server_msg.type == "Opponent_ping") {
                setOppPing({ rtt: server_msg.rtt, jitter: server_msg.jitter });
            }


        }

        return () => {
            clearInterval(pingInterval);
            sock.close()
        };

    }, [roomCode]);

    return { matched, myPing, oppPing };
}