import {Component} from "../abstract/ecs/component";

export class BuildableComponent implements Component {
    name = 'BUILDABLE';

    progress = 0;

    constructor() {
        this.progress = 0;
    }

}