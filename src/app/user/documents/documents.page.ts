import { Component, ElementRef, NgZone, OnInit, ViewChild } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { AlertController, ToastController } from "@ionic/angular";
import * as firebase from "firebase";
import { finalize } from "rxjs/operators";
import { StudentRecord } from "src/app/models/student-record";
import { UDocument } from "src/app/models/udocument";
import { User } from "src/app/models/user.model";
import { AppService } from "src/app/services/app.service";
import { AuthService } from "src/app/services/auth.service";
import { SubSink } from "subsink/dist/subsink";

@Component({
  selector: "app-documents",
  templateUrl: "./documents.page.html",
  styleUrls: ["./documents.page.scss"],
})
export class DocumentsPage implements OnInit {
  @ViewChild("upload", { static: true, read: ElementRef }) fileInput: ElementRef;
  validationMessages = {};
  studentRecord: StudentRecord;
  user: User;
  subs = new SubSink();
  documents: { [name: string]: { name: string; files: File[]; url: string } } = {};
  selectedDocument: string;

  constructor(
    private auth: AuthService,
    private app: AppService,
    private afs: AngularFirestore,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private storage: AngularFireStorage,
    private ngZone: NgZone,
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit() {
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
        });
    });
  }

  getFileUrl(docName: string) {
    return this.documents[docName]?.url;
  }

  cancelUpload(docName: string) {
    if (this.documents[docName]) {
      this.documents[docName].files = null;
      this.documents[docName].url = "";
    }
  }

  onFileChanged(e) {
    console.log(e);
    let url = null;
    const files = [...e.target.files].map((f) => {
      this.ngZone.run(() => {
        const z = f as Blob;
        url = this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(z));
      });
      return f;
    });
    // if (this.documents[this.selectedDocument]) {
    this.documents[this.selectedDocument] = {
      files,
      url,
      name: this.selectedDocument,
    };
    this.selectedDocument = null;
    // }
    console.log("documents", this.documents);
  }

  uploadFile(docName: string) {
    console.log(docName);
    this.fileInput.nativeElement.click();
    this.selectedDocument = docName;
  }

  async sendFiles(docName: string) {
    await this.app.createLoading();
    this.app.loading.present();
    for (const file of this.documents[docName].files) {
      const billID = this.app.generatePushID();
      const fileRef = this.storage.ref(`/url/${billID}/`);
      const uploadTask = fileRef.put(file);

      // get notified when the download URL is available
      this.subs.sink = uploadTask
        .snapshotChanges()
        .pipe(
          finalize(
            () =>
              (this.subs.sink = fileRef.getDownloadURL().subscribe(
                async (url) => {
                  console.log("download url", url);

                  // if (url.length === this.documents[docName].files.length) {
                  try {
                    await this.afs.doc(`student-records/${this.studentRecord.id}`).update({
                      [`documents.${docName}`]: {
                        url,
                        status: "sent",
                      },
                    });
                    const toast = await this.toastCtrl.create({
                      message: "Exito!!",
                    });
                    toast.present();
                    this.cancelUpload(docName);
                  } catch (err) {
                    const alert = await this.app.createErrorAlert(err, ["Ok"]);
                    alert.present();
                  } finally {
                    this.app.loading.dismiss();
                  }
                  // }
                },
                async (err) => {
                  const alert = await this.app.createErrorAlert(err, ["Ok"]);
                  alert.present();
                }
              ))
          )
        )
        .subscribe();
    }
  }
}
