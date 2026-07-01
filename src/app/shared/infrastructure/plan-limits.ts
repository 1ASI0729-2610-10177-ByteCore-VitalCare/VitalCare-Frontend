/**
 * Límites y beneficios por plan de suscripción, anclados a funciones reales de la app.
 */
export interface PlanLimits {
  maxPatients: number;       // Infinity = ilimitado
  canViewLocation: boolean;  // acceso al mapa/ubicación
  canViewHistory: boolean;   // acceso al historial de signos vitales
  warningAlerts: boolean;    // recibe alertas de advertencia además de las críticas
}

export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  switch ((plan ?? '').toUpperCase()) {
    case 'GOLD':
      return { maxPatients: Infinity, canViewLocation: true, canViewHistory: true, warningAlerts: true };
    case 'SILVER':
      return { maxPatients: 5, canViewLocation: true, canViewHistory: true, warningAlerts: true };
    default: // BASIC / FREE / sin suscripción
      return { maxPatients: 1, canViewLocation: false, canViewHistory: false, warningAlerts: false };
  }
}
