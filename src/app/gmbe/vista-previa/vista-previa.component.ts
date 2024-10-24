import { AfterContentChecked, AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GmbeServicesService } from '../services/gmbe-services.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TitulosService } from 'src/app/services/titulos.services';
import {
  faRotateLeft,
  faDownload,
  faX,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CifradoService } from 'src/app/services/cifrado.service';
import { StorageService } from 'src/app/services/storage-service.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModalGraficasComponent } from '../modal-graficas/modal-graficas.component';
import { DataDynamic } from 'src/app/base/services/dinamic-data.services';

declare var swal: any;

@Component({
  selector: 'app-vista-previa',
  templateUrl: './vista-previa.component.html',
  styleUrls: ['./vista-previa.component.scss'],
})
export class VistaPreviaComponent implements OnInit, OnDestroy{
  id: number = 0;
  versionMaxima = 0;
  generales: FormGroup;
  modalRevisionesForm: FormGroup;
  imageUrl: SafeUrl | null = null;
  textoBienvenida = 'Vista previa';

  estructuraFinalColumnasTitulos: any[] = [];
  estructuraFinalFilasTitulos: any[] = [];
  estructuraFinalFilasSubitulos: any[] = [];
  datosIntersecciones: any[] = [];

  mostrarNombre: string = '';
  mostrarObjetivos: string = '';

  revision1:any
  revisionDos: any;

  mostrarNombreModal: string = '';
  mostrarObjetivosModal: string = '';

  faRotaLeft = faRotateLeft;
  faDownload = faDownload;
  faX = faX;
  faCheck = faCheck;

  creado: number = 173;
  publicado: number = 174;
  pendiente: number = 175;
  rechazado: number = 176;
  validado: number = 0;

  revision2 : any ;
  usuario: any;

  existeSegundaRevision: boolean = false;
  existeOtraRevision: boolean = false;
  idEstatus: any;
  idMBE: any;
  mostrarMensajeRevisiones: boolean = false;
  faRotate = faRotateLeft;

tipoModalVerant:number = 1;
imagenPrevia:any;
imagenNueva:any;

valorMaximoZ: number = 0;
valorMinimoZ: number = 0;

arrayValoresBurbujas: any[] = [];

idUsuario:number = 0;

modalTitulo: string = '';

subscriptions: Subscription[] = []; // Array to hold subscriptions

estructuraCarga :any [] = [];

esVisible: boolean[][] = [];
esVisible1: boolean[][] = [];
esVisible2: boolean[][] = [];
@ViewChildren('thElemento') thElements!: QueryList<ElementRef>;
@ViewChildren('thElemento1') thElements1!: QueryList<ElementRef>;
@ViewChildren('thElemento2') thElements2!: QueryList<ElementRef>;
@ViewChildren('contentGraficas') contentGraficas!: QueryList<ElementRef>;

elementosObservados = false;
elementosObservadosModal = false;
renderizadoServices: any;

cuadroAmarrillo: string = '';


  constructor(
    private route: ActivatedRoute,
    private cifrado: CifradoService,
    private storage: StorageService,
    private modalService: NgbModal,
    private gmbservices: GmbeServicesService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private imagen: DataDynamic,
    private titulos: TitulosService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.titulos.changePestaña(this.textoBienvenida);
    this.cuadroAmarrillo = imagen.getImagen('img/CUADRO_AMARILLO-1.png');
    this.usuario = JSON.parse(
      this.cifrado.descifrar(this.storage.getItem('usr')!)
    );
    this.id = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.generales = this.fb.group({
      nombre: [''],
      objetivos: [''],
      resumen: [''],
    });
    this.modalRevisionesForm = this.fb.group({
      anterior: [''],
      actual: [''],
    });
    this.obtenerVersionMax();
    this.cargarRevisonDos();
  }

