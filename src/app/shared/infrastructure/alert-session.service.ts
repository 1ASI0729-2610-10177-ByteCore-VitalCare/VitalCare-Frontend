import { Injectable } from '@angular/core';

/**
 * Guarda la cantidad de alertas de signos vitales generadas durante el inicio de
 * sesión actual. Se almacena en sessionStorage para que sobreviva a refrescos
 * dentro de la misma sesión, pero se reinicie al cerrar sesión o la pestaña.
 */
@Injectable({ providedIn: 'root' })
export class AlertSessionService {
  private readonly KEY = 'vital-session-alerts';

  /** Cantidad de alertas generadas en esta sesión. */
  get count(): number {
    return parseInt(sessionStorage.getItem(this.KEY) ?? '0', 10) || 0;
  }

  /** Fija la cantidad de alertas activas de la última generación. */
  set(value: number): void {
    sessionStorage.setItem(this.KEY, String(value));
  }

  /** Limpia el contador (al cerrar sesión). */
  reset(): void {
    sessionStorage.removeItem(this.KEY);
  }
}
