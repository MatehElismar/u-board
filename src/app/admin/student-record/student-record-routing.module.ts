import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudentRecordPage } from './student-record.page';

const routes: Routes = [
  {
    path: '',
    component: StudentRecordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentRecordPageRoutingModule {}
