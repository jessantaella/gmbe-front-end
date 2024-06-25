import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TitulosService } from 'src/app/services/titulos.services';
import { faX, faRotateLeft, faFloppyDisk, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GmbeServicesService } from '../services/gmbe-services.service';

@Component({
  selector: 'app-crear-gmbe',
  templateUrl: './crear-gmbe.component.html',
  styleUrls: ['./crear-gmbe.component.scss']
})
export class CrearGmbeComponent {

  textoBienvenida =
  "Creación de GMBE";
  faX = faX;
  faRotateLeft = faRotateLeft;
  faFloppyDisk = faFloppyDisk;
  faPlus = faPlus;
  faTrash = faTrash; 

  generales: FormGroup;

  opcionesTipoEstructura! :any [];

  /** Arreglos de pruebas */

arregloCategorias! :any[];

mostrarSubcategoria: { id: number; id_padre: number; nombre: string; }[] | undefined;

subCategorias! : any[];

tipo=0;
categoria:any;
subcategoriasAgregadas :any[] = [];
estructuraFinalFilasTitulos :any = [];
estructuraFinalFilasSubitulos :any = [];
estructuraFinalColumnasTitulos :any = [];
estructuraFinalColumnasSubitulos :any = [];
padreAnterior = 0;
ver =false;

  imageUrl: string | ArrayBuffer | null | undefined = null;
  imageFile: File | null = null;

