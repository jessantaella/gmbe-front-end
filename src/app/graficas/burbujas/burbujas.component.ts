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
  @Input() bubbleData: { idGpo: number; nombreGpo: string; colorBubble: string; count: number }[] = [];

  w: number = 100;
  h: number = 100;

  public chartOptions: any;
  valorZguardado: any;
  isBrowser = false;
  zArrayGuardado: any;
  valorMaximoZ: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: any, private storage:StorageService) {}

  ngAfterViewInit(): void {
    console.log("Bubble data");
    console.log(this.chartTitle);
    console.log(this.bubbleData);
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.bubbleData && this.bubbleData.length > 0) {
      this.chartOptions = this.getCharOptions();
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

  getCharOptions() {
    const seriesData = this.bubbleData.map(bubble => this.generateBubbleData([bubble.count], bubble.nombreGpo, bubble.colorBubble,this.chartTitle || ''));

    console.log("Series data"); 
    console.log(seriesData);

    const maxX = Math.max(...seriesData.map(d => d.x + d.z), 0);
    const maxY = Math.max(...seriesData.map(d => d.y + d.z), 0);
    const minX = Math.min(...seriesData.map(d => d.x - d.z), 0);
    const minY = Math.min(...seriesData.map(d => d.y - d.z), 0);

    // Encuentra el valor máximo de z (tamaño de burbuja)
    console.log("valorMaximoZ");
    console.log(this.valorMaximoZ);
    const maxZ = this.valorMaximoZ;
    // Ajuste del tamaño máximo de burbuja
    let bubbleSizeFactor = 30; // Ajusta este factor según lo necesites

    if (this.valorMaximoZ > 3) {
      console.log("maxZ");
      bubbleSizeFactor = 16;
    } else {
      if (this.valorMaximoZ > 3)  {
        console.log("minZ");
        bubbleSizeFactor = 120;
      } else {
        console.log("else");
        bubbleSizeFactor = 10;
      }
    }

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
      markers: {
        size: seriesData.map(d => d.z / this.valorMaximoZ * bubbleSizeFactor), // Escala el tamaño de las burbujas
        colors: seriesData.map(d => d.colorBubble), // Utiliza el color de cada burbuja
        hover: {
          sizeOffset: 100 // Aumenta el área de interacción al pasar el mouse
        },
      },
      plotOptions: {
        bubble: {
          minBubbleRadius: 5, // Ajusta el radio mínimo
          maxBubbleRadius: 80, // Ajusta el radio máximo para una mayor área de interacción
        },
        marker: {
          hover: {
            size: undefined, // para evitar que cambie el tamaño
            sizeOffset: 0, // para evitar cualquier cambio de tamaño o brillo
          }
        }
      },
      tooltip: {
        enabled: true,
        custom: function({ series, seriesIndex, dataPointIndex, w }: { series: any; seriesIndex: number; dataPointIndex: number; w: any }) {
          const bubbleData = w.config.series[seriesIndex].data[dataPointIndex];
          console.log("Bubble data");
          console.log(bubbleData);
          return `<div class="tooltip-content">
                    <span><strong>Grupo: </strong>${bubbleData.nombreGpo}</span><br>
                    <span><strong>Número de la evaluación:</strong></span><br>
                    <span><strong>Valor: </strong>${bubbleData.z}</span>
                  </div>`;
        }
      },
      states: {
        hover: {
          filter: {
            type: 'none' // Desactiva el filtro de hover (el resalte)
          }
        }
      }
    };
  }

  generateBubbleData(zArray: number[], nombreGpo: string, colorBubble: string, titulo:string): { x: number; y: number; z: number; nombreGpo: string; colorBubble: string } {
    const chartWidth = this.w;
    const chartHeight = this.h;

    // Generate random x and y coordinates within the chart dimensions
    const x = Math.random() * chartWidth;
    const y = Math.random() * chartHeight;

    console.log("titulo");
    console.log(titulo);

    switch (titulo) {
      case "GraficaPrincipal":
        //Almacena todos los valores de z que vayan llegando en un array en local storage sin perder los valores anteriores
        this.zArrayGuardado = JSON.parse(this.storage.getItem("zArrayGuardado") || "[]");
        this.zArrayGuardado.push(zArray[0]);
        this.storage.setItem("zArrayGuardado", JSON.stringify(this.zArrayGuardado));
        console.log("zArrayGuardado");
        console.log(this.zArrayGuardado);
        break;
      case "GraficaModal1":
        this.zArrayGuardado = JSON.parse(this.storage.getItem("zArrayGuardado2") || "[]");
        this.zArrayGuardado.push(zArray[0]);
        this.storage.setItem("zArrayGuardado2", JSON.stringify(this.zArrayGuardado));
        console.log("zArrayGuardado2");
        console.log(this.zArrayGuardado);
        break;
      case "GraficaModal2":
        this.zArrayGuardado = JSON.parse(this.storage.getItem("zArrayGuardado3") || "[]");
        this.zArrayGuardado.push(zArray[0]);
        this.storage.setItem("zArrayGuardado3", JSON.stringify(this.zArrayGuardado));
        console.log("zArrayGuardado3");
        console.log(this.zArrayGuardado);
        break;
      
    }

    //Cuando termine de cargar la página, se obtiene el valor de zArrayGuardado y se buscara el valor máximo
    let maxZ = Math.max(...this.zArrayGuardado, 0);
    let minZ = Math.min(...this.zArrayGuardado, 1);

    this.valorMaximoZ = maxZ;

    // Ajuste del tamaño máximo de burbuja
    let bubbleSizeFactor; // Ajusta este factor según lo necesites

    console.log("zArrayGuardado");
    console.log(this.zArrayGuardado);

    //Si el valor de zArray[0] es igual al valor máximo de zArrayGuardado, entonces la escala de las burbujas será 30 y si no, será 55
    if (maxZ ==  zArray[0] && zArray[0] > 3) {
      console.log("maxZ");
      bubbleSizeFactor = 16;
    } else {
      if (minZ == zArray[0] && zArray[0] > 3)  {
        console.log("minZ");
        bubbleSizeFactor = 120;
      } else {
        console.log("else");
        bubbleSizeFactor = 10;
      }
    }

    // Ajusta el tamaño de la burbuja según el valor de z donde z es el tamaño de la burbuja y maxZ es el valor máximo de z
    const zAdjusted = zArray[0] / maxZ * bubbleSizeFactor;

    // Ensure x, y, and z are valid numbers
    const validX = isNaN(x) ? 0 : x;
    const validY = isNaN(y) ? 0 : y;
    const validZ = isNaN(zAdjusted) ? 0 : zAdjusted;
    return { x: validX, y: validY, z: validZ, nombreGpo, colorBubble };
  }
}
