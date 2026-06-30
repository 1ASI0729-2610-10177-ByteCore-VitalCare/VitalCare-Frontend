import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../domain/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.platformProviderApiBaseUrl}api/v1/notifications`;

  constructor(private http: HttpClient) {}

  getAll(userId?: number): Observable<Notification[]> {
    const url = userId ? `${this.apiUrl}?users_id=${userId}` : this.apiUrl;
    return this.http.get<Notification[]>(url);
  }

  create(notification: Omit<Notification, 'id'>): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
