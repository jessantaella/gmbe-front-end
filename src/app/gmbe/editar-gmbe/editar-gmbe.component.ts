import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GmbeServicesService } from '../services/gmbe-services.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TitulosService } from 'src/app/services/titulos.services';
import {
  faRotateLeft,
  faFloppyDisk,
  faX
} from '@fortawesome/free-solid-svg-icons';
import { StorageService } from 'src/app/services/storage-service.service';
import { CifradoService } from 'src/app/services/cifrado.service';
import { Router } from '@angular/router';
declare var swal: any;

@Component({
  selector: 'app-editar-gmbe',
  templateUrl: './editar-gmbe.component.html',
  styleUrls: ['./editar-gmbe.component.scss']
})
export class EditarGmbeComponent {

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
    private cifrado: CifradoService) {
    this.titulos.changePestaña(this.textoBienvenida);
    this.titulos.changeBienvenida(this.textoBienvenida);
    this.usuario = JSON.parse(this.cifrado.descifrar(this.storage.getItem('usr')!));

    this.id = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.generales = this.fb.group({
      nombre: ['',Validators.required],
      objetivo: ['',Validators.required],
      resumen: ['',Validators.required],
    });
    this.cargaMBE();

  }

  cargaMBE() {
    this.gmbservices.obtenerInfoGMBE(this.id).subscribe(
      res => {
        this.mostrarNombre = res.nombre;
        this.mostrarObjetivos = res.objetivo;
        this.generales = this.fb.group({
          nombre: [res?.nombre,Validators.required],
          objetivo: [res?.objetivo,Validators.required],
          resumen: [res?.resumen,Validators.required],
        });
        this.nombreImagen = res.ruta;
        this.obtenerImagen(res.ruta);
      },
      err => { }
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
    return this.generales.valid && this.imageUrl != null;
  }

  onFileChange(event: any): void {
    this.subiImagen = true;
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

  guardar() {
    if (this.subiImagen) {
      let nombre = this.nombreImagen;
      let enviar = this.generales.value;
      enviar.idUsuario = this.usuario?.idUsuario;
      enviar.idMbe = this.id;
        this.gmbservices.actualizarImagen(this.imageFile, nombre).subscribe(
          res => {
            enviar.ruta = res.remotePath;
            this.gmbservices.actualizarGmbe(enviar).subscribe(res=>{
              swal.fire({
                icon: 'success',
                text: 'MBE actualizado exitosamente',
                confirmButtonText: 'OK',
                customClass: {
                  htmlContainer: 'titulo-swal',
                  confirmButton: 'ok-swal',
                }
              })
              this.router.navigate(['/gmbe'])
            })
          },
          err => { }
        )

    } else {
      let enviar = this.generales.value;
      enviar.ruta = this.nombreImagen;
      enviar.idUsuario = this.usuario?.idUsuario;
      enviar.idMbe = this.id;
          this.gmbservices.actualizarGmbe(enviar).subscribe(res=>{
            swal.fire({
              icon: 'success',
              text: 'MBE actualizado exitosamente',
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



}
