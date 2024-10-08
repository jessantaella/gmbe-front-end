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
  @Input() bubbleData: { idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number, valorMinimoZ:number, valorMaximoZ:number }[] = [];

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

  constructor(@Inject(PLATFORM_ID) private platformId: any, private storage: StorageService) { }

  ngAfterViewInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    //console.log("bubbleData", this.bubbleData);
    if (this.bubbleData && this.bubbleData.length > 0) {
      if (this.isBrowser) {
        setTimeout(() => {
          // const chart = new ApexCharts(this.chartContainer?.nativeElement, this.chartOptions);
          // chart.render();
          //this.valorMaximoCount(this.bubbleData);
          //this.valorMaximoMinimoZ(this.bubbleData);
          this.altoAnchor(this.bubbleData);
          this.chartBubbleData();
          this.chart.render();
        }, 0);
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
            callbacks: {
              label: function (context: any) {
                const { datasetIndex, dataIndex } = context;
                const { nombreGpo, valorOriginalZ } = bubbleData[dataIndex];
                return `${nombreGpo}: ${valorOriginalZ}`;
              }
            },
            bodyFont: {
              size: 16
            },
          },
        },
        elements: {
          line: {
            borderWidth: 0 // Desactivar cualquier borde o línea
          },
          point: {
            radius: function(context) {
              const rValue = (context.raw as { r: number }).r;
              const minSize = 0;
              const maxSize = 25;
              return Math.max(minSize, Math.min(rValue, maxSize));
            }
          }
        }
      }
    });
  }

  valorMaximoCount(bubbleData: { idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number, valorMinimoZ: number, valorMaximoZ: number }[]) {
    this.valorMaximoCountData = Math.max(...bubbleData.map(d => d.count), 0);
    this.valorMinimoCountData = Math.min(...bubbleData.map(d => d.count), 0);
    this.lengthArreglo = bubbleData.length;
    console.log("minCount", this.valorMinimoCountData);
    console.log("maxCount", this.valorMaximoCountData);
    console.log("lengthArreglo", this.lengthArreglo);
  }

  valorMaximoMinimoZ(bubbleData: { idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number, valorMinimoZ: number, valorMaximoZ: number }[]) {
    this.valorMaximoZ = bubbleData[0]?.valorMaximoZ;
    this.valorMinimoZ = bubbleData[0]?.valorMinimoZ;
  }

  generateBubbleData(bubble: { idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number, valorMinimoZ: number, valorMaximoZ: number }) {
    const { count, nombreGpo, colorBubble, alto, ancho } = bubble;
    const chartWidth = ancho;
    const chartHeight = alto;
    let contador = count;
    if (contador <= 1) {
      contador = count + 4;
    }else{
      if (contador > 25) {
        contador = 25;
      }
    }

    let zAdjusted = contador;

     //Toma un valor aleatorio y lo multiplica por el valor mas grande ancho del grafico y el valor mas pequeño ancho del grafico, luego solo se le suma el valor mas pequeño del grafico
    let x = Math.floor( Math.random() * chartWidth - 50 + 1) + 25;

    // Asegura que la posición y no haga que la burbuja se salga por arriba o por abajo
    //Toma un valor aleatorio y lo multiplica por el valor mas grande alto del grafico y el valor mas pequeño alto del grafico, luego solo se le suma el valor mas pequeño del grafico
    let y = Math.floor(Math.random() * chartHeight - 60 + 1) + 30;
    

    return {
      x: x,
      y: y,
      r: zAdjusted,
      fillColor: colorBubble,
      nombreGpo: nombreGpo,
      alto,
      ancho,
      valorOriginalZ: count,
      valorMinimoZ: bubble.valorMinimoZ,
      valorMaximoZ: bubble.valorMaximoZ
    };
  }

  actualizarZArrayGuardado(z: number) {
    const storageKey = this.titulosStorage('GraficaPanel');
    this.zArrayGuardado = JSON.parse(this.storage.getItem(storageKey) || "[]");
    this.zArrayGuardado.push(z);
    this.storage.setItem(storageKey, JSON.stringify(this.zArrayGuardado));
  }

  titulosStorage(title: string | undefined): string {
    switch (title) {
      case "GraficaPrincipal":
        return "zArrayGuardado";
      case "GraficaModal1":
        return "zArrayGuardado2";
      case "GraficaModal2":
        return "zArrayGuardado3";
      case "GraficaPanel":
        return "GraficaPanel";
      case "ValoresMaximosMinimos":
        return "ValoresMaximosMinimos";
      case "coordenadas":
        return "coordenadas";
      default:
        return "";
    }
  }
}
