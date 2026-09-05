export type Position = "GK" | "DF" | "MF" | "ST";

export class Player {

    constructor(
        private _name: string,
        private _position: Position,
        private _team: string,
        private _jerseyNumber: number,
        private _price: number
    ){}

    // GETTERS

    get name() {
        return this._name;
    }

    get position() {
        return this._position;
    }

    get team() {
        return this._team;
    }

    get jerseyNumber() {
        return this._jerseyNumber;
    }

    get price() {
        return this._price;
    }

    // SETTERS

    set name(name: string) {
        this._name = name;
    }

    set position(position: Position) {
        this._position = position;
    }

    set team(team: string) {
        this._team = team;
    }

    set jerseyNumber(jerseyNumber: number) {
        this._jerseyNumber = jerseyNumber;
    }

    set price(price: number) {
        this._price = price;
    }

}
