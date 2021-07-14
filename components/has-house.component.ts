import {Component} from "../abstract/ecs/component";
import {House} from "../entities/house";

export class HasHouseComponent implements Component {

    name = "HAS-HOUSE";

    house:House;

    constructor(h:House) {
        this.house = h;
    }

}