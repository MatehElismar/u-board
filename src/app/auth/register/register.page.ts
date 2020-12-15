import { AfterViewInit, Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { FormComponentBase } from "mateh-ng-m-validation";
import { StudentRecord } from "src/app/models/student-record";
import { AppService } from "src/app/services/app.service";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"],
})
export class RegisterPage extends FormComponentBase implements OnInit, AfterViewInit {
  validationMessages = {};

  admissionForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private app: AppService,
    private afs: AngularFirestore,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    super();
  }

  ngOnInit() {
    this.admissionForm = this.fb.group({
      names: ["", Validators.required],
      lastnames: ["", Validators.required],
      cedula: ["", Validators.required, this.cedulaValidator],
      birthdate: ["", Validators.required],
      gender: ["", Validators.required],
      career: ["", Validators.required],
    });
  }

  ngAfterViewInit() {
    this.startControlMonitoring(this.admissionForm);
  }

  save() {
    if (this.admissionForm.valid) {
      const v = this.admissionForm.value;
      this.auth
        .createUser(
          {
            displayName: v.fullname,
            role: "student",
            disabled: false,
            email: v.email,
            cellphone: v.cellphone,
          },
          v.cedula
        )
        .subscribe(
          async (res) => {
            console.log("register", res);
            if (res.error.errorInfo) {
              this.app.loading.dismiss();
              const alert = await this.app.createErrorAlert(res.error.errorInfo, ["Ok"]);
              alert.present();
            } else {
              const recordID = this.app.generatePushID();
              const record: StudentRecord = {
                id: recordID,
                cedula: v.cedula,
                uid: res.data.uid,
                birthdate: v.birthdate,
                career: v.carrer,
                gender: v.gender,
                names: v.names,
                lastnames: v.lastnames,
                address: {
                  province: v.province,
                  streetName: v.streetName,
                  streetNumber: v.streetName,
                },
              };

              try {
                await this.afs.doc(`student-records/${recordID}`).set(record);
                this.app.loading.dismiss();
                const alert = await this.alertCtrl.create({
                  header: "Exito",
                  subHeader: "Verifique su cuenta",
                  message: "Hemos enviado un correo de verificacion a " + v.email,
                  buttons: ["Ok"],
                });
                alert.present();
                this.router.navigate(["/user/documents"]);
              } catch (err) {
                const alert = await this.app.createErrorAlert(err, ["Ok"]);
                alert.present();
              }
            }
          },
          (err) => {
            this.app.loading.dismiss();
            console.error("google err", err);
            this.app.createErrorAlert(err, ["Ok"]).then((a) => {
              a.present();
            });
          }
        );
    } else this.showErrors(this.admissionForm);
  }
}
