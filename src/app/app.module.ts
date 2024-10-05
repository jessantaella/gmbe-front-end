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
import { VistaPreviaComponent } from './gmbe/vista-previa/vista-previa.component';
import { EditarGmbeComponent } from './gmbe/editar-gmbe/editar-gmbe.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { PanelResultadosComponent } from './gmbe/panel-resultados/listar-panel/listar-panel.component';

import { FormsModule } from '@angular/forms'; 
import { EvaluacionComponent } from './gmbe/evaluacion/evaluacion.component';
import { NgApexchartsModule } from "ng-apexcharts";



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
    NotificacionesComponent,
    ListarGmbeComponent,
    CrearGmbeComponent,
    EditarGmbeComponent,
    BurbujasComponent,
    VistaPreviaComponent,
    PanelResultadosComponent,
    EvaluacionComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    FontAwesomeModule,
    NgApexchartsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    FormsModule
  ],
  providers: [{provide: APP_BASE_HREF, useValue: '/GMBE/'}],
  bootstrap: [AppComponent]
})
export class AppModule { }
