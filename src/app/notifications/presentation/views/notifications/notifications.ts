import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NotificationService } from '../../../infrastructure/notification.service';
import { Notification } from '../../../domain/notification';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbar,
    MatToolbarRow,
    MatButton,
    MatIcon,
    MatTooltip,
    RouterLink
  ],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  notifications = signal<Notification[]>([]);
  selectedDescription = signal<string | null>(null);

  navOptions = [
    { link: '/home', label: 'Home' },
    { link: '/patients', label: 'Pacientes' },
    { link: '/plans', label: 'Ver Plan' },
    { link: '/support', label: 'Soporte' },
  ];

  constructor(
    private notificationService: NotificationService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getAll().subscribe({
      next: (data) => this.notifications.set(data),
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  showDescription(descripcion: string): void {
    this.selectedDescription.set(descripcion);
  }

  goBack(): void {
    this.location.back();
  }
}