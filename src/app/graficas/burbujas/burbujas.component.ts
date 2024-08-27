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

  w: number = 150; // Ajusta el ancho según sea necesario
  h: number = 100; // Ajusta la altura según sea necesario

  public chartOptions: any;
  isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngAfterViewInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.bubbleData && this.bubbleData.length > 0) {
      this.chartOptions = this.getCharOptions();
      console.log("Bubble data provided");
      console.log(this.chartOptions);
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
    const seriesData = this.bubbleData.map((bubble, index) =>
      this.generateBubbleData(bubble.count, bubble.nombreGpo, bubble.colorBubble, index)
    );
    
    // Ajuste del área de visualización para acomodar las burbujas
    const maxX = Math.max(...seriesData.map(d => d.x + d.z), 0);
    const maxY = Math.max(...seriesData.map(d => d.y + d.z), 0);
    const minX = Math.min(...seriesData.map(d => d.x - d.z), 0);
    const minY = Math.min(...seriesData.map(d => d.y - d.z), 0);

    const maxZ = Math.max(...seriesData.map(d => d.valorReal), 0);
    const bubbleSizeFactor = maxZ;
    console.log(maxZ)
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
        show: false,
      },
      tooltip: {
        enabled: true,
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const data = w.config.series[seriesIndex].data[dataPointIndex];
          return `
            <div style="padding: 5px; border-radius: 3px; background-color: ${data.colorBubble}; color: #fff;">
              <strong>${data.nombreGpo}</strong><br>
              Count: ${data.valorReal}
            </div>
          `;
        },
      },
      markers: {
        //size: seriesData.map(d => Math.max(d.z / bubbleSizeFactor * 20, 5)), // Ajusta el tamaño de las burbujas para asegurarse de que sean visibles
        colors: seriesData.map(d => d.colorBubble), // Asigna colores basados en el color de cada burbuja
      },
    };
  }

  generateBubbleData(z: number, nombreGpo: string, colorBubble: string, index: number): { x: number; y: number; z: number; nombreGpo: string; colorBubble: string, valorReal: number } {
    
    const chartWidth = this.w;
    const chartHeight = this.h;
    const margin = 10; // Ajuste del margen entre burbujas

    // Distribuir las burbujas en una cuadrícula
    const columns = Math.ceil(Math.sqrt(this.bubbleData.length)); // Número de columnas basado en el número total de burbujas
    const rows = Math.ceil(this.bubbleData.length / columns); // Número de filas basado en el número total de burbujas
    
    const columnWidth = (chartWidth - margin * (columns - 1)) / columns;
    const rowHeight = (chartHeight - margin * (rows - 1)) / rows;

    const colIndex = index % columns;
    const rowIndex = Math.floor(index / columns);

    let x = colIndex * (columnWidth + margin) + columnWidth / 2;
    let y = rowIndex * (rowHeight + margin) + rowHeight / 2;

    // Escalar el tamaño de las burbujas en función del valor máximo de `z`
    //let zAdjusted =Math.max((z / (Math.max(...this.bubbleData.map(b => b.count)) || 1)) * 10,5); // Ajusta este valor para escalar apropiadamente
    let maxCount = Math.max(...this.bubbleData.map(b => b.count)) || 1;
    let zAdjusted = z>6 ? (z / maxCount) * (maxCount / 10) : z*10;

    // Validar que x, y, y z sean números válidos
    x = isNaN(x) ? 0 : x;
    y = isNaN(y) ? 0 : y;
    zAdjusted = isNaN(zAdjusted) ? 5 : zAdjusted;
    
    console.log({ x, y, z: zAdjusted, nombreGpo, colorBubble, valorReal: z })
    return { x, y, z: zAdjusted, nombreGpo, colorBubble, valorReal: z };
  }
}


 /* Escenario 
  Cuando la burbuja mayor le lleve mas del 100% de tamaño a las otras
    Definir tamaño maximo de burbuja 
      -> cuando 2 sea maximo tendra el tamaño de una burbujota 
      -> 


      Definir la burbuja más grande y con base a esa sacar el porcentaje
        Paso 1. Pruebas para saber cuando se ve bien una burbuja 
        Paso 2, Calcular el porcentaje al que pertenece el valor z de la burbuja a la de referencia y calcular el tamaño.
      */
