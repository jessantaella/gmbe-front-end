import { Component, OnInit, TemplateRef } from "@angular/core";

import {
  faEye,
  faPencil,
  faTrashCan,
  faUserGroup,
  faRotateLeft,
  faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons";
import { TitulosService } from "src/app/services/titulos.services";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { UsuariosService } from "../services/usuarios.service";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
declare var swal: any;
import { debounceTime } from "rxjs/internal/operators/debounceTime";
import { NotificacionesService } from "src/app/services/notificaciones.service";
@Component({
  selector: "app-listar-usuarios",
  templateUrl: "./listar-usuarios.component.html",
  styleUrls: ["./listar-usuarios.component.scss"],
})
export class ListarUsuariosComponent implements OnInit {
  textoBienvenida = "Gestión de usuarios";
  hayuser: any="";
  //Paginación
  currentPage: number = 0;
  page: number = 0;
  pageSize: number = 10;
  items: number = 0;
  totalPage: number = 0;
  seachValue: string = "";
  isModeSearch: boolean = false;
  desde: number = 0;
  palabra: string = "";
  searchValue = new FormControl("", { nonNullable: true });
  existeUser=false;
  //iconos
  faEye = faEye;
  faPencil = faPencil;
  faTrashCan = faTrashCan;
  faUserGroup = faUserGroup;
  faRotate = faRotateLeft;
  faFloppyDisk = faFloppyDisk;

  usuarios!: any[];
  usuariosLdap!: any[];
  filteredUsuarios!: any[];
  roles!: any[];
  listaMBE!: any[];
  selectedUsuario: any;
  usuarioEditar: any;
  seleccionados: number[] = [];

  usuarioForm: FormGroup;
  usuarioEditForm: FormGroup;

  mostrarNotificaciones = false;

  mbeEditables: number[] = [];

  private modalRef: NgbModalRef | undefined;

  constructor(
    private titulos: TitulosService,
    private modalService: NgbModal,
    private usuariosService: UsuariosService,
    private notificacionesService: NotificacionesService,
    private fb: FormBuilder
  ) {
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.titulos.changePestaña("Gestión de usuarios");
    this.usuarioForm = this.fb.group({
      userName: ["", Validators.required],
      correo: ["", Validators.required],
      idRol: ["", Validators.required],
      nombre: ["", Validators.required],
    });

    this.usuarioEditForm = this.fb.group({
      userName: ["", Validators.required],
      correo: ["", Validators.required],
      idRol: ["", Validators.required],
      nombre: ["", Validators.required],
    });
    this.usuarioForm.get("nombre")?.disable();
    this.usuarioForm.get("correo")?.disable();
  }
  ngOnInit(): void {
    this.cambiarPaginaGetAll(0, 10, "", "ACTIVOS");
    //this.obtenerUsuarios();
    this.usuariosLDAP();
    this.obtenerRoles();
    this.obtenerMBEs();
    this.buscar();
    this.notificacionesService.mostrarNotificaciones$.subscribe((mostrar) => {
      console.log('Cambio en mostrarNotificaciones:', mostrar);
      this.mostrarNotificaciones = mostrar;
    });
  }

  obtenerRoles() {
    this.usuariosService.getRoles().subscribe((res) => {
      console.log(res);
      this.roles = res;
    });
  }

  obtenerUsuarios() {
    this.usuariosService.listarUsuarios(0, 10, "", "ACTIVOS").subscribe((res) => {
      console.log(res);
      this.usuarios = res.content;
    });
  }

  usuariosLDAP() {
    this.usuariosService.usuariosLDAP().subscribe(
      (res) => {
        this.usuariosLdap = res;
        console.log(this.usuariosLdap);
      },
      (error) => {}
    );
  }

  obtenerMBEs() {
    this.usuariosService.listarMBE().subscribe((res) => {
      console.log("MBEs");
      console.log(res);
      this.listaMBE = res;
    });
  }

  filterUsuarios(event: any) {
    this.existeUser=false;
    if(event.target.value==""){
    this.filteredUsuarios = this.usuariosLdap.filter((usuario) =>
      usuario.samaccountname.toLowerCase().includes("000")
  );
 this.hayuser=this.filteredUsuarios
    }else{
    const searchTerm = event.target.value.toLowerCase();
    this.filteredUsuarios = this.usuariosLdap.filter((usuario) =>
      usuario.samaccountname.toLowerCase().includes(searchTerm)
    );
    this.hayuser=this.filteredUsuarios

    this.usuarioForm.get("nombre")?.setValue('');
    this.usuarioForm.get("correo")?.setValue('');
  }
  }

  selectUsuario(usuario: any) {
    this.selectedUsuario = usuario;
    this.usuarioForm.get("userName")?.setValue(usuario.samaccountname);
    this.usuarioForm.get("nombre")?.setValue(usuario.commonName);
    this.usuarioForm.get("correo")?.setValue(usuario.userPrincipal);
    this.filteredUsuarios = []; //this.usuarios.slice(); // Restablecer la lista filtrada
  if(this.usuarioForm.get("nombre")?.value.lenght==0 || this.usuarioForm.get("nombre")?.value=="Nombre(s)" ){
   
    console.log("entra selectusuario")
  }else{
    this.existeUser=true
    console.log("entra selectusuario2")
  }

  this.mbeEditables = [];
    
  }

  onCheckboxChange(event: any, idMbe: number) {
    if (event.target.checked) {
      this.seleccionados.push(idMbe);
    } else {
      this.seleccionados = this.seleccionados.filter((id) => id !== idMbe);
    }
  }

  onCheckboxChangeMBE(valor: number) {
    let index = this.mbeEditables?.indexOf(valor);
    if (index === -1) {
      // Element does not exist, add it
      this.mbeEditables.push(valor);
    } else {
      // Element exists, remove it
      this.mbeEditables?.splice(index, 1);
    }
    console.log(this.mbeEditables)
  }

  resumeTablamMbe(mbesAsociados: any) {
    let salida: any[] = [];
    mbesAsociados.forEach(
      (element: { nombreMbe: any; }) => {
        //if (element?.idMbe?.activo) {
          salida.push(element?.nombreMbe);
        //}
      }
    );
    return salida;
  }

  verificaAsociacionMBE(idMbe: number) {
    let salida = this.mbeEditables.find((m: any) => m === idMbe);
    return salida;
  }

  open(content: TemplateRef<any>) {
    this.usuarioForm = this.fb.group({
      userName: ["", Validators.required],
      correo: ["", Validators.required],
      idRol: ["", Validators.required],
      nombre: ["", Validators.required],
    });
    this.usuarioForm.get("nombre")?.disable();
    this.usuarioForm.get("correo")?.disable();
    this.mbeEditables = [];
    this.modalRef = this.modalService.open(content, {
      centered: true,
      size: "lg",
      backdrop: "static",
    });
  }

  openVer(content: TemplateRef<any>, usuario: any) {
    this.open(content);
    this.usuarioEditar = usuario;
    this.mbeEditables = this.usuarioEditar.mbesAsociados.map(
      (item: any) => item.idMbe
    );
    console.log(this.usuarioEditar.mbesAsociados);

    this.usuarioEditForm = this.fb.group({
      userName: [this.usuarioEditar.userName, Validators.required],
      correo: [this.usuarioEditar.correo, Validators.required],
      idRol: [this.usuarioEditar?.rolUsuario?.idRol, Validators.required],
      nombre: [this.usuarioEditar?.nombre, Validators.required],
    });
    this.usuarioEditForm.get("userName")?.disable();
    this.usuarioEditForm.get("correo")?.disable();
    this.usuarioEditForm.get("nombre")?.disable();
    this.usuarioEditForm.get("idRol")?.disable();
  }

  openEditar(content: TemplateRef<any>, usuario: any) {
    this.open(content);
    this.usuarioEditar = usuario;
    this.mbeEditables = this.usuarioEditar.mbesAsociados.map(
      (item: any) => item.idMbe
    );

    this.usuarioEditForm = this.fb.group({
      userName: [this.usuarioEditar.userName, Validators.required],
      correo: [this.usuarioEditar.correo, Validators.required],
      idRol: [this.usuarioEditar?.rolUsuario?.idRol, Validators.required],
      nombre: [this.usuarioEditar?.nombre, Validators.required],
    });
    this.usuarioEditForm.get("userName")?.disable();
    this.usuarioEditForm.get("correo")?.disable();
    this.usuarioEditForm.get("nombre")?.disable();
  }

  crear() {
    console.log(this.usuarioForm.value)
    console.log(this.usuarioForm.valid)
    let usuarioObj = this.usuarioForm.getRawValue();
    usuarioObj.listaMBEs = this.mbeEditables;
    console.log(usuarioObj);
    this.usuariosService.crearUsuario(usuarioObj).subscribe(
      (res) => {
        swal.fire("", "Usuario creado exitosamente", "success");
        if (this.modalRef) {
          this.modalRef.close();
          this.cambiarPaginaGetAll(0,10,'','ACTIVOS');
        }
      },
      (err) => {
        if(this.usuarioForm.get("idRol")?.value==""){
          swal.fire("", "Asigne un rol al usuario", "error");
        }else{
          swal.fire("", "El usuario ya está registrado", "error");
        }
        
      }
    );
  }

  validarExisteUser(){
    const searchTerm = this.usuarioForm.get('userName')?.value.toLowerCase();
    let existe = this.usuariosLdap.filter((usuario) =>
      usuario.samaccountname.toLowerCase().includes(searchTerm)
    );
    return existe;
  }

  validarGmbes(){
    let form = this.usuarioForm.value;
    return form.idRol === "1" ? true : this.mbeEditables.length>0;
  }

  editar() {
    let usuarioObj = this.usuarioEditForm.getRawValue();
    usuarioObj.listaMBEs = this.mbeEditables;
    usuarioObj.idUsuario = this.usuarioEditar.idUsuario;
    this.usuariosService.editarUsuario(usuarioObj).subscribe(
      (res) => {
        swal.fire("", "Usuario actualizado exitosamente", "success");
        if (this.modalRef) {
          this.modalRef.close();
          //this.obtenerUsuarios();
          this.cambiarPaginaGetAll(0,10,'','ACTIVOS');
        }
      },
      (err) => {}
    );
  }

  eliminar(usuario: any) {
    console.log(usuario);

    swal.fire({
      icon: 'warning',
      title: '¿Desea eliminar este usuario?',
      showCancelButton: true,
      confirmButtonColor: '#00a94f',
      cancelButtonColor: '#b3273e',
      confirmButtonText: 'Aceptar',
      cancelButtonText:  'Cancelar',
      reverseButtons: true,
      customClass: {
        title: 'custom-swal-title',
        htmlContainer: 'custom-swal-html',
        confirmButton: 'custom-swal-confirm-button',
        cancelButton: 'custom-swal-cancel-button'
      }
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {
        if (usuario?.mbesAsociados.length > 0) {
          this.usuariosService.desactivarUsuario(usuario?.idUsuario).subscribe(
            (res) => {
              swal.fire("", "Usuario eliminado exitosamente", "success");
              this.cambiarPaginaGetAll(0, 10, "", "ACTIVOS");
            },
            (err) => {}
          );
        } else {
          this.usuariosService.eliminarUsuario(usuario?.idUsuario).subscribe(
            (res) => {
              swal.fire("", "Usuario eliminado exitosamente", "success");
              this.cambiarPaginaGetAll(0, 10, "", "ACTIVOS");
            },
            (err) => {
              this.usuariosService.desactivarUsuario(usuario?.idUsuario).subscribe(
                (res) => {
                  swal.fire("", "Usuario eliminado exitosamente", "success");
                  this.cambiarPaginaGetAll(0, 10, "", "ACTIVOS");
                },
                (err) => {}
              );
            }
          );
        }
      }
    });
  }

  buscar() {
    this.searchValue.valueChanges.pipe(debounceTime(500)).subscribe((e) => {
      if (e === "") {
        this.seachValue = "";
        this.isModeSearch = false;
        this.cambiarPaginaGetAll(0, this.pageSize,this.seachValue,'ACTIVOS');
      } else {
        this.seachValue = e;
        this.isModeSearch = true;
        this.searchCoincidences(0, this.pageSize,'ACTIVOS');
      }
    });
  }

  loadPage(e: number) {
    console.log("seaqrchvalue");
    console.log(this.seachValue);
    console.log("loadPage");
    if (e !== this.currentPage) {
      console.log("currentPage");
      console.log(this.currentPage);
      if (this.isModeSearch) {
        console.log("Busqueda");
        if (this.seachValue === "") {
          this.cambiarPaginaGetAll(e - 1, this.pageSize, "", "ACTIVOS");
        } else {
          this.searchCoincidences(e - 1, this.pageSize, "ACTIVOS");
        }
      } else {
        console.log("Paginacion");
        this.cambiarPaginaGetAll(e - 1, this.pageSize, "", "ACTIVOS");
      }
    }
  }

  cambiarPaginaGetAll(page: number = 0,size: number = 10,busqueda: string,bandUsers: string) {
    this.usuarios = [];
    this.usuariosService
      .listarUsuarios(page, size, busqueda, bandUsers)
      .subscribe((data) => {
        this.usuarios = data?.content!;
        this.items = data?.totalElements;
        this.page = data?.pageable?.pageNumber + 1;
        this.currentPage = data?.pageable?.pageNumber + 1;
        this.totalPage = data.totalPages;
        this.desde = (this.page - 1) * this.pageSize + 1;
      });
  }

  searchCoincidences(
    page: number = 0,
    size: number = 10,
    bandUsers: string = ""
  ) {
    this.palabra = this.seachValue.trim();
    if (this.palabra === "") {
      this.cambiarPaginaGetAll(0, 10, "", "ACTIVOS");
    }
    if (this.palabra.length >= 2) {
      this.usuariosService
        .listarUsuarios(page, size, this.palabra.trim(), bandUsers)
        .subscribe((data) => {
          this.usuarios = data?.content!;
          this.items = data?.totalElements;
          this.page = data?.pageable?.pageNumber + 1;
          this.currentPage = data?.pageable?.pageNumber + 1;
          this.totalPage = data?.totalPages;
          this.desde = (this.page - 1) * this.pageSize + 1;
        });
    }
  }

  validaDisabledGuardar(){
    /*if (this.usuarioForm.get('idRol')!.value === '1'){
      return this.existeUser;
    }else{
      return this.existeUser;
    }*/
   return this.existeUser && this.usuarioForm.get('idRol')!.value !== '';
  }

  validaDisabledGuardarEditar(){
    if (this.usuarioEditForm.get('idRol')!.value === '1' || this.usuarioEditForm.get('idRol')!.value === 1){
      return true;
    }else{
      return true;
    }
  }


  onCancel() {
    this.existeUser = false;
    this.modalService.dismissAll('Cancelar'); // o como sea que cierres el modal
  }
}
