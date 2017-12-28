export class Player{
    private username:string;
    private score:number;
    private role:string;

    constructor(username: string) {

        this.username = username;
        this.score=0;
        this.role="";
    }

    setScore(score:number){
        this.score=score;
    }

    setRole(role:string){
        this.role=role;
    }

    getUsername() :string {
        return this.username;
    }
    getScore() :number {
        return this.score;
    }
    getRole() :string{
        return this.role;
    }
}