import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { LanguageSwitcher } from '../../components/language-switcher/language-switcher';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../iam/application/services/auth.service';

interface NavOption { link: string; label: string; icon?: string; }
interface Subscription { plan: string; status: string; price: number; endDate: string; userId: number; }
interface Patient { id: number; users_id: number; }
interface Patch { status: string; patients_id: number; }
interface Alert { isRead: number; userId: number; }
interface SupportTicket { status: string; users_id: number; }

export interface DashboardData {
  plan: string;
  planExpiry: string;
  patients: number;
  activePatches: number;
  unreadAlerts: number;
  openTickets: number;
}

function buildDashboard(userId: number, d: {
  subscriptions: Subscription[];
  patients: Patient[];
  patches: Patch[];
  alerts: Alert[];
  tickets: SupportTicket[];
}): DashboardData {
  const sub = d.subscriptions.find(s => s.userId === userId && s.status === 'ACTIVE') ?? null;
  const myPatients = d.patients.filter(p => p.users_id === userId);
  const myPatientIds = new Set(myPatients.map(p => p.id));
  return {
    plan: sub?.plan ?? '—',
    planExpiry: sub?.endDate ?? '—',
    patients: myPatients.length,
    activePatches: d.patches.filter(p => myPatientIds.has(p.patients_id) && p.status === 'ACTIVE').length,
    unreadAlerts: d.alerts.filter(a => a.userId === userId && a.isRead === 0).length,
    openTickets: d.tickets.filter(t => t.users_id === userId && t.status === 'OPEN').length,
  };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbar, MatToolbarRow,
    MatButton, MatIconButton,
    MatIcon, MatTooltip,
    MatProgressSpinner,
    RouterLink, RouterLinkActive, RouterOutlet,
    TranslatePipe, LanguageSwitcher,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

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
  readonly data = signal<DashboardData | null>(null);
  readonly currentUser = this.authService.currentUser;

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

  retry(): void { this.loadDashboard(); }
  logout(): void { this.authService.logout(); }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    const base = environment.platformProviderApiBaseUrl;
    const userId = this.authService.currentUser()?.id;
    if (!userId) { this.hasError.set(true); this.isLoading.set(false); return; }
    this.http.get<Patient[]>(`${base}api/v1/patients?users_id=${userId}`).pipe(
      switchMap(patients => {
        const patches$ = patients.length
          ? forkJoin(patients.map(p => this.http.get<Patch[]>(`${base}api/v1/patches?patients_id=${p.id}`)))
              .pipe(map(arrays => arrays.flat()))
          : of<Patch[]>([]);
        return forkJoin({
          subscriptions: this.http.get<Subscription[]>(`${base}api/v1/subscriptions?users_id=${userId}`),
          patients: of(patients),
          patches: patches$,
          alerts: this.http.get<Alert[]>(`${base}api/v1/alerts?userId=${userId}`),
          tickets: this.http.get<SupportTicket[]>(`${base}api/v1/support_tickets?users_id=${userId}`),
        });
      }),
    ).subscribe({
      next: d => {
        this.data.set(buildDashboard(userId, d));
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
