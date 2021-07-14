import {IState, State} from "../../../abstract/fsm/state";
import {Miner} from "../../../entities/miner";
import {Telegram} from "../../../abstract/messaging/telegram";
import {StateMachine} from "../../../abstract/fsm/state-machine";
import {BuildingHouseState} from "./sub/building-house.state";
import {WalkingHomeState} from "../walking/walking-home.state";

export class BuildHouseState extends State implements IState {

    name = "BuildHouse";

    localFsm:StateMachine | null = null;

    enter(entity:Miner) {
        this.localFsm = new StateMachine(entity);
        this.localFsm.changeState(new BuildingHouseState())
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