import {IState} from "../../../abstract/fsm/state";
import {Miner} from "../../../entities/miner";
import {Telegram} from "../../../abstract/messaging/telegram";
import {PositionComponent, PositionComponentName} from "../../../components/position.component";
import {MovementComponent} from "../../../components/movement.component";
import {Vector} from "../../../abstract/geometry/vector";
import {BuildingTypes} from "../../../components/building-stats.component";
import {WalkingTo} from "../walking/walking-to.state";
import {StateMachineComponent} from "../../../components/state-machine.component";
import {HasMoneyToSpendComponent} from "../../../components/has-money-to-spend.component";
import {Bank} from "../../../entities/bank";
import {GoRest} from "../go-rest/go-rest";
import {DiedState} from "../died.state";
import {GoMiningState} from "../go-mining/go-mining.state";
import {JobComponent} from "../../../components/job.component";
import {GoToWorkState} from "../go-to-work/go-to-work.state";

export class GoWithdraw extends WalkingTo implements IState {

    name = "GoWithdraw";


    enter(entity:Miner) {
        const bank = entity.locateClosestBuilding(BuildingTypes.BANK);
        const movement = <MovementComponent>entity.getComponent("MOVEMENT");

        if (movement && bank) {
            movement.arriveOn(bank);
        }

    }

    execute(entity:Miner) {
        this.walk(entity);

        // is it close to tavern? go drinking
        const positionComponent = <PositionComponent>entity.getComponent(PositionComponentName);
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');

        if (movementComponent.arriveTarget && Vector.distance(movementComponent.arriveTarget, positionComponent.position) < 1) {

            const hasMoneyComponent = <HasMoneyToSpendComponent>entity.getComponent('MONEY-TO-SPEND');
            const withdrawRes= Bank.withdrawFromAccount(entity.id, 50);

            const stateMachineComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');

            if (!withdrawRes) {
                // CAPITALISM AT IT'S FINEST, if it doesn't have a bank account
                stateMachineComponent.getFSM().changeGlobalState(new DiedState());
                return;
            }

            hasMoneyComponent.money += withdrawRes.withdraw;

            if (withdrawRes.newAmount < 50) {

                const job = <JobComponent>entity.getComponent('JOB');

                if (job) {
                    stateMachineComponent.getFSM().changeState(new GoToWorkState());
                } else {
                    stateMachineComponent.getFSM().changeState(new GoMiningState())
                }


            } else {
                // return to previous state

                stateMachineComponent.getFSM().revert();
            }



        }
    }

    exit(entity:Miner) {
    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}