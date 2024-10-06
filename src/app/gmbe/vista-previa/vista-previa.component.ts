import { Component, OnDestroy, OnInit } from '@angular/core';
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

declare var swal: any;

@Component({
  selector: 'app-vista-previa',
  templateUrl: './vista-previa.component.html',
  styleUrls: ['./vista-previa.component.scss'],
})
export class VistaPreviaComponent implements OnInit, OnDestroy {
  id: number = 0;
  versionMaxima = 1;
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

  constructor(
    private route: ActivatedRoute,
    private cifrado: CifradoService,
    private storage: StorageService,
    private modalService: NgbModal,
    private gmbservices: GmbeServicesService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private titulos: TitulosService,
    private router: Router
  ) {
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.titulos.changePestaña(this.textoBienvenida);
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
    this.cargaMBE();
    this.obtenerVersionMax();
    this.cargarEstructuraMbe();
    this.cargarRevisonDos();
    //this.cargarDatosMbe();
  }
  ngOnDestroy(): void {
    this.storage.removeItem('zArrayGuardado');
    this.storage.removeItem('zArrayGuardado2');
    this.storage.removeItem('zArrayGuardado3');
  }
  ngOnInit(): void {
    this.estatusVdalidado();
    this.storage.removeItem('zArrayGuardado');
    this.storage.removeItem('zArrayGuardado2');
    this.storage.removeItem('zArrayGuardado3');
  }

  cargarRevisonDos() {
    this.gmbservices.obtenerDatosGMBE(this.id, 1).subscribe(
      (res) => {
        console.log('datos', res);
        this.revisionDos = res;

        this.revisionDos.forEach((element: any) => {
          let valor = element.conteoTipoEval === null ? element.conteoDisenioEval: element.conteoTipoEval;
          console.log('valor', valor);
          this.arrayValoresBurbujas.push(valor)
        });
        console.log('array valores', this.arrayValoresBurbujas);
        this.valorMaximoZ = Math.max(...this.arrayValoresBurbujas.flatMap((cadena: any) => cadena.split(',').map((item: any) => parseInt(item.split(':')[3]))));
        this.valorMinimoZ = Math.min(...this.arrayValoresBurbujas.flatMap((cadena: any) => cadena.split(',').map((item: any) => parseInt(item.split(':')[3]))));
        console.log('valor maximo', this.valorMaximoZ);
        console.log('valor minimo', this.valorMinimoZ);
      },
      (err) => {}
    );
  }

