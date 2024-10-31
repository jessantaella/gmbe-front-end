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

     // const userSession = this.storage.getItem('usr');
      const token = this.storage.getItem('token-gmbe');

      if (!token) {
        return EMPTY;
      }

      const solicitud = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.cifrado.descifrar(token || '')}`,
        },
      });

      return next.handle(solicitud).pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
        // Puedes manejar otras respuestas aquí si lo necesitas
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
    this.storage.removeItem('notificaciones')
    this.storage.removeItem('autorizadas')
    this.notificacionesService.ocultar();
    this.modalService.dismissAll();
    this.router.navigate(['/inicio']);
  }
}