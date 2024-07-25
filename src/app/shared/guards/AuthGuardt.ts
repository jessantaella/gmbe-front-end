import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage-service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private storage: StorageService, private router: Router) {}

  canActivate(): boolean {
    if (this.storage.getItem('usr') !== null) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
