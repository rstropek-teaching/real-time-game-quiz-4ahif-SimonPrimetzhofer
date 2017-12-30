"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const sio = require("socket.io");
const player_js_1 = require("./player.js");
let players = [];
let posKiller = "";
let posDodger = "";
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
        socket.emit("playerRole", playerID, players[playerID].getRole(), players[playerID].getUsername(), players[playerID].getScore());
    });
    socket.on("positionKiller", (position) => {
        posKiller = position;
        scoreEvaluation();
    });
    socket.on("positionDodger", (position) => {
        posDodger = position;
        scoreEvaluation();
    });
    function scoreEvaluation() {
        let indexKiller = -1;
        let indexDodger = -1;
        //Only if both position are set
        if (posKiller !== "" && posDodger !== "") {
            //Getting the index of the killer and the dodger
            for (let i = 0; i < players.length; i++) {
                if (players[i].getRole() === "Dodger")
                    indexDodger = i;
                if (players[i].getRole() === "Killer")
                    indexKiller = i;
            }
            //Checking the position
            if (posKiller === posDodger) {
                players[indexKiller].setScore(players[indexKiller].getScore() + 2);
                posKiller = "";
                posDodger = "";
                if (players[indexKiller].getScore() === 15)
                    socket.emit("bye");
                else if (players[indexKiller].getScore() > 15)
                    players[indexKiller].setScore(players[indexKiller].getScore() - 5);
                socket.emit("winKiller");
                socket.emit("loseDodger");
            }
            else if (posKiller !== posDodger) {
                players[indexDodger].setScore(players[indexDodger].getScore() + 1);
                posKiller = "";
                posDodger = "";
                if (players[indexDodger].getScore() === 15)
                    socket.emit("bye");
                players[indexDodger].setRole("Killer");
                players[indexKiller].setRole("Dodger");
                socket.emit("winDodger");
                socket.emit("loseKiller");
            }
        }
    }
});
