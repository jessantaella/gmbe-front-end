import { isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { Chart, ChartConfiguration, ChartItem } from 'chart.js';
import { StorageService } from "src/app/services/storage-service.service";


@Component({
  selector: "app-burbujas",
  templateUrl: "./burbujas.component.html",
  styleUrls: ["./burbujas.component.scss"],
})
export class BurbujasComponent implements AfterViewInit {
  @Input() chartId: string | undefined;
  @Input() chartTitle: string | undefined;
  @Input() bubbleData: {idMbe: number, idFila:number, idColumna:number, idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number, valorMinimoZ:number, valorMaximoZ:number }[] = [];

  w: number = 200;
  h: number = 200;

  isBrowser = false;
  zArrayGuardado: number[] = [];
  valorMaximoZ: number = 0;
  valorMinimoZ: number = 0;

  valorMaximoCountData: number = 0;
  valorMinimoCountData: number = 0;
  lengthArreglo: number = 0;

  alto: number = 0;
  ancho: number = 0;

  public chart: any;

  constructor(@Inject(PLATFORM_ID) private platformId: any, private storage: StorageService, private router: Router) { }

  ngAfterViewInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    //console.log("bubbleData", this.bubbleData);
    this.altoAnchor(this.bubbleData);
    console.log("bubbleData", this.bubbleData);
    if (this.bubbleData && this.bubbleData.length > 0) {
      if (this.isBrowser) {
        setTimeout(() => {
          // const chart = new ApexCharts(this.chartContainer?.nativeElement, this.chartOptions);
          // chart.render();
          //this.valorMaximoCount(this.bubbleData);
          //this.valorMaximoMinimoZ(this.bubbleData);
          //this.valorMaximoCount(this.bubbleData);
          this.chartBubbleData();
          this.chart.render();
        }, 500);
      }
    } else {
      //console.warn("No bubble data provided");
    }
  }

  altoAnchor(bubbleData: { idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number, valorMinimoZ: number, valorMaximoZ: number }[]) {
    this.alto = bubbleData[0]?.alto;
    this.ancho = bubbleData[0]?.ancho;
  }

  chartBubbleData() {
    const bubbleData = this.bubbleData.map(this.generateBubbleData);
    const colorBubble = this.bubbleData.map((d) => d.colorBubble);

    console.log("bubbleData", bubbleData);
    this.chart = new Chart( this.chartId as ChartItem ,{
      type: 'bubble', //this denotes tha type of chart

      data: {
        datasets: [{
          data: bubbleData,
          backgroundColor: colorBubble
        }]
      },
    
      options: {
        responsive: true,
        onClick: (e: any, item: any) => {
          if (item.length > 0) {
            const { datasetIndex, index } = item[0];
            const { idMbe, idFila, idColumna, idGpo } = bubbleData[index];
            
            if (!this.router.url.includes('vista-previa')) {
              this.tablaEvaluacion(idMbe, idFila, idColumna, Number(idGpo));
            }

          }
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
          }
        },
        plugins: {
          legend: {
            display: false // Ocultar la leyenda si no es necesaria
          },
          tooltip: {
            /** Hay una forma de tomar el tooltip de manera de etiqueta de HTML pero sigue sin poder mostrarse bien ya que 
             * se corta el texto ya que el canvas solo ocupa lo del th de la tabla
             */
            position: 'average',
            callbacks: {
              label: function (context: any) {
                const { datasetIndex, dataIndex } = context;
                const { nombreGpo, valorOriginalZ } = bubbleData[dataIndex];
                return `${nombreGpo} ${valorOriginalZ}`;
              }
            },
            //Aqui tomas el estilo tamaño de la fuente del tooltip
            /**Se probara con un font de 12, pero lo recomendable es 10, ya que hace que no se salga del canvas */
            bodyFont: {
              size: 12
            },
          },
        },
        elements: {
          line: {
            borderWidth: 0 // Desactivar cualquier borde o línea
          },
          
        }
      }
    });
  }

  tablaEvaluacion(idMbe: number, fila: number, columna: number, idGpo: number) {
    this.router.navigate(['/evaluacion'], { queryParams: { idMbe: idMbe, idFila: fila, idColumna: columna, idEva: idGpo } });
  }



  generateBubbleData(bubble: { idMbe:number, idFila:number, idColumna:number, idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number, valorMinimoZ: number, valorMaximoZ: number }) {
    const { count, nombreGpo, colorBubble, alto, ancho } = bubble;
    const chartWidth = ancho;
    const chartHeight = alto;
    let contador = count;

    console.log("contador", contador);

    /**ZAjusted es el calculo que toma a partir de los datos que llega del contador, basicamente solo tomo el maximo y minimo de los datos
     * y hago una regla de tres para que los datos se ajusten a un rango de 0 a 15 que es el rango que se va a mostrar en la burbuja
     * Tambien se le suma 1 a los valores para que no se divida entre 0 o sea infinito
     */
    

    let zAdjusted =  Math.floor(((contador + 1 - bubble.valorMinimoZ + 1) / (bubble.valorMaximoZ + 1 - bubble.valorMinimoZ + 1)) * (15 - 0) )+ 5;

    console.log("zAdjusted", zAdjusted);

    let x = Math.floor(Math.random() * chartWidth - 0 + 1) + 80;

    let y = Math.floor(Math.random() * chartHeight - 0 + 1) + 50;
    

    return {
      x: x,
      y: y,
      r: zAdjusted,
      idMbe: bubble.idMbe,
      idFila: bubble.idFila,
      idColumna: bubble.idColumna,
      idGpo: bubble.idGpo,
      fillColor: colorBubble,
      nombreGpo: nombreGpo,
      alto,
      ancho,
      valorOriginalZ: count,
      valorMinimoZ: bubble.valorMinimoZ,
      valorMaximoZ: bubble.valorMaximoZ
    };
  }
}
