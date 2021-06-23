import {EntityManager} from "./abstract/ecs/entity-manager";
import {StateMachineSystem} from "./systems/state-machine.system";
import {System} from "./abstract/ecs/system";
import {performance} from "perf_hooks";
import {Miner} from "./entities/miner";
import {MovementSystem} from "./systems/movement.system";
import {Tavern} from "./entities/tavern";
import {GameEntity} from "./abstract/ecs/game-entity";
import {Vector} from "./abstract/geometry/vector";


export interface ExportEntity {
    id: number;
    name: string;
    type: string;
    state?: string,
    position: [number, number],
    heading?: [number, number]
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

    stateMachineSystem: StateMachineSystem;
    movementSystem: MovementSystem;

    constructor() {

        const miner = new Miner(this, {
            position: new Vector(10, 10),
            housePosition: new Vector(10, 10)
        });
        this.em.entities.set(miner.id, miner);

        const tavern = new Tavern(this, {
            position: new Vector(100, 100)
        });
        this.em.entities.set(tavern.id, tavern);

        this.stateMachineSystem = new StateMachineSystem(this);
        this.systems.set('STATE-MACHINE-SYSTEM', this.stateMachineSystem);

        this.movementSystem = new MovementSystem(this);
        this.systems.set('MOVEMENT-SYSTEM', this.movementSystem);

        this.update(0);
    }

    dumpDynamicEntities():ExportEntity[] {
        return (<[string, GameEntity][]>Array.from(this.em.entities))
            .filter(([key, entity]:[string, GameEntity]) => {
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
        }, 1000 / 10)
    }

}