  ngOnDestroy(): void {
    this.storage.removeItem('idMbe');
    this.elementosObservados = false; // Marcar que los elementos no han sido observados
    this.esVisible = []; // Limpiar el array de visibilidad
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  ngOnInit(): void {
    this.cargaMBE();
    this.cargarEstructuraMbe();
    this.pantallaCargando();
    this.estatusVdalidado();
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

  pantallaCargando() {
    swal.fire({
      title: 'Cargando',
      timerProgressBar: true,
      didOpen: () => {
        swal.showLoading();
      }
    });
  }


  cargarRevisonDos() {
    this.gmbservices.obtenerDatosGMBE(this.id, 1).subscribe(
      (res) => {
        
        this.revisionDos = res;
        

        this.revisionDos.forEach((element: any) => {
          let valor = element.conteoTipoEval === null ? element.conteoDisenioEval: element.conteoTipoEval;
          
          this.arrayValoresBurbujas.push(valor)
        });
        
        this.valorMaximoZ = Math.max(...this.arrayValoresBurbujas.flatMap((cadena: any) => cadena.split(',').map((item: any) => parseInt(item.split(':')[3]))));
        this.valorMinimoZ = Math.min(...this.arrayValoresBurbujas.flatMap((cadena: any) => cadena.split(',').map((item: any) => parseInt(item.split(':')[3]))));
        
        
      },
      (err) => {}
    );
  }

  abrirModal(content: any, actual: string, anterior: string, tipo: number, titulo: string) {
    this.tipoModalVerant = tipo;

    // Asignar el título dinámico
    this.modalTitulo = titulo;

    // Configurar el formulario
    this.modalRevisionesForm = this.fb.group({
        anterior: [actual],
        actual: [anterior],
    });

    // Deshabilitar los campos dinámicamente
    this.modalRevisionesForm.get('anterior')?.disable();
    this.modalRevisionesForm.get('actual')?.disable();

    // Abrir el modal con las opciones configuradas
    this.modalService.open(content, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
    });
}

  abrirModalGraficas() {
    this.storage.setItem('idMbe', this.idMBE);
    this.modalService.open(ModalGraficasComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      
      size: 'xl',
    })
  }

  cargaMBE() {
    
    this.gmbservices.obtenerInfoGMBE(this.id).subscribe(
      (res) => {
        this.idEstatus = res.revisionOne.idEstatus.idCatalogo;
        
        this.mostrarNombre = res.revisionOne.nombre;
        this.idMBE = res.revisionOne.idMbe;
        this.mostrarObjetivos = res.revisionOne.objetivo;
        this.generales = this.fb.group({
          nombre: [res?.revisionOne.nombre],
          objetivos: [res?.revisionOne.objetivo],
          resumen: [res?.revisionOne.resumen],
        });
        
        
        

        if (res.revisionTwo !== null) {
          this.revision1 = res.revisionOne;
          this.revision2 = res.revisionTwo;
          this.existeSegundaRevision = true;
          this.mostrarObjetivosModal = res.revisionTwo.objetivo;

          this.gmbservices.getImage(res.revisionTwo.ruta).subscribe(
            (res) => {
              this.imagenPrevia = this.sanitizer.bypassSecurityTrustUrl(res);
            },
            (err) => {}
          );

          this.gmbservices.getImage(res.revisionOne.ruta).subscribe(
            (res) => {
              this.imagenNueva= this.sanitizer.bypassSecurityTrustUrl(res);
            },
            (err) => {}
          );



          /*this.modalRevisionesForm = this.fb.group({
            anterior: [res?.revisionTwo.objetivo],
            actual: [res?.revisionOne.objetivo],
          });*/
          this.modalRevisionesForm.get('anterior')?.disable();  // Deshabilitar el campo dinámicamente
          this.modalRevisionesForm.get('actual')?.disable();  // Deshabilitar el campo dinámicamente

        } else {
          this.existeSegundaRevision = false;
        }
        this.generales.disable();
        this.obtenerImagen(res.revisionOne.ruta);
      },
      (err) => {}
    );
  }

  idRol() {
    return this.usuario?.rolUsuario?.idRol;
  }

  validarBotonesAcciones(estatus: string): boolean {
    switch (estatus) {
      case 'rechazado':
        if (
          (this.idEstatus === this.pendiente &&
            (this.idRol() === 4 || this.idRol() === 3 || this.idRol() === 1)) ||
          (this.idEstatus === this.validado &&
            (this.idRol() === 4 || this.idRol() === 1))
        ) {
          return true;
        } else {
          return false;
        }
      case 'aprobado':
        if (
          this.idEstatus === this.pendiente &&
          (this.idRol() === 4 || this.idRol() === 3 || this.idRol() === 1)
        ) {
          return true;
        } else {
          return false;
        }
      case 'publicado':
        if (
          this.idEstatus === this.validado &&
          (this.idRol() === 4 || this.idRol() === 1)
        ) {
          return true;
        } else {
          return false;
        }
      case 'validar':
        if (((this.idEstatus === this.creado) || (this.idEstatus === this.rechazado)) && (this.idRol() === 2 || this.idRol() === 4 || this.idRol() === 1   ) && this.mostrarMensajeRevisiones){
          return true;
        } else {
          return false;
        }
      default:
        return false;
    }
  }

  estatusVdalidado() {
    this.gmbservices.estatusValidacion().subscribe(
      (res) => {
        
        this.validado = res.data;
      },
      (err) => {
        
      }
    );
  }

