import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TitulosService } from 'src/app/services/titulos.services';
import {
  faEllipsisVertical, faEye, faTrashCan, faUserGroup,
  faUpload, faPencil, faCircleCheck, faXmarkCircle, faRotateLeft,
  faFloppyDisk, faX
} from '@fortawesome/free-solid-svg-icons';
import { GmbeServicesService } from '../services/gmbe-services.service';
import { StorageService } from 'src/app/services/storage-service.service';
import { CifradoService } from 'src/app/services/cifrado.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { icon } from '@fortawesome/fontawesome-svg-core';
import { NotificacionesService } from 'src/app/services/notificaciones.service';
declare var swal: any;

@Component({
  selector: 'app-listar-gmbe',
  templateUrl: './listar-gmbe.component.html',
  styleUrls: ['./listar-gmbe.component.scss']
})
export class ListarGmbeComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef | undefined;


  //Paginación
  currentPage: number = 0;
  page: number = 0;
  pageSize: number = 10;
  items: number = 0;
  totalPage: number = 0;
  isModeSearch: boolean = false;
  desde: number = 0;

  listaMBE: any[] = [];

  private modalRef: NgbModalRef | undefined;
  idMbe:number = 0;

  textoBienvenida =
    "MBE";

  //iconos
  faEye = faEye;
  faEllipsisVertical = faEllipsisVertical;
  faTrashCan = faTrashCan;
  faUserGroup = faUserGroup;
  faUpload = faUpload;
  faPencil = faPencil;
  faCircleCheck = faCircleCheck;
  faXmarkCircle = faXmarkCircle;
  faRotate = faRotateLeft;
  faFloppyDisk = faFloppyDisk;
  faX = faX;
  ObjetoUser: any;
  idUsuario:number = 0;

  usuario: any;
  puedeCrearMBE: boolean = false;

  cargaDatos: FormGroup;
  imageUrl: string | ArrayBuffer | null | undefined = null;
  archivoCarga: File | null = null;
  mostrarMensajeRevisiones: any;
  mostrarNotificaciones = false;

  creado: number = 173;
  publicado: number = 174;
  pendiente: number = 175;
  rechazado: number = 176;
  validado: number = 0;
  mostrarMensajeRevisionesAcciones: boolean = false;
