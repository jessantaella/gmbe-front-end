import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
import { StorageService } from 'src/app/services/storage-service.service';
import { debounceTime, fromEvent, Subscription } from 'rxjs';
import html2canvas from 'html2canvas';
declare var swal: any;
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-listar-panel',
  templateUrl: './listar-panel.component.html',
  styleUrls: ['./listar-panel.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush 
})
export class PanelResultadosComponent implements OnInit, OnDestroy{

  faCirclePlus = faCirclePlus;
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

  estructuraFinalColumnasTitulos1: any[] = [];
  estructuraFinalFilasTitulos1: any[] = [];
  estructuraFinalFilasSubitulos1: any[] = [];
  datosIntersecciones1: any[] = [];

  categoriaSeleccionadaColumnas1: any[] = [];
  subcategoriaSeleccionadaColumnas1: any[] = [];
  categoriaSeleccionadaFilas1: any[] = [];
  subcategoriaSeleccionadaFilas1: any[] = [];


  mostrarNombre: string = '';
  mostrarObjetivos: string = '';

  faRotaLeft = faRotateLeft;
  faDownload = faDownload;
  faX = faX;
  faCheck = faCheck;

  idmbe: number = 0;

  categoriaSeleccionadaFila: boolean[] = [];
  subcategoriaSeleccionadaFila: boolean[] = [];
  categoriaSeleccionadaColumna: boolean[] = [];
  subcategoriaSeleccionadaColumna: boolean[] = [];


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

  colores = ['#C2544C', '#757582', '#5562A6', '#32818E', '#B4499E', '#917059'];
  colorCategoria : {categoria:number,color:string}[]= [];
  posColores = 0;
  idAnterior = -1;
  colorSeleccionado = '';

  tituloCategoriaModal: string = '';
  informacionCategoriaModal: any = '';
  urlModal: any = '';
  nombreGPOFlotante: any;
  countFlotante: any;
  mensajeFlotanteFuera: boolean = false;
  figuraActivaId: string | null = null;
  esperaSegundos: boolean = true;

  nombreMBE: string = '';
  btnMasInformacion: boolean = true;

  cadenaDatosBurbujas: any = [];
  valorMasAltoBurbuja: number = 0;
  valorMasBajoBurbuja: number = 0;
  isLoading: boolean = true;
  tituloModal: boolean = true;
  tituloAcotaciones: any;
  subscripcionDatos: Subscription [] = [];
  datosInsercciones: any;

  esVisible: boolean[][] = [];
  esVisible1: boolean[][] = [];
  @ViewChildren('thElemento') thElements!: QueryList<ElementRef>;
  @ViewChildren('thElemento1') thElements1!: QueryList<ElementRef>;
  elementosObservados = false;
  elementosObservados1 = false;
  existeSubcategoria: number = 0;

  modoCaptura: boolean = false;
  terminoRenderizado: boolean = false;
  categoriaFilasAnterior = '';
  categoriaColumnasAnterior = '';


  /** Filtros */

  seleccionFilasCategorias:any[] = [];
  seleccionFilasSubCategorias : any []= [];
  seleccionFilasSubCategoriasObjetos : any []= [];

  seleccionColumnasCategorias:any[] = [];
  seleccionColumnasSubCategorias : any []= [];
  seleccionColumnasSubCategoriasObjetos : any []= [];

  constructor(private route: ActivatedRoute, private storage: StorageService, private router: Router, private gmbservices: GmbeServicesService, private fb: FormBuilder, private modalService: NgbModal, private titulos: TitulosService) {
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.titulos.changePestaña(this.textoBienvenida);
    this.nombreMBE = this.storage.getItem('MBENombre')!;
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
    this.datosAyuda();
    this.filtrosCategoriasFilas();
    //this.filtrosSubcategoriasFilas();
    this.filtrosCategoriasColumnas();
    //this.filtrosSubcategoriasColumnas();
    this.cargarDatosMbe();
    this.cargaEstructuraPanelResultados();
  }

  ngOnDestroy(): void {
    this.subscripcionDatos.forEach(sub => sub.unsubscribe());
    //destruye la funcion de observar los elementos y el renderizado
    this.elementosObservados = false;
  }
  ngOnInit(): void {
    //this.esVisible1[0][0] = true;
    this.tituloAcotacion();
    this.pantallaCargando();
    //this.escucharCambiosSelect();
    this.abrirToastAyuda = true;
  }

