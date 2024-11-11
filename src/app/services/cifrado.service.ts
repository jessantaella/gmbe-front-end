import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CifradoService {
  private claveSecreta: string = 'gmbe-front-end'; // Debes usar una clave secreta segura

  constructor() {}

  cifrar(datos: string): string {
    return CryptoJS.AES.encrypt(datos, this.claveSecreta).toString();
  }

  descifrar(datosCifrados: string): string {
    const bytes = CryptoJS.AES.decrypt(datosCifrados, this.claveSecreta);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
