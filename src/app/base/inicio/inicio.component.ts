import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { faUser, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { TitulosService } from 'src/app/services/titulos.services';
import { environment } from 'src/environments/environment';
import { ServicioInfoDinamicaService } from '../services/servicio-info-comun.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ServerConfigService } from 'src/app/server-config.service';
import { HttpClient } from '@angular/common/http';
import { StorageService } from 'src/app/services/storage-service.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
})
export class InicioComponent implements OnInit {

  redes: any;
  nombreSistema: any;
  fontSizeTitulo = '24px';
  fontSizeTituloNormal = '20px';
  isBrowser = false;
  celular = false;
  @ViewChild('main')
  main!: ElementRef;
  alto = 0;
  faUser = faUser;
  faSortDown = faSortDown;
  faSortUp = faSortUp;
  textoAbajo = true;

  textoBienvenida = 'Bienvenido al Sistema para la Generación de Mapas de Brechas de Evidencia (GMBE)';

  bienvenidaContenito: SafeHtml | undefined;

  rutaImagenAlimentacion: string = environment.recursos + 'Alimentacion.png';
  rutaImagenCuidadoInfantil: string = environment.recursos + 'CuidadoInfantil.png';
  rutaImagenSeguridadSocial: string = environment.recursos + 'SeguridadSocial.png';


  mbes = [];

  constructor(
    private titulos: TitulosService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private info: ServicioInfoDinamicaService,
    private sanitizer: DomSanitizer,
    private serverConfigService: ServerConfigService,
    private storage: StorageService,
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    //if (this.isBrowser) {
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.titulos.changePestaña('Inicio');

    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe((result: BreakpointState) => {
        if (result.matches) {
          this.fontSizeTitulo = '14px';
          this.fontSizeTituloNormal = '12px';
          this.celular = true;
        } else {
          this.fontSizeTitulo = '24px';
          this.fontSizeTituloNormal = '20px';
          this.celular = false;
        }
      });
    this.obtenerInformacion();
    //}
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      window.history.replaceState(null, '', '/');
      this.router.navigateByUrl('/');
    }
    this.obtenerMbesPublicos();
  }

  async obtenerInformacion() {
    if (this.isBrowser) {
      if (this.isBrowser) {
        let url = this.serverConfigService.getServerConfig() + 'api/gmbe-catalogos/api/elementos/idElemento?idElemento=1';
        while (this.serverConfigService.getServerConfig() === '' || this.serverConfigService.getServerConfig() === undefined || this.serverConfigService.getServerConfig() === null) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 1 second
          url = this.serverConfigService.getServerConfig() + 'api/gmbe-catalogos/api/elementos/idElemento?idElemento=1';
          this.obtenerMbesPublicos();
        }
        console.log(url);
        try {
          const result = await this.http.get<any>(url).toPromise();
          console.log(result);
          this.obtenerMbesPublicos();
          this.bienvenidaContenito = this.sanitizer.bypassSecurityTrustHtml(result.valor);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  obtenerMbesPublicos() {
    let token_gmbe = this.storage.getItem('token-gmbe');
      this.info.obtenerMBEPublicado().subscribe(
        res => {
          console.log(res);
          this.mbes = res.filter((mb:any) => mb.bloqueado === false);
        },
        err => { }
      )
  }

}
