import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatStepper } from "@angular/material/stepper";
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
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
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }],
})
export class RegisterPage extends FormComponentBase implements OnInit, AfterViewInit {

  validationMessages = {
    names: { required: "Los nombres son un campo requerido" },
    lastnames: { required: "Los apellidos son un campo requerido" },
    cedula: { required: "La cédula es un campo requerido" },
    birthdate: { required: "La fecha de nacimiento es un campo requerido" },
    gender: { required: "El género es un campo requerido" },
    career: { required: "La carrera es un campo requerido" },
  };

  admissionForm: FormGroup;
  isPersonalInfoDone: boolean = false;
  @ViewChild('stepper') stepper: MatStepper;

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
    console.log(this.admissionForm.value);
    if (this.admissionForm.valid) {
      const v = this.admissionForm.value;
      this.auth
        .createUser(
          {
            displayName: v.names + ' ' + v.lastnames,
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
                  streetNumber: v.streetNumber,
                },
              };

              this.app.loading.dismiss();
              const alert = await this.alertCtrl.create({
                header: "Exito",
                subHeader: "Verifique su cuenta",
                message: "Hemos enviado un correo de verificacion a " + v.email,
                buttons: ["Ok"],
              });
              alert.present();

              this.isPersonalInfoDone = true;

              setTimeout(() => {
                this.stepper.next();
              }, 1);

              // this.router.navigate(["/auth/login"]);
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
