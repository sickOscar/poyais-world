import {GameEntity} from "../abstract/ecs/game-entity";
import {ExportEntity, World} from "../world";
import * as fs from 'fs';
import {Vector} from "../abstract/geometry/vector";

export class Wall {
    begin:Vector;
    end:Vector;
    // normal:Vector
    constructor(begin:Vector, end:Vector) {
        this.begin = begin;
        this.end = end;
    }
}

export enum TerrainType {
    DEEPWATER= 0,
    WATER= 1,
    SAND= 2,
    GRASS= 3,
    TERRAIN= 4,
    HILL= 5,
    ROCK= 6,
    LAVA= 7
}

export const TerrainFriction = {
    [TerrainType.DEEPWATER]: 0.90,
    [TerrainType.WATER]: 0.90,
    [TerrainType.SAND]: 0.99,
    [TerrainType.GRASS]: 0.99,
    [TerrainType.TERRAIN]: 0.98,
    [TerrainType.HILL]: 0.96,
    [TerrainType.ROCK]: 0.80,
    [TerrainType.LAVA]: 0.80,

}

export type ExportMapEntity = ExportEntity & {
    grid:TerrainType[][],
    width:number,
    height: number;
    tileSize: number;
    walls?: Wall[]
}

export class WorldMap extends GameEntity {

    tileSize = 40;
    width = 3000;
    height = 3000;

    grid:TerrainType[][];

    walls:Wall[] = [];


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

        this.walls = this.findWalls();
        this.optimizeWalls();
    }

    terrainAtCoords(x:number, y:number):TerrainType {
        const indexX = Math.floor(x / this.tileSize);
        const indexY = Math.floor(y / this.tileSize);
        if (this.grid[indexY] == undefined || this.grid[indexY][indexX] == undefined) {
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
            height: this.height,
            walls: this.walls
        }
    }

    findWalls() {

        const walls = [];

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {

                if (this.grid[i][j] !== TerrainType.WATER) continue

                const x0 = Math.max(0, j - 1);
                const x1 = Math.min(this.grid[i].length - 1, j + 1)

                const y0 = Math.max(0, i - 1);
                const y1 = Math.min(this.grid.length - 1, i + 1);

                for (let x = x0; x <= x1; x++) {
                    for (let y = y0; y <= y1; y++) {

                        if (x === j && y === i) continue; // center
                        if (x !== j && y !== i) continue; // angles
                        if (this.grid[y][x] === TerrainType.WATER) continue;


                        let begin = new Vector(0, 0);
                        let end = new Vector(0, 0);

                        // terrain on the left
                        if (x < j) {
                            begin = new Vector(this.tileSize * j, this.tileSize * i);
                            end = new Vector(this.tileSize * j, this.tileSize * (i+1))
                            walls.push(new Wall(begin, end));
                        }

                        // terrain on the right
                        if (x > j) {
                            end = new Vector(this.tileSize * x, this.tileSize * y)
                            begin = new Vector(this.tileSize * x, this.tileSize * (y+1))
                            walls.push(new Wall(begin, end));

                        }

                        // terrain on the top
                        if (y < i) {
                            end = new Vector(this.tileSize * x, this.tileSize * i)
                            begin = new Vector(this.tileSize * (x+1), this.tileSize * i)
                            walls.push(new Wall(begin, end));

                        }

                        // terrain on the bottom
                        if (y > i) {
                            begin = new Vector(this.tileSize * x, this.tileSize * y)
                            end = new Vector(this.tileSize * (x + 1), this.tileSize * y)
                            walls.push(new Wall(begin, end));
                        }
                    }
                }

            }
        }

        return walls;

    }

    optimizeWalls() {

        for (let i = this.walls.length - 1; i >= 0 ; i--) {

            // find next starting on this end
            let j = this.walls.length - 1;
            let nextWall;
            for (j; j >= 0; j--) {
                if (j !== i && this.walls[i].end.equals(this.walls[j].begin)) {
                    nextWall = this.walls[j];
                    break;
                }
            }

            if (!nextWall) continue

            const heading = this.walls[i].begin.subtract(this.walls[i].end).normalize().heading();
            const nextWallheading = nextWall.begin.clone().subtract(nextWall.end).normalize().heading();

            if(heading === nextWallheading) {
                const newWall = new Wall(
                    this.walls[i].begin.clone(),
                    this.walls[j].end.clone()
                );
                if (i > j) {
                    this.walls[j] = newWall;
                    this.walls.splice(i, 1);
                }
                if (i < j) {
                    this.walls[i] = newWall;
                    this.walls.splice(j, 1)
                }
            }
        }
    }



}