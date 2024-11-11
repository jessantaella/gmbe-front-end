import { animation } from "@angular/animations";
import { isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
} from "@angular/core";
import { Router } from "@angular/router";
import { Chart, ChartConfiguration, ChartItem } from 'chart.js';
import { fromEvent, throttleTime } from "rxjs";
import { StorageService } from "src/app/services/storage-service.service";

@Component({
  selector: "app-burbujas",
  templateUrl: "./burbujas.component.html",
  styleUrls: ["./burbujas.component.scss"],
})
export class BurbujasComponent implements AfterViewInit, OnDestroy {
  @Input() chartId: string | undefined;
  @Input() chartTitle: string | undefined;
  @Input() bubbleData: { idMbe: number; idFila: number; idColumna: number; idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number; valorMinimoZ: number; valorMaximoZ: number }[] = [];

  private static chartsCache = new Map<string, Chart>();
  private cachedBubbleData: any[] = [];
  public chart: Chart | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: any, private storage: StorageService, private router: Router) { }

  ngAfterViewInit(): void {
    
    if (this.bubbleData && this.bubbleData.length > 0 && isPlatformBrowser(this.platformId)) {
  
      requestAnimationFrame(() => {
        this.createOrUpdateChart();
      });
    } else {
      console.warn("No bubble data provided");
    }
  }

  ngOnDestroy(): void {
    // Elimina el gráfico del cache si es necesario
    if (this.chart) {
      this.chart.destroy();
      BurbujasComponent.chartsCache.delete(this.chartId as string);
    }
  }

  private createOrUpdateChart() {
    // Inicializar el array para almacenar las posiciones existentes
    let burbujasExistentes: Array<{ x: number, y: number, r: number }> = [];

    if (this.cachedBubbleData.length === 0) {
      this.cachedBubbleData = this.bubbleData.map(bubble => this.generateBubbleData(bubble, burbujasExistentes));
    }
  
    if (BurbujasComponent.chartsCache.has(this.chartId as string)) {
      this.chart = BurbujasComponent.chartsCache.get(this.chartId as string)!;
      this.chart.data.datasets[0].data = this.cachedBubbleData; // Usa datos ya cacheados
      this.chart.update();
    } else {
      const colorBubble = this.bubbleData.map((d) => d.colorBubble);
  
      this.chart = new Chart(this.chartId as ChartItem, {
        type: 'bubble',
        data: {
          datasets: [{
            data: this.cachedBubbleData,
            backgroundColor: colorBubble,
          }],
        },
        options: this.getChartOptions(this.cachedBubbleData),
      });
  
      BurbujasComponent.chartsCache.set(this.chartId as string, this.chart);
    }
  }

  private getChartOptions(bubbleData: any[]) {
    return {
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
      animation: { duration: 0 },
      scales: {
        x: { display: false },
        y: { display: false },
      },
      plugins: {
        legend: { display: false },
        decimation: {
          enabled: true,
          algorithm: 'lttb' as 'lttb', 
          samples: 1000       
        },
        tooltip: {
          position: 'average' as 'average',
          callbacks: {
            label: (context: any) => {
              const { datasetIndex, dataIndex } = context;
              const { nombreGpo, valorOriginalZ } = bubbleData[dataIndex];
              return `${nombreGpo} ${valorOriginalZ}`;
            }
          },
          bodyFont: { size: 10 },
        },
      },
      elements: {
        line: { borderWidth: 0 },
      }
    };
  }

  generateBubbleData(
    bubble: { idMbe: number; idFila: number; idColumna: number; idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number; valorMinimoZ: number; valorMaximoZ: number }, 
    burbujasExistentes: Array<{ x: number, y: number, r: number }>
  ) {
      const { count, nombreGpo, colorBubble } = bubble;
      const chartWidth = 250;
      const chartHeight = 250;
  
      // Radio basado en el valor de count
      const r = Math.floor(((count + 1 - 1) / (60 + 1 - 1)) * (25 - 0)) + 5;
      const padding = 40; // Espacio mínimo entre burbujas
  
      // Posición inicial
      let x = Math.random() * chartWidth;  // Empezar con una posición aleatoria
      let y = Math.random() * chartHeight; 
  
      let intentos = 0;
      const desplazamientos = 100; // Máximo número de desplazamientos permitidos
  
      const estaCerca = (b1: { x: number, y: number, r: number }, b2: { x: number, y: number, r: number }) => {
        const distancia = Math.sqrt(Math.pow(b1.x - b2.x, 2) + Math.pow(b1.y - b2.y, 2));
        return distancia < (b1.r + b2.r + padding);
      };
  
      // Reubicar burbuja si la posición está ocupada
      while (burbujasExistentes.some(b => estaCerca(b, { x, y, r })) && intentos < desplazamientos) {
        intentos++;
  
        // Desplazar en una dirección aleatoria
        const angulo = Math.random() * 2 * Math.PI;  // Ángulo aleatorio para el desplazamiento
        const desplazamiento = intentos * (r + padding);  // Desplazamiento que aumenta con cada intento
  
        // Desplazar x e y basados en el ángulo
        x = (x + desplazamiento * Math.cos(angulo)) % chartWidth;
        y = (y + desplazamiento * Math.sin(angulo)) % chartHeight;
  
        // Asegurar que no se salga de los límites del gráfico
        x = Math.max(r, Math.min(x, chartWidth - r));
        y = Math.max(r, Math.min(y, chartHeight - r));
      }
  
      burbujasExistentes.push({ x, y, r });
  
      return {
        x,
        y,
        r,
        idMbe: bubble.idMbe,
        idFila: bubble.idFila,
        idColumna: bubble.idColumna,
        idGpo: bubble.idGpo,
        fillColor: colorBubble,
        nombreGpo,
        valorOriginalZ: count,
      };
  }

  tablaEvaluacion(idMbe: number, fila: number, columna: number, idGpo: number) {
    this.router.navigate(['/evaluacion'], { queryParams: { idMbe: idMbe, idFila: fila, idColumna: columna, idEva: idGpo } });
  }
}