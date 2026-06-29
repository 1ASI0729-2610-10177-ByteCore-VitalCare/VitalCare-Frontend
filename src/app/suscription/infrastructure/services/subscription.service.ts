import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subscription } from '../../domain/model/plan.entity';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private http = inject(HttpClient);

  private baseUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderPlansEndpointPath}`;

  updateSubscriptionPlan(id: number, plan: string, price: number): Observable<Subscription> {
    return this.http.patch<Subscription>(`${this.baseUrl}/${id}`, { plan, price });
  }

  createSubscription(userId: number, plan: string, price: number): Observable<Subscription> {
    const today = new Date();
    const end = new Date(today);
    end.setFullYear(end.getFullYear() + 1);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    return this.http.post<Subscription>(this.baseUrl, {
      userId,
      plan,
      price,
      startDate: fmt(today),
      endDate: fmt(end),
    });
  }

  getSubscriptionsByUser(userId: number): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.baseUrl}?users_id=${userId}`);
  }
}
