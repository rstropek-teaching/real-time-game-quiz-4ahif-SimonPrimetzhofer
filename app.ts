declare const io:SocketIOStatic;

const socket=io();

let playerRole:string="";

//Game logic

function commitPosition(){
    const fields=document.getElementsByClassName(playerRole);
    for(let i=0;i<fields.length;i++){
        if(fields[i].innerHTML.length>0)
            socket.emit("position"+playerRole,fields[i].id.charAt(fields[i].id.length-1));
    }
}

//Decision if won or lost
socket.on("win",(role:string)=>{
    if(playerRole===role){
        alert("You won this round! Congratulations!");
        removeFigure();
        paintFields();
    }
});
socket.on("lose",(role:string) => {
    if(playerRole===role){
        alert("You lost this round! Do better in the next round.");
        removeFigure();
        paintFields();
    }
});

//Painting the fields in the correct color
function paintFields(){
    //Create a number from a string with unary operator +
    const id=getIdFromStorage();

    //Get role of current player
    socket.emit("role",id);

    //Server responds with role
    socket.on("playerRole", (playerID:number,role:string,username:string,score:number) => {
        playerRole=role;
        if(playerID===id){
            //Print the name of the user
            const nameElement=document.getElementById("username");
            if(nameElement)
                nameElement.innerHTML=username;
            //Print the role of the user
            const roleElement=document.getElementById("role");
            if(roleElement)
                roleElement.innerHTML=role;
            //Print score of the user
            const scoreElement=document.getElementById("score");
            if(scoreElement)
                scoreElement.innerHTML=score.toString();
            let fields=document.getElementsByClassName(role);
            //Paint fields in light grey, where the player is able to set his figure
            for(let i=0;i<fields.length;i++)
                fields[i].className="w3-light-grey "+role;
            //Paint fields of other player dark-grey
            const otherRole=(role==="Dodger"?"Killer":"Dodger");
            let otherFields=document.getElementsByClassName(otherRole);
            //Paint other fields in dark grey, where the player is not able to set his figure
            for(let i=0;i<otherFields.length;i++)
                otherFields[i].className="w3-dark-grey "+otherRole;
        }
    });
}

//Placing the figure
function placeFigure(fieldID:string){
    //If a player clicks another field, the figure gets removed from the old field
    removeFigure();
    //Place the figure inside of the clicked field
    let clickedField=document.getElementById(fieldID);
    if(clickedField&&clickedField.classList.contains("w3-light-grey")){
        clickedField.innerHTML=`<img src='${playerRole}.png' alt='${playerRole}' width='100%' height='100%'/>`;
    }else alert("You are not allowed to place your figure here! Watch out for a field colored in light grey");
}

function removeFigure(){
    const fields=document.getElementsByClassName(playerRole);
    for(let i=0;i<fields.length;i++){
        fields[i].innerHTML="";
    }
}

function getIdFromStorage() :number {
    const idString=<string>localStorage.getItem("id");
    //Create a number from a string with unary operator +
    const id=+idString;

    return id;
}

// Connection handling
function userHandling(){
    const username=prompt("Enter your username");
    if(username!=null)
        socket.emit("usernameEntered",username);
}

socket.on("redirect", (url:string,playerID:number) =>{
    localStorage.setItem("id",playerID.toString());
    alert("Press enter to get redirected to the gamefield...");
    window.open(url,"_self");
    
});

socket.on("denied", (message:string) =>{
    alert(message);
    window.close();
    process.exit(1);
});

socket.on("bye",(redirectUrl:string) => {
    socket.emit("removePlayer",getIdFromStorage());
    alert("Thanks for playing, hope to see you again soon! You will now see the scores of all games played so far.");
    window.open(redirectUrl,"_self");
});

function showScores(){
    socket.emit("scores");
}

socket.on("allScores",(data:any) => {
    let scoresTable = document.getElementById("scoresTable");
    if(scoresTable){
        let scoreBody=scoresTable.getElementsByTagName("tbody")[0];
        for(const dataElement of data){
            let row=scoreBody.insertRow(scoreBody.rows.length);
            let element = row.insertCell(0);
            const date = document.createTextNode(`${dataElement.date}`);
            element.appendChild(date);
            element = row.insertCell(1);
            const player1 = document.createTextNode(`${dataElement.player1}`);
            element.appendChild(player1);
            element = row.insertCell(2);
            const player2 = document.createTextNode(`${dataElement.player2}`);
            element.appendChild(player2);
            element=row.insertCell(3);
            const difference=document.createTextNode(`${dataElement.score}`);
            element.appendChild(difference);
        }
    }

});