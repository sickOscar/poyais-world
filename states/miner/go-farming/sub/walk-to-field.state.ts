import {WalkingTo} from "../../walking/walking-to.state";
import {IState} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {HasHouseComponent} from "../../../../components/has-house.component";
import {MovementComponent} from "../../../../components/movement.component";
import {PositionComponent} from "../../../../components/position.component";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {Vector} from "../../../../abstract/geometry/vector";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {FarmerComponent} from "../../../../components/farmer.component";
import {DimensionsComponent} from "../../../../components/dimensions.component";
import {GoRest} from "../../go-rest/go-rest";


export class WalkToFieldState extends WalkingTo implements IState {

    name = "WalkToField";

    fieldDestination: Vector | null = null;

    enter(entity: Miner) {
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
        const farmer = <FarmerComponent>entity.getComponent('FARMER');

        if (farmer && farmer.farm) {
            const farmDimensions = <DimensionsComponent>farmer.farm.getComponent('DIMENSIONS');
            const farmPosition = <PositionComponent>farmer.farm.getComponent('POSITION');

            if (farmDimensions && farmPosition && farmDimensions.height && farmDimensions.width) {
                const angleClamp = Vector.randomClamped();
                this.fieldDestination = new Vector(
                    farmPosition.position.x + (angleClamp.x * farmDimensions.width / 4),
                    farmPosition.position.y + (angleClamp.y * farmDimensions.height / 4)
                )

                movementComponent.arriveOn(this.fieldDestination);
            }

        }
    }

    execute(entity: Miner) {
        const smComponent = <StateMachineComponent>entity.getComponent('STATE-MACHINE');

        this.walk(entity);

        const positionComponent = <PositionComponent>entity.getComponent('POSITION');

        if (!this.fieldDestination) {
            return smComponent.getFSM().changeState(new GoRest());
        }

        if (Vector.distance(positionComponent.position, this.fieldDestination) < 1) {
            const localFsm = smComponent.getFSM().currentState.localFsm;

            if (localFsm) {
                localFsm.revert()
            }
        }

    }

    exit(entity: Miner) {
        const movementComponent = <MovementComponent>entity.getComponent('MOVEMENT');
        movementComponent && movementComponent.arriveOff();
    }

    onMessage(owner: any, telegram: Telegram): boolean {
        return true;
    }

}