i: any;

  constructor(private titulos: TitulosService,
    private modalService: NgbModal,
    private gmbeServices: GmbeServicesService,
    private storage: StorageService,
    private fb: FormBuilder,
    private notificacionesService: NotificacionesService,
    private cifrado: CifradoService) {
    this.titulos.changePestaña(this.textoBienvenida);
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.usuario = JSON.parse(this.cifrado.descifrar(this.storage.getItem('usr')!));
    this.cargaDatos = this.fb.group({
      nombre: [''],
    });
  }


  ngOnInit(): void {
    this.estatusVdalidado();
    this.ObjetoUser = JSON.parse(this.cifrado.descifrar(this.storage.getItem('usr')!));
    console.log(this.ObjetoUser);
    this.idUsuario = this.ObjetoUser.idUsuario;

    this.cambiarPaginaGetAll(0, 10);
    this.validarAccesos(this.idUsuario);

    this.notificacionesService.mostrarNotificaciones$.subscribe((mostrar) => {
      console.log('Cambio en mostrarNotificaciones:', mostrar);
      this.mostrarNotificaciones = mostrar;
    });
  }

  estatusVdalidado() {
    this.gmbeServices.estatusValidacion().subscribe(
      res => {
        console.log(res);
        this.validado = res.data;
      },
      err => {
        console.log(err);
      }
    );
  }

  validarAcciones(idCatalogo:number, accion:string):boolean {
    //Roles
    //1.- ADMIN
    //2.- OPERADOR
    //3.- VALIDADOR
    //4.- PUBLICADOR
    switch (accion) {
      case "aprobar":
        if (idCatalogo === this.pendiente && (this.idRol() === 4 || this.idRol() === 3 || this.idRol() === 1  ) ) {
          return true;
        } else {
          return false;
        }
        break;
      case "enviar":
        if (((idCatalogo === this.creado) || (idCatalogo === this.rechazado)) && (this.idRol() === 2 || this.idRol() === 4 || this.idRol() === 1   )) {
          return true;
        } else {
          return false;
        }
        break;
      case "rechazar":
        if (((idCatalogo === this.pendiente && (this.idRol() === 4 || this.idRol() === 3 || this.idRol() === 1 ) )
        || (idCatalogo === this.validado && (this.idRol() === 4 || this.idRol() === 1 ) ))) {
          return true;
        } else {
          return false;
        }
        break;
      case "publicar":
        if ((idCatalogo === this.validado) && (this.idRol() === 4 || this.idRol() === 1)  ) {
          return true;
        } else {
          return false;
        }
      default:
        return false;
        break
    }
  }

  validarBotones(idCatalogo:number, revisiones: number):boolean {
    if (revisiones > 0 && revisiones !== null ) {
      console.log("Es mayor a 0");
      this.mostrarMensajeRevisionesAcciones = true;
    } else {
      console.log("Es menor a 0");
      this.mostrarMensajeRevisionesAcciones = false; 
    }
    //Roles
    //1.- ADMIN
    //2.- OPERADOR
    //3.- VALIDADOR
    //4.- PUBLICADOR
    switch (idCatalogo) {
      case this.creado:
        console.log(this.mostrarMensajeRevisionesAcciones);
        if ((this.idRol() === 2 || this.idRol() === 4 || this.idRol() === 1) && this.mostrarMensajeRevisionesAcciones) {
          return true;
        } else {
          return false;
        }
        break;
      case this.pendiente:
        if (this.idRol() === 3 || this.idRol() === 4 || this.idRol() === 1 ) {
          return true;
        } else {
          return false;
        }
        break;
      case this.rechazado:
        console.log(this.mostrarMensajeRevisionesAcciones);
        if ((this.idRol() === 2 || this.idRol() === 4 || this.idRol() === 1)  && this.mostrarMensajeRevisionesAcciones) {
          return true;
        } else {
          return false;
        }
        break;
      case this.validado:
        if (this.idRol() === 4 || this.idRol() === 1) {
          return true;
        } else {
          return false;
        }
        break;
      case this.publicado:
        return false;
        break;
      default:
        return false;
        break;
    }
  }

  validarAccesos(idUsuario: number) {
    this.gmbeServices.consultarAccesos(idUsuario).subscribe(
      res => {
        console.log(res);
        //Actualizar el localStorage de los accesos del usuario
        this.storage.setItem("autorizadas", this.cifrado.cifrar(JSON.stringify(res)));
      },
      err => {
        console.log(err);
      }
    );
  }


  validarRol() {
    return this.usuario?.rolUsuario?.idRol === 1;
  }

  idRol() {
    return this.usuario?.rolUsuario?.idRol;
  }

  cambiarPaginaGetAll(
    page: number = 0,
    size: number = 10,
  ) {
    this.listaMBE = [];
    this.gmbeServices
      .listarGmbes(page, size,this.idUsuario)
      .subscribe((data) => {
        console.log(data)
        this.listaMBE = data?.content!;
        this.items = data?.totalElements;
        this.page = data?.pageable?.pageNumber + 1;
        this.currentPage = data?.pageable?.pageNumber + 1;
        this.totalPage = data.totalPages;
        this.desde = (this.page - 1) * this.pageSize + 1;
      });
  }

  masRevisones(mbe: any = '') {
    if (mbe?.maxRevision > 0 && mbe?.maxRevisiones !== null ) {
      console.log("Es mayor a 0");
      this.mostrarMensajeRevisiones = true;
    } else {
      console.log("Es menor a 0");
      this.mostrarMensajeRevisiones = false; 
    }
  }

  /* Opciones
  1 Carga
  2 Editar
  3 Bloquear
  4 Eliminar
  */

  acciones(idMbe: any,opcion:number): boolean {
    switch (this.idRol()) {
      //ADMIN
      case 1:
        this.puedeCrearMBE = true;
        return true;
        break
      //OPERADOR
      case 2:
      this.puedeCrearMBE = true;
        if (idMbe.idEstatus?.idCatalogo === 173 || idMbe.idEstatus?.idCatalogo === 176) {
          if(opcion < 3)
            return true;
        } else {
          return false;
        }
        break;
      //VALIDADOR
      case 3:
        this.puedeCrearMBE = false;
        if ( idMbe.idEstatus?.idCatalogo === 175 || idMbe.idEstatus?.idCatalogo === 176) {
          return true;
        } else {
          return false;
        }
        break;
      //PUBLICADOR
      case 4:
        this.puedeCrearMBE = false;
        if (idMbe.idEstatus?.idCatalogo === 173 || idMbe.idEstatus?.idCatalogo === 176) {
          return true; 
        } else {
          return false;
        }
        break;
    }
    return false;
  }

  cambiarEstatusMBE(idMbe: number, estatusActual: number) {
    let idRol = this.usuario.rolUsuario.idRol;
    let estatus;
    switch (estatusActual) {
      case this.publicado:
        estatus = 'publicar'
        break;
      case this.pendiente:
        estatus = 'enviar a validar'
        break;
      case this.rechazado:
        estatus = 'rechazar'
        break;
      case this.validado:
        estatus = 'aprobar'
        break;
    }

    //Mandar una alerta para cambiar el estatus
    swal.fire({
      icon: 'warning',
      text: '¿Está seguro de que quiere '+estatus+' este MBE? ',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        htmlContainer: 'titulo-swal',
        confirmButton: 'guardar-swal',
        cancelButton: 'cancelar-swal'
      }
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.gmbeServices.estatusGmbe(idMbe, estatusActual,idRol).subscribe(
          res => {
            switch (estatusActual) {
              case this.publicado:
                swal.fire("", "Se ha publicado el MBE con éxito", "success");
                break;
              case this.pendiente:
                swal.fire("", "Se ha enviado a validar el MBE con éxito", "success");
                break;
              case this.rechazado:
                swal.fire("", "Se ha rechazado el MBE con éxito", "success");
                break;
              case this.validado:
                swal.fire("", "Se ha aprobado el MBE con éxito", "success");
                break;
            }
            this.validarAccesos(this.idUsuario);
            this.cambiarPaginaGetAll(0, 10);
          }, err => {

          });
      }
    });
  }

  loadPage(e: number) {
    if (e !== this.currentPage) {
      console.log('currentPage');
      console.log(this.currentPage);
      this.cambiarPaginaGetAll(e - 1, this.pageSize);
    }
  }

  cambiarEstatus(idMbe: number, estatusActual: boolean) {
    let mensaje = estatusActual ? 'desactivar' : 'activar';
    swal.fire({
      title: '¿Está seguro de ' + mensaje + ' el MBE?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        title: 'custom-swal-title',
        htmlContainer: 'custom-swal-html',
        confirmButton: 'custom-swal-confirm-button',
        cancelButton: 'custom-swal-cancel-button'
      }
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.gmbeServices.cambiarEstatus(idMbe, !estatusActual).subscribe(
          res => {
            swal.fire("", "MBE actualizado exitosamente", "success");
            this.cambiarPaginaGetAll(this.page - 1, 10);
          }, err => {

          });
      }
    });
  }

  bloquearMbe(idMbe: number, estatusActual: boolean) {
    let mensaje = !estatusActual ? 'bloquear' : 'desbloquear';
    swal.fire({
      icon: 'warning',
      text: '¿Desea ' + mensaje + ' este MBE?',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        htmlContainer: 'titulo-swal',
        confirmButton: 'guardar-swal',
        cancelButton: 'cancelar-swal'
      }
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.gmbeServices.cambiarEstatus(idMbe, !estatusActual).subscribe(
          res => {
            let mensaje = !estatusActual ? 'bloqueado' : 'desbloqueado';
            swal.fire({
              icon: 'success',
              text: 'Se ha '+mensaje+' el MBE con éxito',
              confirmButtonText: 'OK',
              customClass: {
                htmlContainer: 'titulo-swal',
                confirmButton: 'ok-swal',
              }
            })
            this.validarAccesos(this.idUsuario);
            this.cambiarPaginaGetAll(this.page - 1, 10);
          }, err => {

          });
      }
    });
  }

  openCarga(content: TemplateRef<any>,idmbe:number,mbe:any) {
    console.log(mbe?.maxRevisiones)
    this.masRevisones(mbe);
    this.clearImage(this.fileInput?.nativeElement);
    this.modalRef = this.modalService.open(content, {
      size: 'lg',
      centered: true,
      backdrop: "static",
    });
    this.idMbe = idmbe;
  }

  cargardatos() {
    // Mostrar animación de carga
    const loading = swal.fire({
      text: 'Cargando...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      customClass: {
        htmlContainer: 'titulo-swal',
      },
      willOpen: () => {
        swal.showLoading();
      }
    });
    setTimeout(() => {
      this.gmbeServices.cargarInformación(this.archivoCarga, this.idMbe).subscribe(
        res => {
          console.log(res);
          // Cerrar la animación de carga
          //swal.close();
          // Mostrar mensaje de éxito
          swal.fire({
            icon: 'success',
            text: 'Base de datos cargada con éxito',
            confirmButtonText: 'OK',
            customClass: {
              htmlContainer: 'titulo-swal',
              confirmButton: 'ok-swal',
            }
          })
          this.cambiarPaginaGetAll(0, 10);
          this.modalRef?.close();
        },
        err => {
          console.log(err.error);
          // Cerrar la animación de carga
          swal.close();
          // Mostrar mensaje de error
          swal.fire({
            icon: 'error',
            html: err.error.message.replace(/\n/g, '<br>'),
            confirmButtonText: 'OK',
            customClass: {
              htmlContainer: 'titulo-swal',
              confirmButton: 'ok-swal',
            }
          })
        }
      );
    }, 1000);
}


  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoCarga = file;
      this.cargaDatos = this.fb.group({
        nombre: [this.archivoCarga?.name],
      });

      this.cargaDatos.get("nombre")?.disable();

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(fileInput: HTMLInputElement | undefined): void {
    this.imageUrl = null;
    this.archivoCarga = null;
    this.cargaDatos = this.fb.group({
      nombre: [''],
    });

    this.cargaDatos.get("nombre")?.enable();

    // Restablece el valor del input file
    if (fileInput) {
      fileInput.value = '';
    }
  }

  eliminarGmbe(idMbe: number) {
    swal.fire({
      icon: 'warning',
      text: '¿Está seguro de que quiere eliminar este MBE?',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        htmlContainer: 'titulo-swal',
        confirmButton: 'guardar-swal',
        cancelButton: 'cancelar-swal'
      }
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        this.gmbeServices.eliminarGmbe(idMbe).subscribe(
          res => {
            swal.fire("", "Registro eliminado exitosamente", "success");
            this.validarAccesos(this.idUsuario);
            this.cambiarPaginaGetAll(this.page - 1, 10);
          }, err => {

          });
      }
    });
  }


}
