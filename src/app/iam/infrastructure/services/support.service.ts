import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SupportTicket {
  id?: number;
  subject: string;
  message: string;
  status?: string;
  users_id: number;
}

@Injectable({ providedIn: 'root' })
export class SupportService {
  private http = inject(HttpClient);
  private base = environment.platformProviderApiBaseUrl;

  getTicketsByUser(userId: number): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.base}api/v1/support_tickets?users_id=${userId}`);
  }

  createTicket(ticket: SupportTicket): Observable<SupportTicket> {
    return this.http.post<SupportTicket>(`${this.base}api/v1/support_tickets`, ticket);
  }
}
