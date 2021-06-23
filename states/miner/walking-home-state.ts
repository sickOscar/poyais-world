import {IState, State} from "../../abstract/fsm/state";
import {Miner} from "../../entities/miner";
import {Telegram} from "../../abstract/messaging/telegram";
import {HumanStatsComponent} from "../../components/human-stats-component";
import {StateMachineComponent} from "../../components/state-machine-component";
import {WorldRefComponent} from "../../components/world-ref-component";
import {PositionComponent} from "../../components/position-component";
import {Vector} from "../../abstract/geometry/vector";
import {RestAtHomeState} from "./rest-at-home-state";
import {MovementComponent} from "../../components/movement-component";

export class WalkingHomeState extends State implements IState {

    name = "WalkingHome";

    enter(entity:Miner) {

    }

    execute(entity:Miner) {
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = worldComponent.world.frame.deltaTime;
        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        humanStats.fatigue += 2 * delta;
        humanStats.boredom = Math.max(0, humanStats.boredom - (1 * delta));
        humanStats.thirst += 2 * delta;

        const positionComponent = <PositionComponent>entity.getComponent('POSITION');
        if (Vector.distance(positionComponent.position, new Vector(0, 0)) < 1) {
            const smComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            smComponent.getFSM().changeState(new RestAtHomeState());
            const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
            movementComponent.seekOff();
        }

    }

    exit(entity:Miner) {

    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}