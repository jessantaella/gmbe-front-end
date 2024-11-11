import { Component, OnInit } from '@angular/core';
import { faBars, faUserGroup, faDesktop,faFile  } from "@fortawesome/free-solid-svg-icons";
import { CifradoService } from 'src/app/services/cifrado.service';
import { StorageService } from 'src/app/services/storage-service.service';

@Component({
  selector: 'app-nav-side',
  templateUrl: './nav-side.component.html',
  styleUrls: ['./nav-side.component.scss']
})
export class NavSideComponent implements OnInit {
  idRol:any;

  faBars = faBars;
  faUserGroup=faUserGroup;
  faDesktop = faDesktop;
  faFile = faFile;
  constructor(private storage:StorageService,private cifrado:CifradoService) {

   }

  getrol()
  {
    if(this.storage.getItem('usr') === null){
        return 0;
    }
    let objeto = JSON.parse(this.cifrado.descifrar(this.storage.getItem('usr')!));
    let rol =  objeto.rolUsuario;
    return rol.idRol;
  }
  
  activarSidebar()
  {
    let sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('active');
  }

  ngOnInit(): void {
    this.idRol=1;//localStorage.getItem('idRol');
  }

}
