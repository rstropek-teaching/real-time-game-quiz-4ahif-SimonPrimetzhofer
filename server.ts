import * as express from 'express';
import * as http from 'http';
import * as sio from 'socket.io'
import { Player } from './player.js';

let players: Player[] = [];

const app = express();
app.use(express.static(__dirname));
const server = http.createServer(app);
server.listen(3000);

sio(server).on('connection', socket => {

  //Connection Handling
  socket.on('usernameEntered', username => {
    if (players.length < 2) {
      //Add a new player
      players.push(new Player(username));
      console.log(players[players.length-1].getUsername());
      //If two players are connected, the roles are set
      if (players.length == 2) {
        players[0].setRole("Killer");
        players[1].setRole("Dodger");
      }
      //Player get redirectmessage and their id
      socket.emit("redirect", "./gamefield.html", players.length - 1);
    } else socket.emit("denied", "There are already two players playing at the moment. Come back later!");//There are already two players
  });

  socket.on("role", id => {
    socket.emit("playerRole",players[id].getRole());
  });
});