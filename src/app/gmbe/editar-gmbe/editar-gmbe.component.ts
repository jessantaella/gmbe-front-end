import { AfterViewChecked, AfterViewInit, Component,TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GmbeServicesService } from '../services/gmbe-services.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TitulosService } from 'src/app/services/titulos.services';

import {
  faPlus,
  faTrash,
  faPencil,
  faRotateLeft,
  faFloppyDisk,
  faX
} from '@fortawesome/free-solid-svg-icons';
import { StorageService } from 'src/app/services/storage-service.service';
import { CifradoService } from 'src/app/services/cifrado.service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
declare var swal: any;

@Component({
  selector: 'app-editar-gmbe',
  templateUrl: './editar-gmbe.component.html',
  styleUrls: ['./editar-gmbe.component.scss']
})
export class EditarGmbeComponent{
  SelectCatelogirasForm!: FormGroup;
  categoriaForm: FormGroup;
  subcategoriaForm: FormGroup;
  editarCategoriaForm: FormGroup;
  editarSubcategoriaForm: FormGroup;
  eliminarCategoriaForm: FormGroup;
  eliminarSubcategoriaForm: FormGroup;
  opcionesTipoEstructura!: any[];

  tipo = 1;
  categoria: any;
  subcategoriasAgregadas: any[] = [];
  estructuraFinalFilasTitulos: any = [];
  estructuraFinalFilasSubitulos: any = [];
  estructuraFinalColumnasTitulos: any = [];
  estructuraFinalColumnasSubitulos: any = [];
  padreAnterior = 0;
  ver = false;

  tipoSeleccionado: boolean = false;
  subCategorias!: any[];
  arregloCategorias!: any[];
  volverCargarBandera: boolean = false;
  activarAgregar: boolean = false;
  padreActual: number = 0;
  mostrarErrorurl: boolean = false;
  existeCategoria: boolean = false;
  subCategoriasEditado: any;
  editarNombreSubcategoria: any;
  habilitarSub: boolean = false;
  puedeEditarSubCategoria: boolean = false;

  private urlPattern = new RegExp('^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]{1,5})?(\/\S*)?$');
  editarNombre: any;

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;
  arregloCategoriasEditado: any;
  esEditado: boolean = false;

  private modalRef: NgbModalRef | undefined;
  faFloppyDisk = faFloppyDisk;
  faRotateLeft = faRotateLeft;
  faX = faX;

  id: number = 0;
  generales: FormGroup;
  imageUrl: string | SafeUrl | null | undefined = null;
  imageFile: File | null = null;
  subiImagen: boolean = false;
  nombreImagen: string = '';
  usuario: any;
  puedeEditarCategoria = false;
  textoBienvenida = 'Editar MBE';
  mostrarNombre:string = '';
  mostrarObjetivos:string = '';

