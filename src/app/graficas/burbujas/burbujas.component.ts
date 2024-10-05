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

declare var ApexCharts: any;

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

  public chartOptions: any;
  isBrowser = false;
  zArrayGuardado: number[] = [];
  valorMaximoZ: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: any, private storage: StorageService) { }

  ngAfterViewInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.bubbleData && this.bubbleData.length > 0) {
      this.chartOptions = this.getChartOptions();
      if (this.isBrowser) {
        setTimeout(() => {
          const chart = new ApexCharts(this.chartContainer?.nativeElement, this.chartOptions);
          chart.render();
        }, 0);
      }
    } else {
      console.warn("No bubble data provided");
    }
  }

  getChartOptions() {
    const seriesData = this.bubbleData.map(bubble => this.generateBubbleData(bubble));

    const maxX = Math.max(...seriesData.map(d => d.x + d.valorOriginalZ), 0);
    const maxY = Math.max(...seriesData.map(d => d.y + d.valorOriginalZ), 0);
    const minX = Math.min(...seriesData.map(d => d.x - d.valorOriginalZ), 0);
    const minY = Math.min(...seriesData.map(d => d.y - d.valorOriginalZ), 0);
    const alto = Math.max(...seriesData.map(d => d.alto), 0);
    const ancho = Math.max(...seriesData.map(d => d.ancho + 40), 0);
    const valorMaximoZ = Math.max(...seriesData.map(d => d.valorMaximoZ), 0);

    console.log("seriesData", seriesData);
    console.log("valorMaximoZ", valorMaximoZ);

    const intermedioZ = seriesData.map(d => d.z * 30);

    return {
      grid: {
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: false } },
      },
      series: [{ name: "Burbujas", data: seriesData }],
      chart: {
        responsive: true,
        height: alto,
        width: ancho,
        type: "bubble",
        toolbar: { show: false },
        background: "transparent",
        colors: seriesData.map(d => d.colorBubble),
        zoom: { enabled: false },
      },
      dataLabels: { enabled: false },
      fill: { opacity: 0.8 },
      title: { text: "" },
      xaxis: {
        min: minX,
        max: maxX,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: minY,
        max: maxY,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      legend: { show: true },
      markers: {
        size: seriesData.map(d => d.z),
        hover: { sizeOffset: 100 },
      },
      // plotOptions: {
      //   bubble: {
      //     minBubbleRadius: 15,
      //     maxBubbleRadius: valorMaximoZ,
      //   },
      //   marker: {
      //     hover: { size: undefined, sizeOffset: 0 },
      //   },
      // },
      tooltip: {
        enabled: true,
        custom: ({ series, seriesIndex, dataPointIndex, w }: { series: any; seriesIndex: number; dataPointIndex: number; w: any }) => {
          const bubbleData = w.config.series[seriesIndex].data[dataPointIndex];
          return `<div class="tooltip-content"><span><strong>${bubbleData.nombreGpo}: ${bubbleData.valorOriginalZ}</strong></span><br></div>`;
        },
      },
      states: {
        hover: { filter: { type: 'none' } },
      },
    };
  }

  generateBubbleData(bubble: { idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number }) {
    const { count, nombreGpo, colorBubble, alto, ancho } = bubble;
    const chartWidth = ancho;
    const chartHeight = alto + 40;

    const x = Math.max(0, Math.min(Math.random() * chartWidth, chartWidth));
    const y = Math.max(0, Math.min(Math.random() * chartHeight, chartHeight));

    this.actualizarZArrayGuardado(count);

    const maxZ = Math.max(...this.zArrayGuardado, 0);
    this.valorMaximoZ = maxZ;

    const bubbleSizeFactor = 40;
    const zAdjusted = (count / maxZ) * bubbleSizeFactor;

    return {
      x: isNaN(x) ? 0 : x,
      y: isNaN(y) ? 0 : y,
      z: isNaN(zAdjusted) ? 0 : zAdjusted,
      nombreGpo,
      colorBubble,
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
        return "zArrayGuardado";
    }
  }
}
