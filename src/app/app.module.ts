import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './base/header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { NgbDropdown, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { InicioComponent } from './base/inicio/inicio.component';
import { FooterComponent } from './base/footer/footer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {APP_BASE_HREF} from '@angular/common';
import { ObjetoMbeComponent } from './objeto-mbe/objeto-mbe.component';
import { BarraAzulComponent } from './base/barra-azul/barra-azul.component';
import { LoginComponent } from './base/login/login.component';
import { NavSideComponent } from './base/nav-side/nav-side.component';
import { ListarUsuariosComponent } from './usuarios/listar-usuarios/listar-usuarios.component';
import { ListarGmbeComponent } from './gmbe/listar-gmbe/listar-gmbe.component';
import { CrearGmbeComponent } from './gmbe/crear-gmbe/crear-gmbe.component';
import { StartBardComponent } from './base/start-bard/start-bard.component';
import { BurbujasComponent } from './graficas/burbujas/burbujas.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    InicioComponent,
    FooterComponent,
    ObjetoMbeComponent,
    BarraAzulComponent,
    LoginComponent,
    ListarUsuariosComponent,
    NavSideComponent,
    StartBardComponent,
    ListarGmbeComponent,
    CrearGmbeComponent,
    BurbujasComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    FontAwesomeModule,
    HttpClientModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot()
  ],
  providers: [{provide: APP_BASE_HREF, useValue: '/GMBE/'}],
  bootstrap: [AppComponent]
})
export class AppModule { }
