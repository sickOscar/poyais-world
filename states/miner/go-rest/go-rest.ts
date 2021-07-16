import {IState, State} from "../../../abstract/fsm/state";
import {Miner} from "../../../entities/miner";
import {Telegram} from "../../../abstract/messaging/telegram";
import {StateMachine} from "../../../abstract/fsm/state-machine";
import {WalkingHomeState} from "../walking/walking-home.state";
import {HasHouseComponent} from "../../../components/has-house.component";
import {StateMachineComponent} from "../../../components/state-machine.component";
import {BuildHouseState} from "../build-house/build-house.state";
import {BuildableComponent} from "../../../components/buildable.component";
import {RestingAtHomeState} from "./sub/resting-at-home.state";

export class GoRest extends State implements IState {

    name = "RestAtHome";

    localFsm:StateMachine | null = null;

    enter(entity:Miner) {

        const hasHouse = <HasHouseComponent>entity.getComponent('HAS-HOUSE');
        if (!hasHouse) {
            const stateMachine = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            stateMachine.getFSM().changeState(new BuildHouseState());
            return;
        }

        const buildable = <BuildableComponent>hasHouse.house.getComponent('BUILDABLE');
        if (buildable && buildable.progress < 100) {
            const stateMachine = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            stateMachine.getFSM().changeState(new BuildHouseState());
            return
        }

        this.localFsm = new StateMachine(entity);

        this.localFsm.changeState(new RestingAtHomeState())
        this.localFsm.changeState(new WalkingHomeState())


    }

    execute(entity:Miner) {
        this.localFsm && this.localFsm.update();
    }

    exit(entity:Miner) {
        this.localFsm && this.localFsm.currentState.exit(entity);
    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}