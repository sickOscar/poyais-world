import {IState, State} from "../../abstract/fsm/state";
import {Miner} from "../../entities/miner";
import {Telegram} from "../../abstract/messaging/telegram";
import {HumanStatsComponent} from "../../components/human-stats.component";
import {MovementComponent} from "../../components/movement.component";
import {Vector} from "../../abstract/geometry/vector";
import {WorldRefComponent} from "../../components/world-ref.component";
import {PositionComponent} from "../../components/position.component";
import {StateMachineComponent} from "../../components/state-machine.component";
import {DrinkingInTavernState} from "./drinking-in-tavern.state";

export class WalkingToTavernState extends State implements IState {

    name = "WalkingToTavern";

    enter(entity:Miner) {

    }

    execute(entity:Miner) {
        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = worldComponent.world.frame.deltaTime;

        humanStats.fatigue += 1 * delta;
        humanStats.thirst += 0.3 * delta;
        humanStats.boredom = Math.max(0, humanStats.boredom - (0.5 * delta));

        // is it close to tavern? go drinking
        const positionComponent = <PositionComponent>entity.getComponent('POSITION');
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');

        if (movementComponent.seekTarget && Vector.distance(movementComponent.seekTarget, positionComponent.position) < 1) {
            const stateMachineComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            stateMachineComponent.getFSM().changeState(new DrinkingInTavernState());
            movementComponent.seekOff();
        }

    }

    exit(entity:Miner) {

    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}