import { Component, OnInit, ViewChild } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { NgMDatatable, NgMDatatableOptions } from "mateh-ng-m-datatable";
import { Admission } from "src/app/models/admision";
import { User } from "src/app/models/user.model";
import { AppService } from "src/app/services/app.service";
import { AuthService } from "src/app/services/auth.service";

export interface AdmissionTable {
  id: string;
  student: string;
  date: string;
  status: string;
}

@Component({
  selector: "app-admissions",
  templateUrl: "./admissions.page.html",
  styleUrls: ["./admissions.page.scss"],
})
export class AdmissionsPage implements OnInit {
  @ViewChild("dataTable") DataTable: NgMDatatable<AdmissionTable>;

  dtOptions: NgMDatatableOptions<AdmissionTable> = {
    title: "Admissions",
    // addButton: {
    //   icon: "add",
    //   handler: () => {
    //     this.router.navigate(["/financiamientos/new"]);
    //   },
    // },
    columns: [
      { id: "id", text: "ID" },
      { id: "student", text: "Estudiante" },
      { id: "date", text: "Fecha" },
      { id: "status", text: "Estado De la Admision", type: "badge" },
      {
        id: "action",
        text: "Actions",
        type: "action",
        actions: [
          {
            text: "More Info",
            icon: "add",
            handler: (data) => {
              this.router.navigate(["/admin/student-record/" + data.id]);
            },
          },
        ],
      },
    ],
    displayedColumns: ["id", "student", "date", "action"],
  };

  admissions = new Array<AdmissionTable>();
  constructor(private afs: AngularFirestore, private router: Router, private app: AppService) {}

  ngOnInit() {
    this.afs
      .collection<Admission>("admissions")
      .valueChanges()
      .subscribe(async (admissions) => {
        this.admissions = await Promise.all(
          admissions.map<Promise<AdmissionTable>>(async (a) => ({
            id: a.id,
            date: a.date.toDate().toDateString(),
            status: a.status,
            student: (await this.app.getRef<User>(this.afs.doc(`users/${a.uid}`).ref)).displayName,
          }))
        );
      });
  }
}
