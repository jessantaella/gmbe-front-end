import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageService } from '../services/storage-service.service';
import { CifradoService } from '../services/cifrado.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})

export class NotificacionesComponent implements OnInit, OnDestroy {

  notificacionesCache: any 
  margenNotificaciones = 0;
  cincoPrimerasNotificaciones: any = [];
  conteoObjeto = 0;
  conteoInicial = 0;
  banderaBucle: boolean = false;
  indice = 0;
  intervalo: any;
  notificaciones: any;
  
  constructor(private storage: StorageService, private cifrado: CifradoService) { }
  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      
    }
  }
  
  ngOnInit(): void {
    this.notificaciones = JSON.parse(this.cifrado?.descifrar(this.storage?.getItem('notificaciones')!));
    setInterval(() => {
      if (this.validaToken()) {
      const newValue = JSON.parse(this.cifrado?.descifrar(this.storage?.getItem('notificaciones')!));
        if (JSON.stringify(this.notificaciones) !== JSON.stringify(newValue)) {
          this.notificaciones = newValue;
          console.log('LocalStorage ha cambiado:', newValue);
          this.mostrarCincoPrimerasNotificaciones(this.notificaciones);

          this.intervalo = setInterval(() => {
            if (this.validaToken()) {
              this.notificacionesCache = this.notificaciones;
              console.log('Notificaciones actualizadas');
              this.mostrarCincoPrimerasNotificaciones(this.notificacionesCache);
            }
          }, 5000);
        }
      }else{
        console.log('Token no existe');
        this.notificacionesCache = [];
      }
      console.log('Notificaciones:', this.notificaciones);
    }, 1000); // Verifica cada segundo
  }

  validaToken(): boolean{
    return localStorage.getItem('token-gmbe')!== null;
  }

  mostrarCincoPrimerasNotificaciones(notificaciones: any) {
    console.log('Notificaciones:', notificaciones.length);
    console.log('Notificaciones:', this.notificacionesCache.length);
    if (this.cincoPrimerasNotificaciones.length <= notificaciones.length) {
      console.log('Notificaciones:', notificaciones);
      this.cincoPrimerasNotificaciones = this.notificacionesCache.length >= 5 ? this.notificacionesCache.slice(this.indice, this.indice + 5) : this.notificacionesCache.slice(this.indice, this.notificacionesCache.length);

      console.log('Indice:', this.indice);
      if (this.notificacionesCache.length >= 5 && (this.indice >= this.notificacionesCache.length)) {
        this.cincoPrimerasNotificaciones = [];
        this.indice = 0;
        clearInterval(this.intervalo);
      } else {
        if (this.indice >= this.notificacionesCache.length) {
          console.log('Indice:', this.indice);
          this.cincoPrimerasNotificaciones = [];
          this.indice = 0;
          clearInterval(this.intervalo);
        } else {
          this.indice += 5;
        }
      }

      console.log('Current Chunk:', this.cincoPrimerasNotificaciones);
    }
  }

}
