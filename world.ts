import {EntityManager} from "./abstract/ecs/entity-manager";
import {StateMachineSystem} from "./systems/state-machine.system";
import {System} from "./abstract/ecs/system";
import {performance} from "perf_hooks";
import {Miner, MinerOptions} from "./entities/miner";
import {MovementSystem} from "./systems/movement.system";
import {Tavern} from "./entities/tavern";
import {GameEntity} from "./abstract/ecs/game-entity";
import {Vector} from "./abstract/geometry/vector";
import {PositionComponent, PositionComponentName} from "./components/position.component";
import {Bank} from "./entities/bank";
import {Mine} from "./entities/mine";
import {MinesSystem} from "./systems/mines.system";
import {BuildingStatsComponent, BuildingTypes} from "./components/building-stats.component";
import {EntityDimensions} from "./components/dimensions.component";
import {TreesSystem} from "./systems/trees.system";
import {Forest} from "./entities/forest";
import {HouseBlock} from "./entities/house-block";
import {FarmBlock} from "./entities/farm-block";
import {Farm} from "./entities/farm";
import {House} from "./entities/house";
import {FarmerComponent} from "./components/farmer.component";
import {BuildableComponent} from "./components/buildable.component";
import {Gender} from "./components/human-stats.component";
import {OwnershipSystem} from "./systems/ownership.system";
import {TerrainType, WorldMap} from "./entities/world-map";
import {Warehouse} from "./entities/warehouse";
import {Jobs} from "./components/job.component";
import * as fs from "fs";


export interface ExportEntity {
    id: number;
    name?: string;
    type: string;
    state?: string,
    position: [number, number],
    dimensions?: EntityDimensions
}

export type ExportBag = {
    gold: number,
    wood: number,
    malt: number
}

export type ExportHumanEntity = ExportEntity &  {
    heading: [number, number],
    wandering?: {
        distance: number,
        radius: number,
        target: [number, number]
    },
    weight?: number,
    gender: Gender
    bag?: ExportBag,
    job?: Jobs
}

export type ExportBuildingEntity = ExportEntity & {
    progress?: number,
    availability?: number
}

export interface TimeFrame {
    time: number,
    deltaTime: number
}

export class World {

    em = EntityManager;
    systems = new Map<string, System>()

    lastTime: number = 0;

    frame: TimeFrame = {
        time: 0,
        deltaTime: 0
    }

    map:WorldMap = new WorldMap(this);

    constructor() {

        this.addMap();

        this.addBuildingsAndAreas()

        this.addMiners();
        // this.createRandomMiner();
        // this.createFarmDemo();


        const stateMachineSystem = new StateMachineSystem(this);
        this.systems.set('STATE-MACHINE-SYSTEM', stateMachineSystem);

        const movementSystem = new MovementSystem(this);
        this.systems.set('MOVEMENT-SYSTEM', movementSystem);

        const minesSystem = new MinesSystem(this);
        this.systems.set('MINES-SYSTEM', minesSystem);

        const treesSystem = new TreesSystem(this);
        this.systems.set('TREES-SYSTEM', treesSystem);

        const ownershipSystem = new OwnershipSystem(this);
        this.systems.set('OWNERSHIP-SYSTEM', ownershipSystem);

        this.update(0);
    }

    removeEntity(id:number) {
        this.em.entities.delete(id);
    }

    addBuildingsAndAreas() {
        const elString:string = fs.readFileSync('./map_elements.json', 'utf-8')
        const mapElements = JSON.parse(elString);

        const mult = this.map.tileSize / 20;

        mapElements.areas.forEach((area:any) => {

            if (area.type === 'houses') {
                const houseBlock = new HouseBlock(this, {
                    position: new Vector(area.center[0]  * mult, area.center[1] * mult),
                    width: area.width * mult,
                    height: area.height * mult
                })
                this.em.entities.set(houseBlock.id, houseBlock);
            }

            if (area.type === 'farms') {
                const farmBlock = new FarmBlock(this, {
                    position: new Vector(area.center[0]  * mult, area.center[1] *mult),
                    width: area.width * mult,
                    height: area.height * mult
                })
                this.em.entities.set(farmBlock.id, farmBlock);
            }

        })

        mapElements.buildings.forEach((building:any) => {

            if (building.type === 'bank') {
                const bank = new Bank(this, {
                    position: new Vector(building.center[0]  * mult, building.center[1]  * mult),
                    name: "That old bank"
                })
                this.em.entities.set(bank.id, bank);
            }

            if (building.type === 'warehouse') {
                const warehouse = new Warehouse(this, {
                    position: new Vector(building.center[0]  * mult, building.center[1]  * mult)
                })
                this.em.entities.set(warehouse.id, warehouse);
            }

            if (building.type === 'tavern') {
                const tavern = new Tavern(this, {
                    position: new Vector(building.center[0] * mult, building.center[1]  * mult),
                    name: "A tavernella"
                });
                this.em.entities.set(tavern.id, tavern);
            }

            if (building.type === 'forest') {
                const f = new Forest(this, {
                    distribution: Math.random() > .5 ? 'ROUND' : 'SQUARE',
                    center: new Vector(building.center[0] * mult, building.center[1]  * mult),
                    radius: 50 + Math.round(Math.random() * 30),
                    trees: 10 + Math.round(Math.random() * 10),
                    minRadius: 5,
                    treeRadius: 10
                });
                this.em.entities.set(f.id, f);
            }

            if (building.type === 'mine') {
                const mine = new Mine(this, {
                    position: new Vector(building.center[0] * mult, building.center[1]  * mult)
                })
                this.em.entities.set(mine.id, mine);
            }
        })

    }

