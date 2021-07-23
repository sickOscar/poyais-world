import {IState} from "../../../../abstract/fsm/state";
import {GameEntity} from "../../../../abstract/ecs/game-entity";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {HasBagComponent} from "../../../../components/has-bag.component";
import {WorldRefComponent} from "../../../../components/world-ref.component";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {GoDeposit} from "../../go-deposit/go-deposit.state";
import {WalkToFieldState} from "./walk-to-field.state";
import {HumanStatsComponent} from "../../../../components/human-stats.component";
import {BuildingTypes} from "../../../../components/building-stats.component";

export class FarmingState implements IState {
    name = "Farming";

    timeSpentFarming = 0;
    maxTimeSpentFarming = 3;

    enter(owner: GameEntity): void {
    }

    execute(owner: GameEntity): void {
        const humanStats  = <HumanStatsComponent>owner.getComponent('HUMAN-STATS');
        const bag = <HasBagComponent>owner.getComponent('HAS-BAG');
        const w = <WorldRefComponent>owner.getComponent('WORLD-REF')
        const delta = w.world.frame.deltaTime;
        const sm = <StateMachineComponent>owner.getComponent('STATE-MACHINE')

        humanStats.fatigue += 1.5 * delta;

        if (bag && bag.malt <= bag.maxMalt) {
            this.timeSpentFarming = this.timeSpentFarming + 1 * delta;
            bag.malt = Math.min(bag.maxMalt, bag.malt + 1 * delta)
        }

        if (this.timeSpentFarming > this.maxTimeSpentFarming) {
            if (bag.malt === bag.maxMalt) {
                sm.getFSM().changeState(new GoDeposit(BuildingTypes.WAREHOUSE));
            } else {
                this.timeSpentFarming = 0;
                const localFsm = sm.getFSM().currentState.localFsm;
                localFsm && localFsm.changeState(new WalkToFieldState())
            }
        }

    }

    exit(owner: GameEntity): void {
    }

    onMessage(owner: GameEntity, telegram: Telegram): boolean {
        return false;
    }

}