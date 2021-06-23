import {IState, State} from "../../abstract/fsm/state";
import {Miner} from "../../entities/miner";
import {Telegram} from "../../abstract/messaging/telegram";
import {HumanStatsComponent} from "../../components/human-stats.component";
import {HasMoneyToSpendComponent} from "../../components/has-money-to-spend.component";
import {StateMachineComponent} from "../../components/state-machine.component";
import {WalkingHomeState} from "./walking-home.state";
import {WorldRefComponent} from "../../components/world-ref.component";
import {MovementComponent} from "../../components/movement.component";
import {Vector} from "../../abstract/geometry/vector";
import {HasHouseComponent} from "../../components/has-house.component";

export class DrinkingInTavernState extends State implements IState {

    name = "DrinkingInTavern";

    enter(entity:Miner) {
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
        movementComponent.freeze();
    }

    execute(entity:Miner) {
        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        const hasMoney = <HasMoneyToSpendComponent>entity.getComponent('MONEY-TO-SPEND');
        const stateMachineComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
        const houseComponent = <HasHouseComponent>entity.getComponent('HAS-HOUSE');

        const delta = worldComponent.world.frame.deltaTime;

        if (humanStats.thirst > 0 && hasMoney.money > 0) {
            hasMoney.money = Math.max(0, hasMoney.money - (1 * delta));
            humanStats.thirst = Math.max(0, humanStats.thirst - (1 * delta));
        } else if (hasMoney.money <= 0) {

            movementComponent.seekOn(houseComponent.housePosition);

            stateMachineComponent.getFSM().changeState(new WalkingHomeState());
        } else if (humanStats.thirst <= 0) {

            movementComponent.seekOn(houseComponent.housePosition);

            stateMachineComponent.getFSM().changeState(new WalkingHomeState());
        }

    }

    exit(entity:Miner) {

    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}