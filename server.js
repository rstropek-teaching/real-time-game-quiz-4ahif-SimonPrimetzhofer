"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const sio = require("socket.io");
const player_js_1 = require("./player.js");
let players = [];
const app = express();
app.use(express.static(__dirname));
const server = http.createServer(app);
server.listen(3000);
sio(server).on('connection', socket => {
    //Connection Handling
    socket.on('usernameEntered', username => {
        if (players.length < 2) {
            //Add a new player
            players.push(new player_js_1.Player(username));
            //Setting the roles
            if (players.length === 1)
                players[0].setRole("Killer");
            else if (players.length === 2)
                players[1].setRole("Dodger");
            //Player get redirectmessage and their id
            socket.emit("redirect", "./gamefield.html", players.length - 1);
        }
        else
            socket.emit("denied", "There are already two players playing at the moment. Come back later!"); //There are already two players
    });
    socket.on("role", id => {
        const playerID = id;
        socket.emit("playerRole", playerID, players[id].getRole(), players[id].getUsername());
    });
});
