import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {faUser, faHome } from '@fortawesome/free-solid-svg-icons';
import { CifradoService } from 'src/app/services/cifrado.service';
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

  constructor(private router: Router,private storage:StorageService, private cifrado:CifradoService) {
   }

  validaToken(): boolean{
    return this.storage.getItem('token-gmbe')!== null;
  }
  
  cerrarSesion(){
    this.storage.removeItem('usr');
    this.storage.removeItem('token-gmbe')
    this.storage.removeItem('notificaciones')
    this.storage.removeItem('autorizadas')
    this.router.navigate(['/login'])
  }

  desplegar(){
    this.abrir = !this.abrir;
  }
  getUsuario(){
    let objeto = JSON.parse(this.cifrado.descifrar(this.storage.getItem('usr')!));
    //Sacar unicamnete el nombre o los dos nombres sin apellidos del objeto
    let nombre = objeto.nombre.split(" ")[0];
    return nombre;
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
