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

export class GoDeposit extends WalkingTo implements IState {

    name = "GoDeposit";


    enter(entity:Miner) {
        const bank = entity.locateClosestBuilding(BuildingTypes.BANK);
        const movement = <MovementComponent>entity.getComponent("MOVEMENT")
        if (bank && movement) {
            movement.arriveOn(bank)
        }
    }

    execute(entity:Miner) {
        this.walk(entity);

        // is it close to tavern? go drinking
        const positionComponent = <PositionComponent>entity.getComponent('POSITION');
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');

        if (movementComponent.arriveTarget && Vector.distance(movementComponent.arriveTarget, positionComponent.position) < 1) {

            const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');

            const building = worldComponent.world.locateBuildingAtPosition(movementComponent.arriveTarget, BuildingTypes.BANK);
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

                const stateMachineComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');

                if (!depositRest) {
                    // CAPITALISM AT IT'S FINEST, if it doesn't have a bank account DIE
                    movementComponent.arriveOff();
                    stateMachineComponent.getFSM().changeGlobalState(new DiedState());
                    return;
                }

                movementComponent.arriveOff();

                if (depositRest.newAmount < 100) {
                    const chance = Math.random();

                    const farmer = <FarmerComponent>entity.getComponent('FARMER');
                    if (farmer) {
                        return stateMachineComponent.getFSM().changeState(new GoFarmingState());
                    }

                    if (chance > 0.5) {
                        // oh no, i don't like me haz no money
                        stateMachineComponent.getFSM().changeState(new GoMiningState())
                    } else {
                        stateMachineComponent.getFSM().changeState(new GoLumberjackingState())
                    }

                } else {
                    stateMachineComponent.getFSM().revert();
                }

            }

        }
    }

    exit(entity:Miner) {
        entity.removeComponent('IS-IN-BUILDING');
    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}