import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TitulosService } from 'src/app/services/titulos.services';
import {
  faX,
  faRotateLeft,
  faFloppyDisk,
  faPlus,
  faTrash,
  faPencil,
} from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GmbeServicesService } from '../services/gmbe-services.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage-service.service';
import { CifradoService } from 'src/app/services/cifrado.service';
import { Subscription } from 'rxjs';

declare var swal: any;

@Component({
  selector: 'app-crear-gmbe',
  templateUrl: './crear-gmbe.component.html',
  styleUrls: ['./crear-gmbe.component.scss'],
})
export class CrearGmbeComponent implements OnInit {

  private urlPattern = new RegExp('^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]{1,5})?(\/\S*)?$');



  textoBienvenida = 'Crear MBE';
  faX = faX;
  faRotateLeft = faRotateLeft;
  faFloppyDisk = faFloppyDisk;
  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;
  bloquearBotonGuardar = false;
  SelectCatelogirasForm!: FormGroup;

  private modalRef: NgbModalRef | undefined;

  usuario : any ;

  generales: FormGroup;
  categoriaForm: FormGroup;
  subcategoriaForm: FormGroup;
  editarCategoriaForm: FormGroup;
  editarSubcategoriaForm: FormGroup;

  opcionesTipoEstructura!: any[];

  activarAgregar : boolean = false;

  /** Arreglos de pruebas */

  arregloCategorias!: any[];

  mostrarSubcategoria:
    | { id: number; id_padre: number; nombre: string }[]
    | undefined;

  subCategorias!: any[];

  padreActual : number = 0;

  suscriocionCatalogoEditar: Subscription | undefined;
  suscripcionSubCatalogoEditar: Subscription | undefined;

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

  puedeEditarCategoria = false;

  imageUrl: string | ArrayBuffer | null | undefined = null;
  imageFile: File | null = null;
  esEditado: boolean = false;
  puedeEditarSubCategoria: boolean = false;
  editarNombre: any;
  subCategoriasEditado: any;
  editarNombreSubcategoria: any;
  mostrarErrorurl : boolean = false;
  existeCategoria: boolean = false;

  volverCargarBandera: boolean = false;
  arregloCategoriasEditado: any;


  constructor(
    private titulos: TitulosService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private gmbeservice: GmbeServicesService,
    private router:Router,
    private storage:StorageService, private cifrado:CifradoService
  ) {
    this.usuario = JSON.parse(this.cifrado.descifrar(this.storage.getItem('usr')!));
    this.titulos.changePestaña('Crear  MBE');
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.tipoEstructura();
    this.obtenerCategorias();
    this.generales = this.fb.group({
      nombre: ['', Validators.required],
      objetivo: ['', Validators.required],
      resumen: ['', Validators.required],
    });

    this.categoriaForm = this.fb.group({
      nombre:['',Validators.required],
      descripcion:[''],
      url: ['']
    })
    this.subcategoriaForm = this.fb.group({
      categoria:[0,Validators.required],
      nombre:['', Validators.required],
      descripcion:[''],
      url: ['']
    })

    this.editarCategoriaForm = this.fb.group({
      categoria:['',Validators.required],
      descripcion:[''],
      url: ['']
    })
    this.editarSubcategoriaForm = this.fb.group({
      categoria:['',Validators.required],
      subCategoria:['',Validators.required],
      descripcion:[''],
      url: ['']
    })

    this.SelectCatelogirasForm = this.fb.group({
      selectTipo: [''],
      selectCategoria: ['0'],
    });
  }
  ngOnInit(): void {
    this.SelectTipoCat1();
    this.reiniciarSelect();
    this.detectarSelect();
    this.detectarTipo();
  }

  detectarTipo(){
    this.SelectCatelogirasForm.get('selectTipo')?.valueChanges.subscribe(
      (valor) => {
        console.log(valor);
        if (Number(valor) === 2) {
          this.tipoSeleccionado = true;
        } else {
          this.tipoSeleccionado = false;
        }
      }
    );
  }

