import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { DataDynamic } from '../services/dinamic-data.services';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  generales:any;
  datos:any;
  redes:any;
  isBrowser = false;

  constructor(private servicio:DataDynamic,
    @Inject(PLATFORM_ID) private platformId: any,
    private dinamicService: DataDynamic
  ) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.consultarData();
  }

  consultarData(){
    this.servicio.getInformacion().subscribe(
      res=>{
        this.generales = res.generales;
        this.redes = res.generales.redes;
      },
      err=>{
        console.error(err);
      }
    )
   }

   getImagen(imagen: string) {
    return this.dinamicService.getImagen(imagen);
  }

}