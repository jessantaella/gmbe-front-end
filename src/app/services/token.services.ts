import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerConfigService } from 'src/app/server-config.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private http:HttpClient,private serverConfigService: ServerConfigService) { }

  obtenerTokenPublico():Observable<any>{
    let url = this.serverConfigService.getServerConfig()+'api/coneval-ms-auth/api/auth/token-gen';
    return this.http.post<any>(url,{sistema:'GMBE'});
  }

}