import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionFacadeService } from '../../../application/services/subscription-facade.service';
import { Plan, Subscription } from '../../../domain/model/plan.entity';
import { PlanCard } from '../../components/plan-card/plan-card';
import { CurrentUserService } from '../../../infrastructure/services/current-user.service';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';

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
  imports: [CommonModule, PlanCard],
  templateUrl: './plans.html',
  styleUrls: ['./plans.css'],
})
export class Plans {
  private facade = inject(SubscriptionFacadeService);
  private currentUserService = inject(CurrentUserService);

  public activeTab: 'current' | 'explore' = 'current';

  private readonly planPriority: Record<string, number> = {
    basic: 1,
    silver: 2,
    gold: 3,
  };

  private readonly currentUser$ = this.currentUserService.getCurrentUser().pipe(shareReplay(1));
  private readonly subscriptions$ = this.facade.getActiveSubscriptions().pipe(shareReplay(1));

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
      description: 'Ideal para empezar el monitoreo básico de salud.',
      features: [
        '1 Paciente',
        'Métricas en tiempo real',
        'Historial de 24 horas',
        'Alertas básicas',
      ],
      buttonText: 'Comenzar',
      isPopular: false,
    },
    {
      name: 'Silver',
      price: '15.50',
      description: 'Perfecto para familias pequeñas que necesitan control.',
      features: [
        'Hasta 3 pacientes',
        'Métricas en tiempo real',
        'Historial de 7 días',
        'Alertas personalizadas',
        'Soporte prioritario',
      ],
      buttonText: 'Cambiar a Silver',
      isPopular: true,
    },
    {
      name: 'Gold',
      price: '29.99',
      description: 'Monitoreo total y avanzado sin restricciones.',
      features: [
        'Pacientes ilimitados',
        'Métricas en tiempo real',
        'Historial completo',
        'Alertas avanzadas',
        'Soporte 24/7',
        'Reportes PDF mensuales',
      ],
      buttonText: 'Cambiar a Gold',
      isPopular: false,
    },
  ];

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
