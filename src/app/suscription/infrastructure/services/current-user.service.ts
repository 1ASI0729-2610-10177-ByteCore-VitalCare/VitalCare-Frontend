import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private http = inject(HttpClient);

  private baseUrl = `${environment.platformProviderApiBaseUrl}users`;

  getCurrentUser(): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/1`);
  }
}
