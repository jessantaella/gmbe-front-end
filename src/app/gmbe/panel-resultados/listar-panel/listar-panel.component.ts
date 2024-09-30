import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpResponse } from '@angular/common/http';
declare var swal: any;

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

  categoriaSeleccionadaColumnas: any[] = [];
  subcategoriaSeleccionadaColumnas: any[] = [];
  categoriaSeleccionadaFilas: any[] = [];
  subcategoriaSeleccionadaFilas: any[] = [];


  mostrarNombre: string = '';
  mostrarObjetivos: string = '';

  faRotaLeft = faRotateLeft;
  faDownload = faDownload;
  faX = faX;
  faCheck = faCheck;

  idmbe: number = 0;

  categoriaSeleccionadaFila: boolean [] = [];
  subcategoriaSeleccionadaFila: boolean [] = [];
  categoriaSeleccionadaColumna: boolean [] = [];
  subcategoriaSeleccionadaColumna: boolean [] = [];


  //Nueva ODT
  selectedCategoriaFila: string = '';
  selectedSubcategoriaFila: string = '';

  selectedCategoriaColumna: string = '';
  selectedSubcategoriaColumna: string = '';

  abrirToastAyuda: boolean = false;


  categoriasFilas: any;
  subcategoriasFilas: any;

  categoriasColumnas: any;
  subcategoriasColumnas: any;
  tiposDatosAyuda: any;

  conteoCategorias: any;

  colores = ['#80C080', '#8080FF', '#C080C0', '#ffe0e5', '#c0c0c0', '#808080', '#ff8080', '#ffd280' , '#5562A6', '#35AEB6', '#B8475A', '#F89E66'];
  colorSeleccionado = '';

  tituloCategoriaModal: string = '';
  informacionCategoriaModal: any = '';
  urlModal: any = '';

  constructor(private route: ActivatedRoute, private router: Router, private gmbservices: GmbeServicesService, private fb: FormBuilder, private modalService: NgbModal, private titulos: TitulosService) {
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

    this.obtenerVersionMax();
    this.cargarDatosMbe();
    this.cargaEstructuraPanelResultados();
    this.datosAyuda();
  }
  ngOnInit(): void {
    localStorage.removeItem('zArrayGuardado');
    this.filtrosCategoriasFilas();
    //this.filtrosSubcategoriasFilas();
    this.filtrosCategoriasColumnas();
    //this.filtrosSubcategoriasColumnas();
    this.cargarChechbox();
    //this.escucharCambiosSelect();
    this.abrirAyuda();
  }

  datosAyuda(){
    this.gmbservices.obtenerDatosAyuda(this.idmbe).subscribe(
      res => {
        console.log('datosAyuda:', res);
        this.tiposDatosAyuda = res;
      },
      err => {
        console.error('Error al obtener datos de ayuda:', err);
      }
    );
  }

  abrirAyuda(){
    //Se abre el modal de ayuda solo por 10 segundos
    this.abrirToastAyuda = true;
    setTimeout(() => {
      this.abrirToastAyuda = false;
    }, 10000);
  }

  cerrarAyuda(){
    this.abrirToastAyuda = false;
  }

  tablaEvaluacion(fila: number, columna: number) {
    console.log('entra');
    console.log('fila:', fila);
    console.log('columna:', columna);

    let datos = this.datosIntersecciones.find(
      obj => obj.idFila === fila && obj.idColumna === columna
    );

    let eva = datos?.conteoTipoEvaluacion === null ? datos?.conteoDisenioEval : datos?.conteoTipoEvaluacion;
    let idGpo = eva?.split(':');
    console.log('idGpo:', idGpo[0]);


    console.log('datos:', datos);

    this.router.navigate(['/evaluacion'], { queryParams: { idMbe: this.idmbe, idFila: fila, idColumna: columna, idEva: idGpo[0]} });
  }

  cerraModal() {
    this.modalService.dismissAll();
  }

  cargarChechbox() {
    this.categoriasFilas?.forEach(() => {
      console.log('entra');
      this.categoriaSeleccionadaFila.push(false);
    });
  }

  cargarChechboxSubFila() {
    this.subcategoriasFilas?.forEach(() => {
      console.log('entra');
      this.subcategoriaSeleccionadaFila.push(false);
    });
  }

  cargarChechboxColumnas() {
    this.categoriasColumnas?.forEach(() => {
      console.log('entra');
      this.categoriaSeleccionadaColumna.push(false);
    });
  }

  cargarChechboxSubColumnas() {
    this.subcategoriasColumnas?.forEach(() => {
      console.log('entra');
      this.subcategoriaSeleccionadaColumna.push(false);
    });
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
    this.gmbservices.obtenerDatosGMBEBurbujas(this.idmbe, this.versionMaxima).subscribe(
      res => {
        console.log('datos:', res);
        this.datosIntersecciones = res;
        console.log('datos', this.datosIntersecciones)
      },
      err => { }
    );
  }

  abrirModal(content:any, informacion: any, titulo: string) {
    this.modalService.open(content,{
      centered: true,
      keyboard: false,
      size: 'md'
    });
    console.log('informacion:', informacion);

    switch (titulo) {
      case 'categoria':
        this.tituloCategoriaModal = informacion.categoria;
        this.informacionCategoriaModal = informacion.descripcion;
        this.urlModal = informacion.complemento;
        break;
      case 'subcategoria':
        this.tituloCategoriaModal = informacion.subCategoria;
        this.informacionCategoriaModal = informacion.descripcionSubcategoria;
        this.urlModal = informacion.complementoSubcategoria;
        break;
      default:
        break
    }
  }

  masInformacion() {
    window.open(this.urlModal, '_blank');
  }

  // escucharCambiosSelect() {
  //   this.generales.get('categoriaFila')?.valueChanges.subscribe((value) => {
  //     this.selectedCategoriaFila = value;
  //     console.log('selectedCategoria:', this.selectedCategoriaFila);
  //     this.filtrosCategoriasFilas(parseInt(value), 0);
  //     this.filtrosSubcategoriasFilas(parseInt(value), 0);
  //   })
  //   this.generales.get('subcategoriaFila')?.valueChanges.subscribe((value) => {
  //     console.log('selectedSubcategoria:', value);
  //     this.selectedSubcategoriaFila = value;
  //     this.filtrosSubcategoriasFilas(parseInt(this.selectedCategoriaFila), parseInt(value));
  //   })


  //   this.generales.get('categoriasColumna')?.valueChanges.subscribe((value) => {
  //     console.log('selectedCategoria:', value);
  //     this.filtrosCategoriasColumnas(parseInt(value), 0);
  //     this.filtrosSubcategoriasColumnas(parseInt(value), 0);
  //   });

  //   this.generales.get('subcategoriasColumna')?.valueChanges.subscribe((value) => {
  //     console.log('selectedSubcategoria:', value);
  //     this.filtrosSubcategoriasColumnas(parseInt(this.generales.get('categoriasColumna')?.value), parseInt(value));
  //   });

  // }

  filtrosCategoriasFilas() {
    let datosEnvio = {
      idMbe: this.idmbe,
      idTipo: 2,
      categorias:  null,
      subcategorias:  null,
    };

    this.gmbservices.filtroCategoria(datosEnvio).subscribe(
      res => {
        console.log('Categorias obtenidas:', res);
        this.categoriasFilas = res;
        this.cargarChechbox();
      },
      err => {
        console.error('Error al obtener categorías:', err);
      }
    );
  }

  filtrosSubcategoriasFilas(idCategorias : any = null) {
    console.log('idCategoria:', idCategorias);
    let datosEnvio;
    if (idCategorias.length === 0) {
      this.subcategoriasFilas = [];
    } else {
      datosEnvio = {
        idMbe: this.idmbe,
        idTipo: 2,
        categorias:idCategorias,
        subcategorias: null,
      }; 

      this.gmbservices.filtrosSubcategoria(datosEnvio).subscribe(
        res => {
          console.log('Subcategorias obtenidas:', res);
          this.subcategoriasFilas = res;
          this.cargarChechboxSubFila()
        },
        err => {
          console.error('Error al obtener subcategorías:', err);
        }
      );
    }

  }

  filtrosCategoriasColumnas() {
    let datosEnvio = {
      idMbe: this.idmbe,
      idTipo: 1,
      categorias: null,
      subcategorias: null,
    };

    this.gmbservices.filtroCategoria(datosEnvio).subscribe(
      res => {
        console.log('Categorias obtenidas:', res);
        this.categoriasColumnas = res;
        this.cargarChechboxColumnas();
      },
      err => {
        console.error('Error al obtener categorías:', err);
      }
    );
  }

  filtrosSubcategoriasColumnas(idCategoria: any = null) {
    let datosEnvio;
    if (idCategoria.length === 0) {
      this.subcategoriasColumnas = [];
    } else {
      datosEnvio = {
        idMbe: this.idmbe,
        idTipo: 1,
        categorias: idCategoria,
        subcategorias: null,
      };

      this.gmbservices.filtrosSubcategoria(datosEnvio).subscribe(
        res => {
          console.log('Subcategorias obtenidas:', res);
          this.subcategoriasColumnas = res;
          this.cargarChechboxSubColumnas();
        },
        err => {
          console.error('Error al obtener subcategorías:', err);
        }
    )};
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


  cargaEstructuraPanelResultados(idCateoriaFilas:any = null, idSubcategoriaFilas:any = null, idCategoriaColumnas:any = null, idSubcategoriaColumnas:any = null) {
    console.log('idCateoriaFilas:', idCateoriaFilas);
    console.log('idSubcategoriaFilas:', idSubcategoriaFilas);
    console.log('idCategoriaColumnas:', idCategoriaColumnas);
    console.log('idSubcategoriaColumnas:', idSubcategoriaColumnas);
    //limpia los datos de la estructura
    this.estructuraFinalColumnasTitulos = [];
    this.estructuraFinalFilasTitulos = [];
    this.estructuraFinalFilasSubitulos = [];

    const datosEnvio = {
      idMbe: this.idmbe,
      idCategoriasFilas: idCateoriaFilas?.length > 0 ? idCateoriaFilas : null,
      idSubcategoriasFilas: idSubcategoriaFilas?.length > 0 ? idSubcategoriaFilas : null,
      idCategoriasColumnas: idCategoriaColumnas?.length > 0 ? idCategoriaColumnas : null,
      idSubcategoriasColumnas: idSubcategoriaColumnas?.length > 0 ? idSubcategoriaColumnas : null
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

        //Cuenta cuantas veces se repite el idSubCategoria y almacenar en una variable

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
    
    let countSubCats =  result.reduce((contador, producto) => {
      // Si la categoría ya existe en el contador, incrementamos su valor
      if (contador[producto.idCategoria]) {
        contador[producto.idCategoria]++;
      } else {
        // Si no existe, inicializamos el valor con 1
        contador[producto.idCategoria] = 1;
      }
      return contador;
    }, {});

    console.log('countSubCats:', countSubCats);

    // Para agrupar por categoría
    const categoriasMap = new Map<number, any>();


    result.forEach((obj: any) => {
      const categoria = obj.idCategoria;

      if (!categoriasMap.has(categoria)) {
        categoriasMap.set(categoria, {
          idEstructura: obj.idEstructura,
          categoria: obj.categoria,
          descripcion: obj.descripcion,
          complemento: obj.complemento,
          hijos: []
        });
      }

      // Agregar subcategorías
      categoriasMap.get(categoria).hijos.push({
        categoria: obj.categoria,
        count: countSubCats[obj.idCategoria],
        idCategoria: obj.idCategoria,
        idEstructura: obj.idEstructura,
        idSubCategoria: obj.idSubCategoria,
        subCategoria: obj.subCategoria,
        complementoSubcategoria: obj.complementoSubcategoria,
        descripcionSubcategoria: obj.descripcionSubcategoria

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
    let respuesta = this.datosIntersecciones.find(
      obj => obj.idFila === columna && obj.idColumna === fila
    );


    if (!respuesta) {
      return [];
    }
    let conteoTipoEvaluacion = respuesta?.conteoDisenioEval !== null ? respuesta.conteoDisenioEval : respuesta.conteoTipoEvaluacion;
    let idGpo = 0;
    let nombreGpo = '';
    let colorBubble = '';
    let count = 0;

    if (conteoTipoEvaluacion) {
      const parts = conteoTipoEvaluacion.split(':');
      if (parts.length === 4) {
        idGpo = parseInt(parts[0]);
        nombreGpo = parts[1];
        colorBubble = parts[2];
        count = parseInt(parts[3]);
      }
    }

    let objetoBurbuja = [
      {
        idGpo: idGpo,
        nombreGpo: nombreGpo,
        colorBubble: colorBubble,
        count: count
      }
    ];
    return objetoBurbuja;
  }

  colorFila(idCategoria: number) {
    if (!this.conteoCategorias) {
      this.conteoCategorias = {};
    }

    if (!this.conteoCategorias[idCategoria]) {
      this.colores = ['#80C080', '#8080FF', '#C080C0', '#ffe0e5', '#c0c0c0', '#808080', '#ff8080', '#ffd280' , '#5562A6', '#35AEB6', '#B8475A', '#F89E66'];
      this.colorSeleccionado = this.colores[Math.floor(Math.random() * this.colores.length)];
      this.conteoCategorias[idCategoria] = this.colorSeleccionado;
    }

    return this.conteoCategorias[idCategoria];
  }



  onCategoriaChangeFilas(idSeccion: number) {
    this.toggleSelection(
      idSeccion,
      this.categoriaSeleccionadaFilas,
      this.subcategoriaSeleccionadaFilas,
      this.filtrosSubcategoriasFilas.bind(this),
      this.cargaEstructuraPanelResultados.bind(this),
      this.cargarChechboxSubFila.bind(this)
    );
    console.log('categoriaSeleccionada:', this.categoriaSeleccionadaFilas);
  }

  onSubCategoriaChangeFilas(idSeccion: number) {
    this.toggleSelection(
      idSeccion,
      this.subcategoriaSeleccionadaFilas,
      null,
      null,
      this.cargaEstructuraPanelResultados.bind(this)
    );
    console.log('subcategoriaSeleccionada:', this.subcategoriaSeleccionadaFilas);
  }

  onCategoriaChangeColumnas(idSeccion: number) {
    this.toggleSelection(
      idSeccion,
      this.categoriaSeleccionadaColumnas,
      this.subcategoriaSeleccionadaColumnas,
      this.filtrosSubcategoriasColumnas.bind(this),
      this.cargaEstructuraPanelResultados.bind(this)
    );
    console.log('categoriaSeleccionada:', this.categoriaSeleccionadaColumnas);
  }

  onSubCategoriaChangeColumnas(idSeccion: number) {
    this.toggleSelection( 
      idSeccion,
      this.subcategoriaSeleccionadaColumnas,
      null,
      null,
      this.cargaEstructuraPanelResultados.bind(this)
    );
    console.log('subcategoriaSeleccionada:', this.subcategoriaSeleccionadaColumnas);
  }

  private toggleSelection(
    idSeccion: number,
    mainArray: any[],
    subArray: any[] | null,
    filterFunction: ((ids: any[]) => void) | null,
    loadFunction: (
      idCateoriaFilas: any,
      idSubcategoriaFilas: any,
      idCategoriaColumnas: any,
      idSubcategoriaColumnas: any
    ) => void,
    reloadCheckboxFunction: (() => void) | null = null
  ) {
    const index = mainArray.indexOf(idSeccion);
    if (index === -1) {
      if (subArray) subArray.length = 0; 
      mainArray.push(idSeccion);
    } else {
      if (subArray) subArray.length = 0; 
      mainArray.splice(index, 1);
    }
    if (filterFunction) filterFunction(mainArray);
    loadFunction(
      this.categoriaSeleccionadaFilas,
      this.subcategoriaSeleccionadaFilas,
      this.categoriaSeleccionadaColumnas,
      this.subcategoriaSeleccionadaColumnas
    );
    if (mainArray.length > 2 && reloadCheckboxFunction) reloadCheckboxFunction();
  }

  getTotalColumnas(): number {
    return this.estructuraFinalColumnasTitulos.reduce((acc, col) => acc + col.hijos.length, 0);
  }

  descargar(){
    swal.fire({
      title: 'Descargando',
      timerProgressBar: true,
      didOpen: () => {
        swal.showLoading();
      }
    });
    this.gmbservices.descargarReporteDatos(this.idmbe,this.versionMaxima).subscribe(
      (res: HttpResponse<ArrayBuffer>) => {
        if(res.body!.byteLength>0){
          const file = new Blob([res!.body!], { type: 'application/xlsx' });
          const fileURL = URL.createObjectURL(file);
          var link = document.createElement('a');
          link.href = fileURL;
          swal.close();
          swal.fire('', '¡Descarga con éxito!', 'success').then(() => { });
          link.download = 'DatosMBE_' + this.generales.get('nombre')!.value.replace(/\s+/g, '') + '.xlsx';
          link.click();
        }else{
          swal.fire({
            icon: 'error',
            title: '<center> Error </center>',
            text: 'Sin información',
          })
        }
      },
      err=>{
        swal.fire({
          icon: 'error',
          title: '<center> Error </center>',
          text: 'Sin información',
        })
      })
  }


}
