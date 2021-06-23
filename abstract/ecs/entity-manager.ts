import { Singleton } from "../singleton";
import {GameEntity} from "./game-entity";

class EntityManagerInstance {
  entities:Map<string, GameEntity> = new Map();
}

export const EntityManager = Singleton(EntityManagerInstance);
