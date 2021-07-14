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
import {Forest} from "./entities/abstract/forest";


export interface ExportEntity {
    id: number;
    name?: string;
    type: string;
    state?: string,
    position: [number, number],
    dimensions?: EntityDimensions,
    heading?: [number, number],
    wandering?: {
        distance: number,
        radius: number,
        target: [number, number]
    },
    progress?: number
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

        const mine = new Mine(this, {
            position: new Vector(150, 150)
        })
        this.em.entities.set(mine.id, mine);

        // const house = new House(this, {
        //     position: new Vector(200, 100)
        // })
        // this.em.entities.set(house.id, house);
        //
        // const house2 = new House(this, {
        //     position: new Vector(230, 342)
        // })
        // this.em.entities.set(house2.id, house2);

        // const house3 = new House(this, {
        //     position: new Vector(430, 202)
        // })
        // this.em.entities.set(house3.id, house3);

        const bank = new Bank(this, {
            position: new Vector(500, 100),
            name: "That old bank"
        })
        this.em.entities.set(bank.id, bank);


        // for ( let i = 0; i< 2; i++) {
        //
        //     const house = new House(this, {
        //         position: new Vector(200 + i, 200 + i),
        //     })
        //     this.em.entities.set(house.id, house);
        //
        //     const miner = new Miner(this, {
        //         position: new Vector(350, 350),
        //         house: (<PositionComponent>house.getComponent('POSITION')).position
        //     });
        //     this.em.entities.set(miner.id, miner);
        //     Bank.addAccount(miner.id, Math.random() * 50);
        //
        // }

        // const miner = new Miner(this, {
        //     position: new Vector(300, 200),
        //     // house: house
        // });
        // this.em.entities.set(miner.id, miner);
        // Bank.addAccount(miner.id, Math.random() * 50);

        for (let i = 0; i < 100; i++) {
            const miner = new Miner(this, {
                position: new Vector(
                    Math.round(Math.random() * 500),
                    Math.round(Math.random() * 500)
                ),
                // house: house
            });
            this.em.entities.set(miner.id, miner);
            Bank.addAccount(miner.id, Math.random() * 50);
        }


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

    addTrees() {

        const f = new Forest(this, {
            distribution: 'ROUND',
            center: new Vector(700, 300),
            radius: 70,
            trees: 5,
            minRadius: 5,
            treeRadius: 10
        });

        f.forest.forEach(tree => {
            if (tree) {
                this.em.entities.set(tree.id, tree);
            }
        })

        const f2 = new Forest(this, {
            distribution: 'ROUND',
            center: new Vector(300, 700),
            radius: 70,
            trees: 5,
            minRadius: 5,
            treeRadius: 10
        });

        f2.forest.forEach(tree => {
            if (tree) {
                this.em.entities.set(tree.id, tree);
            }
        })

        // const treesNum = 10;
        // for(let i = 0; i < treesNum; i++) {
        //     const displacement = 40;
        //     const t = new Tree(this, {
        //         position: new Vector(450 +  Math.cos(Math.PI * (1 / i)) * displacement, 450 + Math.sin(Math.PI * (1 / i)) * displacement)
        //     })
        //     this.em.entities.set(t.id, t);
        // }

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
                if (pos.position.equals(position) && buildingStats.type === type) {
                    return true
                }
            });
        return r ? r[1] : undefined;
    }

}