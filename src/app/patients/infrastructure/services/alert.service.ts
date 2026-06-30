import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AlertResource {
  id: number;
  type: string;
  description: string;
  isRead: boolean;
  userId: number;
  patientId: number;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private http = inject(HttpClient);
  private url = `${environment.platformProviderApiBaseUrl}api/v1/alerts`;

  create(alert: Omit<AlertResource, 'id'>): Observable<AlertResource> {
    return this.http.post<AlertResource>(this.url, alert);
  }
}
