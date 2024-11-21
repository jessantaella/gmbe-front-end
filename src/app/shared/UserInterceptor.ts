import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, EMPTY } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { StorageService } from '../services/storage-service.service';
import { CifradoService } from '../services/cifrado.service';
import { GmbeServicesService } from '../gmbe/services/gmbe-services.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificacionesService } from '../services/notificaciones.service';
import { TokenService } from '../services/token.services';
declare var swal: any;

@Injectable()
export class UserInterceptor implements HttpInterceptor {
  private isUserValid: boolean | null = null;

  constructor(
    private storage: StorageService,
    private cifrado: CifradoService,
    private gmbeServices: GmbeServicesService,
    private tokenServices:TokenService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private notificacionesService: NotificacionesService,
    private modalService: NgbModal
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Si la URL es 'conf/server-conf.json', deja pasar la solicitud sin modificarla
    if (req.url.includes('conf/server-conf.json') || req.url.includes('/conf/configuracion.json')) {
      return next.handle(req);
    }


     // const userSession = this.storage.getItem('usr');
      const token = this.storage.getItem('token-gmbe') ? this.storage.getItem("token-gmbe") : this.storage.getItem("token-gmbe-publico");
      //console.log('token', token);

      const solicitud = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.cifrado.descifrar(token || '')}`,
        },
      });
      
      if (!token) {
        return next.handle(solicitud)
      }


      return next.handle(solicitud).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            //console.log('TAP', event);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
          this.limpiarSesionYRedirigir();

          }
          return throwError(error);
        })
      );
  }


  private limpiarSesionYRedirigir() {
    this.storage.removeItem('usr');
    this.storage.removeItem('token-gmbe')
    this.storage.removeItem('token-gmbe-publico')
    this.storage.removeItem('notificaciones')
    this.storage.removeItem('autorizadas')
    this.notificacionesService.ocultar();
    this.modalService.dismissAll();
    this.verificarToken();
    this.router.navigate(['/inicio']);
  }

  verificarToken(){
    if(!this.storage.getItem('token-gmbe-publico')){
    this.tokenServices.obtenerTokenPublico().subscribe(
      res=>{
        this.storage.setItem("token-gmbe-publico",this.cifrado.cifrar(res.token));
      },err=>{
        
      })
  }
}

}