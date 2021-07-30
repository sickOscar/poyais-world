import {GameEntity} from "../abstract/ecs/game-entity";
import {PositionComponent, PositionComponentName} from "../components/position.component";
import {DimensionsComponent} from "../components/dimensions.component";
import {Vector} from "../abstract/geometry/vector";
import {ExportEntity, World} from "../world";
import {House} from "./house";
import {HouseBlockComponent} from "../components/house-block.component";
import {BuildableComponent} from "../components/buildable.component";
import {doOverlap} from "../abstract/geometry/collisions";
import {Farm} from "./farm";
import {FarmBlockComponent} from "../components/farm-block.component";

export interface FarmBlockOptions {
    position:Vector,
    height: number,
    width: number
}

export class FarmBlock extends GameEntity {

    world:World;

    farms:Farm[];
    width:number;
    height:number;
    position:Vector;

    constructor(world:World, options:FarmBlockOptions) {
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
            .addComponent(new FarmBlockComponent());

        this.farms = [];
    }

    buildFarm(position:Vector, width:number, height:number):Farm {
        const farm = new Farm(this.world, {
            position: position,
            width,
            height
        })
        this.farms.push(farm);
        this.world.em.entities.set(farm.id, farm);

        const angleClamp = Vector.randomClamped();
        const houseDimensions = new Vector(
            10 + Math.round(Math.random() * 20),
            10 + Math.round(Math.random() * 20)
        );
        const housePosition = new Vector(
            position.x + angleClamp.x * (houseDimensions.x / 2),
            position.y + angleClamp.y * (houseDimensions.y / 2)
        )

        const house = new House(this.world, {
            position: housePosition,
            width: houseDimensions.x,
            height: houseDimensions.y
        })
        house.addComponent(new BuildableComponent());
        this.world.em.entities.set(house.id, house);

        farm.house = house;
        return farm;
    }

    findSuitablePlace(width:number, height:number):Vector | null {

        if (this.farms.length === 0) {
            return new Vector(
                Math.round(this.position.x - this.width / 2 + Math.round(Math.random() * this.width)),
                Math.round(this.position.y - this.height / 2 + Math.round(Math.random() * this.height))
            )
        }

        const incrementX = 10 + Math.round(Math.random()*10);
        const incrementY = 10 + Math.round(Math.random()*10);
        const lifeSpace = 5;

        for (let j = this.position.y - this.height / 2 + incrementX; j < this.position.y + this.height / 2 - incrementX; j += incrementX) {
            for (let i = this.position.x - this.width / 2 + incrementY; i < this.position.x + this.width / 2 - incrementY; i += incrementY) {

                const place = new Vector(i, j)
                let colliding = false;

                for (let w = 0; w < this.farms.length; w++) {
                    const farm = this.farms[w];
                    const farmPos = <PositionComponent>farm.getComponent(PositionComponentName);
                    const farmDim = <DimensionsComponent>farm.getComponent('DIMENSIONS');

                    if (farmDim && farmPos && farmDim.width && farmDim.height) {
                        const hp = farmPos.position;
                        const hw = farmDim.width + lifeSpace;
                        const hh = farmDim.height + lifeSpace;

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

        const positionComponent = <PositionComponent>this.getComponent(PositionComponentName);

        return {
            id: this.id,
            name: "",
            type: 'farm-block',
            position: [positionComponent.position.x, positionComponent.position.y],
            dimensions: {
                width: this.width,
                height: this.height
            }
        }
    }
}