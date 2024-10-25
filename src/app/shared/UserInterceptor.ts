import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { StorageService } from '../services/storage-service.service';
import { CifradoService } from '../services/cifrado.service';
import { GmbeServicesService } from '../gmbe/services/gmbe-services.service';

@Injectable()
export class UserInterceptor implements HttpInterceptor {
  private isUserValid: boolean | null = null;

  constructor(
    private storage: StorageService,
    private cifrado: CifradoService,
    private gmbeServices: GmbeServicesService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isUserValid === false) {
      console.error('Token no válido o expirado');
      return throwError(() => new Error('Token no válido o expirado'));
    }

    if (this.isUserValid !== null) {
      return this.handleRequestWithToken(req, next); // Usa el valor almacenado si ya está validado
    }

    const userSession = this.storage.sesionGetItem('usr');
    if (userSession) {
      const objetoUsuario = JSON.parse(this.cifrado.descifrar(userSession));
      const { userName, correo } = objetoUsuario;

      return this.gmbeServices.validarUsuario(userName, correo).pipe(
        switchMap((response) => {
          if (response) {
            this.isUserValid = true;
            return this.handleRequestWithToken(req, next);
          } else {
            this.isUserValid = false;
            console.error('Token no válido o expirado');
            return throwError(() => new Error('Token no válido o expirado'));
          }
        }),
        catchError((error) => {
          this.isUserValid = false;
          console.error('Token no válido o expirado');
          return throwError(() => new Error('Token no válido o expirado'));
        })
      );
    } else {
      console.error('No hay sesión de usuario');
      return next.handle(req);
    }
  }

  private handleRequestWithToken(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.cifrado.descifrar(this.storage.sesionGetItem('token-gmbe')!);
    const clonedRequest = token
      ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
      : req;
    return next.handle(clonedRequest);
  }
}