  pantallaCargando() {
    this.isLoading = true;
    swal.fire({
      title: 'Cargando',
      timerProgressBar: true,
      didOpen: () => {
        swal.showLoading();
      }
    });
    setTimeout(() => {
      this.isLoading = false;
      swal.close();
    }, 1000);
  }

  trackByFn(index: number, item: any): number {
    return item.id; // o cualquier propiedad única
  }

  tituloAcotacion() {
    this.gmbservices.obtenerAcotaciones(this.idmbe).subscribe(
      res => {
        
        this.tituloAcotaciones = res.tipoEvaluacion;
        
      },
      err => {
        console.error('Error al obtener acotación:', err);
      }
    );
  }

  datosAyuda() {
    this.gmbservices.obtenerDatosAyuda(this.idmbe).subscribe(
      res => {
        this.tiposDatosAyuda = res;
      },
      err => {
        console.error('Error al obtener datos de ayuda:', err);
      }
    );
  }

  abrirAyuda() {
    //Se abre el modal de ayuda solo por 10 segundos
    this.abrirToastAyuda = true;
  }

  cerrarAyuda() {
    this.abrirToastAyuda = false;
  }

  cerraModal() {
    this.modalService.dismissAll();
  }

  cargarChechbox() {
    this.categoriasFilas?.forEach(() => {
      this.categoriaSeleccionadaFila.push(false);
    });
  }

  cargarChechboxSubFila() {
    this.subcategoriasFilas?.forEach(() => {
      this.subcategoriaSeleccionadaFila.push(false);
    });
  }

  cargarChechboxColumnas() {
    this.categoriasColumnas?.forEach(() => {
      this.categoriaSeleccionadaColumna.push(false);
    });
  }

  cargarChechboxSubColumnas() {
    this.subcategoriasColumnas?.forEach(() => {
      this.subcategoriaSeleccionadaColumna.push(false);
    });
  }

  obtenerVersionMax() {
    this.gmbservices.obtenerVersionMaximaMBE(this.idmbe).subscribe(
      res => {
        this.versionMaxima = res?.data === null ? 1 : res?.data;

      }
    )
  }

  cargarDatosMbe() {
    this.gmbservices.obtenerDatosGMBEBurbujas(this.idmbe, this.versionMaxima).subscribe(
      res => {

        this.datosIntersecciones = res;
        
        //Crea una variable que saque conteoDisenioEval y conteoTipoEvaluacion, si conteoTipoEvaluacion es null, entonces se le asigna conteoDisenioEval
        this.datosIntersecciones.forEach((element: any) => {
          let cadena = element.conteoTipoEvaluacion === null ? element.conteoDisenioEval : element.conteoTipoEvaluacion;
          this.cadenaDatosBurbujas.push(cadena);
        });
        
        this.valorMasAltoBurbuja = Math.max(...this.cadenaDatosBurbujas.flatMap((cadena: any) => cadena.split(',').map((item: any) => parseInt(item.split(':')[3]))));
        this.valorMasBajoBurbuja = Math.min(...this.cadenaDatosBurbujas.flatMap((cadena: any) => cadena.split(',').map((item: any) => parseInt(item.split(':')[3]))));
      },
      err => { }
    );

  }

