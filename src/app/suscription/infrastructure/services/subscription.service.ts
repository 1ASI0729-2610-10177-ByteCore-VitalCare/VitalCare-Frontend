import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
      id: Date.now(),
      plan,
      price,
      start_date: fmt(today),
      end_date: fmt(end),
      status: 'ACTIVE',
      users_id: userId,
    });
  }

  getSubscriptions(): Observable<Subscription[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((responses) =>
        responses.map(
          (data) =>
            ({
              id: data.id,
              plan: data.plan,
              price: data.price,
              startDate: data.start_date,
              endDate: data.end_date,
              status: data.status,
              userId: data.users_id,
            }) as Subscription,
        ),
      ),
    );
  }
}
