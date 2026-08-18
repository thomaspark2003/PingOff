export async function createRoom() {
    const response = await fetch("http://localhost:5000/pingroom", { method: "POST" });

    const unparsed_data = await response.json();

    return unparsed_data.roomCode;

}