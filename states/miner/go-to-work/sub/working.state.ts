import {IState, State} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {HumanStatsComponent} from "../../../../components/human-stats.component";
import {WorldRefComponent} from "../../../../components/world-ref.component";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {StateMachine} from "../../../../abstract/fsm/state-machine";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {GoRest} from "../../go-rest/go-rest";
import {JobComponent} from "../../../../components/job.component";
import {HasMoneyToSpendComponent} from "../../../../components/has-money-to-spend.component";

export class WorkingState extends State implements IState {

    name = "Working";

    maxWorkingTime = 8;
    workingTime = 0;


    enter(entity: Miner) {
    }

    execute(entity: Miner) {

        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = worldComponent.world.frame.deltaTime;
        const stateMachineComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE')
        const fsm = <StateMachine>stateMachineComponent.getFSM();

        humanStats.thirst += 1 * delta;
        humanStats.fatigue += 5 * delta;

        this.workingTime = Math.min(this.maxWorkingTime, this.workingTime + delta);

        if (this.workingTime === this.maxWorkingTime) {
            this.workingTime = 0;
            fsm.changeState(new GoRest())
            return;
        }


    }

    exit(entity: Miner) {
        const hasMoney = <HasMoneyToSpendComponent>entity.getComponent('MONEY-TO-SPEND');
        const job = <JobComponent>entity.getComponent('JOB');
        if (hasMoney && job) {
            hasMoney.money += job.wage;
        }
    }

    onMessage(owner: any, telegram: Telegram): boolean {
        return true;
    }

}