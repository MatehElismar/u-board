import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NgMDatatable, NgMDatatableOptions } from "mateh-ng-m-datatable";

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
      { id: "createdAt", text: "Fecha" },
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
  constructor(private router: Router) {}

  ngOnInit() {}
}
