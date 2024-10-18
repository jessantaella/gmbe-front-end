import { Component, Inject, OnInit, PLATFORM_ID,  Renderer2, RendererFactory2 } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { DataDynamic } from './base/services/dinamic-data.services';
import { isPlatformBrowser } from '@angular/common';
import { ServerConfigService } from './server-config.service';
import { StorageService } from './services/storage-service.service';
import { NotificacionesService } from './services/notificaciones.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'GMBE';
  version = 'V-1.2.3';
  tags: any;
  ga: any;
  isBrowser = false;
  private renderer: Renderer2;
  mostrarNotificaciones = false;


  constructor(private meta: Meta, private notificacionesService: NotificacionesService, private servicio: DataDynamic, @Inject(PLATFORM_ID) private platformId: any, private storage: StorageService,private url:ServerConfigService, rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.url.loadServerConfig();
  }

  ngOnInit(): void {
    this.notificacionesService.mostrarNotificaciones$.subscribe((mostrar) => {
      console.log('Cambio en mostrarNotificaciones:', mostrar);
      this.mostrarNotificaciones = mostrar;
    });
    this.consultarTags();

    this.meta.addTag({
      "name": "description",
      "content": "Sistema para la Generación de Mapas de Brechas de Evidencia (GMBE)"
    });
    this.meta.addTag({
      "name": "canonical",
      "content": "https://sistemas.coneval.org.mx/GMBE/"
    });
    this.meta.addTag({
      "name": "keywords",
      "content": "MBE, herramientas visuales, organizar, sintetizar, evidencia, marco conceptual, intervenciones, resultados, estudios, evaluaciones, áreas, concentración, brechas, panorama, revisiones, sector, subsector, programas, Mapas CONEVAL, conocimiento"
    });
    this.meta.addTag({
      "name": "language",
      "content": "ES-MX"
    })
    this.meta.addTag({
      "name": "robots",
      "content": "index, follow"
    })
    this.meta.addTag({
      "name": "charset",
      "content": "UTF-8"
    })


    /*if(this.isBrowser){
      console.log('voy por icon');
      const link: HTMLLinkElement = this.renderer.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = 'https://sistemas.coneval.org.mx/conf/assets/favicon.ico';

      const links = document.querySelectorAll("link[rel*='icon']");
      links.forEach(link => link.parentNode?.removeChild(link));

      const head = this.renderer.selectRootElement('head', true);
      this.renderer.appendChild(head, link);
    }*/

    // localStorage.setItem('Versión',packageJson.version);
    // console.log(packageJson.version);
    // (window as any).myVariable = packageJson.version;
    this.checkVersion();
  }


  cargaGA() {
    return new Promise((resolve, reject) => {
      let body = document.body;
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = '';
      script.src = this.ga;
      script.onload = () => {
        resolve({ loaded: true, status: 'Loaded' });
      };
      script.onerror = (error: any) => resolve({ loaded: false, status: 'Loaded' });
      script.async = true;
      script.defer = true;
      body.appendChild(script);
    });
  }

  consultarTags() {
    this.servicio.getInformacion().subscribe(
      res => {
        this.tags = res.gmbe?.metas;
        this.ga = res.gmbe?.ga?.url;
          this.addTags();
      })
  }

  addTags() {
    this.tags.forEach((tg: { name: any; content: any; }) => {
      this.meta.addTag({ name: tg.name, content: tg.content });
    });
  }

  checkVersion() {
    const storedVersion = this.storage.getItem('Versión'); 
    const currentVersion = this.version; 
    
    console.log('Versión almacenada en localStorage:', storedVersion); 
    console.log('Versión actual de la aplicación:', currentVersion);   
    
    //console.log('Datos en localStorage antes de cualquier acción:', localStorage);
  
    if (storedVersion && storedVersion !== currentVersion) {
      console.log('Nueva versión detectada. Procediendo a limpiar localStorage y recargar...');
      
      console.log('Cambio de versión detectado: ', storedVersion, ' -> ', currentVersion);
      
      this.storage.clear();
      window.location.reload();
    } else {
      console.log('Las versiones coinciden. No se realizará ninguna acción.');
    }

    this.storage.setItem('Versión', currentVersion);

    console.log('Versión guardada en localStorage:', this.storage.getItem('Versión'));
  }
  
  
}
