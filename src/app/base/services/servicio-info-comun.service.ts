import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerConfigService } from 'src/app/server-config.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServicioInfoDinamicaService {

  constructor(private http:HttpClient,private serverConfigService: ServerConfigService) { }

  obtenerBienvenida():Observable<any>{
    let url = this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/elementos/idElemento?idElemento=1';
    return this.http.get<any>(url);
  }

  obtenerMBEPublicado():Observable<any>{
    let url = this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/mbe/all-by-activo-and-estatus?estatus=CREADO';
    return this.http.get<any>(url); 
  }

}
