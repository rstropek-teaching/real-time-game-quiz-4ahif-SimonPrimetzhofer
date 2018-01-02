import * as express from 'express';
import * as http from 'http';
import * as sio from 'socket.io'
import { Player } from './player.js';
import * as Datastore from "nedb";

//Constants
const MAX_POINTS=2;
const DODGER="Dodger";
const KILLER="Killer";
const MAX_PLAYER=2;

//Create or load database
const db=new Datastore({filename:__dirname+"/db.dat",autoload:true});

//Array of players
let players: Player[] = [];

//Positions of players
let posKiller:string="";
let posDodger:string="";

const app = express();
app.use(express.static(__dirname));
const server = http.createServer(app);
server.listen(3000);

const serverSocket=sio(server);

serverSocket.on('connection', socket => {

  //Connection Handling
  socket.on('usernameEntered', username => {
    if (players.length < MAX_PLAYER) {
      //Add a new player
      players.push(new Player(username));
      //Setting the roles
      //First player to log in is always Killer at start, second one is Dodger
      if(players.length===1)
        players[0].setRole(KILLER);
      else if(players.length===MAX_PLAYER)
        players[1].setRole(DODGER);

      //Player get redirectmessage and their id
      socket.emit("redirect", "./gamefield.html", players.length - 1);
    } else socket.emit("denied", "There are already two players playing at the moment. Come back later!");//There are already two players
  });

  //Role of a player requested
  socket.on("role", id => {
    const playerID=<number>id;
    socket.emit("playerRole",playerID,players[playerID].getRole(),players[playerID].getUsername(),players[playerID].getScore());
  });

  //Killer sets position
  socket.on("positionKiller",(position:string) => {
    posKiller=position;
    scoreEvaluation();
  });
  //Dodger sets position
  socket.on("positionDodger",(position:string) => {
    posDodger=position;
    scoreEvaluation();
  });

  //Evaluate score
  function scoreEvaluation() {
    //Indizes with dummy values
    let indexKiller=-1;
    let indexDodger=-1;
    //Only if both position are set
    if(posKiller!==""&&posDodger!==""){
      //Getting the index of the killer and the dodger
      for(let i=0;i<players.length;i++){
        if(players[i].getRole()===DODGER)
          indexDodger=i;
        if(players[i].getRole()===KILLER)
          indexKiller=i;
      }
      //Killer hits Dodger
      if(posKiller===posDodger){

        //Killer gets two points
        changeScore(indexKiller,2);

        //Reset the positions to ""
        resetPositions();
        
        //If Killer reached the max-points
        if(players[indexKiller].getScore()===MAX_POINTS){
          serverSocket.emit("win",KILLER);
          serverSocket.emit("lose",DODGER);
          //End the game
          serverSocket.emit("bye","./scores.html");
        }

        //If Killer reached more than max-points, he gets -5 points
        else if(players[indexKiller].getScore()>MAX_POINTS)
          changeScore(indexKiller,-5);

        //If the Killer won the current round and no specific event occurs, he gets a message and the loser (dodger) too  
        else {
          serverSocket.emit("win",KILLER);
          serverSocket.emit("lose",DODGER);
        }  
      //Killer missed Dodger
      }else if(posKiller!==posDodger){
        changeScore(indexDodger,1);
        resetPositions();
        if(players[indexDodger].getScore()===MAX_POINTS){
          serverSocket.emit("win",DODGER);
          serverSocket.emit("lose",KILLER)
          serverSocket.emit("bye","./scores.html");
        }else{
          players[indexDodger].setRole(KILLER);
          players[indexKiller].setRole(DODGER);
          serverSocket.emit("win",DODGER);
          serverSocket.emit("lose",KILLER);
        }
      }
    }
  }
  //Add or subtract points
  function changeScore(playerIndex:number,score:number){
    if(players[playerIndex])
      players[playerIndex].setScore(players[playerIndex].getScore()+score);
  }
  //Set positions to ""
  function resetPositions(){
    posKiller="";
    posDodger="";
  }
  //Remove a player
  socket.on("removePlayer",(id:number) => {
    delete players[id];
  });
});