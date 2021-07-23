import {IState, State} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {HumanStatsComponent} from "../../../../components/human-stats.component";
import {HasMoneyToSpendComponent} from "../../../../components/has-money-to-spend.component";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {WorldRefComponent} from "../../../../components/world-ref.component";
import {MovementComponent} from "../../../../components/movement.component";
import {GoRest} from "../../go-rest/go-rest";
import {GoWithdraw} from "../../go-withdraw/go-withdraw.state";
import {BuildingTypes} from "../../../../components/building-stats.component";
import {IsInBuildingComponent} from "../../../../components/is-in-building.component";
import {GoDrinkingState} from "../go-drinking.state";

export class DrinkingInTavernState extends State implements IState {

    name = "DrinkingInTavern";
    
    enter(entity:Miner) {
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF')

        const tPos = entity.locateClosestBuilding(BuildingTypes.TAVERN);

        if (tPos) {
            const tavern = worldComponent.world.locateBuildingAtPosition(tPos, BuildingTypes.TAVERN);
            if (tavern) {
                entity.addComponent(new IsInBuildingComponent(tavern))
            }

            movementComponent.arriveOff();
        } else {
            const sm = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
            sm.getFSM().changeState(new GoRest())
        }



    }

    execute(entity:Miner) {
        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        const hasMoney = <HasMoneyToSpendComponent>entity.getComponent('MONEY-TO-SPEND');
        const stateMachineComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');

        const delta = worldComponent.world.frame.deltaTime;

        if (humanStats.thirst > 0 && hasMoney.money > 0) {
            hasMoney.money = Math.max(0, hasMoney.money - (2 * delta));
            humanStats.thirst = Math.max(0, humanStats.thirst - (10 * delta));
            humanStats.fatigue = Math.max(0, humanStats.fatigue - (1 * delta));
        } else if (hasMoney.money <= 0) {
            stateMachineComponent.getFSM().changeState(new GoDrinkingState());
            stateMachineComponent.getFSM().changeState(new GoWithdraw());
        } else if (humanStats.thirst <= 0) {
            stateMachineComponent.getFSM().changeState(new GoRest());
        }

    }

    exit(entity:Miner) {
        entity.removeComponent('IS-IN-BUILDING')
    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}