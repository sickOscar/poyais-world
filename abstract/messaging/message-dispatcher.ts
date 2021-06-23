import {Message} from "./message";
import {GameEntity} from "../ecs/game-entity";
import {EntityManager} from "../ecs/entity-manager";
import {Telegram, telegramSort} from "./telegram";
import {Singleton} from "../singleton";

class MessageDispatcherInstance {

  public priorityQueue:Telegram[] = [];

  private discharge(receiver:GameEntity, telegram:Telegram) {

  }

  dispatchMessage(senderId:string, receiverId:string, message:Message, delay:number, payload:any): void {

    const dispatchTime = (+new Date()) + delay;
    const telegram = new Telegram(senderId, receiverId, message, dispatchTime, payload);

    if (delay === 0) {
      const entityReceiver = EntityManager.entities.get(receiverId) as GameEntity;
      this.discharge(entityReceiver, telegram);
    } else {
      this.priorityQueue.push(telegram);
      this.priorityQueue.sort(telegramSort)
    }

  }

  dispatchDelayedMessages(): void {

    const now = +new Date();

    while (this.priorityQueue[0] && this.priorityQueue[0].dispatchTime < now) {
      const telegram = this.priorityQueue[0];
      const receiver = EntityManager.entities.get(telegram.receiverId) as GameEntity
      this.discharge(receiver, telegram);
      this.priorityQueue.shift();
    }

  }
}


export const MessageDispatcher = Singleton(MessageDispatcherInstance);
