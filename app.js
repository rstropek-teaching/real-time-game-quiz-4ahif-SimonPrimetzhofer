"use strict";
const socket = io();
//let id:number=0;
//Game logic
function paintFields() {
    const idString = localStorage.getItem("id");
    const id = parseInt(idString);
    socket.emit("role", id);
    socket.on("playerRole", (playerID, role) => {
        console.log(role);
        if (playerID === id) {
            let fields = document.getElementsByClassName(role);
            for (let i = 0; i < fields.length; i++) {
                fields[i].className = "w3-light-grey";
            }
        }
    });
}
// Connection handling
function userHandling() {
    const username = prompt("Enter your username");
    if (username != null)
        socket.emit("usernameEntered", username);
}
socket.on("redirect", (url, playerID) => {
    localStorage.setItem("id", playerID.toString());
    alert("Press enter to get redirected to the gamefield...");
    window.open(url, "_self");
});
socket.on("denied", (message) => {
    alert(message);
    window.close();
    process.exit(1);
});
socket.on("bye", () => {
    alert("Thanks for playing, hope to see you again soon!");
    socket.close();
    process.exit(1);
});
