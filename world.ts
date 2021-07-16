import {EntityManager} from "./abstract/ecs/entity-manager";
import {StateMachineSystem} from "./systems/state-machine.system";
import {System} from "./abstract/ecs/system";
import {performance} from "perf_hooks";
import {Miner} from "./entities/miner";
import {MovementSystem} from "./systems/movement.system";
import {Tavern} from "./entities/tavern";
import {GameEntity} from "./abstract/ecs/game-entity";
import {Vector} from "./abstract/geometry/vector";
import {House} from "./entities/house";
import {PositionComponent} from "./components/position.component";
import {Bank} from "./entities/bank";
import {Mine} from "./entities/mine";
import {MinesSystem} from "./systems/mines.system";
import {BuildingStatsComponent, BuildingTypes} from "./components/building-stats.component";
import {Tree} from "./entities/tree";
import {EntityDimensions} from "./components/dimensions.component";
import {TreesSystem} from "./systems/trees.system";
import {Forest} from "./entities/forest";
import {HouseBlock} from "./entities/house-block";


export interface ExportEntity {
    id: number;
    name?: string;
    type: string;
    state?: string,
    position: [number, number],
    dimensions?: EntityDimensions
}

export type ExportHumanEntity = ExportEntity &  {
    heading: [number, number],
    wandering?: {
        distance: number,
        radius: number,
        target: [number, number]
    },
    weight?: number
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


    constructor() {

        this.addTrees();

        this.addMines();

        this.addHouseBlocks();

        this.addMiners();


        const bank = new Bank(this, {
            position: new Vector(500, 100),
            name: "That old bank"
        })
        this.em.entities.set(bank.id, bank);

        // const miner2 = new Miner(this, {
        //     position: new Vector(100, 150),
        //     // house: house2
        // });
        // this.em.entities.set(miner2.id, miner2);
        // Bank.addAccount(miner2.id, Math.random() * 50);

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

        this.update(0);
    }

    addMiners() {
        for (let i = 0; i < 5; i++) {
            const miner = new Miner(this, {
                position: new Vector(
                    Math.round(Math.random() * 700),
                    Math.round(Math.random() * 500)
                ),
                // house: house
            });
            this.em.entities.set(miner.id, miner);
            Bank.addAccount(miner.id, Math.random() * 50);
        }

        setInterval(() => {
            const miner = new Miner(this, {
                position: new Vector(
                    Math.round(Math.random() * 700),
                    Math.round(Math.random() * 500)
                ),
                // house: house
            });
            this.em.entities.set(miner.id, miner);
            Bank.addAccount(miner.id, Math.random() * 50);
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

    addTrees() {

        const f = new Forest(this, {
            distribution: 'ROUND',
            center: new Vector(700, 300),
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
        return position.x > 0 && position.x < 1000 && position.y > 0 && position.y < 1000;
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