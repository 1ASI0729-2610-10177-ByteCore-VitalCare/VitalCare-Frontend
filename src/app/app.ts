import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionCounterService } from './shared/infrastructure/session-counter.service';
import { PreferencesService } from './shared/infrastructure/preferences.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('vital-care-frontend');

  constructor() {
    // Cuenta cada arranque/refresco de la app para simular la resolución de tickets.
    inject(SessionCounterService).increment();
    // Aplica las preferencias visuales guardadas (tamaño de letra, color de fondo).
    inject(PreferencesService).init();
  }
}