  abrirModal(content: any,actual:string,anterior:string,tipo:number) {
    this.tipoModalVerant = tipo;
      this.modalRevisionesForm = this.fb.group({
            anterior: [actual],
            actual: [anterior],
          });
          this.modalRevisionesForm.get('anterior')?.disable();  // Deshabilitar el campo dinámicamente
          this.modalRevisionesForm.get('actual')?.disable();  // Deshabilitar el campo dinámicamente

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
    });
  }

  abrirModalGraficas(contentGraficas: any) {
    this.modalService.open(contentGraficas, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl',
    });

    console.log('datos', this.datosIntersecciones);
  }

  cargaMBE() {
    this.gmbservices.obtenerInfoGMBE(this.id).subscribe(
      (res) => {
        this.idEstatus = res.revisionOne.idEstatus.idCatalogo;
        console.log('estatus', this.idEstatus);
        this.mostrarNombre = res.revisionOne.nombre;
        this.idMBE = res.revisionOne.idMbe;
        this.mostrarObjetivos = res.revisionOne.objetivo;
        this.generales = this.fb.group({
          nombre: [res?.revisionOne.nombre],
          objetivos: [res?.revisionOne.objetivo],
          resumen: [res?.revisionOne.resumen],
        });
        
        console.log('1ra versión',res.revisionOne);
        console.log('2da versión',res.revisionTwo);

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
        console.log(res);
        this.validado = res.data;
      },
      (err) => {
        console.log(err);
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
                        this.router.navigate(['/gmbe']);
                      }
                    });
                  break;
                case this.rechazado:
                  swal
                    .fire('', 'Se ha rechazado el MBE con éxito', 'success')
                    .then((result: { isConfirmed: any }) => {
                      if (result.isConfirmed) {
                        this.router.navigate(['/gmbe']);
                      }
                    });
                  break;
                case this.validado:
                  swal
                    .fire('', 'Se ha aprobado el MBE con éxito', 'success')
                    .then((result: { isConfirmed: any }) => {
                      if (result.isConfirmed) {
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
    this.storage.removeItem('zArrayGuardado2');
    this.storage.removeItem('zArrayGuardado3');
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
      console.log('version maxima', this.versionMaxima);
      console.log('existe otra revision', this.existeOtraRevision);
      console.log(res);
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

  cargarEstructuraMbe() {
    this.storage.removeItem('zArrayGuardado');
    this.gmbservices.obtenerEstructuraGMBE(this.id).subscribe(
      (res) => {
        console.log(res);
        //obtiene categorias filas
        this.estructuraFinalColumnasTitulos = this.filtrarCategoriasUnicas(
          this.obtenerTipo(res, 1)
        );

        this.estructuraFinalColumnasTitulos.forEach((c) => {
          c.hijos = [];
          res.forEach(
            (e: {
              idSubCategoria: { idRelacion: any };
              idTipo: { idCatalogo: number };
            }) => {
              if (
                e?.idSubCategoria?.idRelacion === c.idCatalogo &&
                e?.idTipo?.idCatalogo == 1
              ) {
                c.hijos.push(e);
              }
            }
          );
        });

        //Creación de hijos auxiliares para mantener espacios
        for (let a = 0; a < this.estructuraFinalColumnasTitulos.length; a++) {
          if (this.estructuraFinalColumnasTitulos[a].hijos.length < 1) {
            this.estructuraFinalColumnasTitulos[a].hijos.push({
              auxiliar: true,
            });
          }
        }

        console.log('valores columnas', this.estructuraFinalColumnasTitulos);

        //obtiene categorias de columnas
        this.estructuraFinalFilasTitulos = this.filtrarCategoriasUnicas(
          this.obtenerTipo(res, 2)
        );

        this.estructuraFinalFilasTitulos.forEach((c) => {
          c.hijos = [];
          res.forEach(
            (e: {
              idSubCategoria: { idRelacion: any };
              idTipo: { idCatalogo: number };
            }) => {
              if (
                e?.idSubCategoria?.idRelacion === c.idCatalogo &&
                e?.idTipo?.idCatalogo == 2
              ) {
                c.hijos.push(e);
              }
            }
          );
        });

        console.log(
          'filas Procesadas Titulos',
          this.estructuraFinalFilasTitulos
        );

        //Creación de hijos auxiliares para mantener espacios

        for (let a = 0; a < this.estructuraFinalFilasTitulos.length; a++) {
          if (this.estructuraFinalFilasTitulos[a].hijos.length < 1) {
            this.estructuraFinalFilasTitulos[a].hijos.push({
              auxiliar: true,
              countSubCats: 1,
              idCategoria: {
                idCatalogo: this.estructuraFinalFilasTitulos[a].idCatalogo,
                catalogo: this.estructuraFinalFilasTitulos[a].catalogo,
              },
              idEstructura: this.estructuraFinalFilasTitulos[a].idEstructura,
            });
          }
        }

        for (let a = 0; a < this.estructuraFinalFilasTitulos.length; a++) {
          this.estructuraFinalFilasSubitulos =
            this.estructuraFinalFilasSubitulos.concat(
              this.estructuraFinalFilasTitulos[a].hijos
            );
        }
        //console.log('Columnas',this.estructuraFinalColumnasTitulos)
        //console.log('subtitulos',this.estructuraFinalFilasSubitulos);
        // console.log('hijos filas',this.estructuraFinalFilasTitulos)
      },
      (err) => {}
    );
  }

  cargarDatosMbe() {
    this.gmbservices.obtenerDatosGMBE(this.id, this.versionMaxima).subscribe(
      (res) => {
        this.datosIntersecciones = res;
        console.log('datos', this.datosIntersecciones);
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

    respuesta = respuesta?.arrConteoDisenioEval.length < 1
      ? respuesta?.arrConteoTipoEval
      : respuesta?.arrConteoDisenioEval;
    
     //Al objeto agregale el valor mas alto de z y el valor mas bajo de z
     let thElemento = document.getElementById('thElemento');
     const alto = thElemento?.clientHeight;
     const ancho = thElemento?.clientWidth;
     
     //Agrega dentro del objeto el valor de alto y ancho
      respuesta?.forEach((element: any) => {
        element.valorMaximoZ = this.valorMaximoZ,
        element.valorMinimoZ = this.valorMinimoZ,
        element.alto = alto ? (alto + 10) : 0,
        element.ancho = ancho
      }) 

    return respuesta;
  }

  datosInterseccion2(columna: number, fila: number) {
    let respuesta = this.revisionDos.find(
      (obj: any) => obj.idFila === columna && obj.idColumna === fila
    );

    respuesta = respuesta?.arrConteoDisenioEval.length < 1
      ? respuesta?.arrConteoTipoEval
      : respuesta?.arrConteoDisenioEval;
    
     //Al objeto agregale el valor mas alto de z y el valor mas bajo de z
     let thElemento = document.getElementById('thElemento');
     const alto = thElemento?.clientHeight;
     const ancho = thElemento?.clientWidth;
     
     //Agrega dentro del objeto el valor de alto y ancho
      respuesta?.forEach((element: any) => {
        element.valorMaximoZ = this.valorMaximoZ,
        element.valorMinimoZ = this.valorMinimoZ,
        element.alto = alto ? (alto + 20) : 0,
        element.ancho = ancho
      }) 

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
