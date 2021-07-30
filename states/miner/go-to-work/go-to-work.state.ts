import {StateMachine} from "../../../abstract/fsm/state-machine";
import {Miner} from "../../../entities/miner";
import {StateMachineComponent} from "../../../components/state-machine.component";
import {Telegram} from "../../../abstract/messaging/telegram";
import {IState, State} from "../../../abstract/fsm/state";
import {JobComponent} from "../../../components/job.component";
import {GoRest} from "../go-rest/go-rest";
import {WalkToWorkplaceState} from "./sub/walk-to-workplace.state";
import {WorkingState} from "./sub/working.state";

export class GoToWorkState extends State implements IState {

    name = "GoToWork";

    localFsm:StateMachine | null = null;

    enter(entity:Miner) {
        const job = <JobComponent>entity.getComponent('JOB')
        const stateMachine = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
        if (!job) {
            return stateMachine.getFSM().changeState(new GoRest())
        }

        // se working state


        this.localFsm = new StateMachine(entity);

        this.localFsm.changeState(new WorkingState())
        this.localFsm.changeState(new WalkToWorkplaceState());

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