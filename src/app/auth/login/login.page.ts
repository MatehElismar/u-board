import { AfterViewInit, Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AlertController, Platform } from "@ionic/angular";
import { FormComponentBase } from "mateh-ng-m-validation";
import { AppService } from "src/app/services/app.service";
import { AuthService } from "src/app/services/auth.service";
import { SubSink } from "subsink/dist/subsink";
import { Plugins } from "@capacitor/core";
const { Keyboard } = Plugins;
@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage extends FormComponentBase implements OnInit, AfterViewInit {
  loginForm: FormGroup;
  subs = new SubSink();
  validationMessages = {
    email: { required: "email is required" },
    password: { required: "password  is required" },
  };

  recover = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private app: AppService,
    private afs: AngularFirestore,
    private router: Router,
    private alertCtrl: AlertController,
    private platform: Platform
  ) {
    super();
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required]],
      password: ["", [Validators.required]],
    });

    this.subs.sink = this.auth.user$.subscribe(async (user) => {
      console.log(user);
      // Con la segunda condicion evitamos acceso a la pagina sin que los usuarios de facebook provean su email.
      const logged = user && user.email !== "";
      // si estamos en la pagina login y ya estamos logueados nos dirijimos a nuestra main page
      if (logged) {
        const notPayed = await this.afs
          .collection("shares", (ref) => ref.where("uid", "==", user.uid).where("status", "in", ["not-paid", "paying"]))
          .get()
          .toPromise();
        if (notPayed.docs.length > 0) this.router.navigate(["socios/cupos"]);
        else {
          const hasShares = await this.afs
            .collection("shares", (ref) =>
              ref
                .where("uid", "==", user.uid)
                .where("status", "in", ["started", "on-process", "on-process-admin", "settled", "settled-admin"])
            )
            .get()
            .toPromise();
          if (hasShares.docs.length > 0) this.router.navigate(["socios/dashboard"]);
          else {
            this.router.navigate(["socios/cupos"]);
          }
        }
        // if ((user.role && user.role != "") || (user.role === "" && user.paypalEmail)) {
        // this.auth.goToApp(user.role);
        // } else if (user.role) {
        // this.router.navigate(["/user/reload-balance"]);
        // }
      }
    });
  }

  ngAfterViewInit() {
    this.startControlMonitoring(this.loginForm);
  }

  forgotPass() {
    if (this.loginForm.value.email)
      this.auth
        .sendPasswordResetEmail(this.loginForm.value.email)
        .then(async () => {
          this.recover = false;
          const alert = await this.alertCtrl.create({
            header: "Exito",
            subHeader: "Recupere su contrase?a",
            message: "Hemos enviado un correo de verificacion a " + this.loginForm.value.email,
            buttons: ["Ok"],
          });
          alert.present();
        })
        .catch((err) => {
          console.error("google err", err);
          this.app.createErrorAlert(err, ["Ok"]).then((a) => {
            a.present();
          });
        });
    else this.showErrors(this.loginForm);
  }

  async logIn() {
    if (this.platform.is("capacitor")) {
      Keyboard.hide();
    }
    if (this.loginForm.valid) {
      await this.app.createLoading();
      // this.app.loading.present();
      await this.auth.localSignin(
        this.loginForm.value.email.trim().toLowerCase(),
        this.loginForm.value.password.trim()
      );
      // .catch(cat);
    } else {
      return this.showErrors(this.loginForm);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
