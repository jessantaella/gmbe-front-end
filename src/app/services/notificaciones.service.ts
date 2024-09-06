import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServerConfigService } from '../server-config.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor(private http:HttpClient,private serverConfigService: ServerConfigService) { }

  getNotificaciones(idUsuario:number): Observable<any>{
    let urlLogin = this.serverConfigService.getServerConfig()+ 'api/gmbe/'+'api/estatus/notificaciones?' + 'idUsuario=' + idUsuario;
    return this.http.get<any>(urlLogin,{});
  }
}
