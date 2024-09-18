import { isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  PLATFORM_ID,
  ViewChild,
} from "@angular/core";

declare var ApexCharts: any;

@Component({
  selector: "app-burbujas",
  templateUrl: "./burbujas.component.html",
  styleUrls: ["./burbujas.component.scss"],
})
export class BurbujasComponent implements AfterViewInit {
  @ViewChild("chartContainer", { static: false }) chartContainer: ElementRef | undefined;
  @Input() chartId: string | undefined;
  @Input() bubbleData: { idGpo: number; nombreGpo: string; colorBubble: string; count: number }[] = [];

  w: number = 100;
  h: number = 50;

  public chartOptions: any;
  isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngAfterViewInit(): void {
    console.log("Bubble data provided");
    console.log(this.bubbleData);
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.bubbleData && this.bubbleData.length > 0) {
      this.chartOptions = this.getCharOptions();
      console.log("Bubble data provided");
      console.log(this.chartOptions);
      if (this.isBrowser) {
        setTimeout(() => {
          console.log("Rendering chart");
          const chart = new ApexCharts(this.chartContainer?.nativeElement, this.chartOptions);
          chart.render();
        }, 0);
      }
    } else {
      console.warn("No bubble data provided");
    }
  }

  getCharOptions() {
    const seriesData = this.bubbleData.map(bubble => this.generateBubbleData([bubble.count], bubble.nombreGpo, bubble.colorBubble));

    console.log("Series data"); 
    console.log(seriesData);

    const maxX = Math.max(...seriesData.map(d => d.x + d.z), 0);
    const maxY = Math.max(...seriesData.map(d => d.y + d.z), 0);
    const minX = Math.min(...seriesData.map(d => d.x - d.z), 0);
    const minY = Math.min(...seriesData.map(d => d.y - d.z), 0);

    // Encuentra el valor máximo de z (tamaño de burbuja)
    const maxZ = Math.max(...seriesData.map(d => d.z), 0);
    // Ajuste del tamaño máximo de burbuja
    const bubbleSizeFactor = 20; // Ajusta este factor según lo necesites

    return {
      grid: {
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
      },
      series: [
        {
          name: "Burbujas",
          data: seriesData,
        },
      ],
      chart: {
        responsive: true,
        height: this.h,
        width: this.w,
        type: "bubble",
        toolbar: {
          show: false,
        },
        background: "transparent",
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        opacity: 0.8,
      },
      title: {
        text: "",
      },
      xaxis: {
        min: minX,
        max: maxX,
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        min: minY,
        max: maxY,
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      legend: {
        show: true,
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: function (val: number, opts: any) {
            return opts.w.config.series[0].data[opts.dataPointIndex].nombreGpo;
          },
        },
      },
      markers: {
        size: seriesData.map(d => d.z / maxZ * bubbleSizeFactor), // Escala el tamaño de las burbujas
        colors: seriesData.map(d => d.colorBubble), // Utiliza el color de cada burbuja
      },
    };
  }

  generateBubbleData(zArray: number[], nombreGpo: string, colorBubble: string): { x: number; y: number; z: number; nombreGpo: string; colorBubble: string } {
    
    const chartWidth = this.w;
    const chartHeight = this.h;

    console.log(`Chart width=${chartWidth}, height=${chartHeight}`);
    
    let x = Math.random() * (chartWidth);
    let y = Math.random() * (chartHeight);
    
    console.log(`Bubble data: x=${x}, y=${y}, zArray=${zArray}, nombreGpo=${nombreGpo}, colorBubble=${colorBubble}`);
    
    // Encuentra el valor máximo de zArray
    const maxZ = Math.max(...zArray);

    console.log(`Max Z=${maxZ}`);

    // Ajustamos el valor de z tomando el último valor de zArray (por ejemplo) y normalizándolo
    const z = zArray[zArray.length - 1]; // O elige otro valor según sea necesario
    const zAdjusted: number = (z / maxZ) * 15;

    console.log(`Z adjusted=${zAdjusted}`);

    console.log(`Bubble data: x=${x}, y=${y}, z=${zAdjusted}, nombreGpo=${nombreGpo}, colorBubble=${colorBubble}`);
    
    // Validar que x, y, y z sean números válidos
    x = isNaN(x) ? 0 : x;
    y = isNaN(y) ? 0 : y;
  
    return { x, y, z: zAdjusted, nombreGpo, colorBubble };
  }
}
