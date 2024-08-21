import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DataDynamic {
  isBrowser = false;
  ruta = "http://10.1.15.102:81/conf/configuracion.json"; //LOCAL
  //servidor = "http://10.1.15.102:81/conf/configuracion.json"; //DEV
  //servidor = "https://qa.coneval.org.mx/conf/configuracion.json" //QA
  //servidor = "https://sistemas.coneval.org.mx/conf/configuracion.json" // PROD


constructor(private http:HttpClient,@Inject(PLATFORM_ID) private platformId:any){
}

  getInformacion(): Observable<any> {
    const headers = new HttpHeaders()
    this.isBrowser = isPlatformBrowser(this.platformId);
    //if (this.isBrowser) {
      let url:string = window.location.hostname;
      let conecta = '';
      if(url.includes('qa')){
        url = 'https://qa.coneval.org.mx/conf/configuracion.json'
      }else if(url.includes('sistemas')){
        url = 'https://sistemas.coneval.org.mx/conf/configuracion.json'
      }else{
        url = 'http://10.1.15.102:81/conf/configuracion.json'
      }
      return this.http.get<any>(conecta,{ headers: headers });
    //}
  }

  getImagen(imagen:string){
    if (this.isBrowser) {
      let url = window.location.hostname;
      if(url === 'localhost'){
        return "assets/"+imagen
      }else if(url.includes('qa') || url.includes('sistemas')){
        return "https://"+url + '/conf/GMBE/assets/'+imagen;

      }else{
        return 'HTTP://' + url + ':81/conf/GMBE/assets/' + imagen; 
      }
    } else {
      return '';
    } 
  }
}