  constructor(private titulos: TitulosService, 
    private route: ActivatedRoute, 
    private gmbservices: GmbeServicesService, 
    private fb: FormBuilder, 
    private router:Router,
    private sanitizer: DomSanitizer,
    private storage: StorageService,
    private modalService: NgbModal,
    private cifrado: CifradoService) {
      
    this.titulos.changePestaña(this.textoBienvenida);
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.usuario = JSON.parse(this.cifrado.descifrar(this.storage.getItem('usr')!));

    this.id = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.cargaMBE();
    this.obtenerCategorias();
    this.tipoEstructura();
    this.generales = this.fb.group({
      nombre: ['',Validators.required],
      objetivo: ['',Validators.required],
      resumen: ['',Validators.required],
    });

    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      url: ['']
    })
    this.subcategoriaForm = this.fb.group({
      categoria: [0, Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      url: ['']
    })

    this.editarCategoriaForm = this.fb.group({
      categoria: ['', Validators.required],
      descripcion: [''],
      url: ['']
    })
    this.editarSubcategoriaForm = this.fb.group({
      categoria: ['', Validators.required],
      subCategoria: [''],
      descripcion: [''],
      url: ['']
    })

    this.SelectCatelogirasForm = this.fb.group({
      selectTipo: [''],
      selectCategoria: ['0'],
    })

    this.eliminarCategoriaForm = this.fb.group({
      categoria: ['', Validators.required],
      descripcion: [''],
      url: ['']
    })

    this.eliminarSubcategoriaForm = this.fb.group({
      categoria: ['', Validators.required],
      subCategoria: ['', Validators.required],
      descripcion: [''],
      url: ['']
    });
  }
  ngOnInit(): void {
    this.SelectTipoCat1();
    this.reiniciarSelect();
    this.detectarSelect();
    this.bloquearInputEliminado();
  }
  
  bloquearInputEliminado() {
    this.eliminarCategoriaForm.get('descripcion')?.disable();
    this.eliminarCategoriaForm.get('url')?.disable();
    this.eliminarSubcategoriaForm.get('descripcion')?.disable();
    this.eliminarSubcategoriaForm.get('url')?.disable();
  }


  detectarSelect() {
    this.SelectCatelogirasForm.get('selectCategoria')?.valueChanges.subscribe(
      (valor) => {

        if (valor !== '') {
          this.puedeEditarCategoria = true;
        } else {
          this.puedeEditarCategoria = false;
        }
      }
    );
  }
  SelectTipoCat1() {
    this.SelectCatelogirasForm.get('selectTipo')?.setValue(1);
  }

  reiniciarSelect() {
    //si se cambia valor de selectTipo se reinicia el valor de selectCategoria
    this.SelectCatelogirasForm.get('selectTipo')?.valueChanges.subscribe(
      (valor) => {
        this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
      }
    );
  }
  cargaMBE() {
    this.gmbservices.obtenerInfoGMBE(this.id).subscribe(
      res => {
        this.mostrarNombre = res.revisionOne.nombre;
        this.mostrarObjetivos = res.revisionOne.objetivo;
        this.generales = this.fb.group({
          nombre: [res?.revisionOne.nombre,Validators.required],
          objetivo: [res?.revisionOne.objetivo,Validators.required],
          resumen: [res?.revisionOne.resumen,Validators.required],
        });
        this.nombreImagen = res.revisionOne.ruta;
        this.obtenerImagen(res.revisionOne.ruta);
        this.escucharCambiosNombre();
        this.escucharCambiosObjetivos();
      },
      err => { }
    )
  }

  escucharCambiosNombre() {
    this.generales.get('nombre')?.valueChanges.subscribe(
      res => {
        this.mostrarNombre = res;
      }
    )
  }

  escucharCambiosObjetivos() {
    this.generales.get('objetivo')?.valueChanges.subscribe(
      res => {
        this.mostrarObjetivos = res;
      }
    )
  }

  obtenerImagen(ruta: string) {
    this.gmbservices.getImageIndividual(ruta).subscribe(
      res => {
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(res);
      },
      err => {
        console.log('Error al traer la imagen', err)
      }
    );
  }

  borrarImagen() {
    this.imageUrl = null;
  }

  validarGuardar() {
    return this.generales.valid && this.estructuraFinalFilasSubitulos.length > 0 && this.estructuraFinalColumnasSubitulos.length > 0 && this.imageFile;
  }

  
  onFileChange(event: any): void {
    const file = event.target.files[0];
    console.log('file',file)
    if (file) {
      const validTypes = ['image/png', 'image/jpeg'];
      if (!validTypes.includes(file.type)) {
        swal.fire('', 'Por favor, sube un archivo de imagen válido (PNG o JPEG)', 'error');
        event.target.value = ''; // Limpia el input de archivo
        return;
      }
  
      if (file.size > 5242880) { // 5MB en bytes
        swal.fire('', 'La imagen excede el tamaño permitido', 'error');
        return;
      }
  
      this.imageFile = file;
  
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result;
      };
      reader.readAsDataURL(file);
  
      event.target.value = ''; // Limpia el input de archivo después de leerlo
    }
  }

  guardar() {
 
    if (this.imageFile !== null) {
      console.log('Con edicion de imagen ',this.imageFile)
      //let nombre = this.nombreImagen;
      let nombre = this.imageFile?.name ? this.imageFile.name.split(".")[0].replaceAll('.','')+Math.random()+'.png' : 'gmbeImage'+Math.random()+'.png';
      let enviar = this.generales.value;
      enviar.idUsuario = this.usuario?.idUsuario;
      enviar.idMbe = this.id;
        this.gmbservices.crearImagen(this.imageFile, nombre).subscribe(
          res => {
            enviar.ruta = res.remotePath;
            this.gmbservices.actualizarGmbe(enviar).subscribe(res=>{
              swal.fire({
                icon: 'success',
                text: 'MBE actualizado con éxito',
                confirmButtonText: 'OK',
                customClass: {
                  htmlContainer: 'titulo-swal',
                  confirmButton: 'ok-swal',
                }
              })
              this.router.navigate(['/gmbe'])
            })
          },
          err => { 
            swal.fire('', 'Error al actualizar la imagen', 'error');
          }
        )

    }else{
      console.log('sin edicion de imagen ')
      let enviar = this.generales.value;
      enviar.ruta = this.nombreImagen;
      enviar.idUsuario = this.usuario?.idUsuario;
      enviar.idMbe = this.id;
          this.gmbservices.actualizarGmbe(enviar).subscribe(res=>{
            swal.fire({
              icon: 'success',
              text: 'MBE actualizado con éxito',
              confirmButtonText: 'OK',
              customClass: {
                htmlContainer: 'titulo-swal',
                confirmButton: 'ok-swal',
              }
            })
            this.router.navigate(['/gmbe'])
          })
    }
  }

  changeTipo(valor: any) {
    this.tipo = parseInt(valor.target.value);

    if (this.tipo === 2) {
      this.tipoSeleccionado = true;
    } else {
      this.tipoSeleccionado = true;
    }
    this.subCategorias = [];
    this.obtenerCategorias();
    this.SelectCatelogirasForm = this.fb.group({
      selectCategoria: ['0'],
    });

  }
  obtenerCategorias() {
    this.gmbservices.listarCatalogo2(2,this.id).subscribe(
      (res) => {
        this.arregloCategorias = res;

        if (!this.volverCargarBandera) {
          this.activarAgregar = false;
        }
      },
      (err) => { }
    );
  }
  obtenerSubCategorias(idPadre: any) {
    //limpia el arreglo de subcategorias agregadas y los checkboxes y el arreglo de subcategorias de la categoria seleccionada
    this.subcategoriasAgregadas = [];
    this.ver = true;
    this.subCategorias = [];
    this.activarAgregar = true;
    let selectElement = idPadre.target as HTMLSelectElement;
    let selectedValue = Number(selectElement.value);
    this.padreActual = selectedValue;
    this.categoria = this.arregloCategorias.find(
      (c) => c.idCatalogo === selectedValue
    );
    this.gmbservices
      .listarSubcategorias2(this.categoria.idCatalogo, this.id)
      .subscribe((res) => {
        this.subCategorias = res;
      });
    this.subcategoriasAgregadas = [];
    this.ver = false;
  }

  obtenerSubCategoriasEditado(idPadre: any) {

    this.habilitarSub = false;
    this.mostrarErrorurl =false;
    this.eliminarSubcategoriaForm.get('subCategoria')?.setValue('');
    this.eliminarSubcategoriaForm.get('descripcion')?.setValue('');
    this.eliminarSubcategoriaForm.get('url')?.setValue('');

    this.editarSubcategoriaForm.get('subCategoria')?.setValue('');
    this.editarSubcategoriaForm.get('descripcion')?.setValue('');
    this.editarSubcategoriaForm.get('url')?.setValue('');

    let selectElement = idPadre.target as HTMLSelectElement;
    let selectedValue = Number(selectElement.value);
    this.padreActual = selectedValue;
    this.categoria = this.arregloCategorias.find(
      (c) => c.idCatalogo === selectedValue
    );
    this.gmbservices
      .listarSubcategorias2(this.categoria.idCatalogo,this.id)
      .subscribe((res) => {
        console.log(res)

        this.subCategoriasEditado = res;
      });
   
  }

  changeSubcategoria(idCatalogo: any) {
    this.mostrarErrorurl =false;
    let selectElement = idCatalogo.target as HTMLSelectElement;
    let selectedValue = Number(selectElement.value);
    let sub = this.subCategoriasEditado.find((e: any) => e.idCatalogo === selectedValue)
    this.editarSubcategoriaForm.get('descripcion')?.setValue(sub.descripcion);
    this.editarSubcategoriaForm.get('url')?.setValue(sub.complemento);

    this.eliminarSubcategoriaForm.get('descripcion')?.setValue(sub.descripcion);
    this.eliminarSubcategoriaForm.get('url')?.setValue(sub.complemento);

    console.log(idCatalogo.target.value)
    if (idCatalogo.target.value !== '0' || idCatalogo.target.value !== '') {
      this.habilitarSub = true;
    } else {
      this.habilitarSub = false;
    }
  }

  obtenerSubCategoriasConid(idPadre: number) {
    let selectedValue = this.padreActual;
    this.categoria = this.arregloCategorias.find(
      (c) => c.idCatalogo === selectedValue
    );
    this.gmbservices
      .listarSubcategorias2(this.categoria.idCatalogo,this.id)
      .subscribe((res) => {
        this.subCategorias = res;
      });
    this.subcategoriasAgregadas = [];
    this.ver = false;
  }

  open(content: TemplateRef<any>, tipo: string) {
    this.categoriaForm.reset();
    this.subcategoriaForm.reset();
    this.eliminarCategoriaForm.reset();
    this.eliminarSubcategoriaForm.reset();

    this.mostrarErrorurl = false;
    this.volverCargarBandera = true;
    this.obtenerCategoriasEditado();

    if (tipo === 'categoria') {
      this.esEditado = false;
      this.categoriaForm = this.fb.group({
        nombre: ['', Validators.required],
        descripcion: [''],
        url: ['']
      });
    }

    if (tipo === 'subcategoria') {
      this.esEditado = false;
      this.subcategoriaForm = this.fb.group({
        categoria: [0, Validators.required],
        nombre: ['', Validators.required],
        descripcion: [''],
        url: ['']
      });
    }

    if (tipo === 'categoriaEliminar') {
      this.eliminarCategoriaForm = this.fb.group({
        categoria: [0, Validators.required],
        descripcion: [''],
        url: ['']
      })
      this.eliminarCategoriaForm.get('descripcion')?.disable();
      this.eliminarCategoriaForm.get('url')?.disable();
    }
    if (tipo === 'subcategoriaEliminar') {
      this.eliminarSubcategoriaForm = this.fb.group({
        categoria: [0, Validators.required],
        subCategoria: ['', Validators.required],
        descripcion: [''],
        url: ['']
      })
      this.eliminarSubcategoriaForm.get('descripcion')?.disable();
      this.eliminarSubcategoriaForm.get('url')?.disable();
    }

    this.modalRef = this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

  obtenerCategoriasEditado() {
    this.gmbservices.listarCatalogo2(2,this.id).subscribe(
      (res) => {
        this.arregloCategoriasEditado = res;

      },
      (err) => { }
    );
  }
  existeObjeto(subcategoria: any) {
    if (this.tipo === 2) {
      let salida = this.estructuraFinalFilasSubitulos.some(
        (obj: { idRelacion: any; idCatalogo: any }) =>
          obj.idRelacion === subcategoria.idRelacion &&
          obj.idCatalogo === subcategoria.idCatalogo
      );
      return salida;
    } else {
      let salida = this.estructuraFinalColumnasSubitulos.some(
        (obj: { idRelacion: any; idCatalogo: any }) =>
          obj.idRelacion === subcategoria.idRelacion &&
          obj.idCatalogo === subcategoria.idCatalogo
      );
      return salida;
    }
  }
  subcategoriaSeleccionada(sub: any) {
    if (!this.subcategoriasAgregadas) {
      this.subcategoriasAgregadas = [];
    }
    let pos = this.subcategoriasAgregadas.findIndex(
      (e) => e.idCatalogo === sub.idCatalogo
    );

    if (pos === -1) {
      this.subcategoriasAgregadas.push(sub);
    } else {
      let nuevoArreglo = this.subcategoriasAgregadas?.filter(
        (elemento) => elemento.idCatalogo !== sub.idCatalogo
      );
      this.subcategoriasAgregadas = nuevoArreglo;
    }

    //Si el arreglo de subcategorias agregadas tiene un elemento con seleccionado puede editar subcategoria, si tiene mas de uno no puede editar

    if (this.subcategoriasAgregadas.length === 1) {
      this.puedeEditarSubCategoria = true;
    } else {
      this.puedeEditarSubCategoria = false;
    }
  }
  mergeAndRemoveDuplicates(arreglo1: any, arreglo2: any) {
    // Crear un conjunto de idCatalogo presentes en ambos arreglos




    const idsArreglo1 = new Set(
      arreglo1.map((item: { idCatalogo: any }) => item.idCatalogo)
    );
    const idsArreglo2 = new Set(
      arreglo2.map((item: { idCatalogo: any }) => item.idCatalogo)
    );

    const commonIds = new Set(
      [...idsArreglo1].filter((id) => idsArreglo2.has(id))
    );

    // Filtrar ambos arreglos para eliminar elementos con idCatalogo en commonIds

    const filteredArreglo1 = arreglo1.filter(
      (item: { idCatalogo: any }) => this.tipo === 2 ? item.idCatalogo !== null && !commonIds.has(item.idCatalogo) : !commonIds.has(item.idCatalogo)
    );
    const filteredArreglo2 = arreglo2.filter(
      (item: { idCatalogo: any }) => !commonIds.has(item.idCatalogo)
    );

    // Combinar los elementos restantes de ambos arreglos
    const mergedArray = [...filteredArreglo1, ...filteredArreglo2];

    return mergedArray;
  }
  agregar() {
    //Filas
    console.log("TIPO")
    console.log(this.tipo)
    //Reinicia el select de subcategorias
    this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
    if (this.tipo === 2) {

      let existe = this.estructuraFinalFilasTitulos.some(
        (obj: any) => obj.categoria.idCatalogo === this.categoria.idCatalogo
      );
      if (existe) {


        let arregloOriginal = this.estructuraFinalFilasTitulos.find(
          (e: any) => {
            return e.categoria.idCatalogo == this.categoria.idCatalogo;
          }
        );

        let nuevasSubcategorias = this.mergeAndRemoveDuplicates(
          arregloOriginal.subcategorias,
          this.subcategoriasAgregadas
        );

        this.estructuraFinalFilasTitulos =
          this.estructuraFinalFilasTitulos.filter(
            (item: { categoria: { idCatalogo: any } }) =>
              item.categoria.idCatalogo !== this.categoria.idCatalogo
          );



        if (nuevasSubcategorias.length < 1) {

          nuevasSubcategorias.push({
            activo: true,
            catalogo: '',
            complemento: null,
            created: null,
            idCatalogo: null,
            idRelacion: this.categoria?.idCatalogo,
            idTipoCatalogo: null,
            esAuxiliar: true
          })
        }

        this.estructuraFinalFilasTitulos.push({
          categoria: this.categoria,
          subcategorias: nuevasSubcategorias.length > 1 ? nuevasSubcategorias.filter((subcategoria: any) => subcategoria.idCatalogo !== null) : nuevasSubcategorias,
        });


      } else {

        this.estructuraFinalFilasTitulos.push({
          categoria: this.categoria,
          subcategorias: this.subcategoriasAgregadas.length >= 1 ? this.subcategoriasAgregadas.filter((subcategoria: any) => subcategoria.idCatalogo !== null) : this.subcategoriasAgregadas,
        });
      }

      if (this.subcategoriasAgregadas.length < 1 || this.estructuraFinalFilasTitulos.length === 1) {

        this.subcategoriasAgregadas.push({
          activo: true,
          catalogo: '',
          complemento: null,
          created: null,
          idCatalogo: null,
          idRelacion: this.categoria?.idCatalogo,
          idTipoCatalogo: null,
          esAuxiliar: true
        })
      }


      this.estructuraFinalFilasSubitulos = [];
      this.estructuraFinalFilasSubitulos =
        this.estructuraFinalFilasTitulos.reduce(
          (acc: string | any[], item: { subcategorias: any }) =>
            acc.concat(item.subcategorias),
          []
        );

      this.subcategoriasAgregadas = [];

      this.activarAgregar = false;
    } else {


      let existe = this.estructuraFinalColumnasTitulos.some(
        (obj: any) => obj.categoria.idCatalogo === this.categoria.idCatalogo
      );

      if (existe) {


        let arregloOriginal = this.estructuraFinalColumnasTitulos.find(
          (e: any) => {
            return e.categoria.idCatalogo == this.categoria.idCatalogo;
          }
        );

        let nuevasSubcategorias = this.mergeAndRemoveDuplicates(
          arregloOriginal.subcategorias,
          this.subcategoriasAgregadas
        );


        this.estructuraFinalColumnasTitulos =
          this.estructuraFinalColumnasTitulos.filter(
            (item: { categoria: { idCatalogo: any } }) =>
              item.categoria.idCatalogo !== this.categoria.idCatalogo
          );

        if (nuevasSubcategorias.length < 1) {

          nuevasSubcategorias.push({
            activo: true,
            catalogo: '',
            complemento: null,
            created: null,
            idCatalogo: null,
            idRelacion: this.categoria?.idCatalogo,
            idTipoCatalogo: null,
            esAuxiliar: true
          })
        }

        this.estructuraFinalColumnasTitulos.push({
          categoria: this.categoria,
          subcategorias: nuevasSubcategorias.length > 1 ? nuevasSubcategorias.filter((subcategoria: any) => subcategoria.idCatalogo !== null) : nuevasSubcategorias,
        });


        console.log(nuevasSubcategorias)
      } else {



        this.estructuraFinalColumnasTitulos.push({
          categoria: this.categoria,
          subcategorias: this.subcategoriasAgregadas.length >= 1 ? this.subcategoriasAgregadas.filter((subcategoria: any) => subcategoria.idCatalogo !== null) : this.subcategoriasAgregadas,
        });
      }
      // agrega auxiliar para espacios en blanco no subcategorias
      console.log('subcategorias agregadas', this.subcategoriasAgregadas)
      console.log('subcategorias agregadas', this.subcategoriasAgregadas.length)
      console.log('estructuraFinalColumnasTitulos', this.estructuraFinalColumnasTitulos.length)
      if (this.subcategoriasAgregadas.length < 1 || this.estructuraFinalColumnasTitulos.length > 0) {

        this.subcategoriasAgregadas.push({
          activo: true,
          catalogo: '',
          complemento: null,
          created: null,
          idCatalogo: null,
          idRelacion: this.categoria?.idCatalogo,
          idTipoCatalogo: null,
          esAuxiliar: true
        })
      }






      // else{
      //   
      //   

      //   this.estructuraFinalColumnasTitulos.forEach((element: any) => {
      //     element.subcategorias = element.subcategorias.filter((e: any) => e.idCatalogo !== null);
      //   });
      // }


      this.estructuraFinalColumnasSubitulos = [];
      this.estructuraFinalColumnasSubitulos =
        this.estructuraFinalColumnasTitulos.reduce(
          (acc: string | any[], item: { subcategorias: any }) =>
            acc.concat(item.subcategorias),
          []
        );

      //limpiar el arreglo de subcategorias agregadas
      this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
      this.subCategorias = [];
      this.subcategoriasAgregadas = [];
      this.activarAgregar = false;

    }

    //limpiar el arreglo de subcategorias agregadas
    this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
    this.subCategorias = [];
    this.subcategoriasAgregadas = [];
    this.activarAgregar = false;
    this.ver = true;
  }
  
  validaSubtitulosColumna() {
    return this.estructuraFinalColumnasSubitulos.some((obj: { esAuxiliar: boolean | undefined; }) => obj.esAuxiliar === false || obj.esAuxiliar === undefined);
  }

  validaSubtitulosFilas() {
    return this.estructuraFinalFilasSubitulos.some((obj: { esAuxiliar: boolean | undefined; }) => obj.esAuxiliar === false || obj.esAuxiliar === undefined);
  }
  
  eliminarSubcategoria(tipo: number, elemento: any){
    console.log(this.estructuraFinalColumnasTitulos);
    if (tipo === 1) {
      this.estructuraFinalColumnasSubitulos =
        this.estructuraFinalColumnasSubitulos.filter(
          (e: { idCatalogo: any; }) => e.idCatalogo !== elemento.idCatalogo
        );
        this.estructuraFinalColumnasTitulos.forEach((item: { subcategorias: any[]; }) => {
          item.subcategorias = item.subcategorias.filter(subcategoria => {
            return subcategoria.idCatalogo !== elemento.idCatalogo;
          });
        });
        this.estructuraFinalColumnasTitulos = this.estructuraFinalColumnasTitulos.filter((item: { subcategorias: string | any[]; }) => item.subcategorias.length > 0);
    }else{
      this.estructuraFinalFilasSubitulos =
      this.estructuraFinalFilasSubitulos.filter(
        (e: { idCatalogo: any; }) => e.idCatalogo !== elemento.idCatalogo
      );
      this.estructuraFinalFilasTitulos.forEach((item: { subcategorias: any[]; }) => {
        item.subcategorias = item.subcategorias.filter(subcategoria => {
          return subcategoria.idCatalogo !== elemento.idCatalogo;
        });
      });
      this.estructuraFinalFilasTitulos = this.estructuraFinalFilasTitulos.filter((item: { subcategorias: string | any[]; }) => item.subcategorias.length > 0);
    }
  }
  eliminarCategoria(tipo: number, elemento: any) {
    if (tipo === 1) {
      this.estructuraFinalColumnasTitulos =
        this.estructuraFinalColumnasTitulos.filter(
          (e: { categoria: { idCatalogo: any } }) =>
            e.categoria.idCatalogo !== elemento.idCatalogo
        );
      this.estructuraFinalColumnasSubitulos =
        this.estructuraFinalColumnasSubitulos.filter(
          (e: { idRelacion: any }) => e.idRelacion !== elemento.idCatalogo
        );
    } else {
      this.estructuraFinalFilasTitulos =
        this.estructuraFinalFilasTitulos.filter(
          (e: { categoria: { idCatalogo: any } }) =>
            e.categoria.idCatalogo !== elemento.idCatalogo
        );
      this.estructuraFinalFilasSubitulos =
        this.estructuraFinalFilasSubitulos.filter(
          (e: { idRelacion: any }) => e.idRelacion !== elemento.idCatalogo
        );
    }
  }
  regresaPapa(idPadre: number) {
    this.padreAnterior = idPadre;
    return this.estructuraFinalFilasTitulos.find(
      (e: any) => e.categoria.idCatalogo === idPadre
    );
  }
  cerrarModal() {
    this.volverCargarBandera = false;
    this.modalService.dismissAll();
  }
  crearCategoria() {
    //Si el nombre esta vacio no se puede crear la categoria o comienza con espacio

    let nombre = this.categoriaForm.get('nombre')?.value;
    let descripcion = this.categoriaForm.get('descripcion')?.value;
    let url = this.categoriaForm.get('url')?.value;
    nombre = nombre.trim();
    descripcion = descripcion?.trim();
    url = url?.trim();

    console.log(url)
    console.log(nombre)
    console.log(descripcion)

    this.gmbservices.crearCategoria(nombre).subscribe(
      res => {
        swal.fire({
          title: '',
          text: 'Registro creado exitosamente',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm-button'
          }
        });
        if (this.modalRef) {
          //limpia el select de categorias
          this.activarAgregar = false;
          this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
          this.obtenerCategorias();
          this.subCategorias = [];
          this.modalRef.close();
        }
      },
      err => { // Cerrar la animación de carga
        swal.close();
        // Verifica si el código de estado es 409
        if (err.status === 409) {
          let data = err.error.data;
          swal.fire({
            icon: 'warning',
            text: '¿Desea reactivar esta categoría?',
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
                let envio = { descripcion: descripcion, complemento: url, activo: true, idCatalogo: data?.idCatalogo };
                this.gmbservices.actualizarActivarCategoriaSubcategoria(envio).subscribe(
                  res => {
                    swal.fire({
                      title: '',
                      text: 'Registro creado exitosamente',
                      icon: 'success',
                      confirmButtonText: 'OK',
                      customClass: {
                        popup: 'custom-swal-popup',
                        confirmButton: 'custom-swal-confirm-button'
                      }
                    });
                    if (this.modalRef) {
                      //limpia el select de categorias
                      this.activarAgregar = false;
                      this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
                      this.obtenerCategorias();
                      this.subCategorias = [];
                      this.modalRef.close();
                    }
                  });
              }
            });
        } else {
          // Manejo de otros errores
          swal.fire({
            icon: 'error',
            text: 'La categoría ya está registrada',
            confirmButtonText: 'OK',
            customClass: {
              htmlContainer: 'titulo-swal',
              confirmButton: 'ok-swal',
            }
          });
        }
      }
    );
  }
  
  //1:CREAR 2:EDITAR 3:CREAR CAT 4:EDITAR CAT
  validaUrl(form: number) {
    let url;

    switch (form) {
      case 1:
        url = this.categoriaForm.get('url')?.value;
        break;
      case 2:
        url = this.editarCategoriaForm.get('url')?.value;
        break;
      case 3:
        url = this.subcategoriaForm.get('url')?.value;
        break;
      case 4:
        url = this.editarSubcategoriaForm.get('url')?.value;
        break;
    }

    if (url.length > 0) {
      if (!this.urlPattern.test(url)) {
        console.log('entro')
        console.log(url)
        this.mostrarErrorurl = true;
      } else {
        this.mostrarErrorurl = false;
      }
    } else {
      this.mostrarErrorurl = false;
    }

  }
  crearSubcategoria() {

    let nombre = this.subcategoriaForm.get('nombre')?.value;
    let descripcion = this.subcategoriaForm.get('descripcion')?.value;
    let url = this.subcategoriaForm.get('url')?.value;
    nombre = nombre.trim();
    descripcion = descripcion?.trim();
    url = url?.trim();

    if (this.tipoSeleccionado && url.length > 0) {
      if (!this.urlPattern.test(url)) {
        swal.fire({
          title: '',
          text: 'Ingresa una URL',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm-button'
          }
        });
        return;
      }
    }
    this.gmbservices.crearSubcategoria(nombre, this.subcategoriaForm.get('categoria')?.value, descripcion, url).subscribe(
      res => {
        swal.fire({
          title: '',
          text: 'Registro creado exitosamente',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        if (this.modalRef) {
          this.subCategorias = [];
          this.activarAgregar = false;
          this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
          this.modalRef.close();
        }
      },
      err => {
        swal.close();

        if (err.status === 409) {
          let data = err.error.data;
          swal.fire({
            icon: 'warning',
            text: '¿Desea reactivar esta subcategoría?',
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
                let envio = { descripcion: descripcion, complemento: url, activo: true, idCatalogo: data?.idCatalogo };
                this.gmbservices.actualizarActivarCategoriaSubcategoria(envio).subscribe(
                  res => {
                    swal.fire({
                      title: '',
                      text: 'Registro creado exitosamente',
                      icon: 'success',
                      confirmButtonText: 'OK',
                      customClass: {
                        popup: 'custom-swal-popup',
                        confirmButton: 'custom-swal-confirm-button'
                      }
                    });
                    if (this.modalRef) {
                      //limpia el select de categorias
                      this.activarAgregar = false;
                      this.subcategoriaForm.reset();
                      this.obtenerCategorias();
                      this.subCategorias = [];
                      this.modalRef.close();
                    }
                  });
              }
            });
        }else{
          // Manejo de otros errores
          swal.fire({
            icon: 'error',
            text: 'La subcategoría ya está registrada',
            confirmButtonText: 'OK',
            customClass: {
              htmlContainer: 'titulo-swal',
              confirmButton: 'ok-swal',
            }
          });
        }

      }
    )
  }
  cerrarModalCatalgo() {
    this.volverCargarBandera = false;
    this.editarCategoriaForm.get('categoria')?.setValue('');
    this.editarCategoriaForm.get('descripcion')?.setValue('');
    this.editarCategoriaForm.get('url')?.setValue('');
  }

  cerrarModalSubCatalgo() {
    //limpia el arreglo de subcategorias agregadas y los checkboxes
    this.volverCargarBandera = false;
    this.subCategoriasEditado = [];
    this.editarSubcategoriaForm.get('categoria')?.setValue('');
    this.editarSubcategoriaForm.get('subCategoria')?.setValue('');
    this.editarSubcategoriaForm.get('descripcion')?.setValue('');
    this.editarSubcategoriaForm.get('url')?.setValue('');
  }
  editarSubcategoria() {
    let id = Number(this.editarSubcategoriaForm.get('categoria')?.value);
    let idSub = Number(this.editarSubcategoriaForm.get('subCategoria')?.value);
    let validarIdSub = idSub === 0 ? id : idSub;
    let nombre = this.editarNombreSubcategoria;
    let descripcion = this.editarSubcategoriaForm.get('descripcion')?.value;
    let url = this.editarSubcategoriaForm.get('url')?.value;



    console.log(descripcion)
    url = url !== null ? url?.trim() : '';
    descripcion = descripcion !== null ? descripcion?.trim() : '';

          if (this.tipoSeleccionado && url.length > 0) {
            if (!this.urlPattern.test(url)) {
              swal.fire({
                title: '',
                text: 'Ingresa una URL',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'custom-swal-popup',
                  confirmButton: 'custom-swal-confirm-button'
                }
              });
              return;
            }
          }

          this.gmbservices.editarSubcategoria2(id, nombre, validarIdSub, descripcion, url, this.id).subscribe(
            res => {
              swal.fire({
                title: '',
                text: 'Registro editado exitosamente',
                icon: 'success',
                confirmButtonText: 'OK'
              });
              this.subCategoriasEditado = [];
              //Se limpia los arrays de subcategorias agregadas y los checkboxes
              this.subcategoriasAgregadas = [];
              this.subCategorias = [];
              //La bandera de guardado se pone en false
              this.activarAgregar = false;
              this.SelectCatelogirasForm.get('selectCategoria')?.setValue('');
              this.editarSubcategoriaForm.get('categoria')?.setValue('');
              this.editarSubcategoriaForm.get('subCategoria')?.setValue('');
              this.editarSubcategoriaForm.get('descripcion')?.setValue('');
              this.editarSubcategoriaForm.get('url')?.setValue('');
              //Vuelve a cargar las subcategorias
              this.obtenerCategorias();
              this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
              this.subCategorias = [];

              this.modalService.dismissAll();
              this.storage.sesionRemoveItem('EstructuraTabla');

            },
            err => {

              // Cerrar la animación de carga
              swal.close();
              // Mostrar mensaje de error
              swal.fire({
                icon: 'error',
                text: err.error.messaje,
                confirmButtonText: 'OK',
                customClass: {
                  htmlContainer: 'titulo-swal',
                  confirmButton: 'ok-swal',
                }
              })

            }
          );
    console.log(idSub)
  }

  eliminarCategoriaFinal() {
    let id = this.eliminarCategoriaForm.get('categoria')?.value;
    this.gmbservices.eliminarCategoriaSubcategoria(id).subscribe(
      res => {
        console.log('respuesta eliminación', res);
        if (res?.code === 1) {
          swal.fire({
            title: '',
            text: res?.message,
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'custom-swal-popup',
              confirmButton: 'custom-swal-confirm-button'
            }
          });
          this.eliminarCategoriaTabla(1, parseInt(id));
          this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
          this.obtenerCategorias();
          this.subCategorias = [];
          this.editarCategoriaForm.get('descripcion')?.setValue('');
          this.editarCategoriaForm.get('url')?.setValue('');
          this.eliminarCategoriaForm.get('descripcion')?.setValue('');
          this.eliminarCategoriaForm.get('url')?.setValue('');
          this.activarAgregar = false;
        } else {
          swal.fire({
            title: '',
            text: 'Registro eliminado exitosamente',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.modalService.dismissAll();
          this.eliminarCategoriaTabla(1, parseInt(id));
          this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
          this.obtenerCategorias();
          this.subCategorias = [];
          this.editarCategoriaForm.get('descripcion')?.setValue('');
          
          this.editarCategoriaForm.get('url')?.setValue('');
          this.eliminarCategoriaForm.get('descripcion')?.setValue('');
          this.eliminarCategoriaForm.get('url')?.setValue('');
          this.activarAgregar = false;
        }
      },
    )
  }

  eliminarCategoriaTabla(tipo: number, id: number) {
    console.info(id)

    let aux: { categoria: { idCatalogo: number; subcategorias: any[]; } | { idCatalogo: number; subcategorias: any[]; }; subcategorias: any[]; }[] = [];
    this.estructuraFinalColumnasTitulos.forEach((e: {
      categoria: { idCatalogo: number; subcategorias: any[]; } | { idCatalogo: number; subcategorias: any[]; }; idCatalogo: number; subcategorias: any[];
    }) => {
      let sub: any[] = [];
      e.subcategorias.forEach((i: any) => {
        if (i.idCatalogo !== id) {
          sub.push(i);
        }
      })
      if (sub.length > 0) {
        aux.push({ categoria: e.categoria, subcategorias: sub })
      }

    })
    this.estructuraFinalColumnasTitulos = aux;

    aux = [];

    this.estructuraFinalFilasTitulos.forEach((e: {
      categoria: { idCatalogo: number; subcategorias: any[]; } | { idCatalogo: number; subcategorias: any[]; }; idCatalogo: number; subcategorias: any[];
    }) => {
      let sub: any[] = [];
      e.subcategorias.forEach((i: any) => {
        if (i.idCatalogo !== id) {
          sub.push(i);
        }
      })
      if (sub.length > 0) {
        aux.push({ categoria: e.categoria, subcategorias: sub })
      }
    })
    this.estructuraFinalFilasTitulos = aux;

    let auxSub: { idCatalogo: number; idRelacion: number; }[] = [];
    this.estructuraFinalColumnasSubitulos.forEach((a: { idCatalogo: number; idRelacion: number; }) => {
      if (a.idCatalogo !== id && a.idRelacion !== id) {
        auxSub.push(a);
      }
    })
    this.estructuraFinalColumnasSubitulos = auxSub;

    auxSub = [];
    this.estructuraFinalFilasSubitulos.forEach((a: { idCatalogo: number; idRelacion: number; }) => {
      if (a.idCatalogo !== id && a.idRelacion !== id) {
        auxSub.push(a);
      }
    })
    this.estructuraFinalFilasSubitulos = auxSub;

    this.estructuraFinalColumnasTitulos = this.estructuraFinalColumnasTitulos.filter((item: { categoria: { idCatalogo: number; }; }) => item.categoria.idCatalogo !== id);
    this.estructuraFinalFilasTitulos = this.estructuraFinalFilasTitulos.filter((item: { categoria: { idCatalogo: number; }; }) => item.categoria.idCatalogo !== id);


    console.error(this.estructuraFinalColumnasTitulos)
    console.error(this.estructuraFinalColumnasSubitulos)
    console.error(this.estructuraFinalFilasTitulos)
    console.error(this.estructuraFinalFilasSubitulos)

  }

  eliminarSubcategoriaFinal() {
    let id = this.eliminarSubcategoriaForm.get('subCategoria')?.value;
    this.gmbservices.eliminarCategoriaSubcategoria(id).subscribe(
      res => {
        console.log('respuesta eliminación', res);
        if (res?.code === 1) {
          swal.fire({
            title: '',
            text: res?.message,
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'custom-swal-popup',
              confirmButton: 'custom-swal-confirm-button'
            }
          });

          this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
          this.eliminarSubcategoriaForm.get('categoria')?.setValue('0');
          this.eliminarSubcategoriaForm.get('subCategoria')?.setValue('');
          this.eliminarSubcategoriaForm.get('descripcion')?.setValue('');
          this.eliminarSubcategoriaForm.get('url')?.setValue('');
          this.activarAgregar = false;
          this.obtenerCategorias();
          this.subCategoriasEditado = [];
          this.subCategorias = [];
        } else {
          swal.fire({
            title: '',
            text: 'Registro eliminado exitosamente',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.modalService.dismissAll();
          this.eliminarCategoriaTabla(1, parseInt(id));
          this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
          this.eliminarSubcategoriaForm.get('categoria')?.setValue('0');
          this.eliminarSubcategoriaForm.get('subCategoria')?.setValue('');
          this.eliminarSubcategoriaForm.get('descripcion')?.setValue('');
          this.editarSubcategoriaForm.get('descripcion')?.setValue('');
          this.editarSubcategoriaForm.get('url')?.setValue('');
          this.eliminarSubcategoriaForm.get('url')?.setValue('');
          this.activarAgregar = false;
          this.obtenerCategorias();
          this.subCategoriasEditado = [];
          this.subCategorias = [];
        }
      },
    )
  }
  escucharSelectEditado(event: any) {
    this.esEditado = true;
    this.mostrarErrorurl = false;

    let idCategoria = Number(event.target.value);
    //buscar la categoria en el arreglo de categorias
    let categoria = this.arregloCategorias.find((e) => e.idCatalogo === idCategoria);

    console.warn(categoria)

    this.editarNombre = categoria.catalogo;

    this.editarCategoriaForm.get('descripcion')?.setValue(categoria.descripcion);
    this.editarCategoriaForm.get('url')?.setValue(categoria.complemento);


    this.eliminarCategoriaForm.get('descripcion')?.setValue(categoria.descripcion);
    this.eliminarCategoriaForm.get('url')?.setValue(categoria.complemento);
  }
  editarCategoria() {
    let id = Number(this.editarCategoriaForm.get('categoria')?.value);
    let nombre = this.editarNombre;

    let descripcion = this.editarCategoriaForm.get('descripcion')?.value;
    let url = this.editarCategoriaForm.get('url')?.value;

    descripcion = descripcion?.trim();
    url = url !== null ? url?.trim() : '';
          if (this.tipoSeleccionado && url.length > 0) {
            if (!this.urlPattern.test(url)) {
              swal.fire({
                title: '',
                text: 'Ingresa una URL',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'custom-swal-popup',
                  confirmButton: 'custom-swal-confirm-button'
                }
              });
              return;
            }
          }
          this.gmbservices.editarCategoria2(id, nombre, descripcion, url, this.id).subscribe(
            res => {
              swal.fire({
                title: '',
                text: 'Registro editado exitosamente',
                icon: 'success',
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'custom-swal-popup',
                  confirmButton: 'custom-swal-confirm-button'
                }
              });
              if (this.modalRef) {
                this.editarCategoriaForm.get('categoria')?.setValue('');
                this.editarCategoriaForm.get('descripcion')?.setValue('');
                this.editarCategoriaForm.get('url')?.setValue('');
                this.obtenerCategorias();
                this.subCategorias = [];
                this.activarAgregar = false;
                this.SelectCatelogirasForm.get('selectCategoria')?.setValue('0');
                this.modalRef.close();
                this.storage.sesionRemoveItem('EstructuraTabla');
              }
            },
            err => {
              // Manejo de errores

              // Cerrar la animación de carga
              swal.close();
              // Mostrar mensaje de error
              swal.fire({
                icon: 'error',
                text: err.error.messaje,
                confirmButtonText: 'OK',
                customClass: {
                  htmlContainer: 'titulo-swal',
                  confirmButton: 'ok-swal',
                }
              })
            }
          );
  }
  tipoEstructura() {
    this.gmbservices.listarCatalogo(1).subscribe(
      (res) => {
        this.opcionesTipoEstructura = res;

      },
      (err) => { }
    );
  }
  
}
