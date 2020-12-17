import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-student-record',
  templateUrl: './student-record.page.html',
  styleUrls: ['./student-record.page.scss'],
})
export class StudentRecordPage implements OnInit {

  constructor(private alertCtrl: AlertController,) { }

  ngOnInit() {
  }

  async ReturnDocument() {
    const alert = await this.alertCtrl.create({
      header: "Confirmacion",
      message: "Razon por la cual no se puede recibir.",
      inputs: [
        {
          name: "reason",
          label: "Motivo",
          placeholder: "Motivo",
          type: "text",
        },
      ],
      buttons: [
        { text: "Cancelar", role: "cancel" },
        { text: "Revocar", role: "ok" },
      ],
    });
    alert.present();
    const alertData = await alert.onDidDismiss();
    if (alertData.role == "ok") {
        //condition
    }
  }

}
