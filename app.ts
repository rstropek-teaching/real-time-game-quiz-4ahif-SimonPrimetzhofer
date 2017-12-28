declare const io:SocketIOStatic;

const socket=io();

//let id:number=0;

//Game logic

function paintFields(){
    const idString=<string>localStorage.getItem("id");
    //Create a number from a string with unary operator +
    const id=+idString;
    
    //Get role of current player
    socket.emit("role",id);
    //Server responds with role
    socket.on("playerRole", (playerID:number,role:string,username:string) => {
        if(playerID===id){
            const nameElement=document.getElementById("username");
            if(nameElement)
                nameElement.innerHTML=username;
            const roleElement=document.getElementById("role");
            if(roleElement)
                roleElement.innerHTML=role;
            let fields=document.getElementsByClassName(role);
            for(let i=0;i<fields.length;i++){
                fields[i].className="w3-light-grey";
            }
        }
    });
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

socket.on("bye",() => {
    alert("Thanks for playing, hope to see you again soon!");
    socket.close();
    process.exit(1);
});