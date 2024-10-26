import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { StorageService } from '../services/storage-service.service';
import { CifradoService } from '../services/cifrado.service';
import { interval } from 'rxjs';
import { NotificacionesService } from '../services/notificaciones.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})

export class NotificacionesComponent implements OnInit, OnDestroy {

  notificacionesCache: any 
  margenNotificaciones = 0;
  cincoPrimerasNotificaciones: any = [];
  notificacionesInformativas: any = [];
  termino = false;
  conteoObjeto = 0;
  conteoInicial = 0;
  banderaBucle: boolean = false;
  indice = 0;
  intervalo: any;
  notificaciones: any;
  guardarNotificaciones: any;

  mostrarNotificaciones = false;
  esMenor = false;

  usuario = JSON.parse(this.cifrado.descifrar(this.storage.getItem('usr')!));
  idUsuario:number = Number(this.usuario.idUsuario);
  idNotificacionesEliminadas: any;
  
  constructor(private cdr: ChangeDetectorRef,private storage: StorageService, private cifrado: CifradoService, private notificacionesService: NotificacionesService) { }
  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      
    }
  }

  dimensionesPantalla(){
    if (window.innerHeight <= 900) {
      
      this.esMenor = true;
    }else{
      
      this.esMenor = false;
    }
  }
  
  ngOnInit(): void {
    
    this.verificarMostrarNotificaciones();
    this.notificacionesRes(this.idUsuario);
    this.dimensionesPantalla();
  }

  verificarMostrarNotificaciones() {
    this.notificacionesService.mostrarNotificaciones$.subscribe((mostrar) => {
      this.mostrarNotificaciones = mostrar;
      
    });
  }

  mostrarCincoPrimerasNotificaciones(notificaciones: any) {
    
  
    if (this.indice >= this.notificacionesCache.length && this.notificacionesCache.length > 0) {
      
      return;
    }
  
    this.cincoPrimerasNotificaciones = this.notificacionesCache.length >= 5 
      ? this.notificacionesCache.slice(this.indice, this.indice + 5) 
      : this.notificacionesCache.slice(this.indice, this.notificacionesCache.length);
    
    
    
  
    if (this.cincoPrimerasNotificaciones.length === 0 && this.notificacionesCache.length === 0) {
      
      return; 
    }
  
    if (this.notificacionesCache.length >= 5 && (this.indice >= this.notificacionesCache.length)) {
      this.cincoPrimerasNotificaciones = [];
      this.indice = 0;
      this.termino = true;
      clearInterval(this.intervalo);
  
      // Verificar si no se está en bucle
      if (!this.banderaBucle && this.notificacionesInformativas.length > 0) {
        this.banderaBucle = true;
        this.notificacionesCache = this.notificacionesInformativas;
        
        this.eliminarNotificacionesNoInformativas(this.guardarNotificaciones);
        this.mostrarCincoPrimerasNotificaciones(this.notificacionesInformativas);
      }
    } else {
      this.indice += 5;
    }
  
    
    
  }
  
  

  eliminarNotificacionesNoInformativas(notificaciones: any) {
    //Almacena unicamete los ID de las notificaciones que no sean informativas y se eliminan todos.
    const notificacionesNoInformativas = notificaciones.filter((notificacion: any) => notificacion.informativa);
    
    this.idNotificacionesEliminadas = notificacionesNoInformativas.map((notificacion: any) => notificacion.idNotificacion);
    const idsNotificaciones = notificacionesNoInformativas.map((notificacion: any) => notificacion.idNotificacion);
    
    this.notificacionesService.eliminarTodasNotificaciones(idsNotificaciones).subscribe((res) => {
      
    });
  };

  clickEliminarNotificacion(index: number) {
    const notificacionEliminada = this.cincoPrimerasNotificaciones.splice(index, 1)[0];
  
    // Verifica si la notificación eliminada es informativa y elimina del backend si es necesario
    if (notificacionEliminada.informativa) {
      this.notificacionesService.eliminarNotificacion(notificacionEliminada.idNotificacion).subscribe((res) => {
        
      });
    }
  
    // Si ya no quedan notificaciones visibles, muestra las siguientes 5
    if (this.cincoPrimerasNotificaciones.length === 0) {
      this.mostrarCincoPrimerasNotificaciones(this.notificacionesInformativas);
    }
    
    
  }
  

  clickEliminarUnadeCinco() {
    //Elimina una notificación de las 5 mostradas.
    const notificacionEliminada = this.cincoPrimerasNotificaciones.shift();
    
    this.notificacionesService.eliminarNotificacion(notificacionEliminada.idNotificacion).subscribe((res) => {
      
    });
  }

  notificacionesRes(idUsuario: number) {
    
    this.notificacionesService
      .getNotificaciones(idUsuario)
      .subscribe((res:any) => {
        
        
        this.notificacionesCache = res;
        this.notificacionesInformativas = res.filter((notificacion: any) => notificacion.informativa === false);
        this.guardarNotificaciones = this.notificacionesCache.filter((notificacion: any) => notificacion.informativa === true);
        
        
        this.mostrarCincoPrimerasNotificaciones(res);
        this.intervalo = setInterval(() => {
          this.mostrarCincoPrimerasNotificaciones(res);
        }, 10000);
      });
      
  }

}
