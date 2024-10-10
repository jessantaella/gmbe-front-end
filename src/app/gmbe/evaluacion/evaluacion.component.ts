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

  currentPage: number = 0;
  page: number = 0;
  pageSize: number = 10;
  items: number = 0;
  totalPage: number = 0;
  isModeSearch: boolean = false;
  desde: number = 0;

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

  loadPage(e: number) {
    if (e !== this.currentPage) {
      console.log('currentPage');
      console.log(this.currentPage);
      this.datosEvaluacion(e - 1, this.pageSize);
    }
  }

  datosEvaluacion(page: number = 0, size: number = 10) {

    this.gmbeService.datosEvaluacion(this.idMbe, this.fila, this.columna, this.idEvaluacion, page, size).subscribe(
      data => {
        console.log(data);
        this.datosEvaluacionTabla = data.content!;
        this.items = data?.totalElements;
        this.page = data?.pageable?.pageNumber + 1;
        this.currentPage = data?.pageable?.pageNumber + 1;
        this.totalPage = data.totalPages;
        this.desde = (this.page - 1) * this.pageSize + 1;
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
