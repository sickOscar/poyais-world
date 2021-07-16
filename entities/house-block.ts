import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent} from "../components/position.component";
import {DimensionsComponent} from "../components/dimensions.component";
import {Vector} from "../abstract/geometry/vector";
import {ExportEntity, World} from "../world";
import {House} from "./house";
import {HasHouseComponent} from "../components/has-house.component";
import {HouseBlockComponent} from "../components/house-block.component";
import {BuildableComponent} from "../components/buildable.component";
import {doOverlap} from "../abstract/geometry/collisions";

export interface HouseBlockOptions {
    position:Vector,
    height: number,
    width: number
}

export class HouseBlock extends GameEntity {

    world:World;

    houses:House[];
    width:number;
    height:number;
    position:Vector;

    constructor(world:World, options:HouseBlockOptions) {
        super();

        this.world = world;
        this.width = options.width;
        this.height = options.height;
        this.position = options.position;

        this.addComponent(new PositionComponent(this.position.x, this.position.y))
            .addComponent(new DimensionsComponent({
                width: options.width,
                height: options.height
            }))
            .addComponent(new HouseBlockComponent());

        this.houses = [];
    }

    buildHouse(position:Vector, width:number, height:number):House {
        const house = new House(this.world, {
            position: position,
            width,
            height
        })
        this.houses.push(house);
        this.world.em.entities.set(house.id, house);
        house.addComponent(new BuildableComponent());
        return house;
    }

    findSuitablePlace(width:number, height:number):Vector | null {

        if (this.houses.length === 0) {
            return new Vector(
                this.position.x - this.width / 2 + Math.round(Math.random() * this.width),
                this.position.y - this.height / 2 + Math.round(Math.random() * this.height)
            )
        }

        const incrementX = 10 + Math.round(Math.random()*10);
        const incrementY = 10 + Math.round(Math.random()*10);
        const lifeSpace = 5;

        for (let j = this.position.y - this.height / 2 + incrementX; j < this.position.y + this.height / 2 - incrementX; j += incrementX) {
            for (let i = this.position.x - this.width / 2 + incrementY; i < this.position.x + this.width / 2 - incrementY; i += incrementY) {

                const place = new Vector(i, j)
                let colliding = false;

                for (let w = 0; w < this.houses.length; w++) {
                    const house = this.houses[w];
                    const housePos = <PositionComponent>house.getComponent('POSITION');
                    const houseDim = <DimensionsComponent>house.getComponent('DIMENSIONS');

                    if (houseDim && housePos && houseDim.width && houseDim.height) {
                        const hp = housePos.position;
                        const hw = houseDim.width + lifeSpace;
                        const hh = houseDim.height + lifeSpace;

                        const l1 = new Vector(hp.x - hw / 2, hp.y - hh / 2);
                        const r1 = new Vector(hp.x + hw / 2, hp.y + hh / 2);
                        const l2 = new Vector(place.x - width / 2, place.y - height / 2);
                        const r2 = new Vector(place.x + width / 2, place.y + height / 2);

                        if (doOverlap(l1, r1, l2, r2)) {
                            colliding = true;
                        }

                    }

                }

                if (!colliding) {
                    return place;
                }

            }

        }

        return null;
    }

    export():ExportEntity {

        const positionComponent = <PositionComponent>this.getComponent('POSITION');

        return {
            id: this.id,
            name: "",
            type: 'house-block',
            position: [positionComponent.position.x, positionComponent.position.y],
            dimensions: {
                width: this.width,
                height: this.height
            }
        }
    }
}