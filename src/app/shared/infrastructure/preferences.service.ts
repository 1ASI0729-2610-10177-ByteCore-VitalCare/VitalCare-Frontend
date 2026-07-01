import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../iam/application/services/auth.service';

export type FontSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type BackgroundColor = 'DEFAULT' | 'BLUE' | 'GREEN' | 'YELLOW';

const FONT_KEY = 'vital-pref-font';
const BG_KEY = 'vital-pref-bg';

const BG_CLASSES: Record<BackgroundColor, string> = {
  DEFAULT: '',
  BLUE: 'vc-bg-blue',
  GREEN: 'vc-bg-green',
  YELLOW: 'vc-bg-yellow',
};

interface PreferencesPayload {
  users_id: number;
  language: string;
  fontSize: string;
  backgroundColor: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

/**
 * Preferencias visuales globales (tamaño de letra y color de fondo).
 * Se aplican al documento, se cachean en localStorage para aplicarlas al instante
 * y se persisten en el backend (user_preferences) para el usuario autenticado.
 * Vive en shared porque no pertenece a ningún bounded context.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = environment.platformProviderApiBaseUrl;

  readonly fontSize = signal<FontSize>(this.readFont());
  readonly backgroundColor = signal<BackgroundColor>(this.readBg());

  // Se conservan para reenviar el payload completo en cada upsert.
  private language = 'es';
  private emailNotifications = true;
  private pushNotifications = true;

  /** Aplica las preferencias cacheadas al documento. Llamar al arrancar la app. */
  init(): void {
    this.applyFont(this.fontSize());
    this.applyBackground(this.backgroundColor());
  }

  /** Carga las preferencias del backend para el usuario autenticado y las aplica. */
  loadForUser(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.http.get<PreferencesPayload>(`${this.base}api/v1/user_preferences?users_id=${userId}`)
      .pipe(catchError(() => of(null)))
      .subscribe(p => {
        if (!p) return;
        this.language = p.language ?? 'es';
        this.emailNotifications = p.emailNotifications ?? true;
        this.pushNotifications = p.pushNotifications ?? true;
        const fs = this.normalizeFont(p.fontSize);
        const bg = this.normalizeBg(p.backgroundColor);
        this.fontSize.set(fs);
        this.backgroundColor.set(bg);
        localStorage.setItem(FONT_KEY, fs);
        localStorage.setItem(BG_KEY, bg);
        this.applyFont(fs);
        this.applyBackground(bg);
      });
  }

  setFontSize(size: FontSize): void {
    this.fontSize.set(size);
    localStorage.setItem(FONT_KEY, size);
    this.applyFont(size);
    this.persist();
  }

  setBackgroundColor(color: BackgroundColor): void {
    this.backgroundColor.set(color);
    localStorage.setItem(BG_KEY, color);
    this.applyBackground(color);
    this.persist();
  }

  private persist(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    const payload: PreferencesPayload = {
      users_id: userId,
      language: this.language,
      fontSize: this.fontSize(),
      backgroundColor: this.backgroundColor(),
      emailNotifications: this.emailNotifications,
      pushNotifications: this.pushNotifications,
    };
    this.http.post(`${this.base}api/v1/user_preferences`, payload)
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  private applyFont(size: FontSize): void {
    const body = document.body;
    body.classList.remove('vc-font-small', 'vc-font-medium', 'vc-font-large');
    body.classList.add(`vc-font-${size.toLowerCase()}`);
  }

  private applyBackground(color: BackgroundColor): void {
    const body = document.body;
    body.classList.remove('vc-bg-blue', 'vc-bg-green', 'vc-bg-yellow');
    const cls = BG_CLASSES[color];
    if (cls) body.classList.add(cls);
  }

  private normalizeFont(v: string | null | undefined): FontSize {
    return v === 'SMALL' || v === 'LARGE' ? v : 'MEDIUM';
  }

  private normalizeBg(v: string | null | undefined): BackgroundColor {
    return v === 'BLUE' || v === 'GREEN' || v === 'YELLOW' ? v : 'DEFAULT';
  }

  private readFont(): FontSize {
    return this.normalizeFont(localStorage.getItem(FONT_KEY));
  }

  private readBg(): BackgroundColor {
    return this.normalizeBg(localStorage.getItem(BG_KEY));
  }
}
