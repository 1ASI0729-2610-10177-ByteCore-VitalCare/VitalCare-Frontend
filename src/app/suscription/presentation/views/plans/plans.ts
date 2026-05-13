import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionFacadeService } from '../../../application/services/subscription-facade.service';
import { Plan, Subscription } from '../../../domain/model/plan.entity';
import { PlanCard } from '../../components/plan-card/plan-card';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, PlanCard],
  templateUrl: './plans.html',
  styleUrls: ['./plans.css'],
})
export class Plans implements OnInit {
  private facade = inject(SubscriptionFacadeService);

  public activeTab: 'current' | 'explore' = 'current';

  private currentUserId: number = 1;
  public activeSubscription: Subscription | null = null;

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

  ngOnInit(): void {
    this.checkUserSubscription();
  }

  checkUserSubscription(): void {
    this.facade.getActiveSubscriptions().subscribe({
      next: (data) => {
        console.log('Data cruda recibida en el componente:', data);

        const mySub = data.find((sub) => {
          console.log(
            `Comparando: userId en data (${sub.userId}) === mi ID (${this.currentUserId})`,
          );
          return sub.userId === this.currentUserId && sub.status === 'ACTIVE';
        });

        console.log('Resultado del filtro:', mySub);

        this.activeSubscription = mySub ? mySub : null;

        if (!this.activeSubscription) {
          this.activeTab = 'explore';
        }
      },
      error: (err) => console.error('Error cargando suscripciones', err),
    });
  }

  switchTab(tab: 'current' | 'explore'): void {
    this.activeTab = tab;
  }
}
