import { Injectable, signal } from '@angular/core';

export type FontSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type BackgroundColor = 'DEFAULT' | 'BLUE' | 'GREEN' | 'YELLOW';

const FONT_KEY = 'vital-pref-font';
const BG_KEY = 'vital-pref-bg';

const BG_COLORS: Record<BackgroundColor, string> = {
  DEFAULT: '',
  BLUE: '#e3f2fd',
  GREEN: '#e8f5e9',
  YELLOW: '#fffde7',
};

/**
 * Preferencias visuales globales (tamaño de letra y color de fondo).
 * Se aplican al documento y se persisten en localStorage. Vive en shared
 * porque no pertenece a ningún bounded context.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly fontSize = signal<FontSize>(this.readFont());
  readonly backgroundColor = signal<BackgroundColor>(this.readBg());

  /** Aplica las preferencias guardadas al documento. Llamar al iniciar la app. */
  init(): void {
    this.applyFont(this.fontSize());
    this.applyBackground(this.backgroundColor());
  }

  setFontSize(size: FontSize): void {
    this.fontSize.set(size);
    localStorage.setItem(FONT_KEY, size);
    this.applyFont(size);
  }

  setBackgroundColor(color: BackgroundColor): void {
    this.backgroundColor.set(color);
    localStorage.setItem(BG_KEY, color);
    this.applyBackground(color);
  }

  private applyFont(size: FontSize): void {
    const body = document.body;
    body.classList.remove('vc-font-small', 'vc-font-medium', 'vc-font-large');
    body.classList.add(`vc-font-${size.toLowerCase()}`);
  }

  private applyBackground(color: BackgroundColor): void {
    const value = BG_COLORS[color];
    if (value) {
      document.body.style.setProperty('background-color', value, 'important');
    } else {
      document.body.style.removeProperty('background-color');
    }
  }

  private readFont(): FontSize {
    const v = localStorage.getItem(FONT_KEY);
    return v === 'SMALL' || v === 'LARGE' ? v : 'MEDIUM';
  }

  private readBg(): BackgroundColor {
    const v = localStorage.getItem(BG_KEY);
    return v === 'BLUE' || v === 'GREEN' || v === 'YELLOW' ? v : 'DEFAULT';
  }
}
