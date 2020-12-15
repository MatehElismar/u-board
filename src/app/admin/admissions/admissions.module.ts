import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AdmissionsPageRoutingModule } from "./admissions-routing.module";

import { AdmissionsPage } from "./admissions.page";
import { NgMDatatableModule } from "mateh-ng-m-datatable";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, NgMDatatableModule, AdmissionsPageRoutingModule],
  declarations: [AdmissionsPage],
})
export class AdmissionsPageModule {}
