import { Injectable, inject } from '@angular/core';
import { SubscriptionService } from '../../infrastructure/services/subscription.service';
import { Subscription } from '../../domain/model/plan.entity';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionFacadeService {
  private subscriptionApi = inject(SubscriptionService);

  getSubscriptionsByUser(userId: number): Observable<Subscription[]> {
    return this.subscriptionApi.getSubscriptionsByUser(userId);
  }

  changePlan(subscriptionId: number, planName: string, price: number): Observable<Subscription> {
    return this.subscriptionApi.updateSubscriptionPlan(subscriptionId, planName.toUpperCase(), price);
  }

  createPlan(userId: number, planName: string, price: number): Observable<Subscription> {
    return this.subscriptionApi.createSubscription(userId, planName.toUpperCase(), price);
  }
}
