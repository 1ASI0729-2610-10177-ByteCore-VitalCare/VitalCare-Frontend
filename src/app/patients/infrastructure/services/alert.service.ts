import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AlertResource {
  id: number;
  type: string;
  description: string;
  created_at: string;
  is_read: number;
  users_id: number;
  patients_id: number;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private http = inject(HttpClient);
  private url = `${environment.platformProviderApiBaseUrl}alerts`;

  create(alert: Omit<AlertResource, 'id'>): Observable<AlertResource> {
    return this.http.post<AlertResource>(this.url, { id: Date.now(), ...alert });
  }
}
