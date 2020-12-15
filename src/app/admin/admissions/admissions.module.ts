import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdmissionsPageRoutingModule } from './admissions-routing.module';

import { AdmissionsPage } from './admissions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdmissionsPageRoutingModule
  ],
  declarations: [AdmissionsPage]
})
export class AdmissionsPageModule {}
