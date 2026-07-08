import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionFacadeService } from '../../../application/services/subscription-facade.service';
import { Plan, Subscription } from '../../../domain/model/plan.entity';
import { PlanCard } from '../../components/plan-card/plan-card';
import { CurrentUserService } from '../../../infrastructure/services/current-user.service';
import { AuthService } from '../../../../iam/application/services/auth.service';
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
  private authService = inject(AuthService);

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
  private readonly subscriptions$ = combineLatest([this.currentUser$, this.refresh$]).pipe(
    switchMap(([user]) => {
      const userId = (user as any)?.id;
      if (!userId) return [];
      return this.facade.getSubscriptionsByUser(userId);
    }),
    shareReplay(1),
  );

  public readonly pageData$: Observable<PlansViewModel> = combineLatest([
    this.currentUser$,
    this.subscriptions$,
  ] as const).pipe(
    map(([user, subscriptions]) => {
      const activeSubscription =
        (subscriptions as Subscription[]).find(
          (sub: Subscription) => sub.status === 'ACTIVE',
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
        'plans.feat_critical_alerts',
      ],
      buttonText: 'plans.btn_basic',
      isPopular: false,
    },
    {
      name: 'Silver',
      price: '15.50',
      description: 'plans.desc_silver',
      features: [
        'plans.feat_5_patients',
        'plans.feat_realtime',
        'plans.feat_warning_alerts',
        'plans.feat_location',
        'plans.feat_history',
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
        'plans.feat_warning_alerts',
        'plans.feat_location',
        'plans.feat_history',
        'plans.feat_home_banner',
        'plans.feat_priority_support',
      ],
      buttonText: 'plans.btn_gold',
      isPopular: false,
    },
  ];

  onSelectPlan(plan: Plan, activeSubscription: Subscription | null): void {
    if (activeSubscription) {
      const currentPriority = this.planPriority[activeSubscription.plan.toLowerCase()] ?? 0;
      const targetPriority = this.planPriority[plan.name.toLowerCase()] ?? 0;
      if (targetPriority < currentPriority &&
          !confirm(`Vas a bajar tu plan a ${plan.name}. Podrías perder funciones de tu plan actual. ¿Deseas continuar?`)) {
        return;
      }
    }
    this.changing.set(true);
    this.changeSuccess.set(false);
    this.changeError.set(false);

    const price = parseFloat(plan.price);
    const userId = this.authService.currentUser()?.id;
    if (!userId && !activeSubscription) {
      this.changing.set(false);
      this.changeError.set(true);
      setTimeout(() => this.changeError.set(false), 3000);
      return;
    }

    const action$ = activeSubscription
      ? this.facade.changePlan(activeSubscription.id, plan.name, price)
      : this.facade.createPlan(userId!, plan.name, price);

    action$.subscribe({
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
