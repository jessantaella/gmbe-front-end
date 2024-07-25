import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { faLock, faUser, faTimes } from "@fortawesome/free-solid-svg-icons";
import { TitulosService } from "src/app/services/titulos.services";
import { NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import * as CryptoJS from "crypto-js";
import { StorageService } from "src/app/services/storage-service.service";
import { CifradoService } from "src/app/services/cifrado.service";
declare var swal: any;

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  faLock = faLock;
  faUser = faUser;
  faTimes = faTimes;
  loginForm!: FormGroup;
  textoBienvenida =
    "Bienvenido al Sistema para la Generación de Mapas de Brechas de Evidencia (GMBE)";

  constructor(
    private titulos: TitulosService,
    private fb: FormBuilder,
    config: NgbModalConfig,
    private router: Router,
    private auth: AuthService,
    private storage: StorageService,
    private cifrado:CifradoService,
  ) {
    this.titulos.changeBienvenida(this.textoBienvenida);

    config.backdrop = "static";
    config.keyboard = false;

    this.loginForm = this.fb.group({
      username: [""],
      password: [""],
    });
  }


  ngOnInit(): void {
    if(this.storage.getItem('usr') !== null){
      this.router.navigate(['/inicio']);
    }
  }

  loguear() {
    const datoOriginal = this.loginForm.get("password")?.value;
    const claveDefinida = "D3Vz&;/)1j,;Zh!C";

    // Convertir la clave definida a un objeto WordArray
    const clave = CryptoJS.enc.Utf8.parse(claveDefinida);

    // Generar un vector de inicialización (IV) aleatorio para AES-GCM
    const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes para AES-128

    // Convertir el dato original a un objeto WordArray
    const datoOriginalWordArray = CryptoJS.enc.Utf8.parse(datoOriginal);

    // Cifrar el dato original utilizando AES-GCM con la clave definida
    const cifrado = CryptoJS.AES.encrypt(datoOriginalWordArray, clave, {
      iv: iv,
    });

    // Obtener el dato cifrado y el IV en formato base64
    const datoCifradoBase64 = cifrado.ciphertext.toString(CryptoJS.enc.Base64);
    const ivBase64 = cifrado.iv.toString(CryptoJS.enc.Base64);

    this.auth
      .validarAcceso(
        this.loginForm.get("username")?.value,
        datoCifradoBase64,
        ivBase64
      )
      .subscribe((res) => {
        console.log(res);
        if (res.usuarioAutenticado?.activo === true) {
          if (res.token) {
            this.router.navigate(["/inicio"]);
            this.storage.setItem("token-gmbe",this.cifrado.cifrar(res.token.token));
            this.storage.setItem("usr",this.cifrado.cifrar(JSON.stringify(res.usuarioAutenticado)));
          } else if (res.mensaje === "Usuario no encontrado en el sistema") {
            swal.fire(
              "",
              "No cuentas con acceso al sistema, favor de contactar al administrador",
              "error"
            );
            this.router.navigate(["/login"]);
          } else {
            swal.fire(
              "",
              "Usuario o contraseña ingresados son incorrectos",
              "error"
            );
            this.router.navigate(["/login"]);
          }
        } else {
          swal.fire(
            "",
            "Usuario o contraseña incorrectos",
            "error"
          );
          this.router.navigate(["/login"]);
        }
      },
    err=>{
      swal.fire(
        "",
        "No cuentas con acceso al sistema, favor de contactar al administrador",
        "error"
      );

    });
  }
}
