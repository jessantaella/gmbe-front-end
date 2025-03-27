import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerConfigService } from 'src/app/server-config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from './storage-service.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private serverConfig: string = '';

  constructor(private http:HttpClient,private storage:StorageService) { }

  obtenerTokenPublico(): Observable<any> {
      let urlToken = this.storage.getItem('srv') + 'api/coneval-ms-auth/api/auth/token-gen';
      return this.http.post<any>(urlToken, { sistema: 'GMBE' });
  }

}