  constructor(private titulos :TitulosService,private modalService: NgbModal,private fb:FormBuilder, private gmbeservice:GmbeServicesService) {
    this.titulos.changePestaña('Creación de  GMBE');
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.tipoEstructura();
    this.obtenerCategorias();
    this.generales = this.fb.group({
      nombre: ['', Validators.required],
      objetivos: ['', Validators.required],
      hallazgos: ['', Validators.required]
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(): void {
    this.imageUrl = null;
    this.imageFile = null;
  }



  subcategoriaSeleccionada(sub: any){
    if (!this.subcategoriasAgregadas) {
      this.subcategoriasAgregadas = [];
    }
    const pos = this.subcategoriasAgregadas.findIndex(e => e.idCatalogo === sub.idCatalogo);
    
    if (pos === -1) {
      this.subcategoriasAgregadas.push(sub);
    } else{
      const nuevoArreglo = this.subcategoriasAgregadas?.filter(elemento => elemento.idCatalogo !== sub.idCatalogo);
      this.subcategoriasAgregadas = nuevoArreglo;
    }
  }


  mergeAndRemoveDuplicates(arreglo1:any,arreglo2:any) {
    // Crear un conjunto de idCatalogo presentes en ambos arreglos
    const idsArreglo1 = new Set(arreglo1.map((item: { idCatalogo: any; }) => item.idCatalogo));
    const idsArreglo2 = new Set(arreglo2.map((item: { idCatalogo: any; })  => item.idCatalogo));

    const commonIds = new Set([...idsArreglo1].filter(id => idsArreglo2.has(id)));

    // Filtrar ambos arreglos para eliminar elementos con idCatalogo en commonIds
    const filteredArreglo1 = arreglo1.filter((item: { idCatalogo: any; })  => !commonIds.has(item.idCatalogo));
    const filteredArreglo2 = arreglo2.filter((item: { idCatalogo: any; })  => !commonIds.has(item.idCatalogo));

    // Combinar los elementos restantes de ambos arreglos
    const mergedArray = [...filteredArreglo1, ...filteredArreglo2];

    return mergedArray;
  }

  agregar(){
    //Filas
    if(this.tipo ===2){
      console.log('Filas')
      let existe =  this.estructuraFinalFilasTitulos.some((obj: any) => obj.categoria.idCatalogo === this.categoria.idCatalogo );
      console.log(existe)
      if (existe){
        console.log(this.estructuraFinalFilasTitulos)
        console.log(this.categoria)
        let arregloOriginal = this.estructuraFinalFilasTitulos.find((e: any )=>{
          return e.categoria.idCatalogo == this.categoria.idCatalogo
        });

        let nuevasSubcategorias = this.mergeAndRemoveDuplicates(arregloOriginal.subcategorias,this.subcategoriasAgregadas);

        this.estructuraFinalFilasTitulos = this.estructuraFinalFilasTitulos.filter((item: { categoria: { idCatalogo: any; }; }) => item.categoria.idCatalogo !== this.categoria.idCatalogo);
        
        console.log(this.estructuraFinalFilasTitulos)

        this.estructuraFinalFilasTitulos.push(
          {categoria:this.categoria,subcategorias:nuevasSubcategorias}
        )

        console.log(this.estructuraFinalFilasTitulos)
      }else{
        this.estructuraFinalFilasTitulos.push(
          {categoria:this.categoria,subcategorias:this.subcategoriasAgregadas}
        )
      }

      
      this.estructuraFinalFilasSubitulos = [];
      this.estructuraFinalFilasSubitulos = this.estructuraFinalFilasTitulos.reduce((acc: string | any[], item: { subcategorias: any; }) => acc.concat(item.subcategorias), []);

    }else{
    //Columnas
      this.estructuraFinalColumnasTitulos.push(
        {categoria:this.categoria,subcategorias:this.subcategoriasAgregadas}
      )
    this.estructuraFinalColumnasSubitulos = this.estructuraFinalColumnasSubitulos.concat(this.subcategoriasAgregadas);
    }
    console.log(this.estructuraFinalFilasTitulos);
    console.log(this.estructuraFinalColumnasTitulos);
  }

  regresaPapa(idPadre:number){
    this.padreAnterior = idPadre;
    return this.estructuraFinalFilasTitulos.find((e:any)=>e.categoria.idCatalogo === idPadre);
  }

  eliminarCategoria(tipo:number,elemento:any){
    if(tipo === 1){
      this.estructuraFinalColumnasTitulos = this.estructuraFinalColumnasTitulos.filter((e: { categoria: { idCatalogo: any; }; })=> e.categoria.idCatalogo !== elemento.idCatalogo);
      this.estructuraFinalColumnasSubitulos = this.estructuraFinalColumnasSubitulos.filter((e: { idRelacion: any; })=>e.idRelacion !== elemento.idCatalogo)
    }else{
      this.estructuraFinalFilasTitulos = this.estructuraFinalFilasTitulos.filter((e: { categoria: { idCatalogo: any; }; })=> e.categoria.idCatalogo !== elemento.idCatalogo)
      this.estructuraFinalFilasSubitulos = this.estructuraFinalFilasSubitulos.filter((e: { idRelacion: any; })=>e.idRelacion !== elemento.idCatalogo)

    }
  }

// uno para obtener fila o columna
  tipoEstructura(){
    this.gmbeservice.listarCatalogo(1).subscribe(
      res=>{
        this.opcionesTipoEstructura = res;
        console.log(res);
      },
    err=>{

    });
  }
  
  changeTipo(valor:any){
    this.tipo = parseInt(valor.target.value);
    this.subCategorias = []
    this.obtenerCategorias()
  }


  obtenerCategorias(){
    this.gmbeservice.listarCatalogo(2).subscribe(
      res=>{
        this.arregloCategorias = res;
      },
    err=>{

    });
  }
  
  
  existeObjeto(subcategoria:any) {
    if(this.tipo === 2){
      let salida =  this.estructuraFinalFilasSubitulos.some((obj: { idRelacion: any; idCatalogo: any; }) => obj.idRelacion === subcategoria.idRelacion && obj.idCatalogo === subcategoria.idCatalogo);
      return salida;

    }else{
      let salida =  this.estructuraFinalColumnasSubitulos.some((obj: { idRelacion: any; idCatalogo: any; }) => obj.idRelacion === subcategoria.idRelacion && obj.idCatalogo === subcategoria.idCatalogo);
      return salida;

    }
  }


  obtenerSubCategorias(idPadre:any){
    let selectElement = idPadre.target as HTMLSelectElement;
    let selectedValue = Number(selectElement.value);
    this.categoria = this.arregloCategorias.find(c=>c.idCatalogo === selectedValue);
    this.gmbeservice.listarSubcategorias(this.categoria.idCatalogo).subscribe(
      res=>{
        this.subCategorias = res;
      }
    )
    this.subcategoriasAgregadas = [];
    this.ver = false;
  }


  guardar(){
    console.log(this.generales.value);
  }

}
