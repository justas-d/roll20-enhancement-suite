let chat_firebase: any = null;

type Callback = (ref: FirebaseReference<ChatMessage>, key: string) => void;

export class OnChatMessage {

  callback: Callback | null;
  internal_callback: Callback | null;

  on(cb: Callback) {
    if(this.callback) {
      console.assert(false);
    }

    this.callback = cb;
    this.internal_callback = (data: FirebaseReference<ChatMessage>, key: string) => {
      const msg_timestamp = data.getPriority();
      const now = (new Date).getTime();

      const delta = now - msg_timestamp;

      //console.log(msg_timestamp, now, delta, data, key);

      // NOTE(justasd): @HACK but whatever for now.
      if(delta <= 2000) {
        this.callback(data, key);
      }
    }

    if(chat_firebase == null) {
      // @ts-ignore
      const firebase = new Firebase(window.FIREBASE_ROOT + window.campaign_storage_path + "/chat/");

      chat_firebase = firebase;
    }

    chat_firebase.on("child_added", this.internal_callback);
  }

  off() {
    chat_firebase.off("child_added", this.internal_callback);
    this.callback = null;
    this.internal_callback = null;
  }
}
