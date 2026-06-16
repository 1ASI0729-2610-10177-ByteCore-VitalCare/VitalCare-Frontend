import { Injectable, inject } from '@angular/core';
import { SubscriptionService } from '../../infrastructure/services/subscription.service';
import { Subscription } from '../../domain/model/plan.entity';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionFacadeService {
  private subscriptionApi = inject(SubscriptionService);

  getActiveSubscriptions(): Observable<Subscription[]> {
    return this.subscriptionApi.getSubscriptions();
  }

  changePlan(subscriptionId: number, planName: string, price: number): Observable<Subscription> {
    return this.subscriptionApi.updateSubscriptionPlan(subscriptionId, planName.toUpperCase(), price);
  }
}
