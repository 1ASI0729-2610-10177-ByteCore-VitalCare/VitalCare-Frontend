import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { PatientService } from '../../../infrastructure/services/patient.service';
import { Patient } from '../../../domain/model/patient.entity';
import { VitalSignsModal } from '../../components/vital-signs-modal/vital-signs-modal';
import { LocationModal } from '../../components/location-modal/location-modal';
import { AddPatientModal } from '../../components/add-patient-modal/add-patient-modal';
import { PatientHistoryModal } from '../patient-history-modal/patient-history-modal';
import { VitalAlertBanner } from '../../components/vital-alert-banner/vital-alert-banner';
import { VitalSignGeneratorService, VitalAlert, GeneratedVitalSign } from '../../../infrastructure/services/vital-sign-generator.service';
import { NotificationStoreService } from '../../../../notifications/infrastructure/notification-store.service';
import { NotificationService } from '../../../../notifications/infrastructure/notification.service';
import { AlertService } from '../../../infrastructure/services/alert.service';
import { AuthService } from '../../../../iam/application/services/auth.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    TranslateModule,
    VitalSignsModal,
    LocationModal,
    AddPatientModal,
    PatientHistoryModal,
    VitalAlertBanner,
  ],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit, OnDestroy {
  private patientService = inject(PatientService);
  private vitalGenerator = inject(VitalSignGeneratorService);
  private notificationStore = inject(NotificationStoreService);
  private notificationService = inject(NotificationService);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  patients = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);
  showVitalSignsModal = signal(false);
  showLocationModal = signal(false);
  showAddPatientModal = signal(false);
  showHistoryModal = signal(false);
  activeAlerts = signal<VitalAlert[]>([]);
  showAlertBanner = signal(false);
  generatedVitals = new Map<number, GeneratedVitalSign>();
  private pendingNavigationId: number | null = null;
  private querySub: Subscription | null = null;

  ngOnInit(): void {
    this.loadPatients();
    this.querySub = this.route.queryParams.subscribe(params => {
      const param = params['patientId'];
      if (param != null) {
        this.pendingNavigationId = Number(param);
        if (this.patients().length > 0) {
          this.flushPendingNavigation();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  private loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients.set(data);
        this.checkVitalAlerts(data);
        this.flushPendingNavigation();
      },
      error: (err) => console.error('Error fetching patients:', err),
    });
  }

  private flushPendingNavigation(): void {
    if (this.pendingNavigationId == null) return;
    const patient = this.patients().find(p => p.id === this.pendingNavigationId);
    if (patient) {
      this.openVitalSignsModal(patient);
    }
    this.router.navigate([], {
      queryParams: { patientId: undefined },
      queryParamsHandling: 'merge',
    });
    this.pendingNavigationId = null;
  }

  private checkVitalAlerts(patients: Patient[]): void {
    const results = this.vitalGenerator.generateForPatients(patients);
    results.forEach(r => this.generatedVitals.set(r.patient.id, r));
    const allAlerts = results.flatMap(r => r.alerts);
    if (allAlerts.length > 0) {
      this.activeAlerts.set(allAlerts);
      this.showAlertBanner.set(true);
      if (this.shouldRegisterNotifications()) {
        this.registerNotifications(allAlerts);
      }
    }
  }

  private shouldRegisterNotifications(): boolean {
    const key = 'vital-alerts-last-registered';
    const last = sessionStorage.getItem(key);
    const now = Date.now();
    if (last && now - parseInt(last) < 5 * 60 * 1000) {
      return false;
    }
    sessionStorage.setItem(key, String(now));
    return true;
  }

  private registerNotifications(alerts: VitalAlert[]): void {
    try {
      const now = new Date();
      const fecha = `${this.pad(now.getDate())}/${this.pad(now.getMonth() + 1)}/${now.getFullYear()} ${this.pad(now.getHours())}:${this.pad(now.getMinutes())}`;
      const created_at = now.toISOString().replace('T', ' ').substring(0, 19);
      const userId = this.authService.currentUser()?.id ?? 1;

      for (const alert of alerts) {
        const statusText = alert.status === 'CRITICAL' ? 'CRÍTICO' : 'ALERTA';
        const descripcion = `Signo anormal: ${alert.parameter} ${alert.value} (${statusText})`;

        this.notificationStore.add(alert.patientName, descripcion, alert.patientId);

        this.notificationService.create({
          nombre: alert.patientName,
          fecha,
          descripcion,
          patientId: alert.patientId,
          users_id: userId,
        }).subscribe({ error: (err) => console.error('Error persisting notification:', err) });

        this.alertService.create({
          type: alert.status,
          description: descripcion,
          created_at,
          is_read: 0,
          users_id: userId,
          patients_id: alert.patientId,
        }).subscribe({ error: (err) => console.error('Error persisting alert:', err) });
      }
    } catch (e) {
      console.error('Error registering notification:', e);
    }
  }

  private pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  getGeneratedVitals(patient: Patient): GeneratedVitalSign | null {
    return this.generatedVitals.get(patient.id) ?? null;
  }

  dismissAlerts(): void {
    this.showAlertBanner.set(false);
    this.activeAlerts.set([]);
  }

  openVitalSignsModal(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.showVitalSignsModal.set(true);
  }

  closeVitalSignsModal(): void {
    this.showVitalSignsModal.set(false);
    this.selectedPatient.set(null);
  }

  openHistoryFromVitals(): void {
    this.showVitalSignsModal.set(false);
    this.showHistoryModal.set(true);
    // selectedPatient ya está seteado
  }

  openLocationModal(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.showLocationModal.set(true);
  }

  closeLocationModal(): void {
    this.showLocationModal.set(false);
    this.selectedPatient.set(null);
  }

  openHistoryModal(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.showHistoryModal.set(true);
  }

  closeHistoryModal(): void {
    this.showHistoryModal.set(false);
    this.selectedPatient.set(null);
  }

  openAddPatientModal(): void {
    this.showAddPatientModal.set(true);
  }

  closeAddPatientModal(): void {
    this.showAddPatientModal.set(false);
  }

  onPatientAdded(newPatient: Patient): void {
    const currentPatients = this.patients();
    this.patients.set([...currentPatients, newPatient]);
    this.closeAddPatientModal();
  }

  onImageError(event: ErrorEvent): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
      const avatar = img.nextElementSibling as HTMLElement;
      if (avatar) {
        avatar.style.display = 'block';
      }
    }
  }

  calculateAge(birthDate: Date | string): number {
    const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  }
}
