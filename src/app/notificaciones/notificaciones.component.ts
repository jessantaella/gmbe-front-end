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

  usuario = JSON.parse(this.cifrado.descifrar(this.storage.getItem('usr')!));
  idUsuario:number = Number(this.usuario.idUsuario);
  idNotificacionesEliminadas: any;
  
  constructor(private cdr: ChangeDetectorRef,private storage: StorageService, private cifrado: CifradoService, private notificacionesService: NotificacionesService) { }
  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      
    }
  }
  
  ngOnInit(): void {
    console.log('Usuario:', this.usuario);
    this.verificarMostrarNotificaciones();
    this.notificacionesRes(this.idUsuario);
  }

  verificarMostrarNotificaciones() {
    this.notificacionesService.mostrarNotificaciones$.subscribe((mostrar) => {
      this.mostrarNotificaciones = mostrar;
      console.log('Mostrar Notificaciones:', this.mostrarNotificaciones);
    });
  }

  mostrarCincoPrimerasNotificaciones(notificaciones: any) {
    console.log('Notificaciones:', notificaciones);
  
    if (this.indice >= this.notificacionesCache.length && this.notificacionesCache.length > 0) {
      console.log('No hay más notificaciones para mostrar.');
      return;
    }
  
    this.cincoPrimerasNotificaciones = this.notificacionesCache.length >= 5 
      ? this.notificacionesCache.slice(this.indice, this.indice + 5) 
      : this.notificacionesCache.slice(this.indice, this.notificacionesCache.length);
    
    console.log('Cinco Primeras Notificaciones:', this.cincoPrimerasNotificaciones);
    console.log('Indice:', this.indice);
  
    if (this.cincoPrimerasNotificaciones.length === 0 && this.notificacionesCache.length === 0) {
      console.log('No hay más notificaciones para mostrar.');
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
        console.log('Notificaciones Informativas:', this.notificacionesInformativas);
        this.eliminarNotificacionesNoInformativas(this.guardarNotificaciones);
        this.mostrarCincoPrimerasNotificaciones(this.notificacionesInformativas);
      }
    } else {
      this.indice += 5;
    }
  
    console.log('Notificaciones Informativas:', this.notificacionesInformativas);
    console.log('Current Chunk:', this.cincoPrimerasNotificaciones);
  }
  
  

  eliminarNotificacionesNoInformativas(notificaciones: any) {
    //Almacena unicamete los ID de las notificaciones que no sean informativas y se eliminan todos.
    const notificacionesNoInformativas = notificaciones.filter((notificacion: any) => notificacion.informativa);
    console.log('Notificaciones No Informativas:', notificacionesNoInformativas);
    this.idNotificacionesEliminadas = notificacionesNoInformativas.map((notificacion: any) => notificacion.idNotificacion);
    const idsNotificaciones = notificacionesNoInformativas.map((notificacion: any) => notificacion.idNotificacion);
    console.log('IDs Notificaciones:', idsNotificaciones);
    this.notificacionesService.eliminarTodasNotificaciones(idsNotificaciones).subscribe((res) => {
      console.log('Notificaciones Eliminadas:', res);
    });
  };

  clickEliminarNotificacion(index: number) {
    const notificacionEliminada = this.cincoPrimerasNotificaciones.splice(index, 1)[0];
  
    // Verifica si la notificación eliminada es informativa y elimina del backend si es necesario
    if (notificacionEliminada.informativa) {
      this.notificacionesService.eliminarNotificacion(notificacionEliminada.idNotificacion).subscribe((res) => {
        console.log('Notificación Eliminada:', res);
      });
    }
  
    // Si ya no quedan notificaciones visibles, muestra las siguientes 5
    if (this.cincoPrimerasNotificaciones.length === 0) {
      this.mostrarCincoPrimerasNotificaciones(this.notificacionesInformativas);
    }
    
    console.log('Notificación Eliminada:', notificacionEliminada);
  }
  

  clickEliminarUnadeCinco() {
    //Elimina una notificación de las 5 mostradas.
    const notificacionEliminada = this.cincoPrimerasNotificaciones.shift();
    console.log('Notificación Eliminada:', notificacionEliminada);
    this.notificacionesService.eliminarNotificacion(notificacionEliminada.idNotificacion).subscribe((res) => {
      console.log('Notificación Eliminada:', res);
    });
  }

  notificacionesRes(idUsuario: number) {
    console.log('ID Usuario:', idUsuario);
    this.notificacionesService
      .getNotificaciones(idUsuario)
      .subscribe((res:any) => {
        console.log("RESULTADOS");
        console.log(res);
        this.notificacionesCache = res;
        this.notificacionesInformativas = res.filter((notificacion: any) => notificacion.informativa === false);
        this.guardarNotificaciones = this.notificacionesCache.filter((notificacion: any) => notificacion.informativa === true);
        console.log('Notificaciones:', this.notificacionesCache);
        console.log('Notificaciones Informativas:', this.notificacionesInformativas);
        this.mostrarCincoPrimerasNotificaciones(res);
        this.intervalo = setInterval(() => {
          this.mostrarCincoPrimerasNotificaciones(res);
        }, 10000);
      });
      
  }

}
