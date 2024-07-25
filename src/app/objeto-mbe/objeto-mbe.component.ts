import { Component, Input, OnInit} from '@angular/core';
import { GmbeServicesService } from '../gmbe/services/gmbe-services.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-objeto-mbe',
  templateUrl: './objeto-mbe.component.html',
  styleUrls: ['./objeto-mbe.component.scss']
})
export class ObjetoMbeComponent implements OnInit{
  private _data: any;
  imageUrl: SafeUrl | null = null;

  @Input()
  set data(value: any) {
    this._data = value;
    if (this._data?.ruta) {
      this.obtenerImagen(this._data.ruta);
    }
  }

  get data(): any {
    return this._data;
  }



constructor(private gmbeservices : GmbeServicesService,private sanitizer: DomSanitizer){}


ngOnInit(): void {
  if(this.data?.ruta)
    this.obtenerImagen(this.data?.ruta);
}


  obtenerImagen(ruta:string){
    this.gmbeservices.getImage(ruta).subscribe(
      res=>{
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(res);
    },
      err=>{
        console.log(err)
      }
    );
  }

}
