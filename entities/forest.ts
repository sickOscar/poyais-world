import {Tree} from "./tree";
import {Vector} from "../abstract/geometry/vector";
import {World} from "../world";
import {PositionComponent} from "../components/position.component";
import {DimensionsComponent} from "../components/dimensions.component";
import {GameEntity} from "../abstract/ecs/game-entity";
import {WorldRefComponent} from "../components/world-ref.component";
import Timeout = NodeJS.Timeout;
import {GrowingForestComponent} from "../components/growing-forest.component";

export interface ForestOptions {
    distribution: 'SQUARE' | 'ROUND',
    center: Vector;
    radius: number;
    trees: number;
    minRadius: number;
    treeRadius: number;
}

export class Forest extends GameEntity {

    world: World;
    forest: Tree[] = [];

    trees: number;
    minRadius: number;
    treeRadius: number;
    distribution:string;

    plantTimeout:Timeout = setTimeout(() => {});

    constructor(world: World, options: ForestOptions) {
        super();
        this.world = world;

        this.addComponent(new PositionComponent(options.center.x, options.center.y))
            .addComponent(new DimensionsComponent({
                radius: options.radius
            }))
            .addComponent(new WorldRefComponent(world))
            .addComponent(new GrowingForestComponent())

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

        this.forest.forEach(tree => {
            if (tree) {
                this.world.em.entities.set(tree.id, tree);
            }
        })

    }

    round() {

        const center = <Vector>(<PositionComponent>this.getComponent('POSITION')).position;
        const radius = <number>(<DimensionsComponent>this.getComponent('DIMENSIONS')).radius

        for (let i = 0; i < this.trees; i++) {
            if (this.forest[i]) continue;

            const x = center.x + radius * Math.random() * Math.cos(Math.PI * 2 / this.trees * i);
            const y = center.y + radius * Math.random() * Math.sin(Math.PI * 2 / this.trees * i);
            // const r = this.minRadius + this.treeRadius * Math.random();

            this.forest[i] = new Tree(this.world, {
                position: new Vector(x, y)
            });
        }
    }

    square() {

        const center = <Vector>(<PositionComponent>this.getComponent('POSITION')).position;
        const radius = <number>(<DimensionsComponent>this.getComponent('DIMENSIONS')).radius

        for (let i = 0; i < this.trees; i++) {
            if (this.forest[i]) continue;

            const x = center.x / 2 + radius * 2 * Math.random();
            const y = center.y / 2 + radius * 2 * Math.random();
            // const r = this.minRadius + this.treeRadius * Math.random();

            this.forest[i] = new Tree(this.world, {
                position: new Vector(x, y)
            })

        }
    }

    plantTree() {
        const center = <Vector>(<PositionComponent>this.getComponent('POSITION')).position;
        const radius = <number>(<DimensionsComponent>this.getComponent('DIMENSIONS')).radius
        const x = center.x - radius / 2 + Math.random() * radius;
        const y = center.y - radius / 2 + Math.random() * radius;;
        const t = new Tree(this.world, {
            position: new Vector(x, y)
        })
        this.forest.push(t);
        this.world.em.entities.set(t.id, t);
    }

    removeTree(id:number) {
        for (let i = this.forest.length - 1; i >= 0; i--) {
            if (this.forest[i].id === id) {
                this.world.em.entities.delete(this.forest[i].id);
                this.forest.splice(i, 1);
                return;
            }
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