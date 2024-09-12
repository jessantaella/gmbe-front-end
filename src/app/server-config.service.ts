import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './services/storage-service.service';

@Injectable({
  providedIn: 'root'
})
export class ServerConfigService {
  private serverConfig: string = '';
  isBrowser = false;
  constructor(
     private http: HttpClient,
     @Inject(PLATFORM_ID) private platformId: any, private storage:StorageService) {

    this.isBrowser = isPlatformBrowser(this.platformId);
   }
 


  loadServerConfig() {
    if(this.isBrowser){
      //const hostname = window.location.hostname;
      const hostname = '10.1.15.156';
      let ruta = '';
  
      if (hostname.includes('qa.coneval.org.mx') || hostname.includes('sistemas.coneval.org.mx')) {
        ruta = hostname; // Devuelve el mismo hostname sin modificaciones
      } else {
        // Obtiene la dirección IP del hostname
        const ip = hostname.split(':')[0]; // Extrae la IP antes del puerto (si hay alguno)
    
        // Concatena la dirección IP con el puerto 81
        ruta = `${ip}:8080`;
      }
      
      // let url = `http${hostname.includes('qa.coneval.org.mx') || hostname.includes('sistemas.coneval.org.mx') ? 's':''}://${ruta}/conf/server-conf.json`; 
      // if(url.includes('localhost')) {url = 'http://10.1.15.102:81/conf/server-conf.json';}
      // const headers = new HttpHeaders()
  
      //     this.http.get<any>(url,{ headers: headers })
      //       .subscribe(response => {
      //         this.serverConfig = response.servidor;
      //         if(this.storage.getItem('srv') !== this.serverConfig){
      //             this.storage.setItem('srv',this.serverConfig)
      //         }
      //       }, error => {
      //         console.error('Error al cargar la configuración del servidor:', error);
      //       });

      this.serverConfig = `http://${ruta}/`;
    }
  }

  getServerConfig(): any {
    return this.serverConfig === '' ? this.storage.getItem('srv') : this.serverConfig;
  }

  setServerConfig(config: any): void {
    this.serverConfig = config;
  }
}
