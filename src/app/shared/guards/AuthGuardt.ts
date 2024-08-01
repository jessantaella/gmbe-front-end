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
      ruta: 'crear-gmbe',
      idRol: [1, 2, 4],
    },
    {
      ruta: 'editar-gmbe',
      idRol: [1, 2, 3, 4],
    },
    {
      ruta: 'vista-previa',
      idRol: [1, 2, 3, 4],
    }
  ]

  constructor(private storage: StorageService, private router: Router, private cifrado: CifradoService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const objetoUsuario = JSON.parse(this.cifrado.descifrar(localStorage.getItem('usr')!));
    const idRol = objetoUsuario?.rolUsuario?.idRol;

    console.log('idRol', idRol);

    const url = route.url.map(segment => segment.path).join('/');

    const permisos = this.rutaAcceso.find(r => r.ruta === url);

    if (this.storage.getItem('usr') == null) {
      this.router.navigate(['/login']);
      return false;
    }
    else if (permisos && permisos?.idRol.includes(idRol)) {
      return true;
    } else {
      this.router.navigate(['/inicio']);
      return false;
    }
  }
}