  detectarSelect(){
    this.SelectCatelogirasForm.get('selectCategoria')?.valueChanges.subscribe(
      (valor) => {
        console.log(valor);
        if (valor !== '') {
          this.puedeEditarCategoria = true;
        } else {
          this.puedeEditarCategoria = false;
        }
      }
    );
  }

  escucharSelectEditado(event:any){
    this.esEditado = true;
    console.log(event.target.value);
    let idCategoria = Number(event.target.value);
    //buscar la categoria en el arreglo de categorias
    let categoria = this.arregloCategorias.find((e) => e.idCatalogo === idCategoria);
    console.log(categoria);
    this.editarNombre = categoria.catalogo;
    this.editarCategoriaForm.get('descripcion')?.setValue(categoria.descripcion);
    this.editarCategoriaForm.get('url')?.setValue(categoria.complemento);
  }
  
  SelectTipoCat1(){
    this.SelectCatelogirasForm.get('selectTipo')?.setValue(1);
  }

  reiniciarSelect(){
    //si se cambia valor de selectTipo se reinicia el valor de selectCategoria
    this.SelectCatelogirasForm.get('selectTipo')?.valueChanges.subscribe(
      (valor) => {
        this.SelectCatelogirasForm.get('selectCategoria')?.setValue('');
      }
    );
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
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

clearImage(): void {
    this.imageUrl = null;
    this.imageFile = null;
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
    console.log(this.subcategoriasAgregadas);
    if (this.subcategoriasAgregadas.length === 1) {
      this.puedeEditarSubCategoria = true;
    } else {
      this.puedeEditarSubCategoria = false;
    }
  }

  mergeAndRemoveDuplicates(arreglo1: any, arreglo2: any) {
    // Crear un conjunto de idCatalogo presentes en ambos arreglos
    console.log('Arreglo 1');
    console.log(arreglo1);
    console.log('Arreglo 2');
    console.log(arreglo2);
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
    console.log(this.tipo);
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
    this.SelectCatelogirasForm.get('selectCategoria')?.setValue('');
    if (this.tipo === 2) {
      console.log('Filas');
      let existe = this.estructuraFinalFilasTitulos.some(
        (obj: any) => obj.categoria.idCatalogo === this.categoria.idCatalogo
      );
      if (existe) {
        console.log(this.estructuraFinalFilasTitulos);
        console.log(this.categoria);
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

        console.log(this.estructuraFinalFilasTitulos);

        if(nuevasSubcategorias.length<1){
          console.log('Agregando auxiliar');
          nuevasSubcategorias.push({
            activo:true,
            catalogo:'',
            complemento:null,
            created:null,
            idCatalogo:null,
            idRelacion:this.categoria?.idCatalogo,
            idTipoCatalogo:null,
            esAuxiliar:true
          })
        }

        this.estructuraFinalFilasTitulos.push({
          categoria: this.categoria,
          subcategorias: nuevasSubcategorias.length > 1 ? nuevasSubcategorias.filter((subcategoria: any) => subcategoria.idCatalogo !== null) : nuevasSubcategorias,
        });

        console.log(this.estructuraFinalFilasTitulos);
      } else {
        console.log(this.estructuraFinalFilasTitulos);
        this.estructuraFinalFilasTitulos.push({
          categoria: this.categoria,
          subcategorias: this.subcategoriasAgregadas.length >= 1 ? this.subcategoriasAgregadas.filter((subcategoria: any) => subcategoria.idCatalogo !== null) : this.subcategoriasAgregadas,
        });
      }

      if(this.subcategoriasAgregadas.length<1 || this.estructuraFinalFilasTitulos.length === 1){
        console.log('Agregando auxiliar');
        this.subcategoriasAgregadas.push({
          activo:true,
          catalogo:'',
          complemento:null,
          created:null,
          idCatalogo:null,
          idRelacion:this.categoria?.idCatalogo,
          idTipoCatalogo:null,
          esAuxiliar:true
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
      console.log('Columnas');

      let existe = this.estructuraFinalColumnasTitulos.some(
        (obj: any) => obj.categoria.idCatalogo === this.categoria.idCatalogo
      );

      if (existe) {
        console.log("Existe");
        console.log(this.estructuraFinalColumnasTitulos);
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

        if(nuevasSubcategorias.length<1){
          console.log('Agregando auxiliar');
          nuevasSubcategorias.push({
            activo:true,
            catalogo:'',
            complemento:null,
            created:null,
            idCatalogo:null,
            idRelacion:this.categoria?.idCatalogo,
            idTipoCatalogo:null,
            esAuxiliar:true
          })
        }

        this.estructuraFinalColumnasTitulos.push({
          categoria: this.categoria,
          subcategorias: nuevasSubcategorias.length > 1 ? nuevasSubcategorias.filter((subcategoria: any) => subcategoria.idCatalogo !== null) : nuevasSubcategorias,
        });

        console.log(this.estructuraFinalColumnasTitulos);
        console.log(nuevasSubcategorias)
      }else{
        console.log("No existe");
        console.log(this.subCategorias);
        console.log(this.subcategoriasAgregadas);
        this.estructuraFinalColumnasTitulos.push({
          categoria: this.categoria,
          subcategorias: this.subcategoriasAgregadas.length >= 1 ? this.subcategoriasAgregadas.filter((subcategoria: any) => subcategoria.idCatalogo !== null) : this.subcategoriasAgregadas,
        });
      }
      // agrega auxiliar para espacios en blanco no subcategorias
      console.log('subcategorias agregadas',this.subcategoriasAgregadas)
      console.log('subcategorias agregadas',this.subcategoriasAgregadas.length)
      console.log('estructuraFinalColumnasTitulos',this.estructuraFinalColumnasTitulos.length)
      if(this.subcategoriasAgregadas.length<1 || this.estructuraFinalColumnasTitulos.length > 0){
        console.log('Agregando auxiliar');
        this.subcategoriasAgregadas.push({
          activo:true,
          catalogo:'',
          complemento:null,
          created:null,
          idCatalogo:null,
          idRelacion:this.categoria?.idCatalogo,
          idTipoCatalogo:null,
          esAuxiliar:true
        })
      }

      console.log(this.subcategoriasAgregadas);
      console.log(this.estructuraFinalColumnasTitulos);



      // else{
      //   console.log(this.subcategoriasAgregadas);
      //   console.log(this.estructuraFinalColumnasTitulos);

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

  regresaPapa(idPadre: number) {
    this.padreAnterior = idPadre;
    return this.estructuraFinalFilasTitulos.find(
      (e: any) => e.categoria.idCatalogo === idPadre
    );
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

  // uno para obtener fila o columna
  tipoEstructura() {
    this.gmbeservice.listarCatalogo(1).subscribe(
      (res) => {
        this.opcionesTipoEstructura = res;
        console.log(res);
      },
      (err) => {}
    );
  }

  changeTipo(valor: any) {
    this.tipo = parseInt(valor.target.value);
    this.subCategorias = [];
    this.obtenerCategorias();
    this.SelectCatelogirasForm = this.fb.group({
      selectCategoria: ['0'],
    });
    
  }

  obtenerCategorias() {
    this.gmbeservice.listarCatalogo(2).subscribe(
      (res) => {
        this.arregloCategorias = res;
        console.log(res);
        if (!this.volverCargarBandera) {
          this.activarAgregar = false; 
        }
      },
      (err) => {}
    );
  }

  obtenerCategoriasEditado() {
    this.gmbeservice.listarCatalogo(2).subscribe(
      (res) => {
        this.arregloCategoriasEditado = res;
        console.log(res);
      },
      (err) => {}
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
    this.gmbeservice
      .listarSubcategorias(this.categoria.idCatalogo)
      .subscribe((res) => {
        this.subCategorias = res;
      });
    this.subcategoriasAgregadas = [];
    this.ver = false;
  }

  obtenerSubCategoriasEditado(idPadre: any) {

    this.editarSubcategoriaForm.get('subCategoria')?.setValue('');
    this.editarSubcategoriaForm.get('descripcion')?.setValue('');
    this.editarSubcategoriaForm.get('url')?.setValue('');

    let selectElement = idPadre.target as HTMLSelectElement;
    let selectedValue = Number(selectElement.value);
    this.padreActual = selectedValue;
    this.categoria = this.arregloCategorias.find(
      (c) => c.idCatalogo === selectedValue
    );
    console.log(this.categoria);
    this.gmbeservice
      .listarSubcategorias(this.categoria.idCatalogo)
      .subscribe((res) => {
        console.log(res);
        this.subCategoriasEditado = res;
      });
    this.editarNombreSubcategoria = this.categoria.catalogo;
    //this.editarSubcategoriaForm.get('descripcion')?.setValue(this.categoria.descripcion);
    //this.editarSubcategoriaForm.get('url')?.setValue(this.categoria.complemento);
  }

  changeSubcategoria(idCatalogo:any){
    let selectElement = idCatalogo.target as HTMLSelectElement;
    let selectedValue = Number(selectElement.value);
    let sub = this.subCategoriasEditado.find((e: any)=>e.idCatalogo === selectedValue)
     this.editarSubcategoriaForm.get('descripcion')?.setValue(sub.descripcion);
    this.editarSubcategoriaForm.get('url')?.setValue(sub.complemento);
  }

  obtenerSubCategoriasConid(idPadre: number) {
    let selectedValue = this.padreActual;
    this.categoria = this.arregloCategorias.find(
      (c) => c.idCatalogo === selectedValue
    );
    this.gmbeservice
      .listarSubcategorias(this.categoria.idCatalogo)
      .subscribe((res) => {
        this.subCategorias = res;
      });
    this.subcategoriasAgregadas = [];
    this.ver = false;
  }

  // Para enviar ->
  // Fila es 2
  // Columna es 1
  generaArregloEstructura() {
    let arregloSalida: {
      tipo: number;
      idCategoria: any;
      idSubCategoria: any;
    }[] = [];
    this.estructuraFinalFilasSubitulos.forEach(
      (element: { idCatalogo: any; idRelacion: any; esAuxiliar:boolean }) => {
        if(!element.esAuxiliar){
          arregloSalida.push({
            tipo: 2,
            idCategoria: element.idRelacion,
            idSubCategoria: element.idCatalogo,
          });
        }
        else{
          arregloSalida.push({
            tipo: 2,
            idCategoria: element.idRelacion,
            idSubCategoria: null,
          });
        }
      }
    );
    this.estructuraFinalColumnasSubitulos.forEach(
      (element: { idCatalogo: any; idRelacion: any; esAuxiliar:boolean }) => {
        if(!element.esAuxiliar){
        arregloSalida.push({
          tipo: 1,
          idCategoria: element.idRelacion,
          idSubCategoria: element.idCatalogo,
        });
        } 
        else{
          arregloSalida.push({
            tipo: 1,
            idCategoria: element.idRelacion,
            idSubCategoria: null,
          });
        }
      }
    );

    return arregloSalida;
  }

  validarGuardar(){
    return this.generales.valid && this.estructuraFinalFilasSubitulos.length >0 && this.estructuraFinalColumnasSubitulos.length>0 && this.imageFile;
  }

  guardar() {
    this.bloquearBotonGuardar = true;
    console.log(this.generales.value);
    let nombre = this.imageFile?.name ? this.imageFile.name.split(".")[0].replaceAll('.','')+Math.random()+'.png' : 'gmbeImage'+Math.random()+'.png';
    let estructura = this.generaArregloEstructura();
    let enviar = this.generales.value;
    enviar.estructura = estructura;
    enviar.ruta= null;
    enviar.idUsuario = this.usuario?.idUsuario;

    console.log(enviar);
    this.gmbeservice.crearImagen(this.imageFile, nombre).subscribe(
      response => {
        console.log('Imagen subida con éxito', response);
        // Maneja la respuesta exitosa aquí
        enviar.ruta = response.remotePath;
        this.gmbeservice.crearGmbe(enviar).subscribe(
          res=>{
            swal.fire('', 'MBE registrado exitosamente', 'success');
            this.consultarAccesos(enviar.idUsuario);
            this.router.navigate(['/gmbe'])
          },
          err=>{}
        );
      },
      error => {
        console.error('Error al subir la imagen', error);
        // Maneja el error aquí
      }
    );
  }

  consultarAccesos(idUsuario:number){
    this.gmbeservice.consultarAccesos(idUsuario).subscribe(
      res=>{
        console.log(res);
        //Actualizar el Storage con los accesos
        this.storage.setItem('autorizadas',this.cifrado.cifrar(JSON.stringify(res)));
      },
      err=>{}
    )
  }

  cerrarModal() {
    this.volverCargarBandera = false;
    this.modalService.dismissAll();
  }

  open(content: TemplateRef<any>,tipo :string) {
    this.mostrarErrorurl = false;
    this.volverCargarBandera = true;
    this.obtenerCategoriasEditado();

    if(tipo=== 'categoria'){
      this.esEditado = false;
      this.categoriaForm = this.fb.group({
        nombre:['',Validators.required],
        descripcion:[''],
        url: ['']
      });
    }

    if(tipo==='subcategoria'){
      this.esEditado = false;
      this.subcategoriaForm = this.fb.group({
        categoria:[0,Validators.required],
        nombre:['',Validators.required],
        descripcion:[''],
        url: ['']
      });
    }

    this.modalRef = this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

//1:CREAR 2:EDITAR 3:CREAR CAT 4:EDITAR CAT
  validaUrl(form:number){
    let url;

    switch(form){
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

    if(this.tipoSeleccionado && url.length>0){
      if(!this.urlPattern.test(url)){
        this.mostrarErrorurl = true;
      }else{
        this.mostrarErrorurl = false;
      }
    }else{
      this.mostrarErrorurl = false;
    }
    console.log(this.mostrarErrorurl);
  }

  crearCategoria() {
    //Si el nombre esta vacio no se puede crear la categoria o comienza con espacio

    let nombre = this.categoriaForm.get('nombre')?.value;
    let descripcion = this.categoriaForm.get('descripcion')?.value;
    let url = this.categoriaForm.get('url')?.value;
    nombre = nombre.trim();
    descripcion = descripcion.trim();
    url = url.trim();

    if (nombre !== '' || descripcion !== '' || url !== '') {
      console.log(nombre);
        this.gmbeservice.crearCategoria(nombre, descripcion, url ).subscribe(
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
          err => {
            // Manejo de errores
            console.log(err.error);
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
      } else {
        swal.fire({
          title: '',
          text: 'El campo no puede estar vacío',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal-popup',
            confirmButton: 'custom-swal-confirm-button'
          }
        });
    }
  }

  editarCategoria(){
    let id = Number(this.editarCategoriaForm.get('categoria')?.value);
    let nombre = this.editarNombre;

    let descripcion = this.editarCategoriaForm.get('descripcion')?.value;
    let url = this.editarCategoriaForm.get('url')?.value;

    descripcion = descripcion.trim();
    url = url !== null ? url?.trim() : '';

    this.gmbeservice.existeCategoriaSubcategoria(id).subscribe(
      res=>{
        console.log(res);
        if(res.data !== true){
          if(this.tipoSeleccionado && url.length>0){
            if(!this.urlPattern.test(url)){
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
      
      
          if (descripcion !== '' || url !== '') {
            this.gmbeservice.editarCategoria(id,nombre,descripcion,url).subscribe(
              () => {
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
                }
              },
              err => {
                // Manejo de errores
                console.log(err.error);
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
          } else {
            swal.fire({
              title: '',
              text: 'El campo no puede estar vacío',
              icon: 'error',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'custom-swal-popup',
                confirmButton: 'custom-swal-confirm-button'
              }
            });
          }
        }else{
          swal.fire({
            title: '',
            text: 'No se puede editar esta categoría ya que se encuentra relacionada a un MBE',
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'custom-swal-popup',
              confirmButton: 'custom-swal-confirm-button'
            }
          });
        }
      },
      err=>{}
    );
  }

  existeCategoriaSubcategoria(idCategoria: number):boolean{
    this.existeCategoria = false;
    this.gmbeservice.existeCategoriaSubcategoria(idCategoria).subscribe(
      res=>{
        console.log(res);
        if(res.data === true){
          this.existeCategoria = true;
        }
      },
      err=>{}
    );
    return this.existeCategoria;
  }


  crearSubcategoria(){

    let nombre = this.subcategoriaForm.get('nombre')?.value;
    let descripcion = this.subcategoriaForm.get('descripcion')?.value;
    let url = this.subcategoriaForm.get('url')?.value;
    nombre = nombre.trim();
    descripcion = descripcion.trim();
    url = url.trim();


    if(this.tipoSeleccionado && url.length>0){
      if(!this.urlPattern.test(url)){
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

    if (nombre !== '' || descripcion !== '' || url !== '') {
        this.gmbeservice.crearSubcategoria(nombre,this.subcategoriaForm.get('categoria')?.value,descripcion,url).subscribe(
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
          err=>{
            console.log(err.error);
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
        )
  }else{
    swal.fire({
      title: '',
      text: 'El campo no puede estar vacío',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
  }

  editarSubcategoria(){
    let id = Number(this.editarSubcategoriaForm.get('categoria')?.value);
    let idSub = Number(this.editarSubcategoriaForm.get('subCategoria')?.value);
    let validarIdSub =  idSub === 0 ? id : idSub;
    let nombre = this.editarNombreSubcategoria;
    let descripcion = this.editarSubcategoriaForm.get('descripcion')?.value;
    let url = this.editarSubcategoriaForm.get('url')?.value;

    console.log(validarIdSub);
    console.log(url);
    console.log(descripcion)
    url = url !== null ? url?.trim() : '';
    descripcion = descripcion !== null ? descripcion?.trim() : '';

    this.gmbeservice.existeCategoriaSubcategoria(validarIdSub).subscribe(
      res=>{
        console.log(res);
        if(res.data !== true){
          if(this.tipoSeleccionado && url.length>0){
            if(!this.urlPattern.test(url)){
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
      
            this.gmbeservice.editarSubcategoria(id,nombre,validarIdSub,descripcion,url).subscribe(
              () => {
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
                
              },
              err=>{
                console.log(err.error);
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
          }else{
            swal.fire({
              title: '',
              text: 'No se puede editar esta subcategoría ya que se encuentra relacionada a un MBE',
              icon: 'error',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'custom-swal-popup',
                confirmButton: 'custom-swal-confirm-button'
              }
            });
          }
      },
      err=>{}
    );


    console.log(idSub)
  }

  cerrarModalCatalgo(){
    this.volverCargarBandera = false;
    this.editarCategoriaForm.get('categoria')?.setValue('');
    this.editarCategoriaForm.get('descripcion')?.setValue('');
    this.editarCategoriaForm.get('url')?.setValue('');
    this.modalRef?.close();
  }

  cerrarModalSubCatalgo(){
    //limpia el arreglo de subcategorias agregadas y los checkboxes
    this.volverCargarBandera = false;
    this.subCategoriasEditado = [];
    this.editarSubcategoriaForm.get('categoria')?.setValue('');
    this.editarSubcategoriaForm.get('subCategoria')?.setValue('');
    this.editarSubcategoriaForm.get('descripcion')?.setValue('');
    this.editarSubcategoriaForm.get('url')?.setValue('');
    this.modalRef?.close();
  }


validaSubtitulosColumna(){
  return this.estructuraFinalColumnasSubitulos.some((obj: { esAuxiliar: boolean | undefined; }) => obj.esAuxiliar === false || obj.esAuxiliar === undefined);
}

validaSubtitulosFilas(){
  return this.estructuraFinalFilasSubitulos.some((obj: { esAuxiliar: boolean | undefined; }) => obj.esAuxiliar === false || obj.esAuxiliar === undefined);
}

  
}
