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
import {WalkToTreeState} from "./walk-to-tree.state";

export class LumberjackState extends State implements IState {

    name = "Lumberjack";

    timePassedLumberjack = 0;
    maxTimeLumberjack = 20;

    tree:Tree | null = null;

    enter(entity:Miner) {
        const closestTreePosition = entity.locateClosestBuilding(BuildingTypes.TREE, {considerCutting: false});
        const sm = <StateMachineComponent>entity.getComponent('STATE-MACHINE');
        const localFsm = sm.getFSM().currentState.localFsm;

        if (!closestTreePosition) {
            localFsm && localFsm.changeState(new WalkToTreeState());
            return;
        }
        const world = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const localTree = <Tree>world.world.locateBuildingAtPosition(closestTreePosition, BuildingTypes.TREE);
        const life = <TreeLifecycleComponent>localTree.getComponent('TREE-LIFECYCLE');

        if (life.cutting >= life.maxCutting) {
            localFsm && localFsm.changeState(new WalkToTreeState());
            return;
        }

        this.tree = localTree;
        life.cutting = life.cutting + 1;

    }

    execute(entity:Miner) {

        const humanStats = <HumanStatsComponent>entity.getComponent('HUMAN-STATS');
        const wc = <WorldRefComponent>entity.getComponent('WORLD-REF');
        const delta = wc.world.frame.deltaTime;
        const movement = <MovementComponent>entity.getComponent('MOVEMENT');
        const hasBag = <HasBagComponent>entity.getComponent('HAS-BAG');
        const stateMachine = <StateMachineComponent>entity.getComponent('STATE-MACHINE');

        humanStats.thirst += 2 * delta;
        humanStats.fatigue = Math.max(0, humanStats.fatigue + (4 * delta));

        this.timePassedLumberjack += 1 * delta;

        if (hasBag) {

            if (this.tree && wc.hasEntity(this.tree.id)) {
                const life = <TreeLifecycleComponent>this.tree.getComponent('TREE-LIFECYCLE');
                life.availability = Math.max(0, life.availability - 1 * delta / 2)

                // if (life.cutting >= life.maxCutting) {
                //     const localFsm = stateMachine.getFSM().currentState.localFsm;
                //     localFsm && localFsm.changeState(new WalkToTreeState());
                // }

                if (life.availability > 0 && hasBag.wood < hasBag.maxWood) {
                    hasBag.wood += 1 * delta / 2;
                } else if (hasBag.wood < hasBag.maxWood) {
                    const localFsm = stateMachine.getFSM().currentState.localFsm;
                    localFsm && localFsm.changeState(new WalkToTreeState());
                }

            } else {
                const localFsm = stateMachine.getFSM().currentState.localFsm;
                localFsm && localFsm.changeState(new WalkToTreeState());
            }
        }

        if (this.timePassedLumberjack >= this.maxTimeLumberjack) {
            // set first to ho rest so after deposit he eventually go rest (revert state)
            // stateMachine.getFSM().changeState(new GoRest());
            stateMachine.getFSM().revert();
        }

    }

    exit(entity:Miner) {
        if (this.tree) {
            const life = <TreeLifecycleComponent>this.tree.getComponent('TREE-LIFECYCLE');
            life.cutting = Math.max(life.cutting - 1, 0);
            this.tree = null;
        }
    }

    onMessage(owner:any, telegram:Telegram):boolean {
        return true;
    }

}