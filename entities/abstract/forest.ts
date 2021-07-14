import {Tree} from "../tree";
import {Vector} from "../../abstract/geometry/vector";
import {World} from "../../world";
import {PositionComponent} from "../../components/position.component";
import {DimensionsComponent} from "../../components/dimensions.component";

export interface ForestOptions {
    distribution: 'SQUARE' | 'ROUND',
    center: Vector;
    radius: number;
    trees: number;
    minRadius: number;
    treeRadius: number;
}

export class Forest {

    world: World;
    forest: Tree[] = [];
    center: Vector;
    radius: number;
    trees: number;
    minRadius: number;
    treeRadius: number;
    distribution:string;

    constructor(world: World, options: ForestOptions) {
        this.world = world;
        this.center = options.center;
        this.radius = options.radius ;
        this.trees = options.trees || 1;
        this.minRadius = options.minRadius || 1;
        this.treeRadius = options.treeRadius || 5;
        this.distribution = options.distribution || 'ROUND';

        switch(this.distribution) {
            case 'SQUARE':
                this.square();
                break;
            case 'ROUND':
                this.round()
                break;
            default:
                this.round();
        }

        this.checkCollisions();

    }

    round() {
        for (let i = 0; i < this.trees; i++) {
            if (this.forest[i]) continue;

            const x = this.center.x + this.radius * Math.random() * Math.cos(Math.PI * 2 / this.trees * i);
            const y = this.center.y + this.radius * Math.random() * Math.sin(Math.PI * 2 / this.trees * i);
            // const r = this.minRadius + this.treeRadius * Math.random();

            this.forest[i] = new Tree(this.world, {
                position: new Vector(x, y)
            });
        }
    }

    square() {
        for (let i = 0; i < this.trees; i++) {
            if (this.forest[i]) continue;

            const x = this.center.x / 2 + this.radius * 2 * Math.random();
            const y = this.center.y / 2 + this.radius * 2 * Math.random();
            // const r = this.minRadius + this.treeRadius * Math.random();

            this.forest[i] = new Tree(this.world, {
                position: new Vector(x, y)
            })

        }
    }

    checkCollisions() {
        const trees = this.forest.length;
        for (let i = trees - 1; i >= 0; i--) {

            for (let j = trees - 1 ; j >= 0; j--) {
                if (i === j) {
                    continue;
                }

                if (!this.forest[i] || !this.forest[j]) {
                    return;
                }

                const positionI = (<PositionComponent>this.forest[i].getComponent('POSITION')).position;
                const dimensionsI = <DimensionsComponent>this.forest[i].getComponent('DIMENSIONS');
                const positionJ = (<PositionComponent>this.forest[j].getComponent('POSITION')).position;
                const dimensionsJ = <DimensionsComponent>this.forest[j].getComponent('DIMENSIONS');

                if (!positionJ || !positionI || !dimensionsI || !dimensionsJ) {
                    return
                }

                const distance = Math.sqrt(
                    Math.pow(positionJ.x - positionI.x, 2) + Math.pow(positionJ.y - positionI.y, 2)
                )

                let sumOfRadi = Infinity;
                if (dimensionsI.radius && dimensionsJ.radius) {
                    sumOfRadi = dimensionsI.radius + dimensionsJ.radius;
                }

                const distanceFactor = 1;

                if (distance < (sumOfRadi * distanceFactor)) {
                    // this.forest[j] = null;
                    this.forest.splice(j, 1);
                    console.log('colliding')
                }

            }
        }
    }

}