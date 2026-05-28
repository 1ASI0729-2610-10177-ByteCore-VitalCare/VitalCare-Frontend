import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDivider } from '@angular/material/divider';
import { LanguageSwitcher } from '../../components/language-switcher/language-switcher';
import { environment } from '../../../../../environments/environment';

// ==================== DOMAIN ====================

interface NavOption {
  link: string;
  label: string;
  icon?: string;
}

interface User {
  id: number;
  name: string;
  created_at: string;
}

interface Subscription {
  id: number;
  plan: string;
  status: string;
  price: number;
}

interface Patient {
  id: number;
  name: string;
  gender: string;
}

interface Patch {
  id: number;
  patch_code: string;
  status: string;
}

interface Alert {
  id: number;
  type: string;
  is_read: number;
}

interface SupportTicket {
  idsupport_tickets: number;
  status: string;
}

interface KpiCard {
  title: string;
  value: number;
  icon: string;
  color: string;
}

interface StatBar {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface ChartSection {
  title: string;
  icon: string;
  bars: StatBar[];
}

interface DashboardStats {
  kpis: KpiCard[];
  charts: ChartSection[];
}

// ==================== APPLICATION ====================

function toStatBars<T extends object>(
  items: T[],
  key: keyof T,
  colorMap: Record<string, string>,
  labelMap?: Record<string, string>
): StatBar[] {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const val = String(item[key] ?? 'UNKNOWN');
    counts[val] = (counts[val] ?? 0) + 1;
  }
  const total = items.length || 1;
  return Object.entries(counts).map(([label, count]) => ({
    label: labelMap?.[label] ?? label,
    count,
    percentage: Math.round((count / total) * 100),
    color: colorMap[label] ?? '#607d8b',
  }));
}


function buildDashboardStats(data: {
  users: User[];
  subscriptions: Subscription[];
  patients: Patient[];
  patches: Patch[];
  alerts: Alert[];
  tickets: SupportTicket[];
}): DashboardStats {
  const { users, subscriptions, patients, patches, alerts, tickets } = data;

  return {
    kpis: [
      { title: 'home.kpi_users', value: users.length, icon: 'people', color: '#1976d2' },
      { title: 'home.kpi_patients', value: patients.length, icon: 'personal_injury', color: '#388e3c' },
      {
        title: 'home.kpi_active_subscriptions',
        value: subscriptions.filter(s => s.status === 'ACTIVE').length,
        icon: 'verified',
        color: '#f57c00',
      },
      {
        title: 'home.kpi_active_patches',
        value: patches.filter(p => p.status === 'ACTIVE').length,
        icon: 'sensors',
        color: '#7b1fa2',
      },
      {
        title: 'home.kpi_unread_alerts',
        value: alerts.filter(a => a.is_read === 0).length,
        icon: 'notifications_active',
        color: '#d32f2f',
      },
      {
        title: 'home.kpi_open_tickets',
        value: tickets.filter(t => t.status === 'OPEN').length,
        icon: 'support_agent',
        color: '#0288d1',
      },
    ],
    charts: [
      {
        title: 'home.chart_subscriptions_by_plan',
        icon: 'workspace_premium',
        bars: toStatBars(subscriptions, 'plan', {
          GOLD: '#f9a825', SILVER: '#78909c', FREE: '#4caf50',
        }),
      },
      {
        title: 'home.chart_subscription_status',
        icon: 'receipt_long',
        bars: toStatBars(subscriptions, 'status', {
          ACTIVE: '#4caf50', EXPIRED: '#f44336', CANCELED: '#9e9e9e', PENDING: '#ff9800',
        }, {
          ACTIVE: 'home.status_active',
          EXPIRED: 'home.status_expired',
          CANCELED: 'home.status_canceled',
          PENDING: 'home.status_pending'
        }),
      },
      {
        title: 'home.chart_patients_by_gender',
        icon: 'wc',
        bars: toStatBars(patients, 'gender', {
          MALE: '#1976d2', FEMALE: '#e91e63', OTHER: '#9c27b0',
        }, {
          MALE: 'home.gender_male',
          FEMALE: 'home.gender_female',
          OTHER: 'home.gender_other'
        }),
      },
      {
        title: 'home.chart_patch_status',
        icon: 'sensors',
        bars: toStatBars(patches, 'status', {
          ACTIVE: '#4caf50', INACTIVE: '#9e9e9e', LOW_BATTERY: '#ff9800', ERROR: '#f44336',
        }, {
          ACTIVE: 'home.status_active',
          INACTIVE: 'home.status_inactive',
          LOW_BATTERY: 'home.status_low_battery',
          ERROR: 'home.status_error'
        }),
      },
      {
        title: 'home.chart_alert_types',
        icon: 'warning_amber',
        bars: toStatBars(alerts, 'type', {
          CRITICAL: '#f44336', WARNING: '#ff9800', INFO: '#2196f3',
        }, {
          CRITICAL: 'home.alert_critical',
          WARNING: 'home.alert_warning',
          INFO: 'home.alert_info'
        }),
      },
      {
        title: 'home.chart_ticket_status',
        icon: 'support',
        bars: toStatBars(tickets, 'status', {
          OPEN: '#f44336', IN_PROGRESS: '#ff9800', CLOSED: '#4caf50',
        }, {
          OPEN: 'home.status_open',
          IN_PROGRESS: 'home.status_in_progress',
          CLOSED: 'home.status_closed'
        }),
      },
    ],
  };
}

// ==================== PRESENTATION ====================

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbar,
    MatToolbarRow,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatProgressSpinner,
    MatDivider,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TranslatePipe,
    LanguageSwitcher,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly navOptions = signal<NavOption[]>([
    { link: '/home', label: 'nav.home', icon: 'home' },
    { link: '/home/patients', label: 'nav.patients', icon: 'people' },
    { link: '/home/plans', label: 'nav.plans', icon: 'assignment' },
    { link: '/home/support', label: 'nav.support', icon: 'help' },
    { link: '/home/notification', label: 'nav.notifications', icon: 'notifications' },
  ]);

  readonly isHomeDashboard = signal(false);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly stats = signal<DashboardStats | null>(null);

  ngOnInit(): void {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(e => {
      this.isHomeDashboard.set(e.urlAfterRedirects.split('?')[0] === '/home');
    });

    this.isHomeDashboard.set(this.router.url.split('?')[0] === '/home');
    this.loadDashboard();
  }

  retry(): void {
    this.loadDashboard();
  }

  // ==================== INFRASTRUCTURE ====================

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    forkJoin({
      users: this.http.get<User[]>(`${environment.platformProviderVitalCareUsUsp}/users`),
      subscriptions: this.http.get<Subscription[]>(`${environment.platformProviderVitalCareSubPat}/subscriptions`),
      patients: this.http.get<Patient[]>(`${environment.platformProviderVitalCareSubPat}/patients`),
      patches: this.http.get<Patch[]>(`${environment.platformProviderVitalCarePatcVs}/patches`),
      alerts: this.http.get<Alert[]>(`${environment.platformProviderVitalCareAlSt}/alerts`),
      tickets: this.http.get<SupportTicket[]>(`${environment.platformProviderVitalCareAlSt}/support_tickets`),
    }).subscribe({
      next: data => {
        this.stats.set(buildDashboardStats(data));
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
