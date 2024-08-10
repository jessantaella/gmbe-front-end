import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { GmbeServicesService } from '../gmbe/services/gmbe-services.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-objeto-mbe',
  templateUrl: './objeto-mbe.component.html',
  styleUrls: ['./objeto-mbe.component.scss']
})
export class ObjetoMbeComponent implements OnInit{

  private unsubscribe$: Subject<void> = new Subject<void>();

  private _data: any;
  imageUrl: SafeUrl | null = null;

  @Input()
  set data(value: any) {
    this._data = value;
    if (this._data?.ruta) {
      this.obtenerImagen(this._data.ruta);
    }
  }

  get data(): any {
    return this._data;
  }

constructor(private gmbeservices : GmbeServicesService,private sanitizer: DomSanitizer){}


ngOnInit(): void {
  /*if(this.data?.ruta)
    this.obtenerImagen(this.data?.ruta);*/
}


  /*obtenerImagen(ruta:string){
    this.gmbeservices.getImage(ruta)
    //.pipe(takeUntil(this.unsubscribe$))
    .subscribe(
      res=>{
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(res);
    },
      err=>{
        console.log(err)
      }
    );
  }*/



async obtenerImagen(ruta: string): Promise<void> {
  try {
    const res = await firstValueFrom(this.gmbeservices.getImage(ruta));
    this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(res);
  } catch (err) {
    console.error('Error al obtener la imagen:', err);
  }
}


  ngOnDestroy(): void {
    // Emite un valor para cancelar todas las suscripciones pendientes
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
