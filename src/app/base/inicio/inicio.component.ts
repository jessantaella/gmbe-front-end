import {Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { faUser,faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { TitulosService } from 'src/app/services/titulos.services';
import { environment } from 'src/environments/environment';
import { ServicioInfoDinamicaService } from '../services/servicio-info-comun.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
})
export class InicioComponent implements OnInit{

  redes: any;
  nombreSistema: any;
  fontSizeTitulo = '24px';
  fontSizeTituloNormal = '20px';
  isBrowser = false;
  celular = false;
  @ViewChild('main')
  main!: ElementRef;
  alto = 0;
  faUser= faUser;
  faSortDown= faSortDown;
  faSortUp= faSortUp;
  textoAbajo = true;

  textoBienvenida = 'Bienvenido al Sistema para la Generación de Mapas de Brechas de Evidencia (GMBE)';

  bienvenidaContenito :SafeHtml | undefined ;

  rutaImagenAlimentacion: string = environment.recursos +'Alimentacion.png';
  rutaImagenCuidadoInfantil: string =  environment.recursos + 'CuidadoInfantil.png';
  rutaImagenSeguridadSocial: string =  environment.recursos + 'SeguridadSocial.png';


  mbes = [
    {urlImg:this.rutaImagenAlimentacion,nombre:"Alimentación"},
    //{urlImg:this.rutaImagenCuidadoInfantil,nombre:"Cuidado Infantil"},
    {urlImg:this.rutaImagenSeguridadSocial,nombre:"Seguridad Social"}]

  constructor(
    private titulos :TitulosService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private info: ServicioInfoDinamicaService,
    private sanitizer: DomSanitizer
  ){
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
    //}
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      window.history.replaceState(null, '', '/');
      this.router.navigateByUrl('/');
    }
    this.obtenerInformacion();
    this.obtenerMbesPublicos();
  }

  obtenerInformacion(){
   // if (this.isBrowser) {
    this.info.obtenerBienvenida().subscribe(
      res=>{
        console.log(res);
        this.bienvenidaContenito = this.sanitizer.bypassSecurityTrustHtml(res.valor);
      },
      err=>{
      });
    //}
  }

  obtenerMbesPublicos(){
    this.info.obtenerMBEPublicado().subscribe(
      res=>{
        console.log(res);
        this.mbes =res;
      },
      err=>{}
    )
  }

}