    createRandomMiner(x?:number, y?:number) {
        const options:Partial<MinerOptions> = {
            position: new Vector(
                x || 700 + Math.round(Math.random() * 700),
                y || 700 + Math.round(Math.random() * 500)
            )
        }

        if (Math.random() < 0.3) {
            options.job = Jobs.FARMER
        }

        const miner = new Miner(this, options);
        this.em.entities.set(miner.id, miner);

        Bank.addAccount(miner.id, Math.random() * 50);
    }

    addMap() {
        // const map:WorldMap = new WorldMap(this);
        this.em.entities.set(this.map.id, this.map);
    }

    addMiners() {
        for (let i = 0; i < 5; i++) {
            this.createRandomMiner()
        }

        setInterval(() => {
            this.createRandomMiner();
        }, 5000)
    }


    createFarmDemo() {

        const house = new House(this, {
            position: new Vector(400, 400),
            width: 30,
            height: 30
        })
        house.addComponent(new BuildableComponent());
        const buildable = <BuildableComponent>house.getComponent('BUILDABLE');
        buildable.progress = 100;
        this.em.entities.set(house.id, house);

        const options:Partial<MinerOptions> = {
            position: new Vector(
                Math.round(Math.random() * 700),
                Math.round(Math.random() * 500)
            ),
            house: house
        }
        options.job = Jobs.FARMER

        const miner = new Miner(this, options);
        this.em.entities.set(miner.id, miner);

        const farm = new Farm(this, {
            position: new Vector(400, 400),
            width: 100,
            height: 100
        })
        this.em.entities.set(farm.id, farm);
        farm.house = house;

        const farmer = <FarmerComponent>miner.getComponent('FARMER')
        farmer.farm = farm;

        Bank.addAccount(miner.id, Math.random() * 50);
    }

    dumpDynamicEntities(): ExportEntity[] {
        return (<[string, GameEntity][]>Array.from(this.em.entities))
            .filter(([key, entity]: [string, GameEntity]) => {
                return entity.hasComponent('MOVEMENT');
            })
            .map(([key, entity]) => {
                return entity.export()
            })
    }

    dumpEntities() {
        return (<[string, GameEntity][]>Array.from(this.em.entities))
            .map(([key, entity]) => {
                return entity.export()
            })
    }

    update(time: number) {
        const delta = time - this.lastTime;
        this.lastTime = time;
        this.frame = {
            time,
            deltaTime: delta / 1000
        };
        Array.from(this.systems).forEach((tuple) => {
            tuple[1].update(delta / 1000, time);
        })
        setTimeout(() => {
            this.update(performance.now());
        }, 1000 / 30)
    }

    validatePositionAgainstMap(position: Vector): boolean {
        // const terrain = this.map.terrainAtCoords(position.x, position.y);
        return true;

        //return position.x > 0 && position.x < this.map.width && position.y > 0 && position.y < this.map.height;
    }

    locateBuildingAtPosition(position: Vector, type: BuildingTypes): GameEntity | undefined {
        const r = (<[string, GameEntity][]>Array.from(this.em.entities))
            .find((entry) => {
                const entity = entry[1];
                const pos = <PositionComponent>entity.getComponent(PositionComponentName);
                if (!pos) {
                    return false
                }
                const buildingStats = <BuildingStatsComponent>entity.getComponent('BUILDING-STATS');
                if (pos.position.equals(position) && buildingStats && buildingStats.type === type) {
                    return true
                }
            });
        return r ? r[1] : undefined;
    }

}