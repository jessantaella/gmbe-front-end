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
import { StorageService } from "src/app/services/storage-service.service";

import ApexCharts from 'apexcharts';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexXAxis,
  ApexDataLabels,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexGrid,
  ApexStates,
  ApexMarkers,
  ApexTooltip,
  ApexPlotOptions
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  states: ApexStates;
  markers: ApexMarkers;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions
};

@Component({
  selector: "app-burbujas",
  templateUrl: "./burbujas.component.html",
  styleUrls: ["./burbujas.component.scss"],
})
export class BurbujasComponent implements AfterViewInit {
  @ViewChild("chartContainer", { static: false }) chartContainer: ElementRef | undefined;
  @Input() chartId: string | undefined;
  @Input() chartTitle: string | undefined;
  @Input() bubbleData: { idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number, valorMinimoZ:number, valorMaximoZ:number }[] = [];

  w: number = 200;
  h: number = 200;

  isBrowser = false;
  zArrayGuardado: number[] = [];
  valorMaximoZ: number = 0;
  valorMinimoZ: number = 0;

  @ViewChild("chart") chart: ChartComponent | undefined;
  chartOptions: Partial<ChartOptions> | undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: any, private storage: StorageService) { }

  ngAfterViewInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log("bubbleData", this.bubbleData);
    if (this.bubbleData && this.bubbleData.length > 0) {
      if (this.isBrowser) {
        setTimeout(() => {
          // const chart = new ApexCharts(this.chartContainer?.nativeElement, this.chartOptions);
          // chart.render();
          this.valorMaximoMinimoZ(this.bubbleData);
          this.getChartOptions();
        }, 0);
      }
    } else {
      console.warn("No bubble data provided");
    }
  }

  valorMaximoMinimoZ(bubbleData: { idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number, valorMinimoZ: number, valorMaximoZ: number }[]) {
    this.valorMaximoZ = bubbleData[0]?.valorMaximoZ;
    this.valorMinimoZ = bubbleData[0]?.valorMinimoZ;
  }

  getChartOptions() {
    const seriesData = this.bubbleData.map(bubble => this.generateBubbleData(bubble));

    const alto = seriesData.reduce((acc, bubble) => Math.max(acc, bubble.alto), 0);
    const ancho = seriesData.reduce((acc, bubble) => Math.max(acc, bubble.ancho), 0);

    //Crea una constante que cuente el numero de burbujas que se van a mostrar
    const numeroBurbujas = seriesData.length;
    console.log("numeroBurbujas", numeroBurbujas);

    this.chartOptions = {
      grid: {
        
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        xaxis: { lines: { show: false }  },
        yaxis: { lines: { show: false } },
      },
      series: [{
        data: seriesData 
      }],
      chart: {
        type: "bubble",
        height: alto > 100 ? alto  : alto + 100, // Ensure a minimum height for better visibility
        width: ancho - 15, 
        toolbar: { show: false },
        background: "transparent",
        zoom: { enabled: false },
        offsetX: 0,  // Elimina el desplazamiento horizontal
        offsetY: 0,
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        opacity: 0.8,
        colors: seriesData.map(bubble => bubble.fillColor),
      },
      title: {
        text: '',
      },
      markers: {
        size : 0,
        hover: { sizeOffset: 0 },

      },
      plotOptions: {
        bubble: {
          //El valor maxBubbleRadius es el tamaño maximo de la burbuja, el valor minBubbleRadius es el tamaño minimo de la burbuja que acepta el grafico
          //El valor es 25 para no salirse del grafico
          maxBubbleRadius: 25,
          minBubbleRadius: 5,
        }
      },
      xaxis: {
        //El valor min es donde empieza el eje x, el valor max es donde termina el eje tomando en cuenta el ancho del th
        min: 0,
        max: ancho,
        type: 'numeric',
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },

      yaxis: {
        //El valor min es donde empieza el eje y, el valor max es donde termina el eje tomando en cuenta el alto del th
        min: 0,
        max: alto,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      states: {
        hover: { filter: { type: 'none' } },
      },
      tooltip: {
        enabled: true,
        custom: ({ series, seriesIndex, dataPointIndex, w }: { series: any; seriesIndex: number; dataPointIndex: number; w: any }) => {
          const bubbleData = w.config.series[seriesIndex].data[dataPointIndex];
            return `<div class="tooltip-content" style="text-align: center;">
            <div style="display: flex; align-items: center; margin: 5px;">
                  <span style="width: 15px; height: 15px; background-color: ${bubbleData.fillColor}; border-radius: 50%; margin-right: 8px; display: inline-block;"></span>
                  <span><strong>${bubbleData.nombreGpo}: ${bubbleData.valorOriginalZ}</strong></span><br>
            </div>
            </div>`;
        },
      }
    };
  }

  generateBubbleData(bubble: { idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number, valorMinimoZ: number, valorMaximoZ: number }) {
    const { count, nombreGpo, colorBubble, alto, ancho } = bubble;
    const chartWidth = ancho;
    const chartHeight = alto;

    console.log("z", count);

    this.actualizarZArrayGuardado(count);
    //El valor de z primero se multiplica por el factor de tamaño de burbuja y luego se divide por 25, luego se le suma el valor minimo de tamaño de burbuja
    //El valor minimo es igual al valor minimo aceptado mas dos puntos para que no se salga del grafico
    //El valor maximo es igual al valor maximo aceptado descontando dos puntos para que no se salga del grafico
    const zAdjusted = Math.floor(count); 

    // Asegura que la posición x no haga que la burbuja se salga por los lados
  //Toma un valor aleatorio y lo multiplica por el valor mas grande ancho del grafico y el valor mas pequeño ancho del grafico, luego solo se le suma el valor mas pequeño del grafico
  let x = Math.floor(Math.random() * (chartWidth - 50 + 1)) + 25;

  // Asegura que la posición y no haga que la burbuja se salga por arriba o por abajo
  //Toma un valor aleatorio y lo multiplica por el valor mas grande alto del grafico y el valor mas pequeño alto del grafico, luego solo se le suma el valor mas pequeño del grafico
  let y = Math.floor(Math.random() * (chartHeight - 60 + 1)) + 30;

  // Guarda las coordenadas en localStorage
  const coordStorageKey = this.titulosStorage('coordenadas');
  let coordArrayGuardado = JSON.parse(this.storage.getItem(coordStorageKey) || "[]");

  // Genera nuevas coordenadas si ya existen en el almacenamiento
  while (coordArrayGuardado.some((coord: [number, number]) => coord[0] === x && coord[1] === y)) {
    const bubbleDiameter = zAdjusted * 2; // Assuming zAdjusted represents the radius of the bubble
    console.log("Entro al while");
    x = Math.floor(Math.random() * (chartWidth - bubbleDiameter + 1)) + bubbleDiameter / 2;
    y = Math.floor(Math.random() * (chartHeight - bubbleDiameter + 1)) + bubbleDiameter / 2;
  }

  // Almacena las nuevas coordenadas
  coordArrayGuardado.push([x, y]);
  console.log("coordArrayGuardado", coordArrayGuardado);
  this.storage.setItem(coordStorageKey, JSON.stringify(coordArrayGuardado));

    return {
      x: x,
      y: y,
      z: zAdjusted,
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
    const storageKey = this.titulosStorage(this.chartTitle);
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
        return "zArrayGuardado4";
      case "ValoresMaximosMinimos":
        return "ValoresMaximosMinimos";
      case "coordenadas":
        return "coordenadas";
      default:
        return "";
    }
  }
}
