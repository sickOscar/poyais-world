import {IState} from "../../../abstract/fsm/state";
import {Miner} from "../../../entities/miner";
import {Telegram} from "../../../abstract/messaging/telegram";
import {PositionComponent} from "../../../components/position.component";
import {MovementComponent} from "../../../components/movement.component";
import {Vector} from "../../../abstract/geometry/vector";
import {BuildingTypes} from "../../../components/building-stats.component";
import {WalkingTo} from "../walking/walking-to.state";
import {StateMachineComponent} from "../../../components/state-machine.component";
import {Bank} from "../../../entities/bank";
import {DiedState} from "../died.state";
import {HasBagComponent} from "../../../components/has-bag.component";
import {GoMiningState} from "../go-mining/go-mining.state";
import {IsInBuildingComponent} from "../../../components/is-in-building.component";
import {WorldRefComponent} from "../../../components/world-ref.component";
import {GoLumberjackingState} from "../go-lumberjacking/go-lumberjacking.state";
import {FarmerComponent} from "../../../components/farmer.component";
import {GoFarmingState} from "../go-farming/go-farming.state";
import {GoDrinkingState} from "../go-drinking/go-drinking.state";

export class GoDeposit extends WalkingTo implements IState {

    name = "GoDeposit";

    targetType: BuildingTypes = BuildingTypes.BANK;

    constructor(type?: BuildingTypes) {
        super();
        this.targetType = type || this.targetType;
    }

    enter(entity: Miner) {
        const bank = entity.locateClosestBuilding(this.targetType);
        const movement = <MovementComponent>entity.getComponent("MOVEMENT")
        if (bank && movement) {
            movement.arriveOn(bank)
        }
    }

    execute(entity: Miner) {
        this.walk(entity);

        // is it close to tavern? go drinking
        const positionComponent = <PositionComponent>entity.getComponent('POSITION');
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
        const stateMachineComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');


        if (movementComponent.arriveTarget && Vector.distance(movementComponent.arriveTarget, positionComponent.position) < 1) {

            const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');

            const building = worldComponent.world.locateBuildingAtPosition(movementComponent.arriveTarget, this.targetType);
            if (building) {
                entity.addComponent(new IsInBuildingComponent(building))
            }

            const hasBagComponent = <HasBagComponent>entity.getComponent('HAS-BAG');

            if (
                hasBagComponent.gold > 0
                || hasBagComponent.wood > 0
                || hasBagComponent.malt > 0
            ) {

                // TODO: conversion gold??
                let changedMoney = hasBagComponent.gold * 2;
                hasBagComponent.gold = 0;

                // TODO conversion wood
                changedMoney += hasBagComponent.wood * 1;
                hasBagComponent.wood = 0;

                changedMoney += hasBagComponent.malt * 0.5;
                hasBagComponent.malt = 0;

                const depositRest = Bank.depositToAccount(entity.id, changedMoney);

                if (!depositRest) {
                    // CAPITALISM AT IT'S FINEST, if it doesn't have a bank account DIE
                    movementComponent.arriveOff();
                    stateMachineComponent.getFSM().changeGlobalState(new DiedState());
                    return;
                }

            }

            movementComponent.arriveOff();

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