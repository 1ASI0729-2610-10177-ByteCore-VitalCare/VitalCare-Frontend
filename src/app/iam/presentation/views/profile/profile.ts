import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  UserProfileService,
  UserProfile,
  UserPreferences,
  UserSubscription,
} from '../../../infrastructure/services/user-profile.service';

interface ProfileViewModel {
  user: UserProfile;
  preferences: UserPreferences | null;
  subscription: UserSubscription | null;
}

const CURRENT_USER_ID = 1;

const LANGUAGE_LABELS: Record<string, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  pt: 'Português',
};

const FONT_SIZE_LABELS: Record<string, string> = {
  SMALL: 'Pequeño',
  MEDIUM: 'Mediano',
  LARGE: 'Grande',
};

const THEME_LABELS: Record<string, string> = {
  DARK: 'Oscuro',
  LIGHT: 'Claro',
  BLUE: 'Azul',
};

const PLAN_COLORS: Record<string, string> = {
  GOLD: '#f9a825',
  SILVER: '#78909c',
  FREE: '#4caf50',
  BASIC: '#4caf50',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#4caf50',
  EXPIRED: '#f44336',
  CANCELED: '#9e9e9e',
  PENDING: '#ff9800',
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private profileService = inject(UserProfileService);

  readonly vm = signal<ProfileViewModel | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  ngOnInit(): void {
    combineLatest([
      this.profileService.getUser(CURRENT_USER_ID),
      this.profileService.getPreferences(CURRENT_USER_ID),
      this.profileService.getSubscription(CURRENT_USER_ID),
    ])
      .pipe(
        map(([user, prefs, subs]) => ({
          user,
          preferences: prefs[0] ?? null,
          subscription: subs.find(s => s.status === 'ACTIVE') ?? subs[0] ?? null,
        })),
      )
      .subscribe({
        next: data => {
          this.vm.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  languageLabel(code: string): string {
    return LANGUAGE_LABELS[code] ?? code.toUpperCase();
  }

  fontSizeLabel(size: string): string {
    return FONT_SIZE_LABELS[size] ?? size;
  }

  themeLabel(theme: string): string {
    return THEME_LABELS[theme] ?? theme;
  }

  planColor(plan: string): string {
    return PLAN_COLORS[plan.toUpperCase()] ?? '#0C7AB5';
  }

  statusColor(status: string): string {
    return STATUS_COLORS[status.toUpperCase()] ?? '#64748b';
  }

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  }

  memberSince(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
