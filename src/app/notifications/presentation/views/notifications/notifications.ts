import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Location } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationService } from '../../../infrastructure/notification.service';
import { NotificationStoreService } from '../../../infrastructure/notification-store.service';
import { Notification } from '../../../domain/notification';
import { AuthService } from '../../../../iam/application/services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatButton, MatIcon, MatTooltip, TranslatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  notifications = signal<Notification[]>([]);
  selectedDescription = signal<string | null>(null);

  private router = inject(Router);
  private authService = inject(AuthService);

  constructor(
    private notificationService: NotificationService,
    private notificationStore: NotificationStoreService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const userId = this.authService.currentUser()?.id ?? 1;
    this.notificationService.getAll(userId).subscribe({
      next: (data) => this.mergeNotifications(data),
      error: () => this.mergeNotifications([]),
    });
  }

  private mergeNotifications(remote: Notification[]): void {
    const local = this.notificationStore.notifications$();
    const remoteIds = new Set(remote.map(n => n.id));
    const localOnly = local.filter(n => !remoteIds.has(n.id));
    this.notifications.set([...localOnly, ...remote]);
  }

  showDescription(descripcion: string): void {
    this.selectedDescription.set(descripcion);
  }

  goToPatient(patientId?: number): void {
    if (patientId != null) {
      this.router.navigate(['/home/patients'], { queryParams: { patientId } });
    }
  }

  clearAll(): void {
    if (!confirm('¿Borrar todo el historial de notificaciones? Esta acción no se puede deshacer.')) return;
    const current = this.notifications();
    this.notificationStore.clear();
    this.notifications.set([]);
    sessionStorage.removeItem('vital-alerts-last-registered');
    for (const n of current) {
      if (n.id) {
        this.notificationService.deleteById(n.id).subscribe();
      }
    }
  }

  goBack(): void {
    this.location.back();
  }
}
