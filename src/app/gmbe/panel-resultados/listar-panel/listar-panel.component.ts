import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GmbeServicesService } from '../../services/gmbe-services.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TitulosService } from 'src/app/services/titulos.services';
import {
  faRotateLeft,
  faDownload,
  faX,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-listar-panel',
  templateUrl: './listar-panel.component.html',
  styleUrls: ['./listar-panel.component.scss']
})
export class PanelResultadosComponent {
  id:number = 0;
  versionMaxima = 1;
  generales: FormGroup;
  imageUrl: SafeUrl | null = null;
  textoBienvenida = "Panel de Resultados";

  estructuraFinalColumnasTitulos:any[] = [];
  estructuraFinalFilasTitulos:any[] = [];
  estructuraFinalFilasSubitulos:any[] = [];
  datosIntersecciones:any [] = [];

  mostrarNombre:string = '';
  mostrarObjetivos:string = '';

  faRotaLeft = faRotateLeft;
  faDownload = faDownload;
  faX = faX;
  faCheck = faCheck;


  //Nueva ODT
  selectedCategoria: string = '';
  selectedSubcategoria: string = '';
  

  categorias = [
    { id: '1', nombre: 'Categoría 1' },
    { id: '2', nombre: 'Categoría 2' },
    { id: '3', nombre: 'Categoría 3' }
  ];
  subcategorias: { id: string; nombre: string }[] = [];


  subcategoriasPorCategoria: { [key: string]: { id: string; nombre: string }[] } = {
    '1': [
      { id: '1-1', nombre: 'Subcategoría 1-1' },
      { id: '1-2', nombre: 'Subcategoría 1-2' }
    ],
    '2': [
      { id: '2-1', nombre: 'Subcategoría 2-1' },
      { id: '2-2', nombre: 'Subcategoría 2-2' }
    ],
    '3': [
      { id: '3-1', nombre: 'Subcategoría 3-1' },
      { id: '3-2', nombre: 'Subcategoría 3-2' }
    ]
  };

  constructor(private route: ActivatedRoute, private gmbservices:GmbeServicesService,private fb: FormBuilder,private sanitizer: DomSanitizer,private titulos: TitulosService){
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.titulos.changePestaña(this.textoBienvenida);
    this.generales = this.fb.group({
      nombre: [''],
      objetivos: [''],
      resumen: [''],
      categoria: [''],
      subcategoria: [''],
    });

    this.cargaEstructuraPanelResultados();
  }

  anchoDinamico(){
    if (window.innerWidth >= 920) {
      if(this.estructuraFinalColumnasTitulos.length  <= 2 && this.estructuraFinalColumnasTitulos.some(c => c.hijos.length <= 3)){
        return '60';
      }else{
        if(this.estructuraFinalColumnasTitulos.length  <= 4){
          return '90';
        }else{
          return '100';
        }
      } 
    }else{
      return '100';
    }
  }

  
  cargaEstructuraPanelResultados() {
    const datosEnvio = {
      idMbe: 4,
      idCategoriasFilas: null,
      idSubcategoriasFilas: null,
      idCategoriasColumnas: null,
      idSubcategoriasColumnas: null
    };
  
    this.gmbservices.obtenerEstructuraPanelResultados(datosEnvio).subscribe(
      res => {
        console.log('Estructura obtenida:', res);
  
        // Filtrar las columnas y las filas por tipo
        this.estructuraFinalColumnasTitulos = this.filtrarPorTipo(res, 1); 
        this.estructuraFinalFilasTitulos = this.filtrarPorTipo(res, 2);  
        
        console.log('Columnas:', this.estructuraFinalColumnasTitulos);
        console.log('Filas:', this.estructuraFinalFilasTitulos);
      },
      err => {
        console.error('Error al obtener estructura del panel:', err);
      }
    );
  }
  
  filtrarPorTipo(arreglo: any[], tipo: number) {
    const result = arreglo.filter(item => item.idTipo === tipo);
    
    // Para agrupar por categoría
    const categoriasMap = new Map<number, any>();
    
    result.forEach((obj: any) => {
      const categoria = obj.idCategoria;
      
      if (!categoriasMap.has(categoria)) {
        categoriasMap.set(categoria, {
          categoria: obj.categoria,
          hijos: []
        });
      }
  
      // Agregar subcategorías
      categoriasMap.get(categoria).hijos.push({
        idSubCategoria: obj.idSubCategoria,
        subCategoria: obj.subCategoria
      });
    });
  
    return Array.from(categoriasMap.values());
  }

obtenerTipo(res: any[], tipo: number) {
  return res.filter(item => item.idTipo === tipo);
}

filtrarCategoriasUnicas(arreglo: any) {
  const categoriasMap = new Map<number, any>();

  arreglo.forEach((obj: any) => {
    const categoria = obj.idCategoria;
    
    if (categoria && typeof categoria === 'number') {
      if (!categoriasMap.has(categoria)) {
        categoriasMap.set(categoria, { idCategoria: categoria, catalogo: obj.categoria, hijos: [] });
      }

      // Agregar subcategorías a la categoría correspondiente
      categoriasMap.get(categoria).hijos.push({
        idSubCategoria: obj.idSubCategoria,
        subCategoria: obj.subCategoria
      });
    } else {
      console.error('Error: La categoría no es válida', categoria);
    }
  });

  return Array.from(categoriasMap.values());
}




regresaValorSinSubcategoria(padre:any,hijo:any){
 return hijo !== undefined ? hijo : padre?.idEstructura;

}

datosInterseccion(columna: number, fila: number) {
  let respuesta = this.datosIntersecciones.find(
    obj => obj.idFila === columna && obj.idColumna === fila
  );
  return respuesta?.arrConteoDisenioEval.length < 1 ? respuesta?.arrConteoTipoEval : respuesta?.arrConteoDisenioEval;
}



onCategoriaChange(event: any) {
  const categoriaId = event.target.value;
  this.subcategorias = this.subcategoriasPorCategoria[categoriaId] || [];
  this.selectedSubcategoria = '';
}

getTotalColumnas(): number {
  return this.estructuraFinalColumnasTitulos.reduce((acc, col) => acc + col.hijos.length, 0);
}


}
