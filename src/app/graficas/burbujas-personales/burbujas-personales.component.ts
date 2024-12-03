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
  valorMedio = 0;

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
    this.datosBurbujas.forEach((bubble,index) => {
      this.generateBubbleData(bubble);
      //this.calcularBurbuja(bubble,index,this.datosBurbujas.length);
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
      this.ancho = element.offsetWidth>150 ? element.offsetWidth : 150;
      this.alto = element.offsetHeight>100 ? element.offsetHeight : 100;
    }

    const chartWidth = this.ancho-20;
    const chartHeight = this.alto-20;
    let padding = this.datosBurbujas.length>8 ? 5: 10;
    padding = this.datosBurbujas.length<=3 ? 40:padding;
  
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

    if(maxRadius>40 && this.getAncho()>200){
      maxRadius=20;
    }


    this.maxR = maxRadius;

    // Ajustar el radio máximo si hay muchas burbujas grandes
    if ((maxCountBubbles > 1 || this.datosBurbujas.length>8) && maxCount>2 ) {
      if(maxCount>100){
        maxRadius= 8;
        padding = 15;
      }else if(media<10){
        maxRadius = 10;
        padding = 10;
      }else{
        let divisor = this.datosBurbujas.length>7 && maxCount<3 ? 1.5:2;
        maxRadius = Math.min(
          maxRadius,
          Math.sqrt((chartWidth * chartHeight) / (Math.PI * maxCountBubbles)) / divisor - padding
        );
      }
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
        x = centerX + (r*2);
        y = centerY + r;
      }
    } else {
      // Posición aleatoria para otras burbujas
      let positioned = false;
      let attempts = 0;
      while (!positioned && attempts < 10000) {
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

    this.valorMedio =media;

    // Añadir burbuja
    this.burbujasExistentes.push({ x, y, r, fillColor: colorBubble, nombreGpo, count, idGpo });
    // Ajustar posiciones si hay superposiciones
   //this.ajustarSuperposiciones();
   
   if(this.burbujasExistentes.length<=12){
    this.distribuirBurbujas1();
   }

   if((this.burbujasExistentes.length>10 && this.valorMedio>60) || (this.burbujasExistentes.length>10 && media <4 || this.maxR>=150 || this.valorMedio<3)){
    this.distribuirBurbujas();
   }
  }
  

  // Modo grid
    calcularBurbuja(
      bubble: {
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
      },
      index: number,
      totalBurbujas: number
    ) {
      if (isPlatformBrowser(this.platformId)) {
        // Asegurar que el contenedor tiene dimensiones válidas
        const element = this.bubbleContainer.nativeElement;
        this.ancho = element.offsetWidth > 150 ? element.offsetWidth - 100 : 140;
        this.alto = element.offsetHeight > 100 ? element.offsetHeight - 50 : 100;
      }
    
      const anchoContenedor = this.ancho;
      const altoContenedor = this.alto;
    
      if (anchoContenedor === 0 || altoContenedor === 0) {
        return;
      }
    
      // Validar datos del objeto `bubble`
      if (!bubble.count || !bubble.valorMaximoZ || bubble.valorMaximoZ === 0) {
        return;
      }
    
      // Escalar el radio (`r`) entre 4 y 20
      const minRadius = 4; // Radio mínimo
      const maxRadius = 20  ;//this.burbujasExistentes.length>2 ?  20 : 40 ; // Radio máximo
      const r =
        minRadius +
        ((bubble.count / bubble.valorMaximoZ) * (maxRadius - minRadius));
    
      // Distribución: Si hay pocas burbujas, colócalas linealmente en el centro
      let x = 0;
      let y = 0;
    
      if (totalBurbujas <= 5) {
        // Lineal centrada
        const spacing = anchoContenedor / (totalBurbujas + 1);
        x = (index + 1) * spacing;
        y = altoContenedor / 2; // Centrada verticalmente
      } else {
        // Distribuir en una cuadrícula
        const cols = Math.ceil(Math.sqrt(totalBurbujas)); // Columnas de la cuadrícula
        const rows = Math.ceil(totalBurbujas / cols); // Filas de la cuadrícula
        const cellWidth = anchoContenedor / cols;
        const cellHeight = altoContenedor / rows;
    
        const row = Math.floor(index / cols);
        const col = index % cols;
    
        x = col * cellWidth + cellWidth / 2; // Centrar en la celda
        y = row * cellHeight + cellHeight / 2; // Centrar en la celda
        x=x+(r*2) >this.ancho ? x-(r*2):x-10;
        y=y+(r*2) >this.alto ? y-(r*2):y-10; 
      }
    
      // Agregar la burbuja a la lista
      const burbuja = {
        x,
        y,
        r: Math.max(minRadius, Math.min(r, maxRadius)), // Limitar `r` al rango permitido
        fillColor: bubble.colorBubble,
        nombreGpo: bubble.nombreGpo,
        count: bubble.count,
        idGpo: bubble.idGpo
      };
    
      this.burbujasExistentes.push(burbuja);
    
    }

    distribuirBurbujas1() {
        const columnas = Math.ceil(Math.sqrt(this.burbujasExistentes.length)); // Número de columnas (aproximadamente raíz cuadrada del total)
        const filas = Math.ceil(this.burbujasExistentes.length / columnas); // Número de filas
        const cellWidth = this.ancho / columnas; // Ancho de cada celda
        const cellHeight = this.alto / filas; // Altura de cada celda
        const randomOffset = 0.3; // Variación aleatoria (20% del tamaño de la celda)
      
        let index = 0;
      
        // Ordenar burbujas de mayor a menor
        this.burbujasExistentes.sort((a, b) => b.r - a.r);
      
        for (let fila = 0; fila < filas; fila++) {
          for (let columna = 0; columna < columnas; columna++) {
            if (index >= this.burbujasExistentes.length) break;
      
            const bubble = this.burbujasExistentes[index];
      
            // Coordenadas base del centro de la celda
            const baseX = columna * cellWidth + cellWidth / 2;
            const baseY = fila * cellHeight + cellHeight / 2;
      
            // Variación aleatoria dentro de la celda
            const offsetX = (Math.random() - 0.5) * cellWidth * randomOffset;
            const offsetY = (Math.random() - 0.5) * cellHeight * randomOffset;
      
            // Asignar coordenadas finales
            bubble.x = Math.max(bubble.r, Math.min(((this.ancho-10)-(bubble.r*2)) - bubble.r, baseX + offsetX));
            bubble.y = Math.max(bubble.r, Math.min(((this.alto-20)-(bubble.r*2)) - bubble.r, baseY + offsetY));
            
            index++;
          }
        }
      }
      

    ajustarSuperposiciones() {
      const padding = 30; // Espacio adicional para evitar superposiciones demasiado cercanas
      const maxAttempts = 1000; // Límite de intentos
      let attempt = 0;
      let hasOverlap = true;
    
      while (hasOverlap && attempt < maxAttempts) {
        hasOverlap = false;
    
        for (let i = 0; i < this.burbujasExistentes.length; i++) {
          for (let j = i + 1; j < this.burbujasExistentes.length; j++) {
            const b1 = this.burbujasExistentes[i];
            const b2 = this.burbujasExistentes[j];
    
            const dist = Math.hypot(b1.x - b2.x, b1.y - b2.y);
            const minDist = b1.r + b2.r + padding;
    
            if (dist < minDist) {
              hasOverlap = true; // Indicar que hubo superposición en este intento
    
              const overlap = minDist - dist;
              const angle = Math.atan2(b2.y - b1.y, b2.x - b1.x);
    
              const moveX = (overlap / 2) * Math.cos(angle);
              const moveY = (overlap / 2) * Math.sin(angle);
    
              b1.x -= moveX;
              b1.y -= moveY;
              b2.x += moveX;
              b2.y += moveY;
    
              // Asegurar que b1 se mantenga dentro del contenedor
              b1.x = Math.max(b1.r, Math.min(this.ancho - ((b1.r * 2) - padding), b1.x-b1.r));
              b1.y = Math.max(b1.r, Math.min(this.alto - ((b1.r * 2) - padding), b1.y-b1.r));
    
              // Asegurar que b2 se mantenga dentro del contenedor
              b2.x = Math.max(b2.r, Math.min(this.ancho - ((b2.r * 2) - padding), b2.x-b1.r));
              b2.y = Math.max(b2.r, Math.min(this.alto - ((b2.r * 2) - padding), b2.y-b2.r));
            }
          }
        }
    
        attempt++;
      }
    
      if (attempt >= maxAttempts) {
        console.warn(`Se alcanzó el máximo de intentos (${maxAttempts}) y aún hay superposiciones.`);
      }
    
      // Distribuir burbujas en el espacio disponible
      this.burbujasExistentes.forEach(burbuja => {
        burbuja.x = Math.max(burbuja.r, Math.min(this.ancho - ((burbuja.r * 2) - padding), burbuja.x-(burbuja.r*2)));
        burbuja.y = Math.max(burbuja.r, Math.min(this.alto - ((burbuja.r * 2) - padding), burbuja.y-(burbuja.r*2)));
      });
    }
    

  distribuirBurbujas() {
    const areaWidth = this.ancho - 20;
    const areaHeight = this.alto - 20;
  
    if (!areaWidth || !areaHeight) {
      return;
    }
  
    // Calcular la media de los radios
    const totalRadios = this.burbujasExistentes.reduce((sum, burbuja) => sum + burbuja.r, 0);
    const mediaRadios = totalRadios / this.burbujasExistentes.length;
  
    if (this.burbujasExistentes.length > 10) {
      const occupiedSpaces: { x: number; y: number; r: number }[] = [];
      const midPoint = areaWidth / 2;
  
      const sectorLeft = this.burbujasExistentes.slice(0, Math.ceil(this.burbujasExistentes.length / 2));
      const sectorRight = this.burbujasExistentes.slice(Math.ceil(this.burbujasExistentes.length / 2));
  
      const generateRandomPosition = (minX: number, maxX: number, minY: number, maxY: number) => {
        return {
          x: Math.random() * (maxX - minX) + minX,
          y: Math.random() * (maxY - minY) + minY,
        };
      };
  
      const distributeSector = (sector: any[], minX: number, maxX: number, centerBias: boolean) => {
        sector.forEach(burbuja => {
          let x: number, y: number;
          let isOverlapping = false;
          let attempts = 0; // Contador de intentos
          const maxAttempts = 1000; // Límite de intentos
  
          do {
            const adjustedMinX = centerBias ? midPoint - (areaWidth / 4) : minX;
            const adjustedMaxX = centerBias ? midPoint + (areaWidth / 4) : maxX;
  
            const position = generateRandomPosition(
              Math.max(adjustedMinX, burbuja.r),
              Math.min(adjustedMaxX, areaWidth - burbuja.r),
              burbuja.r,
              areaHeight - burbuja.r
            );
  
            x = position.x + burbuja.r*2 >this.alto ? position.x - burbuja.r*2:position.x-burbuja.r;
            y = position.y + burbuja.r*2 >this.ancho ? position.y - burbuja.r*2:position.y-burbuja.r;
            
            // Verificar solapamiento
            isOverlapping = occupiedSpaces.some(space => {
              const dx = x - space.x;
              const dy = y - space.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              return distance < (burbuja.r + space.r);
            });
  
            attempts++; // Incrementar contador de intentos
  
            if (!isOverlapping) {
              burbuja.x = x;
              burbuja.y = y;
              occupiedSpaces.push({ x: burbuja.x, y: burbuja.y, r: burbuja.r });
            }
          } while (isOverlapping && attempts < maxAttempts);
  
          if (attempts >= maxAttempts) {
            console.warn(`No se pudo ubicar la burbuja después de ${maxAttempts} intentos.`, burbuja);
          }
        });
      };
  
      // Determinar si la mayoría de las burbujas tiene valores pequeños
      const smallBubbleThreshold = mediaRadios * 0.8; // Considerar "pequeñas" las burbujas con radios menores al 80% de la media
      const smallBubblesCount = this.burbujasExistentes.filter(b => b.r < smallBubbleThreshold).length;
      const centerBias = smallBubblesCount > this.burbujasExistentes.length / 2;
  
      // Distribuir burbujas en cada sector
      distributeSector(sectorLeft, 0, midPoint, centerBias);
      distributeSector(sectorRight, midPoint, areaWidth, centerBias);
    }
  }
  

      

  showTooltip(event: MouseEvent, bubble: any) {
    this.anchoTooltip = bubble.nombreGpo.length*5;

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

calcularLeft(bubble: any, burbujasExistentes: any[], ancho: number): number {
  const padding = 5; // Espacio mínimo entre burbujas
  let left = bubble.x;

  for (const otraBurbuja of burbujasExistentes) {
    if (bubble === otraBurbuja) continue; // No comparar con sí misma

    const distY = Math.abs(bubble.y - otraBurbuja.y);
    const minDistY = (bubble.r * 2)+ otraBurbuja.r + padding;

    if (distY < minDistY) {
      const distX = Math.abs(left - otraBurbuja.x);
      const minDistX = (bubble.r * 2) + otraBurbuja.r + padding;

      if (distX < minDistX) {
        // Calcular nuevo left
        const adjustment = minDistX - distX;
        left = otraBurbuja.x + adjustment;

        // Mantener dentro de los límites
        left = Math.max(bubble.r, Math.min(ancho - bubble.r, left));
      }
    }
  }

  return left;
}

calcularTop(bubble: any, burbujasExistentes: any[], alto: number): number {
  const padding = 5; // Espacio mínimo entre burbujas
  let top = bubble.y;

  for (const otraBurbuja of burbujasExistentes) {
    if (bubble === otraBurbuja) continue; // No comparar con sí misma

    const distX = Math.abs(bubble.x - otraBurbuja.x);
    const minDistX = (bubble.r * 2) + otraBurbuja.r + padding;

    if (distX < minDistX) {
      const distY = Math.abs(top - otraBurbuja.y);
      const minDistY = (bubble.r * 2) + otraBurbuja.r + padding;

      if (distY < minDistY) {
        // Calcular nuevo top
        const adjustment = minDistY - distY;
        top = otraBurbuja.y + adjustment;

        // Mantener dentro de los límites
        top = Math.max(bubble.r, Math.min(alto - bubble.r, top));
      }
    }
  }

  return top;
}




getAncho(){ return this.ancho};
getAlto(){return this.alto;}

getMargin(){return Math.floor(Math.random() * 30);}

}