  abrirModal(content: any, informacion: any, titulo: string, seccion: string) {
    this.modalService.open(content, {
      centered: true,
      keyboard: false,
      size: 'md'
    });

    if (seccion === 'Columna') {
      this.btnMasInformacion = false;
      this.tituloModal = false;
    }else{
      this.btnMasInformacion = true;
      this.tituloModal = true;
    }

    


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

  mensajeFlotante(fila: number, columna: number) {
    let datos = this.datosIntersecciones.find(
      obj => obj.idFila === fila && obj.idColumna === columna
    );
    let eva = datos?.conteoTipoEvaluacion === null ? datos?.conteoDisenioEval : datos?.conteoTipoEvaluacion;
    let idGpo = eva?.split(':');
    let nombreGpo = idGpo[1];
    let count = idGpo[3];

    this.figuraActivaId = fila + '-' + columna;

    this.mensajeFlotanteFuera = true;

    this.nombreGPOFlotante = nombreGpo;
    this.countFlotante = count;

  }

  mensajeFuera() {
    this.figuraActivaId = null;
    this.mensajeFlotanteFuera = false;
  }

  filtrosCategoriasFilas() {
    let datosEnvio = {
      idMbe: this.idmbe,
      idTipo: 2,
      categorias: this.seleccionFilasCategorias,
      subcategorias: this.seleccionFilasSubCategorias,
    };
    console.log('datosEnvio:', datosEnvio);
    this.gmbservices.filtroCategoria(datosEnvio).subscribe(
      res => {
        console.log(res);
        this.categoriasFilas = res;
        this.cargarChechbox();
        //this.cargarChechbox();
      },
      err => {
        console.error('Error al obtener categorías:', err);
      }
    );
  }

  filtrosSubcategoriasFilas() {
    let datosEnvio;
    if (this.seleccionFilasCategorias?.length === 0) {
      this.subcategoriasFilas = [];
    } else {
      datosEnvio = {
        idMbe: this.idmbe,
        idTipo: 2,
        categorias: this.seleccionFilasCategorias,
        subcategorias: this.seleccionFilasSubCategorias,
      };

      this.gmbservices.filtrosSubcategoria(datosEnvio).subscribe(
        res => {
          console.log(res);
          this.subcategoriasFilas = res.filter((subcategoria: any) => subcategoria.idSubcategoria !== 0);
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
    if (idCategoria?.length === 0) {
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
          console.log(res);
          this.subcategoriasColumnas = res.filter((subcategoria: any) => subcategoria.idSubcategoria !== 0);
          this.cargarChechboxSubColumnas();
        },
        err => {
          console.error('Error al obtener subcategorías:', err);
        }
      )
    };
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


  cargaEstructuraPanelResultados(idCateoriaFilas: any = null, idSubcategoriaFilas: any = null, idCategoriaColumnas: any = null, idSubcategoriaColumnas: any = null) {
    //limpia los datos de la estructura
    this.estructuraFinalColumnasTitulos = [];
    this.estructuraFinalFilasTitulos = [];
    this.estructuraFinalFilasSubitulos = [];

    // Obtener estructuras guardadas del localStorage
    let estructurasGuardadas = JSON.parse(this.storage.sesionGetItem('EstructuraTabla') || '[]');

    // Verificar si ya existe una estructura con el mismo idMbe
    const estructuraExistente = estructurasGuardadas.find((estructura: any) => estructura.idMbe === this.idmbe);

    if (estructuraExistente && (idCateoriaFilas?.length === 0 || idCateoriaFilas === null ) && (idSubcategoriaFilas?.length === 0 || idSubcategoriaFilas === null) && (idCategoriaColumnas?.length === 0 || idCategoriaColumnas === null) && (idSubcategoriaColumnas?.length === 0 || idSubcategoriaColumnas === null)) {
      console.log('Estructura guardada en el localStorage:', estructuraExistente);
      // Cargar la estructura existente desde el localStorage
      setTimeout(() => {
        this.estructuraFinalColumnasTitulos = estructuraExistente.columnas;
        this.estructuraFinalFilasTitulos = estructuraExistente.filas;
        this.estructuraFinalFilasSubitulos = estructuraExistente.subfilas;
      }, 500);
    } else {
      console.log('No existe estructura guardada en el localStorage');
      // Construir la estructura si no existe en el localStorage
      const datosEnvio = {
        idMbe: this.idmbe,
        idCategoriasFilas: idCateoriaFilas?.length > 0 ? idCateoriaFilas : null,
        idSubcategoriasFilas: idSubcategoriaFilas?.length > 0 ? idSubcategoriaFilas : null,
        idCategoriasColumnas: idCategoriaColumnas?.length > 0 ? idCategoriaColumnas : null,
        idSubcategoriasColumnas: idSubcategoriaColumnas?.length > 0 ? idSubcategoriaColumnas : null
      };

      this.gmbservices.obtenerEstructuraPanelResultados(datosEnvio).subscribe(
        res => {
          this.sinResultados(res);

          // Filtrar las columnas y las filas por tipo
          this.estructuraFinalColumnasTitulos = this.filtrarPorTipo(res, 1);
          this.estructuraFinalFilasTitulos = this.filtrarPorTipo(res, 2);

          this.estructuraFinalFilasSubitulos = this.estructuraFinalFilasTitulos.flatMap(fila => fila.hijos);

          // Verifica si en todos los datos de la estructura hay un idSubcategorias mayor a 0
          this.estructuraFinalFilasSubitulos.forEach((element: any) => {
            if (element.idSubCategoria > 0) {
              this.existeSubcategoria = 1;
            }
          });

          let contador = -1;
          let categoriaAnt=0;
          this.estructuraFinalFilasSubitulos.forEach(e=>{
            if(e.idCategoria !== categoriaAnt ){
              categoriaAnt = e.idCategoria;
              contador++;
            }
            if(contador>this.colores.length-1){
              contador = 0;
            }
            e.color = this.colores[contador];
          })
          let estructuraGuardada = {
            idMbe: this.idmbe,
            columnas: this.estructuraFinalColumnasTitulos,
            filas: this.estructuraFinalFilasTitulos,
            subfilas: this.estructuraFinalFilasSubitulos
          };

          // Agregar la nueva estructura al localStorage
          estructurasGuardadas.push(estructuraGuardada);
          this.storage.sesionSetItem('EstructuraTabla', JSON.stringify(estructurasGuardadas));
        },
        err => {
          console.error('Error al obtener estructura del panel:', err);
        }
      );
    }
  }

  sinResultados(res: any) {
    if (res.length === 0) {
      swal.fire({
        icon: 'error',
        title: '<center> Error </center>',
        text: 'Sin resultados',
      })
    }
  }

  borraFiltros() {
    //reinicio de los checkbox en false
    this.quitarSeleccion();
    this.seleccionColumnasCategorias = [];
    this.seleccionFilasCategorias = [];
    this.seleccionColumnasSubCategorias = [];
    this.seleccionFilasSubCategorias = [];
    this.cargaEstructuraPanelResultados();
  }

  quitarSeleccion() {
    this.elementosObservados = false;
    this.categoriasFilas = [];
    this.subcategoriasFilas = [];
    this.categoriasColumnas = [];
    this.subcategoriasColumnas = [];
    this.categoriaSeleccionadaFilas = [];
    this.subcategoriaSeleccionadaFilas = [];
    this.categoriaSeleccionadaColumnas = [];
    this.subcategoriaSeleccionadaColumnas = [];
    this.filtrosCategoriasFilas();
    //this.filtrosSubcategoriasFilas();
    this.filtrosCategoriasColumnas();
    //this.filtrosSubcategoriasColumnas();
    this.cargarChechbox();
    //this.cargarChechboxSubFila();
    this.cargarChechboxColumnas();
    //this.cargarChechboxSubColumnas();
  }

  filtrarPorTipo(arreglo: any[], tipo: number) {
    const result = arreglo.filter(item => item.idTipo === tipo);

    // Contar subcategorías por categoría
    const countSubCats = result.reduce((contador, producto) => {
      contador[producto.idCategoria] = (contador[producto.idCategoria] || 0) + 1;
      return contador;
    }, {});



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
        descripcion: obj.descripcion,
        complemento: obj.complemento,
        complementoSubcategoria: obj.complementoSubcategoria,
        descripcionSubcategoria: obj.descripcionSubcategoria

      });
    });

