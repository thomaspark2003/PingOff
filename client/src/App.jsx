import { useState } from 'react'
import { createRoom } from "./hooks/createRoom";
import { useSockConn } from "./hooks/sockConn";

import './App.css'

function App() {
  const [roomCode, setRoomCode] = useState(null);
  const [joinState, setJoinState] = useState("");


  const { matched } = useSockConn(roomCode);

  async function ManageRoom() {
    const code = await createRoom();
    setRoomCode(code);
  }

  async function ManageJoinRoom() {
    if (!joinState) {
      return;
    }
    setRoomCode(joinState.toUpperCase());
  }

  return (
    <section id="center">
      <h1>PingOff</h1>

      <button type="button" onClick={ManageRoom}>
        Create Room
      </button>

      <div>
        <input type="text" value={joinState} onChange={(e) =>
          setJoinState(e.target.value)} placeholder="Insert Room Code"></input>
          <button type="button" onClick={ManageJoinRoom}>Join Room</button>
      </div>

      {roomCode && <p>Room code: {roomCode}</p>}
      {roomCode && !matched && <p>Waiting...</p>}
      {matched && <p>Connected! Clients are ready.</p>}
    </section>
  )
}

export default App
