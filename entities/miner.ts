import {GameEntity} from "../abstract/ecs/game-entity";
import {StateMachineComponent} from "../components/state-machine-component";
import {StateMachine} from "../abstract/fsm/state-machine";
import {RestAtHomeState} from "../states/miner/rest-at-home-state";
import {HumanStatsComponent} from "../components/human-stats-component";
import {PositionComponent} from "../components/position-component";
import {LivingState} from "../states/miner/living-state";
import {MovementComponent} from "../components/movement-component";
import {WorldRefComponent} from "../components/world-ref-component";
import {ExportEntity, World} from "../world";
import {Vector} from "../abstract/geometry/vector";
import {BuildingStatsComponent, BuildingTypes} from "../components/building-stats-component";
import {HasMoneyToSpendComponent} from "../components/has-money-to-spend-component";
import {DiedState} from "../states/miner/died-state";

export class Miner extends GameEntity {

    constructor(world:World) {
        super();

        const fsmComponent = new StateMachineComponent();
        const stateMachine = new StateMachine(this);
        fsmComponent.setFSM(stateMachine);
        stateMachine.changeState(new RestAtHomeState());
        stateMachine.changeGlobalState(new LivingState());

        this.addComponent(fsmComponent)
            .addComponent(new HumanStatsComponent())
            .addComponent(new PositionComponent())
            .addComponent(new MovementComponent())
            .addComponent(new HasMoneyToSpendComponent())
            .addComponent(new WorldRefComponent(world))

    }

    locateClosestTavern():Vector {

        const worldRefComponent = <WorldRefComponent>this.getComponent('WORLD-REF')
        
        const allTaverns:[string, GameEntity][] = (<[string, GameEntity][]>Array.from(worldRefComponent.world.em.entities))
            .filter(([key, entity]:[string, GameEntity]) => {
                const buildingComponent = <BuildingStatsComponent>entity.getComponent('BUILDING-STATS');
                return buildingComponent && buildingComponent.type === BuildingTypes.TAVERN
            })
        

        const minerPosition = <PositionComponent>this.getComponent('POSITION');

        let closestDistance = Infinity;
        let closestTavern = null;
        for (let i = 0; i < allTaverns.length; i++) {
            const tavern = allTaverns[i][1];
            const positionComponent = <PositionComponent>tavern.getComponent('POSITION')
            const dist = Vector.distance(positionComponent.position, minerPosition.position);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestTavern = tavern;
            }
        }

        if (closestTavern) {
            return (<PositionComponent>closestTavern.getComponent('POSITION')).position.clone();
        } else {
            return minerPosition.position.clone();
        }

    }

    die() {
        const stateMachineComponent = <StateMachineComponent>this.getComponent('STATE-MACHINE');

        this.removeComponent('HUMAN-STATS');
        this.removeComponent('HAS-MONEY');
        this.removeComponent('MOVEMENT');

        stateMachineComponent.getFSM().changeGlobalState(new DiedState())
        stateMachineComponent.getFSM().changeState(new DiedState());
    }

    export():ExportEntity {
        const humanStatsComponent = <HumanStatsComponent>this.getComponent('HUMAN-STATS');
        const positionComponent = <PositionComponent>this.getComponent('POSITION');
        const movementComponent = <MovementComponent>this.getComponent('MOVEMENT');
        const smComponent = <StateMachineComponent>this.getComponent('STATE-MACHINE');

        const exportEntity:ExportEntity = {
            id: this.id,
            name: humanStatsComponent.characterFullName,
            type: 'human',
            state: smComponent.getFSM().currentState.name,
            position: [positionComponent.position.x, positionComponent.position.y],
        }

        if (movementComponent) {
            exportEntity.heading = [movementComponent.heading.x, movementComponent.heading.y];
        }

        return exportEntity;

    }

    print() {

        console.clear()

        const currentState = <StateMachineComponent>this.getComponent('STATE-MACHINE');
        const currentStateName = currentState.getFSM().currentState.name;

        const positionComponent = <PositionComponent>this.getComponent('POSITION');
        const humanStatsComponent = <HumanStatsComponent>this.getComponent('HUMAN-STATS');
        const hasMoneyComponent = <HasMoneyToSpendComponent>this.getComponent('MONEY-TO-SPEND');

        const line = `
            ${humanStatsComponent.characterName} ${humanStatsComponent.characterSurname} - ${currentStateName} - POS (x: ${positionComponent.position.x} | y: ${positionComponent.position.y})
            THIRST: ${humanStatsComponent.thirst} / ${humanStatsComponent.max_thirst}
            FATIGUE: ${humanStatsComponent.fatigue}
            BOREDOM: ${humanStatsComponent.boredom} / ${humanStatsComponent.max_boredom}
            MONEY: ${hasMoneyComponent.money}
            AGE: ${humanStatsComponent.age} / ${humanStatsComponent.max_age}
            `;

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(line);

    }

}