    return Array.from(categoriasMap.values());
  }

  obtenerTipo(arreglo: any, tipo: number) {
    let salida = [];
    salida = arreglo.filter((e: any) => e.idTipo === tipo);

    return salida;
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

  regresaValorSinSubcategoria(padre: any, hijo: any) {
    return hijo !== undefined ? hijo : padre?.idEstructura;

  }

  datosInterseccion(columna: number, fila: number,u:number,i:number) {
    const respuesta = this.datosIntersecciones.find(
      obj => obj.idFila === columna && obj.idColumna === fila
    );

    const conteoTipoEvaluacion = respuesta.conteoDisenioEval ?? respuesta.conteoTipoEvaluacion;
    const evaluaciones = conteoTipoEvaluacion ? conteoTipoEvaluacion.split(',') : [];

    return evaluaciones.map((eva:any) => {
      const [idGpo, nombreGpo, colorBubble, count] = eva.split(':');
      return {
        idMbe: this.idmbe,
        idFila: respuesta.idFila,
        idColumna: respuesta.idColumna,
        idGpo: parseInt(idGpo),
        nombreGpo,
        colorBubble,
        count: parseInt(count),
        valorMaximoZ: this.valorMasAltoBurbuja,
        valorMinimoZ: this.valorMasBajoBurbuja,
      };
    });
  }

  validarDatos(columna: number, fila: number) {
    const respuesta = this.datosIntersecciones.find(
      obj => obj.idFila === columna && obj.idColumna === fila
    );

    return respuesta ? true : false;

  }

  colorFila(posicion: number, tipo: number, id: number) {
    let salida = '';
    if(id !== this.idAnterior){
      this.posColores++;
      this.idAnterior = id;
    }
    // Verifica si es de tipo 1 y no hay selecciones en filas o columnas
    if (tipo === 1 && this.seleccionColumnasCategorias.length === 0 && this.seleccionFilasCategorias.length === 0) {
      // Calcula el color basado en la posición y almacena en `colorCategoria` si no existe
      salida = this.colores[this.posColores % this.colores.length];
      
      // Solo agrega el color si no existe ya en `colorCategoria`
      const existeCategoria = this.colorCategoria.some(obj => obj.categoria === id);
      if (!existeCategoria) {
        this.colorCategoria.push({ categoria: id, color: salida });
      }
    } else {
      // Si ya existe en `colorCategoria`, busca el color
      const item = this.colorCategoria.find(obj => obj.categoria === id);
      salida = item?.color ?? ''; // Usa el color si existe, o una cadena vacía si no
    }
    return salida;
  }
  

  detenerPropagacion(event: Event) {
    event.stopPropagation();
  }



  onCategoriaChangeFilas(idSeccion: number, event: any) {
    this.elementosObservados = false;
    this.toggleSelection(
      idSeccion,
      this.categoriaSeleccionadaFilas,
      this.subcategoriaSeleccionadaFilas,
      this.filtrosSubcategoriasFilas.bind(this),
      this.cargaEstructuraPanelResultados.bind(this)
    );
  }

  onSubCategoriaChangeFilas(idSeccion: number, event: any) {
    console.log('Subcategoria seleccionada:', idSeccion);
    console.log('event:', event);
    this.elementosObservados = false;
    this.toggleSelection(
      idSeccion,
      this.subcategoriaSeleccionadaFilas,
      null,
      null,
      this.cargaEstructuraPanelResultados.bind(this)
    );
  }

  onCategoriaChangeColumnas(idSeccion: number, event: any) {
    this.elementosObservados = false;
    this.toggleSelection(
      idSeccion,
      this.categoriaSeleccionadaColumnas,
      this.subcategoriaSeleccionadaColumnas,
      this.filtrosSubcategoriasColumnas.bind(this),
      this.cargaEstructuraPanelResultados.bind(this)
    );
  }

  onSubCategoriaChangeColumnas(idSeccion: number, event: any) {
    this.elementosObservados = false;
    this.toggleSelection(
      idSeccion,
      this.subcategoriaSeleccionadaColumnas,
      null,
      null,
      this.cargaEstructuraPanelResultados.bind(this)
    );
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
    ) => void
  ) {
    const index = mainArray.indexOf(idSeccion);
    if (index === -1) {
      mainArray.push(idSeccion);
    } else {
      mainArray.splice(index, 1);
    }
    if (filterFunction) filterFunction(mainArray);
    loadFunction(
      this.categoriaSeleccionadaFilas,
      this.subcategoriaSeleccionadaFilas,
      this.categoriaSeleccionadaColumnas,
      this.subcategoriaSeleccionadaColumnas
    );
  }

  getTotalColumnas(): number {
    return this.estructuraFinalColumnasTitulos.reduce((acc, col) => acc + col.hijos.length, 0);
  }

  descargar() {
    swal.fire({
      title: 'Descargando',
      timerProgressBar: true,
      didOpen: () => {
        swal.showLoading();
      }
    });
    this.gmbservices.descargarReporteDatos(this.idmbe, this.versionMaxima).subscribe(
      (res: HttpResponse<ArrayBuffer>) => {
        if (res.body!.byteLength > 0) {
          this.descargarImagenPanel();
          const file = new Blob([res!.body!], { type: 'application/xlsx' });
          const fileURL = URL.createObjectURL(file);
          var link = document.createElement('a');
          link.href = fileURL;
          link.download = 'DatosMBE_' + this.nombreMBE.replace(/\s+/g, '') + '.xlsx';
          link.click();
        } else {
          swal.fire({
            icon: 'error',
            title: '<center> Error </center>',
            text: 'Sin información',
          })
        }
      },
      err => {
        swal.fire({
          icon: 'error',
          title: '<center> Error </center>',
          text: 'Sin información',
        })
      })
  }

  esperaHasta(condicion: () => boolean, intervalo: number): Promise<void> {
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (condicion()) {
          clearInterval(intervalId);
          resolve();
        }
      }, intervalo);
    });
  }

  async descargarImagenPanel() {
    const node = document.getElementById('imagenTabla') as HTMLElement; // Selecciona el div que quieres capturar
    if (node) {
      // Corrige elementos conflictivos como SVGs
      const svgElements = node.getElementsByTagName('svg');
      for (let i = 0; i < svgElements.length; i++) {
        const svg = svgElements[i];
        svg.setAttribute('class', svg.className.baseVal); // Corregir la propiedad class
      }
    
      domtoimage.toPng(node)
        .then((dataUrl: string) => {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = this.nombreMBE.replace(/\s+/g, '') + '.png';
          link.click();
    
          swal.fire('', '¡Descarga con éxito!', 'success').then(() => { });
        })
        .catch((error: any) => {
          console.error('Error al capturar el elemento:', error);
        });
    }
  }
  closeModal() {
    this.modalService.dismissAll();
  }
  
  /**
   *  Inicia sección de filtros nuevos
   * 
   */


  seleccionarCategoriaFilas(idCategoria:number){
    const index = this.seleccionFilasCategorias.indexOf(idCategoria);
    if (index === -1) {
      // Si no existe, lo agrega
      this.seleccionFilasCategorias.push(idCategoria);
    } else {
      // Si ya existe, lo elimina
      this.seleccionFilasCategorias.splice(index, 1);
      let busca = this.subcategoriasFilas.filter(
        (item: { idCategoria: number; }) => item.idCategoria === idCategoria
      );
      const idsAEliminar = busca.map((item: { idSubcategoria: any; }) => item.idSubcategoria);
      console.warn(idsAEliminar);
      console.warn(this.seleccionFilasSubCategorias)
        // Filtra `seleccionFilasSubCategorias` para excluir los `idSubcategoria` en `idsAEliminar`
        this.seleccionFilasSubCategorias = this.seleccionFilasSubCategorias.filter(
          item => !idsAEliminar.includes(item)
        );
    }
    this.filtrosFilas();
  }

  seleccionSubcategoriasFilas(idSubcategoria:number){
    const index = this.seleccionFilasSubCategorias.indexOf(idSubcategoria);
    if (index === -1) {
      // Si no existe, lo agrega
      this.seleccionFilasSubCategorias.push(idSubcategoria);
    } else {
      // Si ya existe, lo elimina
      this.seleccionFilasSubCategorias.splice(index, 1);
    }
    this.filtrosFilas();
  }

  filtrosFilas(){
    if(this.seleccionFilasCategorias.length === 0){
      this.seleccionFilasSubCategorias = [];
    }

   let datosEnvio = {
      idMbe: this.idmbe,
      idTipo: 2,
      categorias: this.seleccionFilasCategorias?.length === 0 ? null: this.seleccionFilasCategorias,
      subcategorias: this.seleccionFilasSubCategorias?.length === 0 ? null: this.seleccionFilasSubCategorias,
    };

    this.gmbservices.filtroCategoria(datosEnvio).subscribe(
      res => {
        console.log(res);
        this.categoriasFilas = res;
        this.cargarChechbox();
      },
      err => {
        console.error('Error al obtener categorías:', err);
      }
    );

    this.gmbservices.filtrosSubcategoria(datosEnvio).subscribe(
      res => {
        console.log(res);
        this.subcategoriasFilas = res.filter((subcategoria: any) => subcategoria.idSubcategoria !== 0);
        this.cargarChechboxSubFila()
      },
      err => {
        console.error('Error al obtener subcategorías:', err);
      }
    );

    this.cargaEstructuraPanelResultados(this.seleccionFilasCategorias,this.seleccionFilasSubCategorias,this.seleccionColumnasCategorias,this.seleccionColumnasSubCategorias);
  }

  seleccionarCategoriaColumnas(idCategoria:number){
    console.log(idCategoria);
    const index = this.seleccionColumnasCategorias.indexOf(idCategoria);
    if (index === -1) {
      // Si no existe, lo agrega
      this.seleccionColumnasCategorias.push(idCategoria);
    } else {
      // Si ya existe, lo elimina
      this.seleccionColumnasCategorias.splice(index, 1);
      let busca = this.subcategoriasColumnas.filter(
        (item: { idCategoria: number; }) => item.idCategoria === idCategoria
      );
      const idsAEliminar = busca.map((item: { idSubcategoria: any; }) => item.idSubcategoria);
        // Filtra `seleccionFilasSubCategorias` para excluir los `idSubcategoria` en `idsAEliminar`
        this.seleccionColumnasCategorias = this.seleccionColumnasCategorias.filter(
          item => !idsAEliminar.includes(item)
        );
    }
    this.filtrosColumnas();
  }

  seleccionSubcategoriasColumnas(idSubcategoria:number){
    const index = this.seleccionColumnasSubCategorias.indexOf(idSubcategoria);
    if (index === -1) {
      // Si no existe, lo agrega
      this.seleccionColumnasSubCategorias.push(idSubcategoria);
    } else {
      // Si ya existe, lo elimina
      this.seleccionColumnasSubCategorias.splice(index, 1);
    }
    this.filtrosColumnas();
  }

  filtrosColumnas(){
    if(this.seleccionColumnasCategorias.length === 0){
      this.seleccionColumnasSubCategorias = [];
    }

   let datosEnvio = {
      idMbe: this.idmbe,
      idTipo: 1,
      categorias: this.seleccionColumnasCategorias?.length === 0 ? null: this.seleccionColumnasCategorias,
      subcategorias: this.seleccionColumnasSubCategorias?.length === 0 ? null: this.seleccionColumnasSubCategorias,
    };

    this.gmbservices.filtroCategoria(datosEnvio).subscribe(
      res => {
        console.log(res);
        this.categoriasColumnas = res;
        this.cargarChechboxColumnas();
      },
      err => {
        console.error('Error al obtener categorías:', err);
      }
    );

    this.gmbservices.filtrosSubcategoria(datosEnvio).subscribe(
      res => {
        console.log(res);
        this.subcategoriasColumnas = res.filter((subcategoria: any) => subcategoria.idSubcategoria !== 0);
        this.cargarChechboxSubColumnas()
      },
      err => {
        console.error('Error al obtener subcategorías:', err);
      }
    );

    this.cargaEstructuraPanelResultados(this.seleccionFilasCategorias,this.seleccionFilasSubCategorias,this.seleccionColumnasCategorias,this.seleccionColumnasSubCategorias);
  }

  /**
   * Modifica listado subcategoria de filtros
   * 
   */

  obtenerCategoria(idCategoria:number,tipo:number){
    let nomCategoria = '';
    if(tipo===1){
        nomCategoria = this.categoriasFilas.find((cat: { idCategoria: number; })=>cat.idCategoria === idCategoria)?.categoria;
        this.categoriaFilasAnterior =this.categoriaFilasAnterior === '' || nomCategoria !== this.categoriaFilasAnterior? nomCategoria : this.categoriaFilasAnterior;
    }else{
      nomCategoria = this.categoriasColumnas.find((cat: { idCategoria: number; })=>cat.idCategoria === idCategoria)?.categoria;
      this.categoriaColumnasAnterior =this.categoriaColumnasAnterior === '' ||  nomCategoria !== this.categoriaColumnasAnterior ? nomCategoria : this.categoriaColumnasAnterior;
    }
    return nomCategoria;
  }

}
