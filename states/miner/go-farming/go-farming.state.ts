import {IState, State} from "../../../abstract/fsm/state";
import {Miner} from "../../../entities/miner";
import {Telegram} from "../../../abstract/messaging/telegram";
import {StateMachine} from "../../../abstract/fsm/state-machine";
import {WalkToFieldState} from "./sub/walk-to-field.state";
import {FarmingState} from "./sub/farming.state";

export class GoFarmingState extends State implements IState {

    name = "GoFarming";

    localFsm:StateMachine | null = null;

    enter(entity:Miner) {
        this.localFsm = new StateMachine(entity);
        this.localFsm.changeState(new FarmingState())
        this.localFsm.changeState(new WalkToFieldState())
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