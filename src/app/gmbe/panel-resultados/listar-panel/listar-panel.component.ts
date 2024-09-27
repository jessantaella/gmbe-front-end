import { Component, OnInit } from '@angular/core';
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
export class PanelResultadosComponent implements OnInit {
  id: number = 0;
  versionMaxima = 1;
  generales: FormGroup;
  imageUrl: SafeUrl | null = null;
  textoBienvenida = "Panel de Resultados";

  estructuraFinalColumnasTitulos: any[] = [];
  estructuraFinalFilasTitulos: any[] = [];
  estructuraFinalFilasSubitulos: any[] = [];
  datosIntersecciones: any[] = [];

  mostrarNombre: string = '';
  mostrarObjetivos: string = '';

  faRotaLeft = faRotateLeft;
  faDownload = faDownload;
  faX = faX;
  faCheck = faCheck;

  idmbe: number = 0;


  //Nueva ODT
  selectedCategoriaFila: string = '';
  selectedSubcategoriaFila: string = '';

  selectedCategoriaColumna: string = '';
  selectedSubcategoriaColumna: string = '';


  categoriasFilas: any;
  subcategoriasFilas: any;

  categoriasColumnas: any;
  subcategoriasColumnas: any;

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

  constructor(private route: ActivatedRoute, private gmbservices: GmbeServicesService, private fb: FormBuilder, private sanitizer: DomSanitizer, private titulos: TitulosService) {
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.titulos.changePestaña(this.textoBienvenida);
    this.route.queryParams.subscribe(params => {
      this.idmbe = Number(params['idMbe']);
    });
    this.generales = this.fb.group({
      nombre: [''],
      objetivos: [''],
      resumen: [''],
      categoriaFila: [''],
      subcategoriaFila: [''],
      categoriasColumna: [''],
      subcategoriasColumna: [''],
    });
    this.cargaEstructuraPanelResultados();
  }
  ngOnInit(): void {
    this.filtrosCategoriasFilas();
    this.filtrosSubcategoriasFilas();
    this.filtrosCategoriasColumnas();
    this.filtrosSubcategoriasColumnas();
    this.escucharCambiosSelect();
    this.obtenerVersionMax();
    this.cargarDatosMbe();
  }
  obtenerVersionMax() {
    this.gmbservices.obtenerVersionMaximaMBE(this.idmbe).subscribe(
      res => {
        this.versionMaxima = res?.data === null ? 1 : res?.data;
        console.log(res);
      }
    )
  }

  cargarDatosMbe() {
    console.log('id:', this.idmbe);
    console.log('version:', this.versionMaxima);
    this.gmbservices.obtenerDatosGMBE(this.idmbe, this.versionMaxima).subscribe(
      res => {
        console.log('datos:', res);
        this.datosIntersecciones = res;
        console.log('datos', this.datosIntersecciones)
      },
      err => { }
    );
  }

  escucharCambiosSelect() {
    this.generales.get('categoriaFila')?.valueChanges.subscribe((value) => {
      this.selectedCategoriaFila = value;
      console.log('selectedCategoria:', this.selectedCategoriaFila);
      this.filtrosCategoriasFilas(parseInt(value), 0);
      this.filtrosSubcategoriasFilas(parseInt(value), 0);
    })
    this.generales.get('subcategoriaFila')?.valueChanges.subscribe((value) => {
      console.log('selectedSubcategoria:', value);
      this.selectedSubcategoriaFila = value;
      this.filtrosSubcategoriasFilas(parseInt(this.selectedCategoriaFila), parseInt(value));
    })


    this.generales.get('categoriasColumna')?.valueChanges.subscribe((value) => {
      console.log('selectedCategoria:', value);
      this.filtrosCategoriasColumnas(parseInt(value), 0);
      this.filtrosSubcategoriasColumnas(parseInt(value), 0);
    });

    this.generales.get('subcategoriasColumna')?.valueChanges.subscribe((value) => {
      console.log('selectedSubcategoria:', value);
      this.filtrosSubcategoriasColumnas(parseInt(this.generales.get('categoriasColumna')?.value), parseInt(value));
    });

  }

  filtrosCategoriasFilas(idCategoria: number = 0, idSubcategoria: number = 0) {
    console.log('idCategoria:', idCategoria);
    console.log('idSubcategoria:', idSubcategoria);
    let datosEnvio = {
      idMbe: this.idmbe,
      idTipo: 2,
      categorias: idCategoria !== 0 ? [idCategoria] : null,
      subcategorias: idSubcategoria !== 0 ? [idSubcategoria] : null,
    };

    this.gmbservices.filtroCategoria(datosEnvio).subscribe(
      res => {
        console.log('Categorias obtenidas:', res);
        this.categoriasFilas = res;
      },
      err => {
        console.error('Error al obtener categorías:', err);
      }
    );
  }

