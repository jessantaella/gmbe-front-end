import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError, of, EMPTY } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { StorageService } from '../services/storage-service.service';
import { CifradoService } from '../services/cifrado.service';
import { GmbeServicesService } from '../gmbe/services/gmbe-services.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificacionesService } from '../services/notificaciones.service';
declare var swal: any;

@Injectable()
export class UserInterceptor implements HttpInterceptor {
  private isUserValid: boolean | null = null;

  constructor(
    private storage: StorageService,
    private cifrado: CifradoService,
    private gmbeServices: GmbeServicesService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private notificacionesService: NotificacionesService,
    private modalService: NgbModal
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const userSession = this.storage.sesionGetItem('usr');
      console.log(req.url)

      if (req.url.includes('/gmbe-catalogos/api/login/auth') || req.url.includes('get-mbes-permitidos') || req.url.includes('usuarios/exist-user?') || req.url.includes('conf/server-conf.json')) {
        return next.handle(req);
      }


      if(userSession){
        const objetoUsuario = JSON.parse(this.cifrado.descifrar(userSession));
        const { userName, correo } = objetoUsuario;
        console.log('Valida usuario en guard ')
        return this.gmbeServices.validarUsuario(userName, correo).pipe(
          switchMap((response) => {
            if (response.data === null) {
              this.isUserValid = false;
              console.error('Token no válido o expirado');
              this.limpiarSesionYRedirigir();
              return EMPTY;
            } else {
              this.isUserValid = true;
              console.log('usuario valido')
              return this.handleRequestWithToken(req, next);
            }
          }),
          /*catchError((error) => {
            this.isUserValid = false;
            return EMPTY;
          })*/
        );
      }else{
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


  private limpiarSesionYRedirigir() {
    this.storage.removeItem('usr');
    this.storage.removeItem('token-gmbe')
    this.storage.removeItem('notificaciones')
    this.storage.removeItem('autorizadas')
    this.notificacionesService.ocultar();
    this.modalService.dismissAll();
    this.router.navigate(['/inicio']);
  }
}