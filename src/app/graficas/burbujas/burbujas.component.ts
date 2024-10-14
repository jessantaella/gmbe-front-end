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
    console.log('bubbleData', this.bubbleData);
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
    let existingBubbles: Array<{ x: number, y: number }> = [];

    if (this.cachedBubbleData.length === 0) {
      this.cachedBubbleData = this.bubbleData.map(bubble => this.generateBubbleData(bubble, existingBubbles));
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
      scales: {
        x: { display: false },
        y: { display: false },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          position: 'average' as 'average',
          callbacks: {
            label: (context: any) => {
              const { datasetIndex, dataIndex } = context;
              const { nombreGpo, valorOriginalZ } = bubbleData[dataIndex];
              return `${nombreGpo} ${valorOriginalZ}`;
            }
          },
          bodyFont: { size: 12 },
        },
      },
      elements: {
        line: { borderWidth: 0 },
      }
    };
  }

  generateBubbleData(bubble: { idMbe: number; idFila: number; idColumna: number; idGpo: number; nombreGpo: string; colorBubble: string; count: number; alto: number; ancho: number; valorMinimoZ: number; valorMaximoZ: number }, existingBubbles: Array<{ x: number, y: number }>) {
    const { count, nombreGpo, colorBubble, alto, ancho, valorMinimoZ, valorMaximoZ } = bubble;
    const chartWidth = 250;
    const chartHeight = 250;

    const r =  Math.floor(((count + 1 - 1) / (120 + 1 -  1)) * (18 - 0) )+ 5;
    const padding = 20; // Espacio entre burbujas

    // Calcular posición base x y y
    let x = (bubble.idFila * (r * 2 + padding)) % chartWidth;
    let y = (bubble.idColumna * (r * 2 + padding)) % chartHeight;

    // Revisar si la posición ya está ocupada por otra burbuja
    let attempt = 0; // Contador de intentos de desplazamiento
    const maxAttempts = 10; // Máximo número de desplazamientos permitidos

    while (existingBubbles.some(b => b.x === x && b.y === y) && attempt < maxAttempts) {
      attempt++;
      const offset = attempt * 10; // Aumenta el desplazamiento en cada intento
      x = (x + offset) % chartWidth;
      y = (y + offset) % chartHeight;
    }

    // Guardar las coordenadas actuales en la lista de burbujas existentes
    existingBubbles.push({ x, y });

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
        valorOriginalZ: count + '-' + r,
      };
  }

  tablaEvaluacion(idMbe: number, fila: number, columna: number, idGpo: number) {
    this.router.navigate(['/evaluacion'], { queryParams: { idMbe: idMbe, idFila: fila, idColumna: columna, idEva: idGpo } });
  }
}