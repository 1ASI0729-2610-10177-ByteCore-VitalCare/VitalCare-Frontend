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
