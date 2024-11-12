import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-burbujas-personales',
  templateUrl: './burbujas-personales.component.html',
  styleUrls: ['./burbujas-personales.component.scss']
})
export class BurbujasPersonalesComponent {


  @Input() datosBurbujas: Array<{
    idMbe: number;
    idFila: number;
    idColumna: number;
    idGpo: number;
    nombreGpo: string;
    colorBubble: string;
    count: number;
    alto: number;
    ancho: number;
    valorMinimoZ: number;
    valorMaximoZ: number;
  }> = [];

  @Input() titulo: string | undefined;

  constructor(private router: Router){}

  tooltipVisible: boolean = false;
  tooltipData: any = {}; // Información del tooltip
  tooltipStyles: any = {}; // Estilos para posicionar el tooltip
  countMayor : number = 0;

  @Input() ancho: number | undefined;
  @Input() alto: number | undefined;

  burbujasExistentes: Array<{ x: number, y: number, r: number, fillColor: string, nombreGpo: string , count:number, idGpo : number}> = [];

  ngOnInit() {
    this.inicializarBurbujas();
  }

  inicializarBurbujas() {
    if (this.datosBurbujas.length > 0) {
      // Encontrar la burbuja con el mayor valor de `count`
      const max = this.datosBurbujas.reduce((max, burbuja) => {
        return (burbuja.count > max.count) ? burbuja : max;
      });
      this.countMayor = max.count;
    }

    // Limpiar las burbujas actuales antes de regenerarlas
    this.burbujasExistentes = [];

    // Generar burbujas para todos los datosBurbujas
    this.datosBurbujas.forEach(bubble => {
      this.generateBubbleData(bubble);
    });
  }

  generateBubbleData(bubble: {
    idMbe: number;
    idFila: number;
    idColumna: number;
    idGpo: number;
    nombreGpo: string;
    colorBubble: string;
    count: number;
    alto: number;
    ancho: number;
    valorMinimoZ: number;
    valorMaximoZ: number;
  }) {
    const { count, nombreGpo, colorBubble, idGpo } = bubble;
    const chartWidth = this.ancho || 150;
    const chartHeight = this.alto || 150;
    const padding = 20; // Espacio entre burbujas en la cuadrícula
  
    // Determinar el count máximo para escalar los radios
    const maxCount = this.countMayor;
  
    // Contar cuántas burbujas tienen el valor máximo
    const maxCountBubbles = this.datosBurbujas.filter(b => b.count === maxCount).length;
  
    // Ajustar el radio máximo si hay múltiples burbujas con el valor máximo
    let minRadius = 4;
    let maxRadius = 20;
  
    if (maxCountBubbles > 1) {
      const gridArea = chartWidth * chartHeight;
      const adjustedMaxRadius = Math.min(
        maxRadius,
        Math.sqrt((gridArea / maxCountBubbles) / Math.PI) - padding / 2
      );
      maxRadius = adjustedMaxRadius;
    }
  
    // Escalar el radio de acuerdo con el valor `count` relativo a `maxCount`
    const r = minRadius + ((count / maxCount) * (maxRadius - minRadius));
  
    let x: number = 0, y: number = 0;
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;
  
    if (count === maxCount && maxCountBubbles > 1) {
      // Si hay múltiples burbujas con el valor máximo, distribuirlas en un círculo
      const angleIncrement = (2 * Math.PI) / maxCountBubbles;
      const index = this.burbujasExistentes.length;
      const angle = angleIncrement * index;
      const radius = (Math.min(chartWidth, chartHeight) / 2) - r - padding;
  
      x = centerX + radius * Math.cos(angle);
      y = centerY + radius * Math.sin(angle);
  
    } else if (count === maxCount && maxCountBubbles === 1) {
      // Si es la única burbuja con el valor máximo, colócala en el centro
      if (!this.burbujasExistentes.some(b => b.x === centerX && b.y === centerY)) {
        x = centerX;
        y = centerY;
      } else {
        const angleIncrement = Math.PI / 4;
        let positioned = false;
        let angle = 0;
  
        while (!positioned && angle < 2 * Math.PI) {
          x = centerX + (r + padding) * Math.cos(angle);
          y = centerY + (r + padding) * Math.sin(angle);
          if (!this.burbujasExistentes.some(b => Math.hypot(b.x - x, b.y - y) < b.r + r + padding)) {
            positioned = true;
          } else {
            angle += angleIncrement;
          }
        }
      }
    } else {
      // Posicionar las burbujas en una cuadrícula si no son las más grandes
      const cols = Math.floor(chartWidth / (2 * r + padding));
      const rows = Math.floor(chartHeight / (2 * r + padding));
      const gridIndex = this.burbujasExistentes.length;
  
      x = (gridIndex % cols) * (2 * r + padding) + r + padding / 2;
      y = Math.floor(gridIndex / cols) * (2 * r + padding) + r + padding / 2;
  
      x = Math.min(x, chartWidth - r);
      y = Math.min(y, chartHeight - r);

      x= x>chartWidth-r ? x-r:x-padding;
      y= y>chartHeight-r ? y-r : y-padding;
      
    }
  
    // Añadir la burbuja a la lista existente
    this.burbujasExistentes.push({ x, y, r, fillColor: colorBubble, nombreGpo, count, idGpo });
  }
  
  
  // Función para ajustar superposiciones de burbujas, colocando las más pequeñas arriba
  ajustarSuperposiciones() {
    // Ordena las burbujas de mayor a menor tamaño
    this.burbujasExistentes.sort((a, b) => b.r - a.r);
  
    const estaCerca = (b1: { x: number; y: number; r: number }, b2: { x: number; y: number; r: number }) => {
      const distancia = Math.hypot(b1.x - b2.x, b1.y - b2.y);
      return distancia < (b1.r + b2.r);
    };
  
    // Reajustar las burbujas que estén cerca, colocando la más pequeña arriba
    for (let i = 0; i < this.burbujasExistentes.length; i++) {
      for (let j = i + 1; j < this.burbujasExistentes.length; j++) {
        const burbujaGrande = this.burbujasExistentes[i];
        const burbujaPequena = this.burbujasExistentes[j];
  
        if (estaCerca(burbujaGrande, burbujaPequena)) {
          // Coloca la burbuja más pequeña visualmente arriba
          this.burbujasExistentes[j] = burbujaPequena;
          this.burbujasExistentes[i] = burbujaGrande;
        }
      }
    }
  }
  
    

  showTooltip(event: MouseEvent, bubble: any) {
    this.tooltipData = bubble;
    const tooltipHeight = 30; 
    // Ajusta las coordenadas aquí
    this.tooltipStyles = {
      position: 'absolute',
      left: `${Math.max(0, bubble.x + bubble.r + 5)}px`, // Colocar a la derecha de la burbuja
      top: `${Math.max(0, bubble.y - (tooltipHeight / 2) + (bubble.r / 2))}px`, // Centrado verticalmente con la burbuja
      zIndex: 1000
    };
  
    this.tooltipVisible = true;
  }
  
// Ocultar el tooltip cuando el mouse sale
hideTooltip() {
  this.tooltipVisible = false;
}

redireccionar(idMbe: number, fila: number, columna: number, idGpo: number){
  if (this.titulo === 'panel') {
    this.router.navigate(['/evaluacion'], { queryParams: { idMbe: idMbe, idFila: fila, idColumna: columna, idEva: idGpo } });
  }
}


}
