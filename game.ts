import {World} from "./world";

export class Game {

    world:World;

    constructor() {
        this.world = new World();
    }

    getInitialState() {
        return this.world.dumpEntities();
    }

    getState() {
        return this.world.dumpDynamicEntities()
    }

}
