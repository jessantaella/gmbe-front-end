import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GmbeServicesService } from '../services/gmbe-services.service';
import { TitulosService } from 'src/app/services/titulos.services';
import {
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-evaluacion',
  templateUrl: './evaluacion.component.html',
  styleUrls: ['./evaluacion.component.scss']
})
export class EvaluacionComponent implements OnInit {

  idMbe = 0;
  fila = 0;
  columna = 0;
  idEvaluacion = 0;

  textoBienvenida = "Evaluación";
  faRotate = faRotateLeft;


  datosEvaluacionTabla: any;
  tituloAcotaciones: any;

  
    constructor(private route: ActivatedRoute, private gmbeService: GmbeServicesService, private titulos: TitulosService, private router: Router) {
      this.titulos.changeBienvenida(this.textoBienvenida);
      this.titulos.changePestaña(this.textoBienvenida);
      this.route.queryParams.subscribe(params => {
        this.idMbe = Number(params['idMbe']);
        this.fila = Number(params['idFila']);
        this.columna = Number(params['idColumna']);
        this.idEvaluacion = Number(params['idEva']);
      });
     }
  ngOnInit(): void {
    this.datosEvaluacion();
    this.tituloAcotacion();
  }

  tituloAcotacion() {
    this.gmbeService.obtenerAcotaciones(this.idMbe).subscribe(
      res => {
        console.log('Acotación:', res);
        this.tituloAcotaciones = res.tipoEvaluacion;
        console.log('tituloAcotaciones', this.tituloAcotaciones);
      },
      err => {
        console.error('Error al obtener acotación:', err);
      }
    );
  }

  abrirURL(url: string){
    window.open(url, "_blank");
  }

  datosEvaluacion(){

    this.gmbeService.datosEvaluacion(this.idMbe, this.fila, this.columna, this.idEvaluacion).subscribe(
      data => {
        console.log(data);
        this.datosEvaluacionTabla = data;
        // if (this.datosEvaluacionTabla.every((item: any) => 
        //   item.nombreIntervencion === null &&
        //   item.tituloEvaluacion === null &&
        //   item.anioEval === 0 &&
        //   item.tipoEvaluacion === null &&
        //   item.link === null)) {
        //   this.datosEvaluacionTabla = [];
        // }
      },
      error => {
        console.log(error);
      }
    );
  }

  regresarPanelResultados(){
    this.router.navigate(['/panel'], { queryParams: { idMbe: this.idMbe } });
  }
}
