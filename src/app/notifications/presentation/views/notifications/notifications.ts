import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Location } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { NotificationService } from '../../../infrastructure/notification.service';
import { NotificationStoreService } from '../../../infrastructure/notification-store.service';
import { Notification } from '../../../domain/notification';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatButton,
    MatIcon,
    MatTooltip,
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  notifications = signal<Notification[]>([]);
  selectedDescription = signal<string | null>(null);

  private router = inject(Router);

  constructor(
    private notificationService: NotificationService,
    private notificationStore: NotificationStoreService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getAll().subscribe({
      next: (data) => this.mergeNotifications(data),
      error: () => this.mergeNotifications([]),
    });
  }

  private mergeNotifications(remote: Notification[]): void {
    const local = this.notificationStore.notifications$();
    const combined = [...local, ...remote];
    this.notifications.set(combined);
  }

  showDescription(descripcion: string): void {
    this.selectedDescription.set(descripcion);
  }

  goToPatient(patientId?: number): void {
    if (patientId != null) {
      this.router.navigate(['/home/patients'], { queryParams: { patientId } });
    }
  }

  goBack(): void {
    this.location.back();
  }
}