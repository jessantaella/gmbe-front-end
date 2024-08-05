import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerConfigService } from 'src/app/server-config.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient,private serverConfigService: ServerConfigService) { }

  validarAcceso(usr:string,pass:string, clave:string): Observable<any>{
    let urlLogin = this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/login/auth';
    return this.http.post<any>(urlLogin, {username:usr,password:pass, iv:clave},{});
  }

  getAutorizadas(idUsuario:number): Observable<any>{
    let urlLogin = this.serverConfigService.getServerConfig()+ 'api/gmbe-catalogos/'+'api/mbe/get-mbes-permitidos?' + 'idUsuario=' + idUsuario;
    return this.http.get<any>(urlLogin,{});
  }
}
