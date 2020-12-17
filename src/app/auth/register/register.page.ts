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
import * as firebase from "firebase";
import { AuthService } from "src/app/services/auth.service";
import * as moment from "moment";
import { Admission } from "src/app/models/admision";
import { User } from "src/app/models/user.model";
import { SubSink } from "subsink/dist/subsink";

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

  studentRecord: StudentRecord;
  subs = new SubSink();

  @ViewChild("stepper") stepper: MatStepper;
  user: User;

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
      cedula: ["", [Validators.required /* this.cedulaValidator */]],
      birthdate: [{ value: "12/08/1999" }, [Validators.required]],
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
      civil_status: ["(A)", [Validators.required]],
    });

    this.academicForm = this.fb.group({
      study_type: ["", [Validators.required]],
      career: ["", [Validators.required]],
      highSchool_name: ["", [Validators.required]],
      grade_career: ["BACHILLER"],
      previousUniversity_name: [""],
      previousUniversity_career: [""],
    });

    this.medicalForm = this.fb.group({
      blood_type: ["", [Validators.required]],
      isAlergic: [""],
      disease: [""],
    });

    this.familyForm = this.fb.group({
      father_names: ["Text"],
      father_lastnames: ["Text"],
      father_telephone: ["Text"],
      father_occupation: ["Text"],
      father_civil_status: ["Text"],
      mother_names: ["Text"],
      mother_lastnames: ["Text"],
      mother_telephone: ["Text"],
      mother_occupation: ["Text"],
      mother_civil_status: ["Text"],
      wife_or_husband_names: ["Text"],
      wife_or_husband_lastnames: ["Text"],
      wife_or_husband_telephone: ["Text"],
      wife_or_husband_occupation: ["Text"],
    });
    this.subs.sink = this.auth.user$.subscribe((user) => {
      this.user = user;
      console.log(this.user);
      this.subs.sink = this.afs
        .collection<StudentRecord>(`student-records/`, (ref) => ref.where("uid", "==", this.user.uid).limit(1))
        .valueChanges()
        .subscribe(async (records) => {
          await Promise.all(
            records.map((record) => {
              this.studentRecord = record;
            })
          );
          console.log("student record", this.studentRecord);

          this.admissionForm.get("names").patchValue(this.studentRecord.names);
          this.admissionForm.get("lastnames").patchValue(this.studentRecord.lastnames);
          this.admissionForm.get("cedula").patchValue(this.studentRecord.cedula);
          this.admissionForm.get("birthdate").patchValue(this.studentRecord.birthdate);
          this.admissionForm.get("gender").patchValue(this.studentRecord.gender);
          this.admissionForm.get("email").patchValue(this.studentRecord.email);
          this.admissionForm.get("cellphone").patchValue(this.studentRecord.cellphone);
          this.admissionForm.get("telephone").patchValue(this.studentRecord.telephone);
          this.admissionForm.get("streetName").patchValue(this.studentRecord.address.streetName);
          this.admissionForm.get("streetNumber").patchValue(this.studentRecord.address.streetNumber);
          this.admissionForm.get("neighborhood").patchValue(this.studentRecord.address.neighborhood);
          this.admissionForm.get("municipality").patchValue(this.studentRecord.address.municipality);
          this.admissionForm.get("province").patchValue(this.studentRecord.address.province);
          this.admissionForm.get("nationality").patchValue(this.studentRecord.nationality);
          this.admissionForm.get("religion").patchValue(this.studentRecord.religion);
          this.admissionForm.get("civil_status").patchValue(this.studentRecord.civil_status);

          const academic = this.studentRecord.academic;
          this.academicForm.get("study_type").patchValue(academic?.study_type);
          this.academicForm.get("career").patchValue(academic?.career);
          this.academicForm.get("highSchool_name").patchValue(academic?.highSchool_name);
          this.academicForm.get("grade_career").patchValue(academic?.grade_career);
          this.academicForm.get("previousUniversity_name").patchValue(academic?.previousUniversity_name);
          this.academicForm.get("previousUniversity_career").patchValue(academic?.previousUniversity_career);

          const medical = this.studentRecord.medical;
          this.medicalForm.get("blood_type").patchValue(medical?.blood_type);
          this.medicalForm.get("isAlergic").patchValue(medical?.isAlergic);
          this.medicalForm.get("disease").patchValue(medical?.disease);

          const family = this.studentRecord.family;
          this.familyForm.get("father_names").patchValue(family?.father_names);
          this.familyForm.get("father_lastnames").patchValue(family?.father_lastnames);
          this.familyForm.get("father_telephone").patchValue(family?.father_telephone);
          this.familyForm.get("father_occupation").patchValue(family?.father_occupation);
          this.familyForm.get("father_civil_status").patchValue(family?.father_civil_status);
          this.familyForm.get("mother_names").patchValue(family?.mother_names);
          this.familyForm.get("mother_lastnames").patchValue(family?.mother_lastnames);
          this.familyForm.get("mother_telephone").patchValue(family?.mother_telephone);
          this.familyForm.get("mother_occupation").patchValue(family?.mother_occupation);
          this.familyForm.get("mother_civil_status").patchValue(family?.mother_civil_status);
          this.familyForm.get("wife_or_husband_names").patchValue(family?.wife_or_husband_names);
          this.familyForm.get("wife_or_husband_lastnames").patchValue(family?.wife_or_husband_lastnames);
          this.familyForm.get("wife_or_husband_telephone").patchValue(family?.wife_or_husband_telephone);
          this.familyForm.get("wife_or_husband_occupation").patchValue(family?.wife_or_husband_occupation);
        });
    });
  }

  ngAfterViewInit() {
    this.startControlMonitoring(this.admissionForm);
  }

  async saveAdmissionForm(v: any, uid: string) {
    const record: StudentRecord = {
      id: this.app.generatePushID(),
      cedula: v.cedula,
      email: v.email,
      uid: uid,
      birthdate: new Date(v.birthdate).valueOf(),
      names: v.names,
      lastnames: v.lastnames,
      createdAt: firebase.default.firestore.FieldValue.serverTimestamp() as any,
      gender: v.gender,
      cellphone: v.cellphone,
      telephone: v.telephone,
      religion: v.religion,
      nationality: v.nationality,
      civil_status: v.civil_status,
      address: {
        streetName: v.streetName,
        streetNumber: v.streetNumber,
        neighborhood: v.neighborhood,
        municipality: v.municipality,
        province: v.province,
      },
    };

    console.log(record);

    try {
      //  save info into the student reacord
      await this.afs.doc<StudentRecord>(`student-records/${record.id}`).set(record);

      // create an admission request.
      const admissionID = this.app.generatePushID();
      await this.afs.doc<Admission>(`admissions/${admissionID}`).set({
        id: admissionID,
        uid: record.uid,
        status: "filling",
        date: firebase.default.firestore.FieldValue.serverTimestamp() as any,
      });

      const toast = await this.toastCtrl.create({
        message: "Information saved!",
        duration: 2000,
        color: "dark",
      });
      toast.present();

      this.isPersonalInfoDone = true;
    } catch (err) {
      const alert = await this.app.createErrorAlert(err, ["Ok"]);
      alert.present();
    }

    setTimeout(() => {
      this.stepper.next();
    }, 1);
  }

  admissionInfoDone() {
    this.admissionForm.get("birthdate").enable();
    const myBdate = moment(this.admissionForm.value.birthdate).valueOf();
    const myAdmForm = this.admissionForm.value;
    myAdmForm.birthdate = myBdate;
  
    if (this.admissionForm.valid) {
      const v = myAdmForm;
      if (!this.user)
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
              try {
                await this.auth.localSignin(user.email, v.cedula);
                const alert = await this.alertCtrl.create({
                  header: "Exito",
                  subHeader: "Verifique su cuenta",
                  message: "Hemos enviado un correo de verificacion a " + v.email,
                  buttons: ["Ok"],
                });
                alert.present();
              } catch (err) {
                this.app.loading.dismiss();
                console.error("google err", err);
                this.app.createErrorAlert(err, ["Ok"]).then((a) => {
                  a.present();
                });
              }
              this.saveAdmissionForm(v, user.uid);
            },
            (err) => {
              this.app.loading.dismiss();
              console.error("google err", err);
              this.app.createErrorAlert(err, ["Ok"]).then((a) => {
                a.present();
              });
            },
            () => this.app.loading.dismiss()
          );
      else this.saveAdmissionForm(v, this.user.uid);
    } else {
      this.showErrors(this.admissionForm);
    }
  }

  async academicInfoDone() {
    if (this.academicForm.valid) {
      const v = this.academicForm.value;
      const academicRecord: Partial<StudentRecord> = {
        academic: {
          study_type: v.study_type,
          career: v.career,
          highSchool_name: v.highSchool_name,
          grade_career: v.grade_career,
          previousUniversity_name: v.previousUniversity_name,
          previousUniversity_career: v.previousUniversity_career,
        },
      };

      try {
        //  save info into the student reacord
        await this.afs.doc<StudentRecord>(`student-records/${this.studentRecord.id}`).update(academicRecord);

        const toast = await this.toastCtrl.create({
          message: "Information saved!",
          duration: 2000,
          color: "dark",
        });
        toast.present();

        this.isAcademicInfoDone = true;
      } catch (err) {
        const alert = await this.app.createErrorAlert(err, ["Ok"]);
        alert.present();
      }
      setTimeout(() => {
        this.stepper.next();
      }, 1);
    } else {
      this.showErrors(this.academicForm);
    }
  }

  async medicalInfoDone() {
    if (this.medicalForm.valid) {
      const v = this.medicalForm.value;
      console.log(v);
      const medicalRecord: Partial<StudentRecord> = {
        medical: {
          blood_type: v.blood_type,
          isAlergic: v.isAlergic,
          disease: v.disease,
        },
      };

      try {
        //  save info into the student reacord
        await this.afs.doc<StudentRecord>(`student-records/${this.studentRecord.id}`).update(medicalRecord);

        const toast = await this.toastCtrl.create({
          message: "Information saved!",
          duration: 2000,
          color: "dark",
        });
        toast.present();

        this.isMedicalInfoDone = true;
      } catch (err) {
        const alert = await this.app.createErrorAlert(err, ["Ok"]);
        alert.present();
      }
      setTimeout(() => {
        this.stepper.next();
      }, 1);
    } else {
      this.showErrors(this.medicalForm);
    }
  }

  async familyInfoDone() {
    if (this.familyForm.valid) {
      const v = this.familyForm.value;
      const familyRecord: Partial<StudentRecord> = {
        family: {
          father_names: v.father_names,
          father_lastnames: v.father_lastnames,
          father_telephone: v.father_telephone,
          father_occupation: v.father_occupation,
          father_civil_status: v.father_civil_status,
          mother_names: v.mother_names,
          mother_lastnames: v.mother_lastnames,
          mother_telephone: v.mother_telephone,
          mother_occupation: v.mother_occupation,
          mother_civil_status: v.mother_civil_status,
          wife_or_husband_names: v.wife_or_husband_names,
          wife_or_husband_lastnames: v.wife_or_husband_lastnames,
          wife_or_husband_telephone: v.wife_or_husband_telephone,
          wife_or_husband_occupation: v.wife_or_husband_occupation,
        },
      };

      try {
        //  save info into the student reacord
        await this.afs.doc<StudentRecord>(`student-records/${this.studentRecord.id}`).update(familyRecord);

        const toast = await this.toastCtrl.create({
          message: "Information saved!",
          duration: 2000,
          color: "dark",
        });
        toast.present();

        this.isFamilyInfoDone = true;
      } catch (err) {
        const alert = await this.app.createErrorAlert(err, ["Ok"]);
        alert.present();
      }
      setTimeout(() => {
        this.router.navigate(["/user/documents"]);
      }, 1);
    } else {
      this.showErrors(this.familyForm);
    }
  }

  nextStep() {}
}
