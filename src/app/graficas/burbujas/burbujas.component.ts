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
  @Input() bubbleData: { idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number }[] = [];

  w: number = 200;
  h: number = 200;

  isBrowser = false;
  zArrayGuardado: number[] = [];
  valorMaximoZ: number = 0;

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
          this.getChartOptions();
        }, 0);
      }
    } else {
      console.warn("No bubble data provided");
    }
  }

  getChartOptions() {
    const seriesData = this.bubbleData.map(bubble => this.generateBubbleData(bubble));

    const alto = seriesData.reduce((acc, bubble) => Math.max(acc, bubble.alto), 0);
    const ancho = seriesData.reduce((acc, bubble) => Math.max(acc, bubble.ancho), 0);
    this.valorMaximoZ = seriesData.reduce((acc, bubble) => Math.max(acc, bubble.valorOriginalZ), 0);

    console.log("seriesData", seriesData);
    console.log("alto", alto);
    console.log("ancho", ancho);

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
        height: alto + 50,
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
          maxBubbleRadius: 25,
          minBubbleRadius: 5,
        }
      },
      xaxis: {
        min: 0,
        max: ancho,
        type: 'numeric',
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },

      yaxis: {
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
          return `<div class="tooltip-content"><span><strong>${bubbleData.nombreGpo}: ${bubbleData.valorOriginalZ}</strong></span><br></div>`;
        },
      }
    };
  }

  generateBubbleData(bubble: { idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number }) {
    const { count, nombreGpo, colorBubble, alto, ancho } = bubble;
    const chartWidth = ancho;
    const chartHeight = alto;

    console.log("z", count);

    this.actualizarZArrayGuardado(count);

    const maxZ = Math.max(...this.zArrayGuardado, 0);
    console.log("maxZ", maxZ);
    this.valorMaximoZ = maxZ;

    const bubbleSizeFactor = 23;

    const minBubbleSize = 7; // Minimum bubble size to ensure visibility
    const zAdjusted = Math.floor((bubbleSizeFactor * count) / 25) + minBubbleSize;

    // Asegura que la posición x no haga que la burbuja se salga por los lados
  const x = Math.floor(Math.random() * (chartWidth - 50 + 1)) + 25;

  // Asegura que la posición y no haga que la burbuja se salga por arriba o por abajo
  const y = Math.floor(Math.random() * (chartHeight - 60 + 1)) + 30;

  console.log("x", x);
  console.log("y", y);

    console.log("zAdjusted", zAdjusted);

    return {
      x: x,
      y: y,
      z: zAdjusted,
      fillColor: colorBubble,
      nombreGpo: nombreGpo,
      alto,
      ancho,
      valorOriginalZ: count,
      valorMaximoZ: maxZ,
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
      default:
        return "";
    }
  }
}
