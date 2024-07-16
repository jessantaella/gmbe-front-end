import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ServerConfigService } from 'src/app/server-config.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GmbeServicesService {

  constructor(private http:HttpClient,private serverConfigService: ServerConfigService) { }

  listarCatalogo(tipo:number):Observable<any>{
    let url = this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/catalogo/find-by-tipo-catalogo?idTipoCatalogo='+tipo;
    return this.http.get<any>(url);
  }

  listarSubcategorias(padre:number):Observable<any>{
    let url = this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/catalogo/find-by-id-relacion?idRelacion='+padre;
    return this.http.get<any>(url);
  }

  crearGmbe(gmbe:any):Observable<any>{
    let urlCrear=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/gestion-mbe/crear-gestion-mbe';
    return this.http.post<any>(urlCrear,gmbe,{});
  }

  actualizarGmbe(gmbe:any):Observable<any>{
    let urlactualizar=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/mbe/actualizar';
    return this.http.put<any>(urlactualizar,gmbe,{});
  }

  cambiarEstatus(idMbe:number,estatus:boolean):Observable<any>{
    let urlactualizar=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/mbe/bloqueo?idMbe='+idMbe+'&bloqueo='+estatus;
    return this.http.put<any>(urlactualizar,{});
  }

  bloquearMbe(idMbe:number,estatus:boolean):Observable<any>{
    let urlactualizar=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/mbe/activar-desactivar?idMbe='+idMbe+'&activo='+estatus;
    return this.http.put<any>(urlactualizar,{});
  }

  listarGmbes(pagina:number,size:number):Observable<any>{
    let url = this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/mbe/paginated?page='+pagina+'&size='+size;
    return this.http.get<any>(url);
  }

  crearCategoria(nombre:string):Observable<any>{
    let urlCrear=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/catalogo/crear';
    let categoria = {
      tipoCatalogo:'CATEGORIAS',
      catalogo:nombre,
      idRelacionCatalogo:null
    };
    return this.http.post<any>(urlCrear,categoria,{});
  }

  crearSubcategoria(nombre:string,idRelacion:number):Observable<any>{
    let urlCrear=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/catalogo/crear';
    let subcategoria = {
      tipoCatalogo:'SUBCATEGORIAS',
      catalogo:nombre,
      idRelacionCatalogo:idRelacion
    };
    return this.http.post<any>(urlCrear,subcategoria,{});
  }

  obtenerInfoGMBE(idMbe:number):Observable<any>{
    let url=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/mbe/buscar-por-id?idMbe='+idMbe;
    return this.http.get<any>(url);
  }


  obtenerEstructuraGMBE(idMbe:number):Observable<any>{
    let url=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/estructura-mbe/find-by-idMbe?idMbe='+idMbe;
    return this.http.get<any>(url);
  }

  obtenerDatosGMBE(idMbe:number):Observable<any>{
    let url=this.serverConfigService.getServerConfig()+'api/gmbe/api/datos-mbe/vista-previa?idMbe='+idMbe;
    return this.http.get<any>(url);
  }
  
  crearImagen(imagen:any,nombre:string){
    const formData = new FormData();
    formData.append('file', imagen);
    formData.append('remotePath','ftp/gmbe/datos/'+nombre.replace(/_/g, ''));
    formData.append('sistema','GMBE');
    let url: string =`${this.serverConfigService.getServerConfig()}api/coneval-ms-storage/api/storage/upload-file`;
    return this.http.post<any>(url, formData, {});
   }

  
    getImage(remotePath: string): Observable<string> {
      const payload = { sistema: 'GMBE', remotePath };
      const url = `${this.serverConfigService.getServerConfig()}api/coneval-ms-storage/api/storage/get-file`;
      return this.http.post(url, payload, { responseType: 'arraybuffer' }).pipe(
        map(response => {
          // Convert array buffer to base64 string
          const binaryString = Array.from(new Uint8Array(response))
            .map(byte => String.fromCharCode(byte))
            .join('');
          const base64String = btoa(binaryString);
          return `data:image/png;base64,${base64String}`;
        })
      );
    }

    actualizarImagen(imagen:any,nombre:string){
      const formData = new FormData();
      formData.append('file', imagen);
      formData.append('remotePath',nombre.replace(/_/g, ''));
      formData.append('sistema','GMBE');
      let url: string =`${this.serverConfigService.getServerConfig()}api/coneval-ms-storage/api/storage/update-file`;
      return this.http.post<any>(url, formData, {});
     }


}
