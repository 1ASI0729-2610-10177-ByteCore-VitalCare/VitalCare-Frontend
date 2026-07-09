import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import {
  PreferencesService,
  FontSize,
  BackgroundColor,
} from '../../../infrastructure/preferences.service';

@Component({
  selector: 'app-accessibility-fab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, MatIcon],
  templateUrl: './accessibility-fab.html',
  styleUrl: './accessibility-fab.css',
})
export class AccessibilityFab {
  private prefs = inject(PreferencesService);

  readonly open = signal(false);
  readonly fontSize = this.prefs.fontSize;
  readonly backgroundColor = this.prefs.backgroundColor;
  readonly showHomeAlerts = this.prefs.showHomeAlerts;

  readonly fontOptions: FontSize[] = ['SMALL', 'MEDIUM', 'LARGE'];
  readonly bgOptions: BackgroundColor[] = ['DEFAULT', 'BLUE', 'GREEN', 'YELLOW'];

  toggle(): void {
    this.open.update(v => !v);
  }

  onFontChange(value: FontSize): void {
    this.prefs.setFontSize(value);
  }

  onBackgroundChange(value: BackgroundColor): void {
    this.prefs.setBackgroundColor(value);
  }

  onShowHomeAlertsChange(value: boolean): void {
    this.prefs.setShowHomeAlerts(value);
  }
}
