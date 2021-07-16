import {IState, State} from "../../../../abstract/fsm/state";
import {Miner} from "../../../../entities/miner";
import {Telegram} from "../../../../abstract/messaging/telegram";
import {HumanStatsComponent} from "../../../../components/human-stats.component";
import {StateMachineComponent} from "../../../../components/state-machine.component";
import {WorldRefComponent} from "../../../../components/world-ref.component";
import {MovementComponent} from "../../../../components/movement.component";
import {HasBagComponent} from "../../../../components/has-bag.component";
import {BuildingTypes} from "../../../../components/building-stats.component";
import {Tree} from "../../../../entities/tree";
import {TreeLifecycleComponent} from "../../../../components/tree-lifecycle.component";
import {Vector} from "../../../../abstract/geometry/vector";
import {PositionComponent} from "../../../../components/position.component";
import {WalkToTreeState} from "./walk-to-tree.state";

export class LumberjackState extends State implements IState {

    name = "Lumberjack";

    timePassedLumberjack = 0;
    maxTimeLumberjack = 20;

    tree:Tree | null = null;

    enter(entity:Miner) {
        const closestTreePosition = entity.locateClosestBuilding(BuildingTypes.TREE);
        const sm = <StateMachineComponent>entity.getComponent('STATE-MACHINE');

        if (!closestTreePosition) {
            sm.getFSM().revert();
            return;
        }

        const position = <PositionComponent>entity.getComponent('POSITION');

        if (Vector.distance(closestTreePosition, position.position) > 0.1) {
            const localFsm = sm.getFSM().currentState.localFsm;
            localFsm && localFsm.changeState(new WalkToTreeState())
            return;
        }

        const world = <WorldRefComponent>entity.getComponent('WORLD-REF');
        this.tree = <Tree>world.world.locateBuildingAtPosition(closestTreePosition, BuildingTypes.TREE);
    }

    execute(entity:Miner) {

        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        const worldComponent = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = worldComponent.world.frame.deltaTime;
        const movement = <MovementComponent>entity.getComponent('MOVEMENT');
        const hasBag = <HasBagComponent>entity.getComponent('HAS-BAG');

        humanStats.thirst += 2 * delta;
        humanStats.fatigue = Math.max(0, humanStats.fatigue + (4 * delta));

        this.timePassedLumberjack += 1 * delta;
        if (hasBag) {

            if (this.tree) {
                const life = <TreeLifecycleComponent>this.tree.getComponent('TREE-LIFECYCLE');
                life.availability = Math.max(0, life.availability - 1 * delta / 2)
                if (life.availability > 0) {
                    hasBag.wood += 1 * delta / 2;
                } else {
                    this.timePassedLumberjack = this.maxTimeLumberjack;
                }
            } else {
                this.timePassedLumberjack = this.maxTimeLumberjack;
            }
        }

        if (this.timePassedLumberjack >= this.maxTimeLumberjack) {
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