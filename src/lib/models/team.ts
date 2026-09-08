import { Player } from "./player";

export class Team {
    constructor(
        private _user: string,
        private _players: Player[]
    ){}

    // GETTERS
    get user() {
        return this._user;
    }

    get players() {
        return this._players;
    }

    // SETTERS

    set user(user: string){
        this._user = user;
    }

    set players(players: Player[]){
        this._players = players;
    }

    createLineup(players: Player[]){
        
    }
}