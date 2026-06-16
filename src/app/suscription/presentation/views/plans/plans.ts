import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionFacadeService } from '../../../application/services/subscription-facade.service';
import { Plan, Subscription } from '../../../domain/model/plan.entity';
import { PlanCard } from '../../components/plan-card/plan-card';
import { CurrentUserService } from '../../../infrastructure/services/current-user.service';
import { BehaviorSubject, Observable, combineLatest, map, shareReplay, switchMap } from 'rxjs';

type PlansViewModel = {
  activeSubscription: Subscription | null;
  currentPlan: Plan | null;
  recommendedPlanName: string | null;
  currentPlans: Plan[];
  explorePlans: Plan[];
};

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, TranslatePipe, PlanCard],
  templateUrl: './plans.html',
  styleUrls: ['./plans.css'],
})
export class Plans {
  private facade = inject(SubscriptionFacadeService);
  private currentUserService = inject(CurrentUserService);

  public activeTab: 'current' | 'explore' = 'current';
  public readonly changing = signal(false);
  public readonly changeSuccess = signal(false);
  public readonly changeError = signal(false);

  private readonly planPriority: Record<string, number> = {
    basic: 1,
    silver: 2,
    gold: 3,
  };

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  private readonly currentUser$ = this.currentUserService.getCurrentUser().pipe(shareReplay(1));
  private readonly subscriptions$ = this.refresh$.pipe(
    switchMap(() => this.facade.getActiveSubscriptions()),
    shareReplay(1),
  );

  public readonly pageData$: Observable<PlansViewModel> = combineLatest([
    this.currentUser$,
    this.subscriptions$,
  ] as const).pipe(
    map(([user, subscriptions]) => {
      const currentUserId = (user as any)?.id ?? 1;

      const activeSubscription =
        (subscriptions as Subscription[]).find(
          (sub: Subscription) => sub.userId === currentUserId && sub.status === 'ACTIVE',
        ) ?? null;

      const currentPlan = activeSubscription
        ? this.plans.find(
            (plan) => plan.name.toLowerCase() === activeSubscription.plan.toLowerCase(),
          ) ?? null
        : null;

      const recommendedPlanName = this.getRecommendedPlanName(currentPlan?.name ?? null);

      return {
        activeSubscription,
        currentPlan,
        recommendedPlanName,
        currentPlans: currentPlan ? [currentPlan] : [],
        explorePlans: this.plans,
      } satisfies PlansViewModel;
    }),
    shareReplay(1),
  );

  public isRecommendedPlan(plan: Plan, recommendedPlanName: string | null): boolean {
    return !!recommendedPlanName && plan.name.toLowerCase() === recommendedPlanName.toLowerCase();
  }

  public plans: Plan[] = [
    {
      name: 'Basic',
      price: '0.00',
      description: 'plans.desc_basic',
      features: [
        'plans.feat_1_patient',
        'plans.feat_realtime',
        'plans.feat_history_24h',
        'plans.feat_basic_alerts',
      ],
      buttonText: 'plans.btn_basic',
      isPopular: false,
    },
    {
      name: 'Silver',
      price: '15.50',
      description: 'plans.desc_silver',
      features: [
        'plans.feat_3_patients',
        'plans.feat_realtime',
        'plans.feat_history_7d',
        'plans.feat_custom_alerts',
        'plans.feat_priority_support',
      ],
      buttonText: 'plans.btn_silver',
      isPopular: true,
    },
    {
      name: 'Gold',
      price: '29.99',
      description: 'plans.desc_gold',
      features: [
        'plans.feat_unlimited_patients',
        'plans.feat_realtime',
        'plans.feat_history_full',
        'plans.feat_advanced_alerts',
        'plans.feat_support_247',
        'plans.feat_pdf',
      ],
      buttonText: 'plans.btn_gold',
      isPopular: false,
    },
  ];

  onSelectPlan(plan: Plan, activeSubscription: Subscription | null): void {
    if (!activeSubscription) return;
    this.changing.set(true);
    this.changeSuccess.set(false);
    this.changeError.set(false);

    this.facade.changePlan(activeSubscription.id, plan.name, parseFloat(plan.price)).subscribe({
      next: () => {
        this.changing.set(false);
        this.changeSuccess.set(true);
        this.refresh$.next();
        setTimeout(() => this.changeSuccess.set(false), 3000);
      },
      error: () => {
        this.changing.set(false);
        this.changeError.set(true);
        setTimeout(() => this.changeError.set(false), 3000);
      },
    });
  }

  private getRecommendedPlanName(currentPlanName: string | null): string | null {
    if (!currentPlanName) return null;

    const currentPriority = this.planPriority[currentPlanName.toLowerCase()] ?? 0;
    const nextPlan = this.plans.find(
      (plan) => (this.planPriority[plan.name.toLowerCase()] ?? 0) > currentPriority,
    );

    return nextPlan?.name ?? null;
  }

  switchTab(tab: 'current' | 'explore'): void {
    this.activeTab = tab;
  }
}
