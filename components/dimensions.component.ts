import {Component} from "../abstract/ecs/component";

export interface EntityDimensions {
    width?: number;
    height?: number;
    radius?: number;
}

export class DimensionsComponent implements Component {

    name = "DIMENSIONS";

    width:number|undefined;
    height:number|undefined;
    radius:number|undefined;

    constructor(dim:EntityDimensions) {
        this.width = dim.width;
        this.height = dim.height;
        this.radius = dim.radius;
    }

}