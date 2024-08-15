import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerConfigService } from 'src/app/server-config.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private http:HttpClient,private serverConfigService: ServerConfigService) { }

  listarUsuarios(pagina:number,size:number,busqueda:string,filtro:string):Observable<any>{
    let url = this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/usuarios/search-paginados?page='+pagina+'&size='+size+'&busqueda='+busqueda+'&filtro='+filtro;
    return this.http.get<any>(url);
  }

  usuariosLDAP():Observable<any>{
    let url = this.serverConfigService.getServerConfig()+'api/coneval-ms-ldap/api/ldap/users?sistema=gmbe';
    return this.http.get<any>(url);
  }

  getRoles():Observable<any>{
    let url = this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/roles/get-all';
    return this.http.get<any>(url);
  }

  crearUsuario(usuario:any):Observable<any>{
    let urlCrear=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/usuarios/registrar';
    return this.http.post<any>(urlCrear,usuario,{});
  }

  editarUsuario(usuario:any):Observable<any>{
    let urlEditar=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/usuarios/actualizar';
    return this.http.put<any>(urlEditar,usuario,{});
  }

  listarMBE():Observable<any>{
    let url=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/mbe/all-by-activo';
    return this.http.get<any>(url);
  }

  eliminarUsuario(idUsuario:number):Observable<any>{
    let url=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/usuarios/eliminar/'+idUsuario;
    return this.http.post<any>(url,{});
  }

  desactivarUsuario(idUsuario:number):Observable<any>{
    let url=this.serverConfigService.getServerConfig()+'api/gmbe-catalogos/api/usuarios/activar-desactivar';
    return this.http.put<any>(url,{idUsuario,activo:false});
  }
}