  validarAccesos(idUsuario: number) {
    this.gmbservices.consultarAccesos(idUsuario).subscribe(
      res => {
        
        //Actualizar el localStorage de los accesos del usuario
        this.storage.setItem("autorizadas", this.cifrado.cifrar(JSON.stringify(res)));
      },
      err => {
        
      }
    );
  }

  cambiarEstatusMBE(idEstatus: number) {
    let idRol = this.usuario.rolUsuario.idRol;
    let estatus;
    switch (idEstatus) {
      case this.publicado:
        estatus = 'publicar';
        break;
      case this.pendiente:
        estatus = 'enviar a validar';
        break;
      case this.rechazado:
        estatus = 'rechazar';
        break;
      case this.validado:
        estatus = 'aprobar';
        break;
    }

    //Mandar una alerta para cambiar el estatus
    swal
      .fire({
        icon: 'warning',
        text: '¿Está seguro de que quiere ' + estatus + ' este MBE? ',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        customClass: {
          htmlContainer: 'titulo-swal',
          confirmButton: 'guardar-swal',
          cancelButton: 'cancelar-swal',
        },
      })
      .then((result: { isConfirmed: any }) => {
        if (result.isConfirmed) {
          this.gmbservices.estatusGmbe(this.idMBE, idEstatus, idRol).subscribe(
            (res) => {
              switch (idEstatus) {
                case this.publicado:
                  swal
                    .fire('', 'Se ha publicado el MBE con éxito', 'success')
                    .then((result: { isConfirmed: any }) => {
                      if (result.isConfirmed) {
                        this.validarAccesos(this.usuario.idUsuario);
                        this.router.navigate(['/gmbe']);
                      }
                    });
                  break;
                case this.pendiente:
                  swal
                    .fire(
                      '',
                      'Se ha enviado a validar el MBE con éxito',
                      'success'
                    )
                    .then((result: { isConfirmed: any }) => {
                      if (result.isConfirmed) {
                        this.validarAccesos(this.usuario.idUsuario);
                        this.router.navigate(['/gmbe']);
                      }
                    });
                  break;
                case this.rechazado:
                  swal
                    .fire('', 'Se ha rechazado el MBE con éxito', 'success')
                    .then((result: { isConfirmed: any }) => {
                      if (result.isConfirmed) {
                        this.validarAccesos(this.usuario.idUsuario);
                        this.router.navigate(['/gmbe']);
                      }
                    });
                  break;
                case this.validado:
                  swal
                    .fire('', 'Se ha aprobado el MBE con éxito', 'success')
                    .then((result: { isConfirmed: any }) => {
                      if (result.isConfirmed) {
                        this.validarAccesos(this.usuario.idUsuario);
                        this.router.navigate(['/gmbe']);
                      }
                    });
                  break;
              }
            },
            (err) => {}
          );
        }
      });
  }

  cerraModal() { 
    clearInterval(this.renderizadoServices);
    this.modalService.dismissAll();
  }

  obtenerVersionMax() {
    this.gmbservices.obtenerVersionMaximaMBE(this.id).subscribe((res) => {
      this.versionMaxima = res?.data === null ? 1 : res?.data;
      
      this.existeOtraRevision = this.versionMaxima > 1 ? true : false;
      if (res?.data !== null) {
        this.mostrarMensajeRevisiones = true;
      } else {
        this.mostrarMensajeRevisiones = false;
      }

      this.cargarDatosMbe();
      
    });
  }

  obtenerImagen(ruta: string) {
    this.gmbservices.getImage(ruta).subscribe(
      (res) => {
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(res);
      },
      (err) => {}
    );
  }

