"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const sio = require("socket.io");
const player_js_1 = require("./player.js");
const Datastore = require("nedb");
//Constants
const MAX_POINTS = 15;
const DODGER = "Dodger";
const KILLER = "Killer";
const MAX_PLAYER = 2;
//Create or load database
const db = new Datastore({ filename: __dirname + "/db.dat", autoload: true });
//Array of players
let players = [];
//Positions of players
let posKiller = "";
let posDodger = "";
const app = express();
app.use(express.static(__dirname));
const server = http.createServer(app);
server.listen(3000);
const serverSocket = sio(server);
serverSocket.on('connection', socket => {
    //Connection Handling
    socket.on('usernameEntered', username => {
        if (players.length < MAX_PLAYER) {
            //Add a new player
            players.push(new player_js_1.Player(username));
            //Setting the roles
            //First player to log in is always Killer at start, second one is Dodger
            if (players.length === 1)
                players[0].setRole(KILLER);
            else if (players.length === MAX_PLAYER)
                players[1].setRole(DODGER);
            //Player get redirectmessage and their id
            socket.emit("redirect", "./gamefield.html", players.length - 1);
        }
        else
            socket.emit("denied", "There are already two players playing at the moment. Come back later!"); //There are already two players
    });
    //Role of a player requested
    socket.on("role", id => {
        const playerID = id;
        socket.emit("playerRole", playerID, players[playerID].getRole(), players[playerID].getUsername(), players[playerID].getScore());
    });
    //Killer sets position
    socket.on("positionKiller", (position) => {
        posKiller = position;
        scoreEvaluation();
    });
    //Dodger sets position
    socket.on("positionDodger", (position) => {
        posDodger = position;
        scoreEvaluation();
    });
    //Evaluate score
    function scoreEvaluation() {
        //Indizes with dummy values
        let indexKiller = -1;
        let indexDodger = -1;
        //Only if both position are set
        if (posKiller !== "" && posDodger !== "") {
            //Getting the index of the killer and the dodger
            for (let i = 0; i < players.length; i++) {
                if (players[i].getRole() === DODGER)
                    indexDodger = i;
                if (players[i].getRole() === KILLER)
                    indexKiller = i;
            }
            //Killer hits Dodger
            if (posKiller === posDodger) {
                //Killer gets two points
                changeScore(indexKiller, 2);
                //Reset the positions to ""
                resetPositions();
                //If Killer reached the max-points
                if (players[indexKiller].getScore() === MAX_POINTS) {
                    serverSocket.emit("win", KILLER);
                    serverSocket.emit("lose", DODGER);
                    //End the game
                    insertNewScore();
                    serverSocket.emit("bye", "./scores.html");
                }
                else if (players[indexKiller].getScore() > MAX_POINTS)
                    changeScore(indexKiller, -5);
                else {
                    serverSocket.emit("win", KILLER);
                    serverSocket.emit("lose", DODGER);
                }
                //Killer missed Dodger
            }
            else if (posKiller !== posDodger) {
                changeScore(indexDodger, 1);
                resetPositions();
                if (players[indexDodger].getScore() === MAX_POINTS) {
                    serverSocket.emit("win", DODGER);
                    serverSocket.emit("lose", KILLER);
                    insertNewScore();
                    serverSocket.emit("bye", "./scores.html");
                }
                else {
                    players[indexDodger].setRole(KILLER);
                    players[indexKiller].setRole(DODGER);
                    serverSocket.emit("win", DODGER);
                    serverSocket.emit("lose", KILLER);
                }
            }
        }
    }
    //Add or subtract points
    function changeScore(playerIndex, score) {
        if (players[playerIndex])
            players[playerIndex].setScore(players[playerIndex].getScore() + score);
    }
    //Set positions to ""
    function resetPositions() {
        posKiller = "";
        posDodger = "";
    }
    //Remove a player
    socket.on("removePlayer", (id) => {
        delete players[id];
    });
    //Database operations
    function insertNewScore() {
        let today = new Date();
        db.insert({ date: today.toLocaleDateString(), player1: players[0].getUsername(), player2: players[1].getUsername(), score: Math.abs(players[0].getScore() - players[1].getScore()) });
    }
    socket.on("scores", () => {
        socket.emit("allScores", db.getAllData());
    });
});
