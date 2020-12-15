import { Injectable } from "@angular/core";
import { DocumentReference } from "@angular/fire/firestore";
import { LoadingController, AlertController, ToastController } from "@ionic/angular";
import { Clipboard } from "@capacitor/core";

@Injectable({
  providedIn: "root",
})
export class AppService {
  loading: HTMLIonLoadingElement;

  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastController: ToastController
  ) {
    this.createLoading();
  }

  // Modeled after base64 web-safe chars, but ordered by ASCII.
  PUSH_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";

  // Timestamp of last push, used to prevent local collisions if you push twice in one ms.
  lastPushTime = 0;

  // We generate 72-bits of randomness which get turned into 12 characters and appended to the
  // timestamp to prevent collisions with other clients.  We store the last characters we
  // generated because in the event of a collision, we'll use those same characters except
  // "incremented" by one.
  lastRandChars = [];

  generatePushID() {
    var now = new Date().getTime();
    var duplicateTime = now === this.lastPushTime;
    this.lastPushTime = now;

    var timeStampChars = new Array(8);
    for (var i = 7; i >= 0; i--) {
      timeStampChars[i] = this.PUSH_CHARS.charAt(now % 64);
      // NOTE: Can't use << here because javascript will convert to int and lose the upper bits.
      now = Math.floor(now / 64);
    }
    if (now !== 0) throw new Error("We should have converted the entire timestamp.");

    var id = timeStampChars.join("");

    if (!duplicateTime) {
      for (i = 0; i < 12; i++) {
        this.lastRandChars[i] = Math.floor(Math.random() * 64);
      }
    } else {
      // If the timestamp hasn't changed since last push, use the same random number, except incremented by 1.
      for (i = 11; i >= 0 && this.lastRandChars[i] === 63; i--) {
        this.lastRandChars[i] = 0;
      }
      this.lastRandChars[i]++;
    }
    for (i = 0; i < 12; i++) {
      id += this.PUSH_CHARS.charAt(this.lastRandChars[i]);
    }
    if (id.length != 20) throw new Error("Length should be 20.");

    return id;
  }

  async createLoading() {
    this.loading = await this.loadingCtrl.create({
      animated: true,
      backdropDismiss: true,
      message: "Please Wait...",
      showBackdrop: true,
    });
  }

  createErrorAlert(err: any, buttons: any[]) {
    console.log(JSON.stringify(err));
    return this.alertCtrl.create({
      header: err?.name || err?.code || err?.title,
      message: err?.message,
      buttons,
    });
  }

  async getRef<T>(ref: any) {
    const d = await (ref as DocumentReference).get();
    return d.data() as T;
  }

  async copyToClipboard(text: string) {
    await Clipboard.write({ string: text });
    const toast = await this.toastController.create({
      animated: true,
      message: "Copiado al portapapeles: " + text,
      duration: 3000,
    });

    toast.present();
  }
}
