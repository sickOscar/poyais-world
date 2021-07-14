import {IState, State} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {HumanStatsComponent} from "../../../../components/human-stats.component";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {WorldRefComponent} from "../../../../components/world-ref.component";
import {MovementComponent} from "../../../../components/movement.component";
import {GoRest} from "../../go-rest/go-rest";
import {HasBagComponent} from "../../../../components/has-bag.component";
import {GoDeposit} from "../../go-deposit/go-deposit.state";

export class MiningState extends State implements IState {

    name = "Mining";

    timePassedMining = 0;
    maxTimeMining = 10;

    enter(entity:Miner) {

    }

    execute(entity:Miner) {

        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = worldComponent.world.frame.deltaTime;
        const movement = <MovementComponent>entity.getComponent('MOVEMENT');
        const hasBag = <HasBagComponent>entity.getComponent('HAS-BAG');

        humanStats.thirst += 2 * delta;
        humanStats.fatigue = Math.max(0, humanStats.fatigue + (6 * delta));

        this.timePassedMining += 1 * delta;
        if (hasBag) {
            hasBag.gold += 1 * delta / 2;
        }

        if (this.timePassedMining > this.maxTimeMining) {
            const stateMachine = <StateMachineComponent>entity.getComponent('STATE-MACHINE');

            // set first to ho rest so after deposit he eventually go rest (revert state)
            // stateMachine.getFSM().changeState(new GoRest());
            stateMachine.getFSM().revert();
        }

    }

    exit(entity:Miner) {

    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}