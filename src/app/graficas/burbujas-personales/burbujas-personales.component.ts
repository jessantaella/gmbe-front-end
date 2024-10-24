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

  constructor(private router: Router){}

  tooltipVisible: boolean = false;
  tooltipData: any = {}; // Información del tooltip
  tooltipStyles: any = {}; // Estilos para posicionar el tooltip
  countMayor : number = 0;

  @Input() ancho: number | undefined;
  @Input() alto: number | undefined;

  burbujasExistentes: Array<{ x: number, y: number, r: number, fillColor: string, nombreGpo: string , count:number, idGpo : number}> = [];

  ngOnInit() {

    if (this.datosBurbujas.length >0) {
   
    // Generar burbujas para todos los datosBurbujas al inicializar el componente
    let max =  this.datosBurbujas?.reduce((max, burbuja) => {
      return (burbuja.count > max.count) ? burbuja : max;
    });
    this.countMayor = max.count;
  }
  
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
    const chartWidth = this.ancho || 150; // Ancho del contenedor
    const chartHeight = this.alto || 150; // Alto del contenedor
    const padding = 20; // Espacio entre burbujas
  
    // Determinar el número total de burbujas existentes
    const totalBurbujas = this.burbujasExistentes.length + 1; // Incluir la burbuja actual

    
    // Cálculo del radio ajustado
    const r = 4 + (count - 1) * 0.2;
      
    let x:number, y:number;
  
    // Si no hay otras burbujas, colocar la burbuja en el centro
    if (this.burbujasExistentes.length === 0) {
      x = chartWidth / 2;  // Centrar la burbuja en el ancho
      y = chartHeight / 2; // Centrar la burbuja en el alto
    } else {
      // Generar una posición aleatoria inicial para múltiples burbujas
      x = Math.random() * ((chartWidth-30) - r * 2) + r; // Asegurar que esté dentro del contenedor
      y = Math.random() * ((chartHeight-30) - r * 2) + r; // Asegurar que esté dentro del contenedor
      let intentos = 0;
      const desplazamientosMax = 100;
  
      // Función para verificar si las burbujas están cerca
      const estaCerca = (b1: { x: number; y: number; r: number }, b2: { x: number; y: number; r: number }) => {
        const distancia = Math.hypot(b1.x - b2.x, b1.y - b2.y);
        return distancia < (b1.r + b2.r + padding);
      };
  
      // Reubicar la burbuja si está demasiado cerca de otras
      while (this.burbujasExistentes.some(b => estaCerca(b, { x, y, r })) && intentos < desplazamientosMax) {
        intentos++;
        const angulo = Math.random() * Math.PI * 2; // Ángulo aleatorio
        const desplazamiento = intentos * (r + padding); // Desplazamiento progresivo
  
        // Desplazar la burbuja dentro del gráfico
        x = (x + desplazamiento * Math.cos(angulo)) % (chartWidth - r * 2) + r;
        y = (y + desplazamiento * Math.sin(angulo)) % (chartHeight - r * 2) + r;
  
        // Asegurar que se mantenga dentro de los límites
        x = Math.max(r, Math.min(x, chartWidth - r));
        y = Math.max(r, Math.min(y, chartHeight - r));
      }
    }
  
    // Añadir la burbuja a la lista existente
    this.burbujasExistentes.push({ x, y, r, fillColor: colorBubble, nombreGpo,count, idGpo });
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
  this.router.navigate(['/evaluacion'], { queryParams: { idMbe: idMbe, idFila: fila, idColumna: columna, idEva: idGpo } });
}


}
