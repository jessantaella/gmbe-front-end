import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GmbeServicesService } from '../services/gmbe-services.service';
import { TitulosService } from 'src/app/services/titulos.services';

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

  datosEvaluacionTabla: any;

  
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
  }

  abrirURL(url: string){
    window.open(url, "_blank");
  }

  datosEvaluacion(){
    console.log("idMbe: " + this.idMbe);
    console.log("fila: " + this.fila);
    console.log("columna: " + this.columna);
    console.log("idEvaluacion: " + this.idEvaluacion);

    this.gmbeService.datosEvaluacion(this.idMbe, this.fila, this.columna, this.idEvaluacion).subscribe(
      data => {
        console.log(data);
        this.datosEvaluacionTabla = data;
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
