import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { LoginPageRoutingModule } from "./login-routing.module";

import { LoginPage } from "./login.page";
import {MatInputModule} from '@angular/material/input';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, LoginPageRoutingModule,MatInputModule],
  declarations: [LoginPage],
})
export class LoginPageModule {}
