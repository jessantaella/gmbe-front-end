import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TitulosService } from 'src/app/services/titulos.services';
import {
  faX,
  faRotateLeft,
  faFloppyDisk,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GmbeServicesService } from '../services/gmbe-services.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage-service.service';
import { CifradoService } from 'src/app/services/cifrado.service';

declare var swal: any;

@Component({
  selector: 'app-crear-gmbe',
  templateUrl: './crear-gmbe.component.html',
  styleUrls: ['./crear-gmbe.component.scss'],
})
export class CrearGmbeComponent implements OnInit {
  textoBienvenida = 'Crear MBE';
  faX = faX;
  faRotateLeft = faRotateLeft;
  faFloppyDisk = faFloppyDisk;
  faPlus = faPlus;
  faTrash = faTrash;
  bloquearBotonGuardar = false;
  SelectCatelogirasForm!: FormGroup;

  private modalRef: NgbModalRef | undefined;

  usuario : any ;

  generales: FormGroup;
  categoriaForm: FormGroup;
  subcategoriaForm: FormGroup;

  opcionesTipoEstructura!: any[];

  activarAgregar : boolean = false;

  /** Arreglos de pruebas */

  arregloCategorias!: any[];

  mostrarSubcategoria:
    | { id: number; id_padre: number; nombre: string }[]
    | undefined;

  subCategorias!: any[];

  padreActual : number = 0;

  tipo = 1;
  categoria: any;
  subcategoriasAgregadas: any[] = [];
  estructuraFinalFilasTitulos: any = [];
  estructuraFinalFilasSubitulos: any = [];
  estructuraFinalColumnasTitulos: any = [];
  estructuraFinalColumnasSubitulos: any = [];
  padreAnterior = 0;
  ver = false;

  imageUrl: string | ArrayBuffer | null | undefined = null;
  imageFile: File | null = null;


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
      nombre:['',Validators.required]
    })
    this.subcategoriaForm = this.fb.group({
      categoria:[null],
      nombre:['']
    })

    this.SelectCatelogirasForm = this.fb.group({
      selectTipo: [''],
      selectCategoria: [''],
    });
  }
  ngOnInit(): void {
    this.SelectTipoCat1();
    this.reiniciarSelect();
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

      }

     
    //limpia el arreglo de subcategorias agregadas y los checkboxes
    this.subcategoriasAgregadas = [];
    this.ver = true;

    this.obtenerCategorias();
    this.subCategorias = [];
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
    
  }

  obtenerCategorias() {
    this.gmbeservice.listarCatalogo(2).subscribe(
      (res) => {
        this.arregloCategorias = res;
        this.activarAgregar = false;
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
        if(!element.esAuxiliar)
        arregloSalida.push({
          tipo: 2,
          idCategoria: element.idRelacion,
          idSubCategoria: element.idCatalogo,
        });
        else
        arregloSalida.push({
          tipo: 2,
          idCategoria: element.idRelacion,
          idSubCategoria: null,
        });
      }
    );
    this.estructuraFinalColumnasSubitulos.forEach(
      (element: { idCatalogo: any; idRelacion: any; esAuxiliar:boolean }) => {
        if(!element.esAuxiliar)
        arregloSalida.push({
          tipo: 1,
          idCategoria: element.idRelacion,
          idSubCategoria: element.idCatalogo,
        });
        else
        arregloSalida.push({
          tipo: 1,
          idCategoria: element.idRelacion,
          idSubCategoria: null,
        });
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

  open(content: TemplateRef<any>,tipo :string) {
    if(tipo=== 'categoria'){
      this.categoriaForm = this.fb.group({
        nombre:['',Validators.required]
      });
    }

    if(tipo==='subcategoria'){
      this.subcategoriaForm = this.fb.group({
        categoria:[null,Validators.required],
        nombre:['',Validators.required]
      })
    }

    this.modalRef = this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }


  crearCategoria() {
    //Si el nombre esta vacio no se puede crear la categoria o comienza con espacio

    let nombre = this.categoriaForm.get('nombre')?.value;
    nombre = nombre.trim();

    if (nombre !== '' ) {
      console.log(nombre);
      this.gmbeservice.crearCategoria(nombre).subscribe(
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
            this.modalRef.close();
            this.obtenerCategorias();
          }
        },
        err => {
          // Manejo de errores
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


  crearSubcategoria(){

    let nombre = this.subcategoriaForm.get('nombre')?.value;
    nombre = nombre.trim();
    if (nombre !== '' ) {

    this.gmbeservice.crearSubcategoria(nombre,this.subcategoriaForm.get('categoria')?.value).subscribe(
      res => {
        swal.fire({
          title: '',
          text: 'Registro creado exitosamente',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        if (this.modalRef) {
          this.modalRef.close();
          if(this.padreActual != 0){
            this.obtenerSubCategoriasConid(this.padreActual);
          }
        }
       
      },
      err=>{}
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

}
