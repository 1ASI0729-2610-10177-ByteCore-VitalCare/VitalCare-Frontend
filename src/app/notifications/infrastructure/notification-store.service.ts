import { Injectable, signal } from '@angular/core';
import { Notification } from '../domain/notification';

@Injectable({ providedIn: 'root' })
export class NotificationStoreService {
  private notificationsSignal = signal<Notification[]>([]);

  readonly notifications$ = this.notificationsSignal.asReadonly();

  private nextId = 1;

  add(nombre: string, descripcion: string, patientId: number): void {
    const now = new Date();
    const fecha = `${this.pad(now.getDate())}/${this.pad(now.getMonth() + 1)}/${now.getFullYear()} ${this.pad(now.getHours())}:${this.pad(now.getMinutes())}`;
    const notification: Notification = {
      id: this.nextId++,
      nombre,
      fecha,
      descripcion,
      patientId,
    };
    this.notificationsSignal.update(list => [notification, ...list]);
  }

  private pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }
}
