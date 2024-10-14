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
declare var swal: any;

@Component({
  selector: 'app-listar-panel',
  templateUrl: './listar-panel.component.html',
  styleUrls: ['./listar-panel.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush 
})
export class PanelResultadosComponent implements OnInit, OnDestroy, AfterViewChecked {
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

  colores = ['#80C080', '#8080FF', '#C080C0', '#ffb6c0', '#c0c0c0', '#808080', '#ff8080', '#ffd280', '#5562A6', '#35AEB6', '#B8475A', '#F89E66'];
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
  @ViewChildren('thElemento') thElements!: QueryList<ElementRef>;
  elementosObservados = false;
  existeSubcategoria: number = 0;


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
    this.filtrosSubcategoriasFilas();
    this.filtrosCategoriasColumnas();
    this.filtrosSubcategoriasColumnas();
    this.cargarDatosMbe();
    this.cargaEstructuraPanelResultados();
  }
  ngAfterViewChecked(): void {
    // Solo ejecutar el renderizado una vez que los elementos estén disponibles
    if (!this.elementosObservados && this.thElements.length > 0) {
      this.renderizado();
      this.elementosObservados = true; // Marcar que ya se han observado los elementos
    }
  }

  ngOnDestroy(): void {
    this.subscripcionDatos.forEach(sub => sub.unsubscribe());
    //destruye la funcion de observar los elementos y el renderizado
    this.elementosObservados = false;
  }
  ngOnInit(): void {
    this.pantallaCargando();
    this.tituloAcotacion();
    //this.escucharCambiosSelect();
    this.abrirToastAyuda = true;
    setTimeout(() => {
      this.abrirToastAyuda = false;
      this.esperaSegundos = false;
    }, 10000);
  }

  trackByFn(index: number, item: any): number {
    return item.id; // o cualquier propiedad única
  }

  renderizado() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const [_, index, index2] = entry.target.id.split('-').map(Number);
        if (entry.isIntersecting) {
          if (!this.esVisible[index]) {
            this.esVisible[index] = [];
          }
          if (!this.esVisible[index][index2]) {
            this.esVisible[index][index2] = true;
          }
        }
      });
    }, {
      rootMargin: '500px',
    });

    this.thElements.forEach(th => {
      observer.observe(th.nativeElement);
    });
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
      swal.close();
      this.isLoading = false; 
    }, 4000); 
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

  // escucharCambiosSelect() {
  //   this.generales.get('categoriaFila')?.valueChanges.subscribe((value) => {
  //     this.selectedCategoriaFila = value;
  //     
  //     this.filtrosCategoriasFilas(parseInt(value), 0);
  //     this.filtrosSubcategoriasFilas(parseInt(value), 0);
  //   })
  //   this.generales.get('subcategoriaFila')?.valueChanges.subscribe((value) => {
  //     
  //     this.selectedSubcategoriaFila = value;
  //     this.filtrosSubcategoriasFilas(parseInt(this.selectedCategoriaFila), parseInt(value));
  //   })


  //   this.generales.get('categoriasColumna')?.valueChanges.subscribe((value) => {
  //     
  //     this.filtrosCategoriasColumnas(parseInt(value), 0);
  //     this.filtrosSubcategoriasColumnas(parseInt(value), 0);
  //   });

  //   this.generales.get('subcategoriasColumna')?.valueChanges.subscribe((value) => {
  //     
  //     this.filtrosSubcategoriasColumnas(parseInt(this.generales.get('categoriasColumna')?.value), parseInt(value));
  //   });

  // }

  filtrosCategoriasFilas() {
    let datosEnvio = {
      idMbe: this.idmbe,
      idTipo: 2,
      categorias: null,
      subcategorias: null,
    };

    this.gmbservices.filtroCategoria(datosEnvio).subscribe(
      res => {

        this.categoriasFilas = res;
        this.cargarChechbox();
        //this.cargarChechbox();
      },
      err => {
        console.error('Error al obtener categorías:', err);
      }
    );
  }

  filtrosSubcategoriasFilas(idCategorias: any = null) {

    let datosEnvio;
    if (idCategorias?.length === 0) {
      this.subcategoriasFilas = [];
    } else {
      datosEnvio = {
        idMbe: this.idmbe,
        idTipo: 3,
        categorias: idCategorias,
        subcategorias: null,
      };

      this.gmbservices.filtrosSubcategoria(datosEnvio).subscribe(
        res => {

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
      idTipo: 2,
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
        idTipo: 3,
        categorias: idCategoria,
        subcategorias: null,
      };

      this.gmbservices.filtrosSubcategoria(datosEnvio).subscribe(
        res => {

          this.subcategoriasColumnas = res;
          //Saca el idCategoria del primer dato de la subcategoria y marca el checkbox de la categoria
          this.categoriaSeleccionadaColumnas = [];
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
        
        //Verfica si en todo los datos de la estructura hay un idSubcategorias mayor a 0
        this.estructuraFinalFilasSubitulos.forEach((element: any) => {
          if (element.idSubCategoria > 0) {
            this.existeSubcategoria = 1;
          }
        });

        console.log(this.estructuraFinalFilasSubitulos);

      },
      err => {
        console.error('Error al obtener estructura del panel:', err);
      }
    );
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
    //limpia los checkbox
    this.elementosObservados = false;
    this.categoriaSeleccionadaFila = [];
    this.subcategoriaSeleccionadaFila = [];
    this.categoriaSeleccionadaColumna = [];
    this.subcategoriaSeleccionadaColumna = [];
    this.cargaEstructuraPanelResultados();
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

    if (!respuesta) {
      return [];
    }

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

  insertadoEncontrados(respuesta: any,u:number,i:number) {
    const conteoTipoEvaluacion = respuesta.conteoDisenioEval ?? respuesta.conteoTipoEvaluacion;
    const evaluaciones = conteoTipoEvaluacion ? conteoTipoEvaluacion.split(',') : [];

    const thElemento = document.getElementById('thElemento-' + u + '-' + i);
    const alto = thElemento?.clientHeight ?? 0;
    const ancho = thElemento?.clientWidth ?? 0;

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
        alto: alto,
        ancho: ancho,
      };
    });
  }

  colorFila(idCategoria: number) {
    if (!this.conteoCategorias) {
      this.conteoCategorias = {};
    }

    if (!this.conteoCategorias[idCategoria]) {
      if (this.colores.length === 0) {
        this.colores = ['#80C080', '#8080FF', '#C080C0', '#ffb6c0', '#c0c0c0', '#808080', '#ff8080', '#ffd280', '#5562A6', '#35AEB6', '#B8475A', '#F89E66'];
      }
      this.colorSeleccionado = this.colores.splice(Math.floor(Math.random() * this.colores.length), 1)[0];
      
      this.conteoCategorias[idCategoria] = this.colorSeleccionado;
    }

    return this.conteoCategorias[idCategoria];
  }



  onCategoriaChangeFilas(idSeccion: number) {
    this.elementosObservados = false;
    this.toggleSelection(
      idSeccion,
      this.categoriaSeleccionadaFilas,
      this.subcategoriaSeleccionadaFilas,
      null,
      //this.filtrosSubcategoriasFilas.bind(this),
      this.cargaEstructuraPanelResultados.bind(this),
      //this.cargarChechboxSubFila.bind(this)
    );

  }

  onSubCategoriaChangeFilas(idSeccion: number) {
    this.elementosObservados = false;
    this.toggleSelection(
      idSeccion,
      this.subcategoriaSeleccionadaFilas,
      null,
      null,
      this.cargaEstructuraPanelResultados.bind(this)
    );

  }

  onCategoriaChangeColumnas(idSeccion: number) {
    this.elementosObservados = false;
    this.toggleSelection(
      idSeccion,
      this.categoriaSeleccionadaColumnas,
      this.subcategoriaSeleccionadaColumnas,
      null,
      //this.filtrosSubcategoriasColumnas.bind(this),
      this.cargaEstructuraPanelResultados.bind(this),
      //this.cargaEstructuraPanelResultados.bind(this)
    );

  }

  onSubCategoriaChangeColumnas(idSeccion: number) {
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
          const file = new Blob([res!.body!], { type: 'application/xlsx' });
          const fileURL = URL.createObjectURL(file);
          var link = document.createElement('a');
          link.href = fileURL;
          swal.close();
          swal.fire('', '¡Descarga con éxito!', 'success').then(() => { });
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

  closeModal() {
    this.modalService.dismissAll();
  }


}
