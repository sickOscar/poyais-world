import {IState, State} from "../../abstract/fsm/state";
import {Miner} from "../../entities/miner";
import {Telegram} from "../../abstract/messaging/telegram";
import {HumanStatsComponent} from "../../components/human-stats.component";
import {StateMachineComponent} from "../../components/state-machine.component";
import {WalkingToTavernState} from "./walking-to-tavern.state";
import {StateMachine} from "../../abstract/fsm/state-machine";
import {WorldRefComponent} from "../../components/world-ref.component";
import {MovementComponent} from "../../components/movement.component";
import {Vector} from "../../abstract/geometry/vector";

export class RestAtHomeState extends State implements IState {

    name = "RestAtHome";

    enter(entity:Miner) {

    }

    execute(entity:Miner) {

        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = worldComponent.world.frame.deltaTime;
        const movement = <MovementComponent>entity.getComponent('MOVEMENT');


        humanStats.boredom += 1 * delta;
        humanStats.thirst += 0.1 * delta;
        humanStats.fatigue = Math.max(0, humanStats.fatigue - (3 * delta));

        // go to tavern if bored
        if (humanStats.boredom >= humanStats.max_boredom) {

            movement.seekOn(entity.locateClosestTavern());

            const stateMachineComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE')
            if (stateMachineComponent) {
                const fsm = <StateMachine>stateMachineComponent.getFSM();
                if (fsm) {
                    fsm.changeState(new WalkingToTavernState());
                }
            }

            return;

        }

        // go to tavern if thirsty
        if (humanStats.thirst >= humanStats.thirst_threshold) {

            movement.seekOn(entity.locateClosestTavern());

            const stateMachineComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE')
            if (stateMachineComponent) {
                const fsm = <StateMachine>stateMachineComponent.getFSM();
                if (fsm) {
                    fsm.changeState(new WalkingToTavernState());
                }
            }

            return;
        }

    }

    exit(entity:Miner) {

    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}