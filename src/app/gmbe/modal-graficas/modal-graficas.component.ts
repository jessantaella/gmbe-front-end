import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GmbeServicesService } from '../services/gmbe-services.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CifradoService } from 'src/app/services/cifrado.service';
import { StorageService } from 'src/app/services/storage-service.service';
import { ActivatedRoute } from '@angular/router';
import {
  faRotateLeft
} from '@fortawesome/free-solid-svg-icons';
declare var swal: any;

@Component({
  selector: 'app-modal-graficas',
  templateUrl: './modal-graficas.component.html',
  styleUrls: ['./modal-graficas.component.scss']
})
export class ModalGraficasComponent {

  @ViewChildren('thElemento1') thElements1!: QueryList<ElementRef>;
  @ViewChildren('thElemento2') thElements2!: QueryList<ElementRef>;
  elementosObservadosModal1 = false;
  elementosObservadosModal2 = false;

  modalRevisionesForm: FormGroup;

  estructuraFinalColumnasTitulos: any[] = [];
  estructuraFinalFilasTitulos: any[] = [];
  estructuraFinalFilasSubitulos: any[] = [];
  datosIntersecciones: any[] = [];

  revision2 : any ;
  usuario: any;

  existeSegundaRevision: boolean = false;
  existeOtraRevision: boolean = false;
  idEstatus: any;
  idMBE: any;
  mostrarMensajeRevisiones: boolean = false;

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

revision1:any
revisionDos: any;
id: number = 0;
versionMaxima = 1;
faRotate = faRotateLeft;

  constructor(
    private fb: FormBuilder,
    private gmbservices: GmbeServicesService,
    private modalService: NgbModal,
    private cifrado: CifradoService,
    private storage: StorageService,
    private route: ActivatedRoute
  ) { 
    this.usuario = JSON.parse(
      this.cifrado.descifrar(this.storage.getItem('usr')!)
    );
    this.id = parseInt(this.storage.getItem('idMbe')!);
    this.modalRevisionesForm = this.fb.group({
      anterior: [''],
      actual: [''],
    });
    this.obtenerVersionMax();
    this.cargarRevisonDos();
  }

  ngOnDestroy(): void {
   this.subscriptions.forEach(sub => sub.unsubscribe());
 }
 ngOnInit(): void {
   this.cargarEstructuraMbe();
   this.pantallaCargando();
 }

 ngAfterViewChecked(): void {
  // Solo ejecutar el renderizado una vez que los elementos estén disponibles
  if (!this.elementosObservadosModal1 && this.thElements1.length > 0 ) {
    this.renderizadoModal1();
    this.elementosObservadosModal1 = true; // Marcar que ya se han observado los elementos
  }

  if (!this.elementosObservadosModal2 && this.thElements2.length > 0 ) {
    this.renderizadoModal2();
    this.elementosObservadosModal2 = true; // Marcar que ya se han observado los elementos
  }
}

 renderizadoModal1() {
  console.log('Renderizado modal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const [_, index, index2] = entry.target.id.split('-').map(Number);
      if (entry.isIntersecting) {
        if (!this.esVisible1[index]) {
          this.esVisible1[index] = [];
        }

        if (!this.esVisible1[index][index2]) {
          this.esVisible1[index][index2] = true;
        }
      }
    });
  }, {
    rootMargin: '100px',
  });

  this.thElements1.forEach(th => {
    observer.observe(th.nativeElement);
  });
}

renderizadoModal2() {
  console.log('Renderizado modal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const [_, index, index2] = entry.target.id.split('-').map(Number);
      if (entry.isIntersecting) {
        if (!this.esVisible2[index]) {
          this.esVisible2[index] = [];
        }

        if (!this.esVisible2[index][index2]) {
          this.esVisible2[index][index2] = true;
        }
      }
    });
  }, {
    rootMargin: '100px',
  });

  this.thElements2.forEach(th => {
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

  cargarRevisonDos() {
    this.gmbservices.obtenerDatosGMBE(this.id, 1).subscribe(
      (res) => {
        
        this.revisionDos = res;
        console.log('Revision 2', this.revisionDos);

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

  cargarDatosMbe() {
    this.gmbservices.obtenerDatosGMBE(this.id, this.versionMaxima).subscribe(
      (res) => {
        this.datosIntersecciones = res;
        
        swal.close();
      },
      (err) => {}
    );
  }

  cargarEstructuraMbe() {
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

        console.log('Filas Procesadas Titulos', this.estructuraFinalFilasTitulos);
      },
      (err) => {
        console.error('Error al cargar la estructura MBE', err);
      }
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

  regresaValorSinSubcategoria(padre: any, hijo: any) {
    return hijo !== undefined ? hijo : padre?.idEstructura;
  }

  cerraModal() { 
    this.modalService.dismissAll();
  }



}
