import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { CifradoService } from 'src/app/services/cifrado.service';
import { StorageService } from 'src/app/services/storage-service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  rutaAcceso = [
    {
      ruta: 'inicio',
      idRol: [1, 2, 3, 4],
    },
    {
      ruta: 'usuarios',
      idRol: [1],
    },
    {
      ruta: 'gmbe',
      idRol: [1, 2, 3, 4],
    },
    {
      ruta: 'editar-gmbe',
      idRol: [1, 2, 4],
    },
    {
      ruta: 'vista-previa',
      idRol: [1, 2, 3, 4],
    },
    {
      ruta: 'crear-gmbe',
      idRol: [1, 2, 4],
    }
  ]

  constructor(private storage: StorageService, private router: Router, private cifrado: CifradoService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    // Obtener y descifrar el objeto de ids autorizados donde puede acceder el usuario
    const objetoIds = JSON.parse(this.cifrado.descifrar(localStorage.getItem('autorizadas')!));

    // Obtener y descifrar el objeto de usuario desde el localStorage
    const objetoUsuario = JSON.parse(this.cifrado.descifrar(localStorage.getItem('usr')!));
    const idRol = objetoUsuario?.rolUsuario?.idRol;

    console.log('idRol', idRol);
    const routePath = route.routeConfig?.path?.split('/:')[0];

    // Buscar si hay permisos para la parte base de la ruta
    const permisos = this.rutaAcceso.find(r => r.ruta === routePath);

    // Verificar si el usuario está autenticado
    if (!objetoUsuario) {
      this.router.navigate(['/login']);
      return false;
    }

    const idAutorizados = objetoIds?.map((id: string) => parseInt(id));
    const idParam = parseInt(route.params['id']);

    console.log('guard',idAutorizados);
    console.log('guard',permisos);
    console.log('guard',routePath);

    // Verificar si el rol del usuario tiene acceso a la ruta
    if (permisos && permisos.idRol.includes(idRol) && routePath !== 'editar-gmbe' && routePath !== 'vista-previa') {
      return true;
    }
    // Verificar si el rol del usuario tiene acceso a la ruta o al id de la ruta
    else if ((routePath === 'editar-gmbe' || routePath === 'vista-previa') && idAutorizados?.includes(idParam)) {
      return true;
    } else if(idRol !== '1'){
      return true;
    }else{
      this.router.navigate(['/inicio']);
      return false;
    }
  }
}
