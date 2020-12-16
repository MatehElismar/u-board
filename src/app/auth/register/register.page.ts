import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatStepper } from "@angular/material/stepper";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import { Router } from "@angular/router";
import { AlertController, ToastController } from "@ionic/angular";
import { FormComponentBase } from "mateh-ng-m-validation";
import { StudentRecord } from "src/app/models/student-record";
import { AppService } from "src/app/services/app.service";
import { AuthService } from "src/app/services/auth.service";
import * as moment from "moment";

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class RegisterPage extends FormComponentBase implements OnInit, AfterViewInit {

  validationMessages = {
    names: { required: "Campo Requerido" },
    lastnames: { required: "Campo Requerido" },
    email: { required: "Campo Requerido" },
    cedula: { required: "Campo Requerido" },
    birthdate: { required: "Campo Requerido" },
    gender: { required: "Campo Requerido" },
    streetName: { required: "Campo Requerido" },
    streetNumber: { required: "Campo Requerido" },
    neighborhood: { required: "Campo Requerido" },
    municipality: { required: "Campo Requerido" },
    province: { required: "Campo Requerido" },
    nationality: { required: "Campo Requerido" },
    civil_status: { required: "Campo Requerido" },
    study_type: { required: "Campo Requerido" },
    career: { required: "Campo Requerido" },
    highSchool_name: { required: "Campo Requerido" },
    blood_type: { required: "Campo Requerido" },
  };

  admissionForm: FormGroup;
  academicForm: FormGroup;
  medicalForm: FormGroup;
  familyForm: FormGroup;
  isPersonalInfoDone: boolean = false;
  isAcademicInfoDone: boolean = false;
  isMedicalInfoDone: boolean = false;
  isFamilyInfoDone: boolean = false;
  @ViewChild("stepper") stepper: MatStepper;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private app: AppService,
    private afs: AngularFirestore,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    super();
  }

  ngOnInit() {
    this.admissionForm = this.fb.group({
      names: ["", [Validators.required]],
      lastnames: ["", [Validators.required]],
      cedula: ["", [Validators.required, /* this.cedulaValidator */]],
      birthdate: [{ value: "", disabled: true }, [Validators.required]],
      gender: ["", [Validators.required]],
      email: ["", [Validators.required]],
      cellphone: [""],
      telephone: [""],
      streetName: ["", [Validators.required]],
      streetNumber: ["", [Validators.required]],
      neighborhood: ["", [Validators.required]],
      municipality: ["", [Validators.required]],
      province: ["", [Validators.required]],
      nationality: ["", [Validators.required]],
      religion: [""],
      civil_status: ["", [Validators.required]]
    });

    this.academicForm = this.fb.group({
      study_type: ["", [Validators.required]],
      career: ["", [Validators.required]],
      highSchool_name: ["", [Validators.required]],
      grade_career: [""],
      previousUniversity_name: [""],
      previousUniversity_career: [""]
    });

    this.medicalForm = this.fb.group({
      blood_type: ["", [Validators.required]],
      isAlergic: [""],
      disease: [""]
    });

    this.familyForm = this.fb.group({
      father_names: [""],
      father_lastnames: [""],
      father_telephone: [""],
      father_occupation: [""],
      father_civil_status: [""],
      mother_names: [""],
      mother_lastnames: [""],
      mother_telephone: [""],
      mother_occupation: [""],
      mother_civil_status: [""],
      wife_or_husband_names: [""],
      wife_or_husband_lastnames: [""],
      wife_or_husband_telephone: [""],
      wife_or_husband_occupation: [""]
    });
  }

  ngAfterViewInit() {
    this.startControlMonitoring(this.admissionForm);
  }

  admissionInfoDone() {

    this.admissionForm.get('birthdate').enable();
    const myBdate = moment(this.admissionForm.value.birthdate).toLocaleString();
    //this.admissionForm.get('birthdate').setValue(myBdate);

    const myAdmForm = this.admissionForm.value;
    myAdmForm.birthdate = myBdate;

    console.log(myAdmForm);

    if (this.admissionForm.valid) {

      const v = myAdmForm;
      this.auth
        .createUser(
          {
            displayName: v.names + " " + v.lastnames,
            role: "student",
            disabled: false,
            email: v.email,
            cellphone: v.cellphone,
          },
          v.cedula
        )
        .subscribe(
          async (user) => {
            console.log("register", user);
            const record: StudentRecord = {
              id: this.app.generatePushID(),
              cedula: v.cedula,
              email: v.email,
              uid: user.uid,
              birthdate: v.birthdate.toDate().valueOf(),
              gender: v.gender,
              names: v.names,
              lastnames: v.lastnames,
              // address: {
              //   province: v.province,
              //   streetName: v.streetName,
              //   streetNumber: v.streetNumber,
              // },
            };

            try {
              await this.auth.localSignin(user.email, record.cedula);
              await this.afs.doc<StudentRecord>(`student-records/${record.id}`).set(record);
              const toast = await this.toastCtrl.create({
                message: "Information saved!",
                color: "dark",
              });
              toast.present();

              this.nextStep(); //Go to next step
            } catch (err) {
              const alert = await this.app.createErrorAlert(err, ["Ok"]);
              alert.present();
            }

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
          },
          (err) => {
            this.app.loading.dismiss();
            console.error("google err", err);
            this.app.createErrorAlert(err, ["Ok"]).then((a) => {
              a.present();
            });
          }
        );
    } else {
      this.showErrors(this.admissionForm);
    }
    // console.log(this.formErrors);
  }

  academicInfoDone() {

    this.isAcademicInfoDone = true;

    setTimeout(() => {
      this.stepper.next();
    }, 1);
  }

  medicalInfoDone() {

    this.isMedicalInfoDone = true;

    setTimeout(() => {
      this.stepper.next();
    }, 1);
  }

  familyInfoDone() {

    this.isFamilyInfoDone = true;

    setTimeout(() => {
      this.stepper.next();
    }, 1);
  }

  nextStep() { }
}
