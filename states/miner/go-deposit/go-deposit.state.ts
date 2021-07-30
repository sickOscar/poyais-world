import {IState} from "../../../abstract/fsm/state";
import {Miner} from "../../../entities/miner";
import {Telegram} from "../../../abstract/messaging/telegram";
import {PositionComponent, PositionComponentName} from "../../../components/position.component";
import {MovementComponent} from "../../../components/movement.component";
import {Vector} from "../../../abstract/geometry/vector";
import {BuildingTypes} from "../../../components/building-stats.component";
import {WalkingTo} from "../walking/walking-to.state";
import {StateMachineComponent} from "../../../components/state-machine.component";
import {Bank} from "../../../entities/bank";
import {DiedState} from "../died.state";
import {HasBagComponent} from "../../../components/has-bag.component";
import {IsInBuildingComponent} from "../../../components/is-in-building.component";
import {WorldRefComponent, WorldRefComponentName} from "../../../components/world-ref.component";
import {GoDrinkingState} from "../go-drinking/go-drinking.state";
import {GameEntity} from "../../../abstract/ecs/game-entity";
import {Depositables, DepositComponent, DepositComponentName} from "../../../components/has-deposit.component";

export class GoDeposit extends WalkingTo implements IState {

    name = "GoDeposit";

    target: GameEntity | null = null;
    targetType: BuildingTypes = BuildingTypes.BANK;

    constructor(type?: BuildingTypes) {
        super();
        this.targetType = type || this.targetType;
    }

    enter(entity: Miner) {
        const target = entity.locateClosestBuilding(this.targetType);
        const movement = <MovementComponent>entity.getComponent("MOVEMENT")
        const worldRef = <WorldRefComponent>entity.getComponent(WorldRefComponentName)

        if (target && movement) {
            this.target = worldRef.world.locateBuildingAtPosition(target, this.targetType) || null;
            movement.arriveOn(target)
        }
    }

    execute(entity: Miner) {
        this.walk(entity);

        // is it close to tavern? go drinking
        const positionComponent = <PositionComponent>entity.getComponent(PositionComponentName);
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
        const stateMachineComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');


        if (movementComponent.arriveTarget && Vector.distance(movementComponent.arriveTarget, positionComponent.position) < 1) {

            const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');

            const building = worldComponent.world.locateBuildingAtPosition(movementComponent.arriveTarget, this.targetType);
            if (building) {
                entity.addComponent(new IsInBuildingComponent(building))
            }

            movementComponent.arriveOff();

            const hasBagComponent = <HasBagComponent>entity.getComponent('HAS-BAG');
            const deposit = this.target && <DepositComponent>this.target.getComponent(DepositComponentName);

            if (hasBagComponent && deposit) {
                let changedMoney = 0;

                if (deposit && deposit.doAccept(Depositables.GOLD)) {
                    changedMoney += hasBagComponent.gold * 2;
                    deposit.storage[Depositables.GOLD] += hasBagComponent.gold;
                    hasBagComponent.gold = 0;
                }

                if (deposit && deposit.doAccept(Depositables.WOOD)) {
                    changedMoney += hasBagComponent.wood * 1;
                    deposit.storage[Depositables.WOOD] += hasBagComponent.wood;
                    hasBagComponent.wood = 0;
                }

                if (deposit && deposit.doAccept(Depositables.MALT)) {
                    changedMoney += hasBagComponent.malt * 0.5;
                    deposit.storage[Depositables.MALT] += hasBagComponent.malt;
                    hasBagComponent.malt = 0;
                }

                const depositRest = Bank.depositToAccount(entity.id, changedMoney);

                if (!depositRest) {
                    // CAPITALISM AT IT'S FINEST, if it doesn't have a bank account DIE
                    movementComponent.arriveOff();
                    stateMachineComponent.getFSM().changeGlobalState(new DiedState());
                    return;
                }

            }


            const chance = Math.random();
            if (chance > 0.5) {
                stateMachineComponent.getFSM().changeState(new GoDrinkingState())
            } else {
                stateMachineComponent.getFSM().revert();
            }

        }
    }

    exit(entity: Miner) {
        entity.removeComponent('IS-IN-BUILDING');
    }

    onMessage(owner: any, telegram: Telegram): boolean {
        return true;
    }

}