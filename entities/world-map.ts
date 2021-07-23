import {GameEntity} from "../abstract/ecs/game-entity";
import {ExportEntity, World} from "../world";
import {noise} from "../abstract/geometry/perlin";
import * as fs from 'fs';

export enum TerrainType {
    WATER = 0,
    GRASS = 1,
    TERRAIN = 2,
    UNDERWOOD = 3
}

export const TerrainFriction = {
    [TerrainType.WATER]: .5,
    [TerrainType.GRASS]: 0.99,
    [TerrainType.TERRAIN]: 0.98,
    [TerrainType.UNDERWOOD]: 0.96
}

export type ExportMapEntity = ExportEntity & {
    grid:TerrainType[][],
    width:number,
    height: number;
    tileSize: number;
}

export class WorldMap extends GameEntity {

    tileSize = 40;
    width = 3000;
    height = 3000;

    grid:TerrainType[][];


    constructor(world:World) {
        super();
        this.grid = [];

        const mapContent:String = fs.readFileSync('./map.csv', 'utf-8');

        mapContent.split('\n').forEach((rowString:string) => {
            if (!rowString) {
                return;
            }
            const row = <TerrainType[]>rowString.split(',').map(parseFloat)
            this.grid.push(row);
        })
    }

    terrainAtCoords(x:number, y:number):TerrainType {
        const indexX = Math.floor(x / this.tileSize);
        const indexY = Math.floor(y / this.tileSize);
        if (!this.grid[indexY] || !this.grid[indexY][indexX]) {
            return TerrainType.GRASS;
        }
        return this.grid[indexY][indexX]
    }

    getFrictionAt(x:number, y:number):number {
        const terrain:TerrainType = <number>this.terrainAtCoords(x, y);
        return TerrainFriction[terrain];
    }

    export():ExportMapEntity {
        return {
            id: this.id,
            name: 'map',
            type: 'map',
            position: [0, 0],
            grid: this.grid,
            tileSize: this.tileSize,
            width: this.width,
            height: this.height
        }
    }


}