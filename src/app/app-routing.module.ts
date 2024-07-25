import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { InicioComponent } from "./base/inicio/inicio.component";
import { LoginComponent } from "./base/login/login.component";
import { ListarUsuariosComponent } from "./usuarios/listar-usuarios/listar-usuarios.component";
import { ListarGmbeComponent } from "./gmbe/listar-gmbe/listar-gmbe.component";
import { CrearGmbeComponent } from "./gmbe/crear-gmbe/crear-gmbe.component";
import { BurbujasComponent } from "./graficas/burbujas/burbujas.component";
import { VistaPreviaComponent } from "./gmbe/vista-previa/vista-previa.component";
import { EditarGmbeComponent } from "./gmbe/editar-gmbe/editar-gmbe.component";
import { AuthGuard } from "./shared/guards/AuthGuardt";

const routes: Routes = [
  { path: "", redirectTo: "inicio", pathMatch: "full" },
  { path: "inicio", component: InicioComponent },
  { path: "login", component: LoginComponent },
  { path: "usuarios", component: ListarUsuariosComponent, canActivate: [AuthGuard] },
  { path: "gmbe", component: ListarGmbeComponent, canActivate: [AuthGuard] },
  { path: "crear-gmbe", component: CrearGmbeComponent, canActivate: [AuthGuard] },
  { path: "editar-gmbe/:id", component: EditarGmbeComponent, canActivate: [AuthGuard] },
  { path: "vista-previa/:id", component: VistaPreviaComponent, canActivate: [AuthGuard] },
  { path: "grafica", component: BurbujasComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: "enabledBlocking",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
