import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Location } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationService } from '../../../infrastructure/notification.service';
import { NotificationStoreService } from '../../../application/services/notification-store.service';
import { Notification } from '../../../domain/notification';
import { AuthService } from '../../../../iam/application/services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatButton, MatIcon, TranslatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  notifications = signal<Notification[]>([]);
  selectedDescription = signal<string | null>(null);
  showClearConfirm = signal(false);

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
    // Dedupe by content: the same alert lives in the local store and the backend
    // with different ids, so keying by id would show it twice.
    const seen = new Set(remote.map(n => `${n.patientId}|${n.descripcion}`));
    const localOnly = local.filter(n => !seen.has(`${n.patientId}|${n.descripcion}`));
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
    this.showClearConfirm.set(true);
  }

  cancelClearAll(): void {
    this.showClearConfirm.set(false);
  }

  confirmClearAll(): void {
    const current = this.notifications();
    this.notificationStore.clear();
    this.notifications.set([]);
    this.clearAlertRegistrations();
    for (const n of current) {
      if (n.id) {
        this.notificationService.deleteById(n.id).subscribe();
      }
    }
    this.showClearConfirm.set(false);
  }

  /** Removes the per-alert dedup markers so cleared alerts can be registered again. */
  private clearAlertRegistrations(): void {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('vital-alert-registered:')) {
        sessionStorage.removeItem(key);
      }
    }
  }

  goBack(): void {
    this.location.back();
  }
}
