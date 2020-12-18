import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { StudentRecord } from 'src/app/models/student-record';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-student-record',
  templateUrl: './student-record.page.html',
  styleUrls: ['./student-record.page.scss'],
})
export class StudentRecordPage implements OnInit {

  theID: string;
  theMainRecord;
  bDate;

  constructor(
    private alertCtrl: AlertController,
    private router: Router,
    private app: AppService,
    private afs: AngularFirestore,
    private _activatedRoute: ActivatedRoute,) {

    this._activatedRoute.params.subscribe(params => {
      this.theID = params.id;
      this.getStudentRecord(params.id);
    });
  }

  ngOnInit() {
    // this.getStudentRecord(this.theID);
  }

  getStudentRecord(id: string) {
    let data: any;

    const sR = this.afs.doc<StudentRecord>(`admissions/${id}`).valueChanges()
      .pipe(
        map(response => {
          data = response;
          return { id, ...data };
        })
      );

    sR.subscribe(sRecord => {
      this.afs.collection('student-records', ref => {
        return ref.where('uid', '==', sRecord.uid)
      }).snapshotChanges()
        .pipe(
          map(actions =>
            actions.map(response => {
              const data = response.payload.doc.data() as StudentRecord;
              const id = response.payload.doc.id;
              return { id, ...data };
            })
          )
        ).subscribe(theRecord => {
          this.bDate = moment(theRecord[0].birthdate).locale('es').format('ll');
          this.theMainRecord = theRecord[0];
        });
    });
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
