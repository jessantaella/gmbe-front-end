import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {faUser, faHome } from '@fortawesome/free-solid-svg-icons';
import { CifradoService } from 'src/app/services/cifrado.service';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
import { StorageService } from 'src/app/services/storage-service.service';


@Component({
  selector: 'app-start-bard',
  templateUrl: './start-bard.component.html',
  styleUrls: ['./start-bard.component.scss']
})
export class StartBardComponent {

  abrir = false;
  usuario:any;
  faUser=faUser;
  faHome=faHome;
  abrirAdmin = false;

  constructor(private router: Router,private storage:StorageService, private cifrado:CifradoService, private notificacionesService:NotificacionesService) {
   }

  validaToken(): boolean {
    const token = this.storage.getItem('token-gmbe');
    return token !== null && token !== undefined && token.trim() !== '';
  }
  
  cerrarSesion(){
    this.storage.removeItem('usr');
    this.storage.removeItem('token-gmbe')
    this.storage.removeItem('notificaciones')
    this.storage.removeItem('autorizadas')
    this.storage.removeItem('EstructuraTabla')
    this.router.navigate(['/login'])
    this.notificacionesService.ocultar();
  }

  desplegar(){
    this.abrir = !this.abrir;
  }
  getUsuario() {
    const usuarioCifrado = this.storage.getItem('usr');
    if (!usuarioCifrado) {
      return null;
    }

    try {
      const objeto = JSON.parse(this.cifrado.descifrar(usuarioCifrado));
      const nombre = objeto.nombre.split(" ")[0];
      return nombre;
    } catch (error) {
      console.error('Error al descifrar o parsear el usuario:', error);
      return null;
    }
  }
  getRole(){
   let rol= this.cifrado.descifrar(this.storage.getItem('rolUsuario')!)
   return rol;
  }

  rolUsuario(): Number{
    return 1 ;//Number(localStorage.getItem('idRol'));
  }

  desplegarAdmin(){
    this.abrirAdmin = !this.abrirAdmin;
  }
  
}
