import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { StorageService } from '../services/storage-service.service';
import { CifradoService } from '../services/cifrado.service';

@Injectable()
export class UserInterceptor implements HttpInterceptor {
  private serverConfLoaded = new Subject<void>();

  constructor(private storage: StorageService,private cifrado:CifradoService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Obtener el usuario del localStorage
    const auth_token = this.storage.getItem('token-gmbe');
    console.log(auth_token);

    // Verificar si la URL contiene ciertas rutas específicas
    const allowedRoutes = ['login', 'panel', 'inicio', 'evaluacion'];
    const isAllowedRoute = allowedRoutes.some(route => req.url.includes(route));

    if (isAllowedRoute || req.url.includes('conf/server-conf.json')) {
      // Si la URL es una de las permitidas o es la configuración del servidor, se envía la solicitud sin el encabezado
      console.log('No se envía el encabezado de usuario');
      console.log(req.url);
      return next.handle(req);
    }

    // Esperar a que se cargue la configuración del servidor
    let headers = new HttpHeaders({
      Accept: 'application/json',
    });

    if (auth_token !== null) {
      headers = new HttpHeaders({
        Accept: 'application/json',
        Authorization: `Bearer ${auth_token}`,
      });
    }

    const reqClone = req.clone({
      headers: headers,
    });

    console.log('Se envía el encabezado de usuario');
    console.log(reqClone);

    return next.handle(reqClone);
  }
}
