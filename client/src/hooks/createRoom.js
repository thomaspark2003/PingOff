export async function createRoom() {
    const response = await fetch("https://pingoff.onrender.com/pingroom", { method: "POST" });

    const unparsed_data = await response.json();

    return unparsed_data.roomCode;

}