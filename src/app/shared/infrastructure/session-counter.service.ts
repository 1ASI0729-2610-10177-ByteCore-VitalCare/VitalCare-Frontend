import { Injectable } from '@angular/core';

/**
 * Cuenta los arranques de la app (refrescos / inicios de sesión) y, en base a eso,
 * simula la resolución automática de tickets de soporte: un ticket se considera
 * "resuelto" cuando han pasado al menos RESOLUTION_THRESHOLD sesiones desde su creación.
 */
@Injectable({ providedIn: 'root' })
export class SessionCounterService {
  private readonly COUNT_KEY = 'vital-session-count';
  private readonly TICKETS_KEY = 'vital-ticket-resolution';
  private readonly RESOLUTION_THRESHOLD = 6;

  /** Contador actual de sesiones/arranques. */
  get count(): number {
    return parseInt(localStorage.getItem(this.COUNT_KEY) ?? '0', 10) || 0;
  }

  /** Incrementa el contador. Se llama una vez por arranque de la app. */
  increment(): void {
    localStorage.setItem(this.COUNT_KEY, String(this.count + 1));
  }

  /** Registra el momento (contador) en que se creó un ticket. */
  markTicketCreated(ticketId: number): void {
    const map = this.ticketMap();
    map[ticketId] = this.count;
    localStorage.setItem(this.TICKETS_KEY, JSON.stringify(map));
  }

  /**
   * Asegura que el ticket tenga una sesión base. Para tickets que ya existían
   * antes de tener registro, toma la sesión actual como punto de partida.
   */
  ensureTracked(ticketId: number): void {
    const map = this.ticketMap();
    if (map[ticketId] == null) {
      map[ticketId] = this.count;
      localStorage.setItem(this.TICKETS_KEY, JSON.stringify(map));
    }
  }

  /** Indica si un ticket ya debe mostrarse como resuelto, según el umbral del plan. */
  isResolved(ticketId: number, threshold: number = this.RESOLUTION_THRESHOLD): boolean {
    const createdAt = this.ticketMap()[ticketId];
    if (createdAt == null) return false;
    return this.count - createdAt >= threshold;
  }

  private ticketMap(): Record<string, number> {
    try {
      return JSON.parse(localStorage.getItem(this.TICKETS_KEY) ?? '{}');
    } catch {
      return {};
    }
  }
}
