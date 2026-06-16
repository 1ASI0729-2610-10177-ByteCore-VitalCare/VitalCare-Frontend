import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  UserProfileService,
  UserProfile,
  UserPreferences,
  UserSubscription,
} from '../../../infrastructure/services/user-profile.service';
import { AuthService } from '../../../application/services/auth.service';

interface ProfileViewModel {
  user: UserProfile;
  preferences: UserPreferences | null;
  subscription: UserSubscription | null;
}


const LANGUAGE_KEY: Record<string, string> = {
  es: 'profile.lang_es',
  en: 'profile.lang_en',
  fr: 'profile.lang_fr',
  pt: 'profile.lang_pt',
};

const FONT_SIZE_KEY: Record<string, string> = {
  SMALL: 'profile.font_small',
  MEDIUM: 'profile.font_medium',
  LARGE: 'profile.font_large',
};

const THEME_KEY: Record<string, string> = {
  DARK: 'profile.theme_dark',
  LIGHT: 'profile.theme_light',
  BLUE: 'profile.theme_blue',
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
  imports: [CommonModule, TranslatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private profileService = inject(UserProfileService);
  private authService = inject(AuthService);

  readonly vm = signal<ProfileViewModel | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  ngOnInit(): void {
    const userId = this.authService.currentUser()?.id ?? 1;

    combineLatest([
      this.profileService.getUser(userId),
      this.profileService.getPreferences(userId),
      this.profileService.getSubscription(userId),
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

  languageKey(code: string): string {
    return LANGUAGE_KEY[code] ?? 'profile.lang_en';
  }

  fontSizeKey(size: string): string {
    return FONT_SIZE_KEY[size] ?? 'profile.font_medium';
  }

  themeKey(theme: string): string {
    return THEME_KEY[theme] ?? 'profile.theme_light';
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
