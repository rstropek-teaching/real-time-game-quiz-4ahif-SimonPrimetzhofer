import * as express from 'express';
import * as http from 'http';
import * as sio from 'socket.io'
import { Player } from './player.js';

let players: Player[] = [];
let posKiller:string="";
let posDodger:string="";

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
      //Setting the roles
      if(players.length===1)
        players[0].setRole("Killer");
      else if(players.length===2)
        players[1].setRole("Dodger");

      //Player get redirectmessage and their id
      socket.emit("redirect", "./gamefield.html", players.length - 1);
    } else socket.emit("denied", "There are already two players playing at the moment. Come back later!");//There are already two players
  });

  socket.on("role", id => {
    const playerID=<number>id;
    socket.emit("playerRole",playerID,players[playerID].getRole(),players[playerID].getUsername(),players[playerID].getScore());
  });

  socket.on("positionKiller",(position:string) => {
    posKiller=position;
    scoreEvaluation();
  });
  socket.on("positionDodger",(position:string) => {
    posDodger=position;
    scoreEvaluation();
  });

  function scoreEvaluation() {
    let indexKiller=-1;
    let indexDodger=-1;
    //Only if both position are set
    if(posKiller!==""&&posDodger!==""){
      //Getting the index of the killer and the dodger
      for(let i=0;i<players.length;i++){
        if(players[i].getRole()==="Dodger")
          indexDodger=i;
        if(players[i].getRole()==="Killer")
          indexKiller=i;
      }
      //Checking the position
      if(posKiller===posDodger){
        players[indexKiller].setScore(players[indexKiller].getScore()+2);
        posKiller="";
        posDodger="";
        if(players[indexKiller].getScore()===15)
          socket.emit("bye","scores.html");
        else if(players[indexKiller].getScore()>15)
          players[indexKiller].setScore(players[indexKiller].getScore()-5);
        socket.emit("winKiller");
        socket.emit("loseDodger");
      }else if(posKiller!==posDodger){
        players[indexDodger].setScore(players[indexDodger].getScore()+1);
        posKiller="";
        posDodger="";
        if(players[indexDodger].getScore()===15)
          socket.emit("bye","scores.html");
        players[indexDodger].setRole("Killer");
        players[indexKiller].setRole("Dodger");
        socket.emit("winDodger");
        socket.emit("loseKiller");
      }
    }
  }
});