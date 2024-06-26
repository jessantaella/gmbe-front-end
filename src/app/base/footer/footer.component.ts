import { Component } from '@angular/core';
import { DataDynamic } from '../services/dinamic-data.services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  generales:any;
  datos:any;
  redes:any;

  logoBlanco = '';

  constructor(private servicio:DataDynamic) { }

  ngOnInit(): void {
    this.consultarData();
    this.logoBlanco = environment.recursos + 'LOGO_CONEVAL-BLANCO.svg';
  }

  consultarData(){
    this.servicio.getInformacion().subscribe(
      res=>{
        this.generales = res.generales;
        this.redes = res.generales.redes;
      }
    )
   }

}