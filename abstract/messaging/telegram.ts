import {Message} from "./message";

export class Telegram {

  senderId:string;
  receiverId:string;
  message:Message;
  dispatchTime:number;

  payload:any;

  constructor(senderId:string, receiverId:string, message:Message, dispatchTime:number, payload:any) {
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.message = message;
    this.dispatchTime = dispatchTime;
    this.payload = payload;
  }

}

export const telegramSort = (a:Telegram, b:Telegram):1|-1|0 => {
  if (a.dispatchTime > b.dispatchTime) {
    return 1;
  }
  if (a.dispatchTime < b.dispatchTime) {
    return -1;
  }
  return 0;
}