  filtrosSubcategoriasFilas(idCategoria: number = 0, idSubcategoria: number = 0) {
    console.log('idCategoria:', idCategoria);
    console.log('idSubcategoria:', idSubcategoria);
    let datosEnvio = {
      idMbe: this.idmbe,
      idTipo: 2,
      categorias: idCategoria !== 0 ? [idCategoria] : null,
      subcategorias: idSubcategoria !== 0 ? [idSubcategoria] : null,
    };

    this.gmbservices.filtrosSubcategoria(datosEnvio).subscribe(
      res => {
        console.log('Subcategorias obtenidas:', res);
        this.subcategoriasFilas = res;
      },
      err => {
        console.error('Error al obtener subcategorías:', err);
      }
    );
  }

  filtrosCategoriasColumnas(idCategoria: number = 0, idSubcategoria: number = 0) {
    console.log('idCategoria:', idCategoria);
    console.log('idSubcategoria:', idSubcategoria);
    let datosEnvio = {
      idMbe: this.idmbe,
      idTipo: 1,
      categorias: idCategoria !== 0 ? [idCategoria] : null,
      subcategorias: idSubcategoria !== 0 ? [idSubcategoria] : null,
    };

    this.gmbservices.filtroCategoria(datosEnvio).subscribe(
      res => {
        console.log('Categorias obtenidas:', res);
        this.categoriasColumnas = res;
      },
      err => {
        console.error('Error al obtener categorías:', err);
      }
    );
  }

  filtrosSubcategoriasColumnas(idCategoria: number = 0, idSubcategoria: number = 0) {
    console.log('idCategoria:', idCategoria);
    console.log('idSubcategoria:', idSubcategoria);
    let datosEnvio = {
      idMbe: this.idmbe,
      idTipo: 1,
      categorias: idCategoria !== 0 ? [idCategoria] : null,
      subcategorias: idSubcategoria !== 0 ? [idSubcategoria] : null,
    };

    this.gmbservices.filtrosSubcategoria(datosEnvio).subscribe(
      res => {
        console.log('Subcategorias obtenidas:', res);
        this.subcategoriasColumnas = res;
      },
      err => {
        console.error('Error al obtener subcategorías:', err);
      }
    );
  }

  anchoDinamico() {
    if (window.innerWidth >= 920) {
      if (this.estructuraFinalColumnasTitulos.length <= 2 && this.estructuraFinalColumnasTitulos.some(c => c.hijos.length <= 3)) {
        return '60';
      } else {
        if (this.estructuraFinalColumnasTitulos.length <= 4) {
          return '90';
        } else {
          return '100';
        }
      }
    } else {
      return '100';
    }
  }


  cargaEstructuraPanelResultados() {
    const datosEnvio = {
      idMbe: this.idmbe,
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
        
        for(let a=0;a<this.estructuraFinalFilasTitulos.length;a++){
          this.estructuraFinalFilasSubitulos = this.estructuraFinalFilasSubitulos.concat(this.estructuraFinalFilasTitulos[a].hijos);
        }

        console.log('subFilas:', this.estructuraFinalFilasSubitulos);
        

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
          idEstructura: obj.idEstructura,
          categoria: obj.categoria,
          hijos: []
        });
      }

      // Agregar subcategorías
      categoriasMap.get(categoria).hijos.push({
        categoria: obj.categoria,
        idCategoria: obj.idCategoria,
        idEstructura: obj.idEstructura,
        idSubCategoria: obj.idSubCategoria,
        subCategoria: obj.subCategoria
      });
    });

    return Array.from(categoriasMap.values());
  }

  obtenerTipo(arreglo: any, tipo: number) {
    let salida = [];
    salida = arreglo.filter((e: any) => e.idTipo === tipo);
    console.log('salida:', salida);
    return salida;
  }

  filtrarCategoriasUnicas(arreglo: any) {
    const categoriasMap = new Map<number, any>();

    console.log('arreglo:', arreglo);
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

  regresaValorSinSubcategoria(padre: any, hijo: any) {
    return hijo !== undefined ? hijo : padre?.idEstructura;

  }

  datosInterseccion(columna: number, fila: number) {
    console.log('columna:', columna);
    console.log('fila:', fila);
    let respuesta = this.datosIntersecciones.find(
      obj => obj.idFila === columna && obj.idColumna === fila
    );
    console.log('respuesta:', respuesta);
    return respuesta?.arrConteoDisenioEval.length < 1 ? respuesta?.arrConteoTipoEval : respuesta?.arrConteoDisenioEval;
  }



  onCategoriaChangeFilas(event: any, idSeccion: number) {
    const categoriaId = event.target.value;
    this.subcategoriasFilas = this.subcategoriasPorCategoria[categoriaId] || [];
    this.selectedSubcategoriaFila = '';
  }

  onCategoriaChangeColumnas(event: any) {
    const categoriaId = event.target.value;
    this.subcategoriasFilas = this.subcategoriasPorCategoria[categoriaId] || [];
    this.selectedSubcategoriaFila = '';
  }

  getTotalColumnas(): number {
    return this.estructuraFinalColumnasTitulos.reduce((acc, col) => acc + col.hijos.length, 0);
  }


}
