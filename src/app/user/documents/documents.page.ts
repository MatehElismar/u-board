import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";
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
  documents: Array<{ name: string; files: File[], urls: string[]}>;
  selectedDocument: string;

  constructor(
    private auth: AuthService,
    private app: AppService,
    private afs: AngularFirestore,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {
    this.subs.sink = this.auth.user$.subscribe((user) => {
      this.user = user;

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

  getFileUrl (docName: string){
    const document = this.documents.find((x) => (x.name == docName));
    return document.urls;
  }

  cancelUpload (docName: string){
    const i = this.documents.findIndex((x) => x.name == docName);
    this.documents[i].files = null;
    this.documents[i].urls = [];
  }

  onFileChanged(e) {
    const i = this.documents.findIndex((x) => x.name == this.selectedDocument);
    if (i > -1) {
      this.documents[i].files = e.files;
    } else this.documents.push({ name: this.selectedDocument, files: e.files, urls:[]});
    this.selectedDocument = null;
  }


  uploadFile(docName: string) {
    this.fileInput.nativeElement.click();
    this.selectedDocument = docName;
  }

  async sendFiles(docName: string) {
    const urls: string[] = [];
    const document = this.documents.find((x) => (x.name = docName));
    await this.app.createLoading();
    this.app.loading.present();
    for (const file of document.files) {
      const billID = this.app.generatePushID();
      const fileRef = this.storage.ref(`/urls/${billID}/`);
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
                  urls.push(url);

                  if (urls.length === document.files.length) {
                    const obj = {};
                    obj[docName] = {
                      urls,
                      status: "sent",
                    } as UDocument;

                    try {
                      this.afs.doc(`student-records/${this.studentRecord.id}`).update({
                        [`documents.${docName}`]: {
                          urls,
                          status: "sent",
                        },
                      });
                      const toast = await this.toastCtrl.create({
                        message: "Exito!!",
                      });
                      toast.present();
                    } catch (err) {
                      const alert = await this.app.createErrorAlert(err, ["Ok"]);
                      alert.present();
                    } finally {
                      this.app.loading.dismiss();
                    }
                  }
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