  anchoDinamico() {
    if (window.innerWidth >= 920) {
      if (
        this.estructuraFinalColumnasTitulos.length <= 2 &&
        this.estructuraFinalColumnasTitulos.some((c) => c.hijos.length <= 3)
      ) {
        return '50';
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

  cargarEstructuraMbe() {
    this.storage.removeItem('zArrayGuardado');
    this.gmbservices.obtenerEstructuraGMBE(this.id).subscribe(
      (res) => {
        const categoriasFilas = this.obtenerTipo(res, 1);
        const categoriasColumnas = this.obtenerTipo(res, 2);

        this.estructuraFinalColumnasTitulos = this.filtrarCategoriasUnicas(categoriasFilas);
        this.estructuraFinalFilasTitulos = this.filtrarCategoriasUnicas(categoriasColumnas);

        this.estructuraFinalColumnasTitulos.forEach((columna) => {
          columna.hijos = res.filter(
            (e:any) => e?.idSubCategoria?.idRelacion === columna.idCatalogo && e?.idTipo?.idCatalogo === 1
          );
          if (columna.hijos.length === 0) {
            columna.hijos.push({ auxiliar: true });
          }
        });

        this.estructuraFinalFilasTitulos.forEach((fila) => {
          fila.hijos = res.filter(
            (e:any) => e?.idSubCategoria?.idRelacion === fila.idCatalogo && e?.idTipo?.idCatalogo === 2
          );
          if (fila.hijos.length === 0) {
            fila.hijos.push({
              auxiliar: true,
              countSubCats: 1,
              idCategoria: {
                idCatalogo: fila.idCatalogo,
                catalogo: fila.catalogo,
              },
              idEstructura: fila.idEstructura,
            });
          }
        });

        this.estructuraFinalFilasSubitulos = this.estructuraFinalFilasTitulos.flatMap(fila => fila.hijos);

        
      },
      (err) => {
        console.error('Error al cargar la estructura MBE', err);
      }
    );
  }

  cargarDatosMbe() {
    
    
    
    this.gmbservices.obtenerDatosGMBE(this.id, this.versionMaxima).subscribe(
      (res) => {
        this.datosIntersecciones = res;
        
        
        swal.close();
      },
      (err) => {}
    );
  }

  obtenerTipo(arreglo: any, tipo: number) {
    let salida = [];
    salida = arreglo.filter((e: any) => e.idTipo?.idCatalogo === tipo);
    return salida;
  }

  filtrarCategoriasUnicas(arreglo: any) {
    const categoriasMap = new Map<number, any>();
    arreglo.forEach(
      (obj: { idCategoria: any; idEstructura: any; countSubCats: any }) => {
        const categoria = obj.idCategoria;
        categoria.idEstructura = obj.idEstructura;
        if (categoriasMap.has(categoria.idCatalogo)) {
          categoriasMap.get(categoria.idCatalogo)!.countSubCats! =
            obj.countSubCats;
        } else {
          categoria.countSubCats = obj.countSubCats;
          categoriasMap.set(categoria.idCatalogo, categoria);
        }
      }
    );

    return Array.from(categoriasMap.values());
  }

  regresaValorSinSubcategoria(padre: any, hijo: any) {
    return hijo !== undefined ? hijo : padre?.idEstructura;
  }

  datosInterseccion(columna: number, fila: number) {
    let respuesta = this.datosIntersecciones.find(
      (obj) => obj.idFila === columna && obj.idColumna === fila
    );

    let obj = respuesta;

    respuesta = respuesta?.arrConteoDisenioEval.length < 1
      ? respuesta?.arrConteoTipoEval
      : respuesta?.arrConteoDisenioEval;

      //Agrega el idFila y idColumna al objeto
    respuesta?.forEach((element: any) => {
      element.idFila = obj.idFila;
      element.idColumna = obj.idColumna;
    });
    return respuesta;
  }

  validarDatosBurbujas(columna: number, fila: number){
    let respuesta = this.datosIntersecciones.find(
      (obj) => obj.idFila === columna && obj.idColumna === fila
    );

    return respuesta === undefined ? false : true;
  }

  datosInterseccion2(columna: number, fila: number) {
    let respuesta = this.revisionDos.find(
      (obj: any) => obj.idFila === columna && obj.idColumna === fila
    );

    let obj = respuesta;
    
    respuesta = respuesta?.arrConteoDisenioEval.length < 1
      ? respuesta?.arrConteoTipoEval
      : respuesta?.arrConteoDisenioEval;

      respuesta?.forEach((element: any) => {
        element.idFila = obj.idFila;
        element.idColumna = obj.idColumna;
      });

    return respuesta;
    
  }

  descargar() {
    swal.fire({
      title: 'Descargando',
      timerProgressBar: true,
      didOpen: () => {
        swal.showLoading();
      },
    });
    this.gmbservices
      .descargarReporteDatos(this.id, this.versionMaxima)
      .subscribe(
        (res: HttpResponse<ArrayBuffer>) => {
          if (res.body!.byteLength > 0) {
            const file = new Blob([res!.body!], { type: 'application/xlsx' });
            const fileURL = URL.createObjectURL(file);
            var link = document.createElement('a');
            link.href = fileURL;
            swal.close();
            swal.fire('', '¡Descarga con éxito!', 'success').then(() => {});
            link.download =
              'DatosMBE_' +
              this.generales.get('nombre')!.value.replace(/\s+/g, '') +
              '.xlsx';
            link.click();
          } else {
            swal.fire({
              icon: 'error',
              title: '<center> Error </center>',
              text: 'Sin información',
            });
          }
        },
        (err) => {
          swal.fire({
            icon: 'error',
            title: '<center> Error </center>',
            text: 'Sin información',
          });
        }
      );
  }
}
