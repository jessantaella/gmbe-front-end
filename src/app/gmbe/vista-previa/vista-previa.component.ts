import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GmbeServicesService } from '../services/gmbe-services.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TitulosService } from 'src/app/services/titulos.services';
import {
  faRotateLeft,
  faDownload,
  faX,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { HttpResponse } from '@angular/common/http';
declare var swal: any;

@Component({
  selector: 'app-vista-previa',
  templateUrl: './vista-previa.component.html',
  styleUrls: ['./vista-previa.component.scss']
})
export class VistaPreviaComponent {
  id:number = 0;
  versionMaxima = 1;
  generales: FormGroup;
  imageUrl: SafeUrl | null = null;
  textoBienvenida = "Vista previa";

  estructuraFinalColumnasTitulos:any[] = [];
  estructuraFinalFilasTitulos:any[] = [];
  estructuraFinalFilasSubitulos:any[] = [];
  datosIntersecciones:any [] = [];

  mostrarNombre:string = '';
  mostrarObjetivos:string = '';

  faRotaLeft = faRotateLeft;
  faDownload = faDownload;
  faX = faX;
  faCheck = faCheck;

  constructor(private route: ActivatedRoute, private gmbservices:GmbeServicesService,private fb: FormBuilder,private sanitizer: DomSanitizer,private titulos: TitulosService){
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.titulos.changePestaña(this.textoBienvenida);
    this.id = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.generales = this.fb.group({
      nombre: [''],
      objetivos: [''],
      resumen: [''],
    });
    this.cargaMBE();
    this.obtenerVersionMax();
    this.cargarEstructuraMbe();
    //this.cargarDatosMbe();
  }

  cargaMBE(){
    this.gmbservices.obtenerInfoGMBE(this.id).subscribe(
      res=>{
        this.mostrarNombre = res.nombre;
        this.mostrarObjetivos = res.objetivo;
        this.generales = this.fb.group({
          nombre: [res?.nombre],
          objetivos: [res?.objetivo],
          resumen: [res?.resumen],
        });
        this.generales.disable();
        this.obtenerImagen(res.ruta);
      },
      err=>{}
    )
  }

  obtenerVersionMax(){
    this.gmbservices.obtenerVersionMaximaMBE(this.id).subscribe(
      res=>{
        this.versionMaxima = res?.data;
        this.cargarDatosMbe();
        console.log(res);
      }
    )
  }

  obtenerImagen(ruta:string){
    this.gmbservices.getImage(ruta).subscribe(
      res=>{
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(res);
    },
      err=>{}
    );
  }

  anchoDinamico(){
    if(this.estructuraFinalColumnasTitulos.length  <= 2){
      return '60';
    }else{
      if(this.estructuraFinalColumnasTitulos.length  <= 4){
        return '90';
      }else{
        return '100';
      }
    }
  }

cargarEstructuraMbe(){
  this.gmbservices.obtenerEstructuraGMBE(this.id).subscribe(
    res=>{
      console.log(res);
      //obtiene categorias filas
      this.estructuraFinalColumnasTitulos = this.filtrarCategoriasUnicas(this.obtenerTipo(res,1));

      this.estructuraFinalColumnasTitulos.forEach(c=>{
        c.hijos = [];
        res.forEach((e: { idSubCategoria: { idRelacion: any; }; idTipo: { idCatalogo: number; }; })=>{
          if(e?.idSubCategoria?.idRelacion ===c.idCatalogo && e?.idTipo?.idCatalogo == 1){
           c.hijos.push(e);
          }
        });
      });    
      
      //Creación de hijos auxiliares para mantener espacios
      for(let a=0;a<this.estructuraFinalColumnasTitulos.length;a++){
        if(this.estructuraFinalColumnasTitulos[a].hijos.length<1){
          this.estructuraFinalColumnasTitulos[a].hijos.push({auxiliar:true})
        }
      }

      console.log('valores columnas',this.estructuraFinalColumnasTitulos);

      //obtiene categorias de columnas
      this.estructuraFinalFilasTitulos = this.filtrarCategoriasUnicas(this.obtenerTipo(res,2));

      this.estructuraFinalFilasTitulos.forEach(c=>{
        c.hijos = [];
        res.forEach((e: { idSubCategoria: { idRelacion: any; }; idTipo: { idCatalogo: number; }; })=>{
          if(e?.idSubCategoria?.idRelacion ===c.idCatalogo && e?.idTipo?.idCatalogo == 2){
           c.hijos.push(e);
          }
        });
      });  

      console.log('filas Procesadas Titulos', this.estructuraFinalFilasTitulos);

      //Creación de hijos auxiliares para mantener espacios

      for(let a=0;a<this.estructuraFinalFilasTitulos.length;a++){
        if(this.estructuraFinalFilasTitulos[a].hijos.length<1){
          this.estructuraFinalFilasTitulos[a].hijos.push(
            {
              auxiliar:true,
              countSubCats:1,
              idCategoria:{
                idCatalogo:this.estructuraFinalFilasTitulos[a].idCatalogo,
                catalogo:this.estructuraFinalFilasTitulos[a].catalogo
              },
              idEstructura:this.estructuraFinalFilasTitulos[a].idEstructura
            });
        }
      }
      
      for(let a=0;a<this.estructuraFinalFilasTitulos.length;a++){
        this.estructuraFinalFilasSubitulos = this.estructuraFinalFilasSubitulos.concat(this.estructuraFinalFilasTitulos[a].hijos);
      }
      //console.log('Columnas',this.estructuraFinalColumnasTitulos)
      //console.log('subtitulos',this.estructuraFinalFilasSubitulos);
     // console.log('hijos filas',this.estructuraFinalFilasTitulos)
    },
    err=>{}
  )
}

cargarDatosMbe(){
  this.gmbservices.obtenerDatosGMBE(this.id,this.versionMaxima).subscribe(
    res=>{
      this.datosIntersecciones = res;
      console.log('datos',this.datosIntersecciones)
    },
    err=>{}
  );
}

obtenerTipo(arreglo:any,tipo:number){
  let salida = [];
  salida = arreglo.filter((e: any )=>e.idTipo?.idCatalogo ===tipo);
  return salida;
}

filtrarCategoriasUnicas(arreglo: any){
  const categoriasMap = new Map<number, any>();
  arreglo.forEach((obj: { idCategoria: any; idEstructura: any; countSubCats: any; }) => {
    const categoria = obj.idCategoria;
    categoria.idEstructura = obj.idEstructura;
    if (categoriasMap.has(categoria.idCatalogo)) {
      categoriasMap.get(categoria.idCatalogo)!.countSubCats! = obj.countSubCats;
    } else {
      categoria.countSubCats = obj.countSubCats;
      categoriasMap.set(categoria.idCatalogo, categoria);
    }
  });

  return Array.from(categoriasMap.values());
}


regresaValorSinSubcategoria(padre:any,hijo:any){
 return hijo !== undefined ? hijo : padre?.idEstructura;

}

datosInterseccion(columna:number,fila:number){
  let respuesta =  this.datosIntersecciones.find(
    obj => obj.idFila === columna && obj.idColumna === fila
  );
  return respuesta?.arrConteoDisenioEval.length< 1 ? respuesta?.arrConteoTipoEval : respuesta?.arrConteoDisenioEval
}


descargar(){
  swal.fire({
    title: 'Descargando',
    timerProgressBar: true,
    didOpen: () => {
      swal.showLoading();
    }
  });
  this.gmbservices.descargarReporteDatos(this.id,this.versionMaxima).subscribe(
    (res: HttpResponse<ArrayBuffer>) => {
      if(res.body!.byteLength>0){
        const file = new Blob([res!.body!], { type: 'application/xlsx' });
        const fileURL = URL.createObjectURL(file);
        var link = document.createElement('a');
        link.href = fileURL;
        swal.close();
        swal.fire('', '¡Descarga con éxito!', 'success').then(() => { });
        link.download = 'DatosMBE_' + this.generales.get('nombre')!.value.replace(/\s+/g, '') + '.xlsx';
        link.click();
      }else{
        swal.fire({
          icon: 'error',
          title: '<center> Error </center>',
          text: 'Sin información',
        })
      }
    },
    err=>{
      swal.fire({
        icon: 'error',
        title: '<center> Error </center>',
        text: 'Sin información',
      })
    })
}

}
