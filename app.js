"use strict";
let players = [];
function readUsername() {
    //A player only can login if there aren't already 2 players
    if (players.length < 2) {
        const username = prompt("Enter your username");
        if (username != null) {
            players.push(username);
            alert("Hello " + username + "!");
            openWindow("./gamefield.html");
        }
        else
            openWindow("./index.html");
    }
    else {
        alert("Two players are already registered!");
    }
}
function openWindow(url) {
    window.open(url, "_self");
}
