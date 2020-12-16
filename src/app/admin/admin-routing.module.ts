import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "admissions",
    loadChildren: () => import("./admissions/admissions.module").then((m) => m.AdmissionsPageModule),
  },
  {
    path: 'student-record',
    loadChildren: () => import('./student-record/student-record.module').then( m => m.StudentRecordPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
