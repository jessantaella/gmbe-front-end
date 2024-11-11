/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';
/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { AppServerModule } from './src/main.server';
import { environment } from './src/environments/environment'; // Importa el entorno aquí
import { enableProdMode } from '@angular/core';

//Compilado único



const cors = require("cors");
// Habilita el modo de producción si estás en producción
if (environment.production) {
  enableProdMode();
}

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();

  const distFolder = join(process.cwd(), '/GMBE/browser');  //Despliegue en servidor CONEVAL
  //const distFolder = join(process.cwd(), 'dist/GMBE/browser'); //LOCAL 
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/main/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule
  }));


  server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://qa.coneval.org.mx"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));




  // All regular routes use the Universal engine
  server.get('*',(req, res) => {
    //console.log(`APP_BASE_REF = ${APP_BASE_HREF}`);
    //console.log(`req.baseUrl = ${req.baseUrl}`); 
    const urlActual = req.protocol + '://' + req.get('host') + req.originalUrl;  //compilado unico
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl },  { provide: 'REQUEST_URL', useValue: urlActual }] });
  });

// Carga el archivo de entorno y lo hace accesible en toda la aplicación Express
  server.locals['environment'] = environment;
  console.log('server->',server.locals['environment'].servidor);

  /*server.all('*', function(req, res) {
    res.redirect(301,server.locals['environment'].servidor+'/GMBE');
  });*/


  return server;
}

function run(): void {
  //const port = process.env['PORT'] || 4000;
  const port = 4002;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';