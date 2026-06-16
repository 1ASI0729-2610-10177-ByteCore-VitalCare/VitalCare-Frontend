export interface Notification {
  id: number;
  nombre: string;
  fecha: string;
  descripcion: string;
  patientId?: number;
}