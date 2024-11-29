import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, PLATFORM_ID, SimpleChanges, ElementRef, ViewChild, } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-burbujas-personales',
  templateUrl: './burbujas-personales.component.html',
  styleUrls: ['./burbujas-personales.component.scss']
})
export class BurbujasPersonalesComponent {
  @ViewChild('bubbleContainer', { static: true }) bubbleContainer!: ElementRef;


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
  anchoTooltip:number = 0;

  burbujasExistentes: Array<{ x: number, y: number, r: number, fillColor: string, nombreGpo: string , count:number, idGpo : number}> = [];

  maxR = 0;
  tiempoEspera:number=10;

  anchoActual: number = 0; // Almacena el ancho actual
  altoActual: number = 0; // Almacena el alto actual
  factorEscala: number = 1; // Factor para escalar las burbujas

  constructor(private router: Router,@Inject(PLATFORM_ID) private platformId: Object){
  }



  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Solo se ejecuta en el navegador
      const element = this.bubbleContainer.nativeElement;
      this.ancho = element.offsetWidth>150 ? element.offsetWidth-100 : 150;
      this.alto = element.offsetHeight>=100 ? element.offsetHeight : 100;
      this.alto = this.burbujasExistentes.length<4 && element.offsetWidth>150 ? 80 :this.ancho; 
    }

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

    if (isPlatformBrowser(this.platformId)) {
      // Solo se ejecuta en el navegador
      const element = this.bubbleContainer.nativeElement;
      this.ancho = element.offsetWidth>150 ? element.offsetWidth-100 : 150;
      this.alto = element.offsetHeight>100 ? element.offsetHeight-50 : 100;
    }
    console.log(this.ancho) 
    console.log(this.alto);

    const chartWidth = this.ancho-20;
    const chartHeight = this.alto-20;
    let padding = this.datosBurbujas.length>8 ? 5: 10;
    padding = this.datosBurbujas.length<=2 ? 10:padding;
  
    // Determinar el count máximo para escalar los radios
    const maxCount = this.countMayor;
  
    // Contar cuántas burbujas tienen el valor máximo
    const maxCountBubbles = this.datosBurbujas.filter(b => b.count === maxCount).length;


      // Suma todos los valores de count
  const totalCount = this.datosBurbujas.reduce((sum, b) => sum + b.count, 0);

  // Calcula la media
  const media = totalCount / this.datosBurbujas.length;
  
    let minRadius = 4;

    const minCount = this.datosBurbujas.reduce((min, item) => {
      return item.count < min ? item.count : min;
    }, Infinity);

    let maxRadius = 0;
    if(this.ancho>150){
       maxRadius=maxCount<20 ? maxCount*this.ancho/100 : maxCount/2*this.ancho/100
    }else{
      maxRadius =this.datosBurbujas.length>6 && this.ancho<=chartWidth && minCount>7?   Math.min(chartWidth, chartHeight) / 12: Math.min(chartWidth, chartHeight) / 6;
      maxRadius = minCount>7 || this.datosBurbujas.length>10?  Math.min(chartWidth, chartHeight) / 20 : maxRadius;
      minRadius = maxCountBubbles === this.datosBurbujas.length && maxCount < 3 ? 3: minRadius;
      maxRadius = maxCountBubbles === this.datosBurbujas.length && maxCount < 3 ? Math.min(chartWidth, chartHeight) / 6: maxRadius;
    }
    if(this.datosBurbujas.length<7 && maxCount>20 && media>25){
      maxRadius = 7;
    }else if(this.datosBurbujas.length<7 && maxCount<10){
      maxRadius = 10;
    }
    if(this.datosBurbujas.length<10 && maxCount<10 && maxCountBubbles <2){
      maxRadius = 15;
    }

    if(this.datosBurbujas.length === 1){
      maxRadius= 20;
    }


    this.maxR = maxRadius;

    // Ajustar el radio máximo si hay muchas burbujas grandes
    if ((maxCountBubbles > 1 || this.datosBurbujas.length>8) && maxCount>2 ) {
      let divisor = this.datosBurbujas.length>7 && maxCount<3 ? 1.5:2;
      maxRadius = Math.min(
        maxRadius,
        Math.sqrt((chartWidth * chartHeight) / (Math.PI * maxCountBubbles)) / divisor - padding
      );
    }
  
    // Escalar el radio
    const r = Math.abs( minRadius + ((count / maxCount) * (maxRadius - minRadius)));
  
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
        x =x+chartWidth>= this.ancho ? x-(r+padding):x;
        y =y+chartHeight>=this.alto-padding ? y-(r-padding):y-r;
  
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
        x =x+chartWidth>= this.ancho ? x-(r+padding):x;
        y =y+chartHeight>=this.alto-padding ? y-(r-padding):y-r;
  
      }
    }
  
    // Asegurar que la burbuja no se salga del contenedor
    x = Math.max(r, Math.min(chartWidth - r, x));
    y = Math.max(r, Math.min(chartHeight - r, y));
    x =x+chartWidth>= this.ancho ? x-(r+padding):x;
    y =y+chartHeight>=this.alto-padding ? y-(r-padding)-padding:y-r;


    // Añadir burbuja
    this.burbujasExistentes.push({ x, y, r, fillColor: colorBubble, nombreGpo, count, idGpo });
    console.log(this.burbujasExistentes)
    // Ajustar posiciones si hay superposiciones
    this.ajustarSuperposiciones();

  }
  
  
  ajustarSuperposiciones() {
    let padding = this.datosBurbujas.length>8 ? 5: 10;
    padding = this.datosBurbujas.length<=2 ? 25 :padding;
  
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
          b1.x = Math.max(b1.r, Math.min((this.ancho * b1.r) - b1.r, b1.x));
          b1.y = Math.max(b1.r, Math.min((this.alto * b1.r) - b1.r, b1.y));
          b2.x = Math.max(b2.r, Math.min((this.ancho * b2.r) - b2.r, b2.x));
          b2.y = Math.max(b2.r, Math.min((this.alto * b2.r) - b2.r, b2.y));
        }
      }
    }
  }
  
    

  showTooltip(event: MouseEvent, bubble: any) {
    this.anchoTooltip = bubble.nombreGpo.length*5;
    //console.log(bubble.y)
    //console.log(bubble.r);
    this.tooltipData = bubble;
    const padding = bubble.r*2 <=20 ? 25:5; 
    // Ajusta las coordenadas aquí
    const diametro = bubble.r*2;

    let calculoLongitud= bubble.x-diametro-padding;
    let calculoAltitud = (bubble.y-bubble.r)-padding;
    this.tooltipStyles = {
      position: 'absolute',
      left: `${bubble.x+ this.anchoTooltip>=this.ancho? bubble.x-this.anchoTooltip:calculoLongitud}px`, 
      top: `${calculoAltitud}px`, 
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

getAncho(){ return this.ancho};
getAlto(){return this.alto;}

}
