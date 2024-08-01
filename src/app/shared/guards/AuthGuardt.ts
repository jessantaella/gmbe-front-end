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

    // Verificar si el rol del usuario tiene acceso a la ruta
    if (permisos && permisos.idRol.includes(idRol)) {
      return true;
    } else {
      this.router.navigate(['/inicio']);
      return false;
    }
  }
}
