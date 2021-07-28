import {World} from "./world";

export class Game {

    world:World;

    constructor() {
        this.world = new World();
    }

    getInitialState() {
        return { game: this.world.dumpEntities() };
    }

    getState() {
        return { game: this.world.dumpDynamicEntities() }
    }

    addMiner(x:number, y:number) {
        this.world.createRandomMiner(x, y);
    }

}
