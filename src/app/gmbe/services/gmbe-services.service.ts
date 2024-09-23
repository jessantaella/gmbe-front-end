import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerConfigService } from 'src/app/server-config.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { map, retry, catchError ,shareReplay } from 'rxjs/operators';
import { of, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GmbeServicesService {

  constructor(private http:HttpClient,private serverConfigService: ServerConfigService) { }
  private cache = new Map<string, Observable<string>>();

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

  eliminarGmbe(idMbe:number):Observable<any>{
    let urlEliminar=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/mbe/eliminar?idMbe='+idMbe;
    return this.http.post<any>(urlEliminar,{});
  }

  cambiarEstatus(idMbe:number,estatus:boolean):Observable<any>{
    let urlactualizar=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/mbe/bloqueo?idMbe='+idMbe+'&bloqueo='+estatus;
    return this.http.put<any>(urlactualizar,{});
  }

  bloquearMbe(idMbe:number,estatus:boolean):Observable<any>{
    let urlactualizar=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/mbe/activar-desactivar?idMbe='+idMbe+'&activo='+estatus;
    return this.http.put<any>(urlactualizar,{});
  }

  listarGmbes(pagina:number,size:number, idUsuario:number):Observable<any>{
    let url = this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/mbe/paginated?page='+pagina+'&size='+size + '&idUsuario='+idUsuario;
    return this.http.get<any>(url);
  }

  crearCategoria(nombre:string, descripcion:string, complemento: string):Observable<any>{
    let urlCrear=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/catalogo/crear';
    let categoria = {
      tipoCatalogo:'CATEGORIAS',
      catalogo:nombre,
      descripcion:descripcion,
      complemento:complemento,
      idRelacionCatalogo:null
    };
    return this.http.post<any>(urlCrear,categoria,{});
  }

  consultarCatalogo(id:number):Observable<any>{
    let url=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/catalogo/editar?idCatalogo='+id;
    return this.http.get<any>(url);
  }

  editarCategoria(id:number,nombre:string, descripcion:string, complemento: string):Observable<any>{
    let urlEditar=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/catalogo/actualizar';
    let categoria = {
      idCatalogo:id,
      catalogo:nombre,
      descripcion:descripcion,
      complemento:complemento
    };
    return this.http.put<any>(urlEditar,categoria,{});
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
    let url=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/mbe/buscar-por-id-revisiones?idMbe='+idMbe;
    return this.http.get<any>(url);
  }


  obtenerEstructuraGMBE(idMbe:number):Observable<any>{
    let url=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/estructura-mbe/find-by-idMbe?idMbe='+idMbe;
    return this.http.get<any>(url);
  }

  obtenerDatosGMBE(idMbe:number,revision:number):Observable<any>{
    let url=this.serverConfigService.getServerConfig()+'api/gmbe/api/datos-mbe/vista-previa?idMbe='+idMbe+'&revision='+revision;
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
    if (this.cache.has(remotePath)) {
      return this.cache.get(remotePath)!;
    }

    const payload = { sistema: 'GMBE', remotePath };
    const url = `${this.serverConfigService.getServerConfig()}api/coneval-ms-storage/api/storage/get-file`;

    const request$ = this.http.post(url, payload, { responseType: 'arraybuffer' }).pipe(
      retry(6), // Reintenta la solicitud hasta 3 veces en caso de error
      map(response => {
        // Convertir array buffer a cadena base64
        const binaryString = Array.from(new Uint8Array(response))
          .map(byte => String.fromCharCode(byte))
          .join('');
        const base64String = btoa(binaryString);
        return `data:image/png;base64,${base64String}`;
      }),
      catchError(err => {
        console.error('Error al obtener la imagen:', err);
        return of(''); // Devuelve un valor vacío o maneja el error según sea necesario
      }),
      shareReplay(1) // Comparte la última emisión y evita múltiples solicitudes
    );

    this.cache.set(remotePath, request$);

    return request$;
  }

    getImageIndividual(remotePath: string): Observable<string> {
      if (this.cache.has(remotePath)) {
        return this.cache.get(remotePath)!;
      }
  
      const payload = { sistema: 'GMBE', remotePath };
      const url = `${this.serverConfigService.getServerConfig()}api/coneval-ms-storage/api/storage/get-file`;
  
      const request$ = this.http.post(url, payload, { responseType: 'arraybuffer' }).pipe(
        retry(1), // Reintenta la solicitud hasta 3 veces en caso de error
        map(response => {
          // Convertir array buffer a cadena base64
          const binaryString = Array.from(new Uint8Array(response))
            .map(byte => String.fromCharCode(byte))
            .join('');
          const base64String = btoa(binaryString);
          return `data:image/png;base64,${base64String}`;
        }),
        catchError(err => {
          console.error('Error al obtener la imagen:', err);
          return of(''); // Devuelve un valor vacío o maneja el error según sea necesario
        }),
        shareReplay(1) // Comparte la última emisión y evita múltiples solicitudes
      );
  
      this.cache.set(remotePath, request$);
  
      return request$;
    }
  


    actualizarImagen(imagen:any,nombre:string){
      const formData = new FormData();
      formData.append('file', imagen);
      formData.append('remotePath',nombre?.replace(/_/g, ''));
      formData.append('sistema','GMBE');
      let url: string =`${this.serverConfigService.getServerConfig()}api/coneval-ms-storage/api/storage/update-file`;
      return this.http.post<any>(url, formData, {});
     }


     cargarInformación(archivo:any,idMbe:number){
      const formData = new FormData();
      formData.append('file', archivo);
      formData.append('idMBE',idMbe+'');
      let url: string =`${this.serverConfigService.getServerConfig()}api/gmbe/api/datos-mbe/carga-layout`;
      return this.http.post<any>(url, formData, {});
     }

     obtenerVersionMaximaMBE(idMbe:number):Observable<any>{
      let url=this.serverConfigService.getServerConfig()+'api/gmbe/api/datos-mbe/max-revision?idMbe='+idMbe;
      return this.http.get<any>(url);
     }


     descargarReporteDatos(idMbe:number,revision:number):Observable<HttpResponse<ArrayBuffer>>{
      let url: string =`${this.serverConfigService.getServerConfig()}api/gmbe/api/reporte/datos-reporte?idMbe=${idMbe}&revision=${revision}`;
      return this.http.get(url, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        responseType: 'arraybuffer',
        observe: 'response'
    });
     }

     consultarAccesos(idUsuario:number):Observable<any>{
      let url=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/'+'api/mbe/get-mbes-permitidos?' + 'idUsuario=' + idUsuario;
      return this.http.get<any>(url);
     }

     estatusGmbe(idMbe:number, idEstatus:number, idRol: number):Observable<any>{
      let url=this.serverConfigService.getServerConfig()+'api/gmbe/api/estatus/cambiar-estatus?idMbe='+idMbe+'&status='+idEstatus+'&idRol='+idRol;
      return this.http.get<any>(url);
     }

     obtenerEstructuraPanelResultados(datos: any): Observable<any> {
      const url = this.serverConfigService.getServerConfig() + 'api/gmbe/api/estructura-mbe/estructura-mbe-panel-resultados';
      return this.http.post<any>(url, datos); 
    }

    filtroCategoria(datosEnviados:any):Observable<any>{
      let url = this.serverConfigService.getServerConfig()+'api/gmbe/api/filtros/filtro-panel-resultados-categoria';
      return this.http.post<any>(url,datosEnviados,{});
    }

    filtrosSubcategoria(datosEnviados:any):Observable<any>{
      let url = this.serverConfigService.getServerConfig()+'api/gmbe/api/filtros/filtro-panel-resultados-subcategoria';
      return this.http.post<any>(url,datosEnviados,{});
    }
     
}
