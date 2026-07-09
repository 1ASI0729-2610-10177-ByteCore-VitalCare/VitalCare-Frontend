import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { getPlanLimits, PlanLimits } from '../../../../shared/infrastructure/plan-limits';

import { PatientStore } from '../../../application/services/patient-store.service';
import { Patient } from '../../../domain/model/patient.entity';
import { VitalSignsModal } from '../../components/vital-signs-modal/vital-signs-modal';
import { LocationModal } from '../../components/location-modal/location-modal';
import { AddPatientModal } from '../../components/add-patient-modal/add-patient-modal';
import { PatientHistoryModal } from '../patient-history-modal/patient-history-modal';
import { VitalAlertBanner } from '../../components/vital-alert-banner/vital-alert-banner';
import { VitalSignGeneratorService, VitalAlert, GeneratedVitalSign } from '../../../infrastructure/services/vital-sign-generator.service';
import { NotificationStoreService } from '../../../../notifications/application/services/notification-store.service';
import { NotificationService } from '../../../../notifications/infrastructure/notification.service';
import { AlertService } from '../../../infrastructure/services/alert.service';
import { AuthService } from '../../../../iam/application/services/auth.service';
import { AlertSessionService } from '../../../../shared/infrastructure/alert-session.service';

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
  private patientStore = inject(PatientStore);
  private vitalGenerator = inject(VitalSignGeneratorService);
  private notificationStore = inject(NotificationStoreService);
  private notificationService = inject(NotificationService);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private alertSession = inject(AlertSessionService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  planLimits = signal<PlanLimits>(getPlanLimits(null));
  planName = signal<string>('BASIC');
  readonly canAddPatient = computed(() => this.patients().length < this.planLimits().maxPatients);

  readonly patients = this.patientStore.patients;
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
    this.loadPlan();
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
    this.patientStore.load().subscribe({
      next: (data) => {
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
    let allAlerts = results.flatMap(r => r.alerts);
    // En planes sin alertas de advertencia (Basic) solo se muestran las críticas.
    if (!this.planLimits().warningAlerts) {
      allAlerts = allAlerts.filter(a => a.status === 'CRITICAL');
    }
    this.alertSession.set(allAlerts.length);
    if (allAlerts.length > 0) {
      this.activeAlerts.set(allAlerts);
      this.showAlertBanner.set(true);
      // One notification per distinct alert (patient + parameter). Skip alerts
      // already registered this session so reloads don't create duplicates.
      const newAlerts = allAlerts.filter(a => !this.isAlertRegistered(a));
      if (newAlerts.length > 0) {
        this.registerNotifications(newAlerts);
        newAlerts.forEach(a => this.markAlertRegistered(a));
      }
    }
  }

  private alertKey(alert: VitalAlert): string {
    return `vital-alert-registered:${alert.patientId}:${alert.parameter}`;
  }

  private isAlertRegistered(alert: VitalAlert): boolean {
    return sessionStorage.getItem(this.alertKey(alert)) !== null;
  }

  private markAlertRegistered(alert: VitalAlert): void {
    sessionStorage.setItem(this.alertKey(alert), '1');
  }

  private registerNotifications(alerts: VitalAlert[]): void {
    try {
      const now = new Date();
      const fecha = `${this.pad(now.getDate())}/${this.pad(now.getMonth() + 1)}/${now.getFullYear()} ${this.pad(now.getHours())}:${this.pad(now.getMinutes())}`;
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
          isRead: false,
          userId,
          patientId: alert.patientId,
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

  private loadPlan(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;
    this.http.get<{ plan: string; status: string }[]>(
      `${environment.platformProviderApiBaseUrl}api/v1/subscriptions?users_id=${userId}`,
    ).subscribe({
      next: subs => {
        const active = subs.find(s => s.status === 'ACTIVE') ?? subs[0];
        const plan = active?.plan ?? 'BASIC';
        this.planName.set(plan.toUpperCase());
        this.planLimits.set(getPlanLimits(plan));
      },
      error: () => {},
    });
  }

  openAddPatientModal(): void {
    if (!this.canAddPatient()) return;
    this.showAddPatientModal.set(true);
  }

  closeAddPatientModal(): void {
    this.showAddPatientModal.set(false);
  }

  onPatientAdded(newPatient: Patient): void {
    this.patientStore.add(newPatient);
    this.closeAddPatientModal();
  }

  patientToDelete = signal<Patient | null>(null);
  isDeleting = signal(false);
  deleteError = signal(false);

  deletePatient(patient: Patient): void {
    this.deleteError.set(false);
    this.patientToDelete.set(patient);
  }

  cancelDeletePatient(): void {
    if (this.isDeleting()) return;
    this.patientToDelete.set(null);
    this.deleteError.set(false);
  }

  confirmDeletePatient(): void {
    const patient = this.patientToDelete();
    if (!patient) return;
    this.isDeleting.set(true);
    this.deleteError.set(false);
    this.patientStore.delete(patient.id).subscribe({
      next: () => {
        this.generatedVitals.delete(patient.id);
        this.isDeleting.set(false);
        this.patientToDelete.set(null);
      },
      error: (err) => {
        console.error('Error deleting patient:', err);
        this.isDeleting.set(false);
        this.deleteError.set(true);
      },
    });
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
