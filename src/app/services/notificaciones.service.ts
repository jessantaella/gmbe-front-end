import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServerConfigService } from '../server-config.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage-service.service';
import { CifradoService } from './cifrado.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private mostrarNotificaciones = new BehaviorSubject<boolean>(this.obtenerEstadoNotificaciones());
  mostrarNotificaciones$ = this.mostrarNotificaciones.asObservable();

  constructor(private http:HttpClient,private serverConfigService: ServerConfigService, private storage:StorageService) { }

  mostrar(){    
    const token = this.storage.getItem('token-gmbe') ;
    if (token) {
      console.log('Mostrar notificaciones');
      this.mostrarNotificaciones.next(true);
      this.storage.setItem('mostrarNotificaciones', 'true');
    } else {
      this.mostrarNotificaciones.next(false);
      this.storage.setItem('mostrarNotificaciones', 'false');
    }
  }
  ocultar(){
    console.log('Ocultar notificaciones');
    this.mostrarNotificaciones.next(false);
  }

   // Método que recupera el estado guardado en localStorage
   private obtenerEstadoNotificaciones(): boolean {
    const estadoGuardado = this.storage.getItem('mostrarNotificaciones');
    this.storage.setItem('mostrarNotificaciones', 'false');
    return estadoGuardado === 'true';
  }

  getNotificaciones(idUsuario:number): Observable<any>{
    let urlLogin = this.serverConfigService.getServerConfig()+ 'api/gmbe/'+'api/estatus/notificaciones?' + 'idUsuario=' + idUsuario;
    return this.http.get<any>(urlLogin,{});
  }

  eliminarNotificacion(idNotificacion:number): Observable<any>{
    let urlLogin = this.serverConfigService.getServerConfig()+ 'api/gmbe/'+'api/estatus/desactivar-notificacion-by-id?' + 'idNotificacion=' + idNotificacion;
    return this.http.put<any>(urlLogin,{});
  }

  eliminarTodasNotificaciones(arregloNotificaciones: any): Observable<any>{
    let urlLogin = this.serverConfigService.getServerConfig()+ 'api/gmbe/'+'api/estatus/notificaciones-desactivar';
    return this.http.put<any>(urlLogin,arregloNotificaciones,{});
  }
}
