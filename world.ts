import {EntityManager} from "./abstract/ecs/entity-manager";
import {StateMachineSystem} from "./systems/state-machine.system";
import {System} from "./abstract/ecs/system";
import {performance} from "perf_hooks";
import {Jobs, Miner, MinerOptions} from "./entities/miner";
import {MovementSystem} from "./systems/movement.system";
import {Tavern} from "./entities/tavern";
import {GameEntity} from "./abstract/ecs/game-entity";
import {Vector} from "./abstract/geometry/vector";
import {PositionComponent} from "./components/position.component";
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
    bag?: ExportBag
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

        this.addMines();

        this.addHouseBlocks();

        this.addFarmBlocks()

        this.addWarehouse();

        this.addTrees();

        // const tr = new Tree(this, {
        //     position: new Vector(350, 350)
        // })
        // const life = <TreeLifecycleComponent>tr.getComponent('TREE-LIFECYCLE')
        // life.cutting = 1;
        // this.em.entities.set(tr.id, tr);
        //
        // const tr1 = new Tree(this, {
        //     position: new Vector(360, 360)
        // })
        // this.em.entities.set(tr1.id, tr1);
        //
        // const tr2 = new Tree(this, {
        //     position: new Vector(380, 760)
        // })
        // this.em.entities.set(tr2.id, tr2);
        //
        //
        // this.createRandomMiner(1, 1);
        // this.createRandomMiner(2, 2);





        this.addMiners();
        // this.createRandomMiner();
        // this.createFarmDemo();

        const bank = new Bank(this, {
            position: new Vector(500, 100),
            name: "That old bank"
        })
        this.em.entities.set(bank.id, bank);

        const tavern = new Tavern(this, {
            position: new Vector(300, 300),
            name: "A tavernella"
        });
        this.em.entities.set(tavern.id, tavern);

        const tavern1 = new Tavern(this, {
            position: new Vector(500, 500),
            name: "Uè Uè"
        });
        this.em.entities.set(tavern1.id, tavern1);

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

    createRandomMiner(x?:number, y?:number) {
        const options:Partial<MinerOptions> = {
            position: new Vector(
                x || Math.round(Math.random() * 700),
                y || Math.round(Math.random() * 500)
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

    addMines() {
        const mine = new Mine(this, {
            position: new Vector(700, 700)
        })
        this.em.entities.set(mine.id, mine);

        const mine2 = new Mine(this, {
            position: new Vector(200, 700)
        })
        this.em.entities.set(mine2.id, mine2);

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

    addTrees() {

        const f = new Forest(this, {
            distribution: 'ROUND',
            center: new Vector(700, 150),
            radius: 70,
            trees: 15,
            minRadius: 5,
            treeRadius: 10
        });
        this.em.entities.set(f.id, f);

        const f2 = new Forest(this, {
            distribution: 'SQUARE',
            center: new Vector(300, 700),
            radius: 100,
            trees: 15,
            minRadius: 5,
            treeRadius: 10
        });
        this.em.entities.set(f2.id, f2);

        const f3 = new Forest(this, {
            distribution: 'SQUARE',
            center: new Vector(750, 300),
            radius: 70,
            trees: 20,
            minRadius: 5,
            treeRadius: 10
        });
        this.em.entities.set(f3.id, f3);


    }

    addFarmBlocks() {
        const farmBlock = new FarmBlock(this, {
            position: new Vector(1400, 400),
            width: 600,
            height: 400
        })
        this.em.entities.set(farmBlock.id, farmBlock);
    }

    addHouseBlocks() {

        const houseBlock = new HouseBlock(this, {
            position: new Vector(200, 200),
            width: 200,
            height: 100
        })
        this.em.entities.set(houseBlock.id, houseBlock);

        const houseBlock2 = new HouseBlock(this, {
            position: new Vector(150, 350),
            width: 100,
            height: 200
        })
        this.em.entities.set(houseBlock2.id, houseBlock2);

        const houseBlock3 = new HouseBlock(this, {
            position: new Vector(950, 350),
            width: 50,
            height: 400
        })
        this.em.entities.set(houseBlock3.id, houseBlock3);

    }

    addWarehouse() {
        const warehouse = new Warehouse(this, {
            position: new Vector(1100, 100)
        })
        this.em.entities.set(warehouse.id, warehouse);
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
        const terrain = this.map.terrainAtCoords(position.x, position.y);

        if (terrain !== TerrainType.WATER) {
            return true
        }

        return false;

        //return position.x > 0 && position.x < this.map.width && position.y > 0 && position.y < this.map.height;
    }

    locateBuildingAtPosition(position: Vector, type: BuildingTypes): GameEntity | undefined {
        const r = (<[string, GameEntity][]>Array.from(this.em.entities))
            .find((entry) => {
                const entity = entry[1];
                const pos = <PositionComponent>entity.getComponent('POSITION');
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