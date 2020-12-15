import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import firebase from "firebase";
import { Observable, of } from "rxjs";
import { environment } from "src/environments/environment";
import { AppService } from "./app.service";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { AngularFireAuth } from "@angular/fire/auth";
import { Role, User } from "../models/user.model";

import { map, switchMap, take, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  user$: Observable<User>;

  ADMIN_UID = "RwAXHUHHoTeimc3WT2RJiYvkSSj1";

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private fireFunctions: AngularFireFunctions,
    private app: AppService
  ) {
    // Get the auth state, then fetch the Firestore user document or return null

    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        // Logged in
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          // Logged out
          return of(null);
        }
      })
    );
  }

  sendPasswordResetEmail(email: string) {
    return this.afAuth.sendPasswordResetEmail(email, {
      url: environment.production ? "u-board-e625a.web.app/auth/login" : "http://localhost:4200/auth/login",
    });
  }

  createUser(user: User, password?: string) {
    const callable = this.fireFunctions.httpsCallable("createUser");
    return callable({ ...user, ...(password ? { password } : {}) }).pipe(
      tap((userRecord) => {
        if (!userRecord.errorInfo) {
          this.updateUserData(
            { ...userRecord, cellphone: user.cellphone, country: user.country },
            user.role,
            true
          ).then(() => {
            // if (user.role !== "student") {
            this.sendPasswordResetEmail(userRecord.email);
            // }
          });
        }
      })
    );
  }

  enableUser(uid: string, role: Role) {
    const callable = this.fireFunctions.httpsCallable("enableUser");
    return callable({ uid }).pipe(
      tap((userRecord) => {
        if (!userRecord.errorInfo) {
          this.updateUserData(userRecord, role).then(() => {});
        }
      })
    );
  }

  disableUser(uid: string, role: Role) {
    const callable = this.fireFunctions.httpsCallable("disableUser");
    return callable({ uid }).pipe(
      tap((userRecord) => {
        if (!userRecord.errorInfo) {
          this.updateUserData(userRecord, role).then(() => {});
        }
      })
    );
  }

  async googleSignin() {
    await this.app.createLoading();
    this.app.loading.present();
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.afAuth
      .signInWithPopup(provider)
      .then(async (credential) => {
        this.app.loading.dismiss();
        console.log("credential", credential);

        if (credential) {
          await this.updateUserData(credential.user, "student", credential.additionalUserInfo.isNewUser);
          return credential.user;
        }
        // else return null;
        // this.app.loading.dismiss()
        // this.appRef.tick();
      })
      .catch(async (err) => {
        console.log(err);
        this.app.loading.dismiss();
        const alert = await this.app.createErrorAlert(err, ["Ok"]);
        alert.present();
        return err;
      });
  }

  async nativeGoogleSignin(token: string) {
    await this.app.createLoading();
    this.app.loading.present();
    return this.afAuth
      .signInWithCustomToken(token)
      .then((credential) => {
        this.app.loading.dismiss();
        console.log("credential", credential);

        if (credential) {
          return this.updateUserData(credential.user, "student", credential.additionalUserInfo.isNewUser);
        }
        // this.app.loading.dismiss()
        // this.appRef.tick();
      })
      .catch(async (err) => {
        console.log(err);
        this.app.loading.dismiss();
        const alert = await this.app.createErrorAlert(err, ["Ok"]);
        alert.present();
        throw err;
      });
  }

  async facebookSignin() {
    await this.app.createLoading();
    this.app.loading.present();
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.afAuth
      .signInWithPopup(provider)
      .then((credential) => {
        this.app.loading.dismiss();
        console.log("credential", credential);
        if (credential) return this.updateUserData(credential.user, "student", credential.additionalUserInfo.isNewUser);
        // this.app.loading.dismiss()
        // this.appRef.tick();
      })
      .catch(async (err) => {
        console.log(err);
        this.app.loading.dismiss();
        const alert = await this.app.createErrorAlert(err, ["Ok"]);
        alert.present();
        throw err;
      });
  }

  async localSignin(email, password) {
    await this.app.createLoading();
    this.app.loading.present();
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .finally(() => {
        this.app.loading.dismiss();
      })
      .then((credential) => {
        console.log("credential", credential);
        /*  */ // this.app.loading.dismiss()
        // this.appRef.tick();
      })
      .catch(async (err) => {
        this.app.loading.dismiss();
        const alert = this.app.createErrorAlert(err, ["Ok"]);
        (await alert).present();
        throw err;
      });
  }

  affiliateEmailToUser(uid: string, email: string) {
    const callable = this.fireFunctions.httpsCallable("affiliateEmailToUser");
    return callable({ uid, email });
  }

  updateUserData(user, role: Role, isNew: boolean = false) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    console.log(user);
    const data: User = {
      uid: user.uid,
      email: (user.email && user.email.toLowerCase()) || "",
      displayName: user.displayName,
      photoURL: user.photoURL,
      disabled: !!user.disabled,
      ...(isNew ? { role } : {}), //Solo cambiamos el role si es un usuario nuevo; de lo contrario no.
      ...(user.country ? { country: user.country } : {}),
      ...(user.cellphone ? { cellphone: user.cellphone } : {}),
    };

    console.log(data);
    return userRef.set(data, { merge: true });
  }

  async signOut() {
    await this.afAuth.signOut();
    this.router.navigate(["/auth/login"]);
  }

  isLoggedIn() {
    return this.user$.pipe(
      take(1),
      map((user) => !!user), // <-- map to boolean
      tap((loggedIn) => {
        if (!loggedIn) {
          console.log("access denied");
          this.router.navigate(["/auth/login"]);
        }
      })
    );
  }

  goToApp(role: Role) {
    const url = role == "admin" ? "/socios" : "/socios";
    this.router.navigateByUrl(url);
  }

  // GENERATE AUTH USERS IN THE EMULATOR AUTH OFF THE USERS IN FIRESTORE.
  populateAuthUsers() {
    const callable = this.fireFunctions.httpsCallable("populateAuthUsers");
    return callable({});
  }
}
