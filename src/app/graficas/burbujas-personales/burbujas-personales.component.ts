import { Component, Input,  OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  @Input() ancho: number = 0;
  @Input() alto: number =0;

  tooltipVisible: boolean = false;
  tooltipData: any = {}; // Información del tooltip
  tooltipStyles: any = {}; // Estilos para posicionar el tooltip
  countMayor : number = 0;


  burbujasExistentes: Array<{ x: number, y: number, r: number, fillColor: string, nombreGpo: string , count:number, idGpo : number}> = [];


  tiempoEspera:number=10;

  anchoActual: number = 0; // Almacena el ancho actual
  altoActual: number = 0; // Almacena el alto actual
  factorEscala: number = 1; // Factor para escalar las burbujas

  constructor(private router: Router){
  }



  ngOnInit() {
    this.inicializarBurbujas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detectar cambios en ancho
    if (changes['ancho'] || changes['alto']) {
      this.calcularFactorEscala();
    }
  }


  calcularFactorEscala(): void {
    // Asegurar que los valores sean positivos y válidos
    const anchoNuevo = this.ancho > 0 ? this.ancho : this.anchoActual;
    const altoNuevo = this.alto > 0 ? this.alto : this.altoActual;

    // Calcular el factor de escala basado en el cambio de tamaño del contenedor
    if (this.anchoActual && this.altoActual) {
      const factorAncho = anchoNuevo / this.anchoActual;
      const factorAlto = altoNuevo / this.altoActual;

      // Usar el menor factor para mantener la proporción
      this.factorEscala = Math.min(factorAncho, factorAlto);
    } else {
      this.factorEscala = 1; // Valor por defecto en el primer render
    }

    // Actualizar valores actuales
    this.anchoActual = anchoNuevo;
    this.altoActual = altoNuevo;
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
    const chartWidth = this.ancho-20 || 150;
    const chartHeight = this.alto-20 || 150;
    const padding = 10;
  
    // Determinar el count máximo para escalar los radios
    const maxCount = this.countMayor;
  
    // Contar cuántas burbujas tienen el valor máximo
    const maxCountBubbles = this.datosBurbujas.filter(b => b.count === maxCount).length;
  
    let minRadius = 2;
    let maxRadius = Math.min(chartWidth, chartHeight) / 6;
  
    // Ajustar el radio máximo si hay muchas burbujas grandes
    if (maxCountBubbles > 1) {
      maxRadius = Math.min(
        maxRadius,
        Math.sqrt((chartWidth * chartHeight) / (Math.PI * maxCountBubbles)) / 2 - padding
      );
    }
  
    // Escalar el radio
    const r = minRadius + ((count / maxCount) * (maxRadius - minRadius));
  
    let x: number = 0,
      y: number = 0;
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;
  
    if (count === maxCount) {
      if (maxCountBubbles > 1) {
        // Distribuir burbujas grandes en un círculo compacto
        const angleIncrement = (2 * Math.PI) / maxCountBubbles;
        const index = this.burbujasExistentes.filter(b => b.count === maxCount).length;
        const angle = angleIncrement * index;
        const radius = Math.min(chartWidth, chartHeight) / 4;
  
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      } else {
        // Una única burbuja grande en el centro
        x = centerX;
        y = centerY;
      }
    } else {
      // Posición aleatoria para otras burbujas
      let positioned = false;
      let attempts = 0;
      while (!positioned && attempts < 1000) {
        x = Math.random() * (chartWidth - 2 * r) + r;
        y = Math.random() * (chartHeight - 2 * r) + r;
  
        // Verificar superposición
        const overlappingBubble = this.burbujasExistentes.find(b =>
          Math.hypot(b.x - x, b.y - y) < b.r + r + padding
        );
  
        if (!overlappingBubble) {
          positioned = true;
        } else {
          attempts++;
        }
      }
  
      // Si no se puede encontrar un lugar después de muchos intentos, forzar la posición
      if (!positioned) {
        x = Math.random() * (chartWidth - 2 * r) + r;
        y = Math.random() * (chartHeight - 2 * r) + r;
      }
    }
  
    // Asegurar que la burbuja no se salga del contenedor
    x = Math.max(r, Math.min(chartWidth - r, x));
    y = Math.max(r, Math.min(chartHeight - r, y));

    // Añadir burbuja
    this.burbujasExistentes.push({ x, y, r, fillColor: colorBubble, nombreGpo, count, idGpo });
  
    // Ajustar posiciones si hay superposiciones
    this.ajustarSuperposiciones();
  }
  
  
  ajustarSuperposiciones() {
    const padding = 10;
  
    for (let i = 0; i < this.burbujasExistentes.length; i++) {
      for (let j = i + 1; j < this.burbujasExistentes.length; j++) {
        const b1 = this.burbujasExistentes[i];
        const b2 = this.burbujasExistentes[j];
  
        const dist = Math.hypot(b1.x - b2.x, b1.y - b2.y);
        const minDist = b1.r + b2.r + padding;
  
        if (dist < minDist) {
          const overlap = minDist - dist;
          const angle = Math.atan2(b2.y - b1.y, b2.x - b1.x);
  
          const moveX = (overlap / 2) * Math.cos(angle);
          const moveY = (overlap / 2) * Math.sin(angle);
  
          b1.x -= moveX;
          b1.y -= moveY;
          b2.x += moveX;
          b2.y += moveY;
  
          // Asegurar que no se salgan del contenedor
          b1.x = Math.max(b1.r, Math.min(this.ancho - b1.r, b1.x));
          b1.y = Math.max(b1.r, Math.min(this.alto - b1.r, b1.y));
          b2.x = Math.max(b2.r, Math.min(this.ancho - b2.r, b2.x));
          b2.y = Math.max(b2.r, Math.min(this.alto - b2.r, b2.y));
        }
      }
    }
  }
  
    

  showTooltip(event: MouseEvent, bubble: any) {
    //console.log(bubble.y)
    //console.log(bubble.r);
    this.tooltipData = bubble;
    const padding = -10; 
    // Ajusta las coordenadas aquí
    const diametro = bubble.r*2;
    this.tooltipStyles = {
      position: 'absolute',
      left: `${bubble.x+diametro}px`, 
      top: `${bubble.y-bubble.r}px`, 
      whiteSpace: 'nowrap', // Evitar saltos de línea
      zIndex: 1000
    };
    //console.log(this.tooltipStyles)
  
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

calcularNivel(grpo: any[],valor:number){
 // Ordenar el arreglo por el campo count en orden ascendente
 const sortedArray = [...grpo].sort((b, a) => a.count - b.count);

 // Encontrar la posición del valor en el arreglo ordenado
 const position = sortedArray.findIndex(item => item.count === valor);

 // Devolver la posición en formato 1-based (1, 2, 3, ...)
 return position +1; // -1 si el valor no se encuentra
}


}
