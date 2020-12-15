import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdmissionsPage } from './admissions.page';

const routes: Routes = [
  {
    path: '',
    component: AdmissionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdmissionsPageRoutingModule {}
