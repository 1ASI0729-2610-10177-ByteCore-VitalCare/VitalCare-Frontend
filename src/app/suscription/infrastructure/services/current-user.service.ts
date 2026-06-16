import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../iam/application/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrl = `${environment.platformProviderApiBaseUrl}users`;

  getCurrentUser(): Observable<unknown> {
    const userId = this.authService.currentUser()?.id ?? 1;
    return this.http.get<unknown>(`${this.baseUrl}/${userId}`);
  }
}
