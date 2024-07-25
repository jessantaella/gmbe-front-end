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

  usuario: any;

  cargaDatos: FormGroup;
  imageUrl: string | ArrayBuffer | null | undefined = null;
  archivoCarga: File | null = null;

  constructor(private titulos: TitulosService,
    private modalService: NgbModal,
    private gmbeServices: GmbeServicesService,
    private storage: StorageService,
    private fb: FormBuilder,
    private cifrado: CifradoService) {
    this.titulos.changePestaña(this.textoBienvenida);
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.usuario = JSON.parse(this.cifrado.descifrar(this.storage.getItem('usr')!));
    this.cargaDatos = this.fb.group({
      nombre: [''],
    });
  }


  ngOnInit(): void {
    this.cambiarPaginaGetAll(0, 10);
  }

  validarRol() {
    return this.usuario?.rolUsuario?.idRol === 1;
  }

  cambiarPaginaGetAll(
    page: number = 0,
    size: number = 10,
  ) {
    this.listaMBE = [];
    this.gmbeServices
      .listarGmbes(page, size)
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
      title: '¿Desea ' + mensaje + ' este MBE?',
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
            let mensaje = !estatusActual ? 'bloqueado' : 'desbloqueado';
            swal.fire("", 'Se ha '+mensaje+'el MBE', "success");
            this.cambiarPaginaGetAll(this.page - 1, 10);
          }, err => {

          });
      }
    });
  }

  openCarga(content: TemplateRef<any>,idmbe:number) {
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
      title: 'Cargando...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        swal.showLoading();
      }
    });

    this.gmbeServices.cargarInformación(this.archivoCarga, this.idMbe).subscribe(
      res => {
        console.log(res);
        // Cerrar la animación de carga
        swal.close();
        // Mostrar mensaje de éxito
        swal.fire("", "Base de datos cargada con éxito", "success");
        this.modalRef?.close();
      },
      err => {
        console.log(err);
        // Cerrar la animación de carga
        swal.close();
        // Mostrar mensaje de error
        swal.fire("", "Error en la carga, revisar el archivo", "error");
      }
    );
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
      title: '¿Está seguro de que quiere eliminar este MBE?',
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
        this.gmbeServices.eliminarGmbe(idMbe).subscribe(
          res => {
            swal.fire("", "Registro eliminado exitosamente", "success");
            this.cambiarPaginaGetAll(this.page - 1, 10);
          }, err => {

          });
      }
    });
  }


}
