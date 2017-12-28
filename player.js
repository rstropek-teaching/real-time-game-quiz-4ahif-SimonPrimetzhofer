"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(username) {
        this.username = username;
        this.score = 0;
        this.role = "";
    }
    setScore(score) {
        this.score = score;
    }
    setRole(role) {
        this.role = role;
    }
    getUsername() {
        return this.username;
    }
    getScore() {
        return this.score;
    }
    getRole() {
        return this.role;
    }
}
exports.Player = Player;
