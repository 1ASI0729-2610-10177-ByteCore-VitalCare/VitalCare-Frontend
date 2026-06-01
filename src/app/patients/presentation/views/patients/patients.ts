import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

import { PatientService } from '../../../infrastructure/services/patient.service';
import { Patient } from '../../../domain/model/patient.entity';
import { VitalSignsModal } from '../../components/vital-signs-modal/vital-signs-modal';
import { LocationModal } from '../../components/location-modal/location-modal';
import { AddPatientModal } from '../../components/add-patient-modal/add-patient-modal';
import { PatientHistoryModal } from '../patient-history-modal/patient-history-modal';
import { VitalAlertBanner } from '../../components/vital-alert-banner/vital-alert-banner';
import { VitalSignGeneratorService, VitalAlert } from '../../../infrastructure/services/vital-sign-generator.service';

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
export class Patients implements OnInit {
  private patientService = inject(PatientService);
  private vitalGenerator = inject(VitalSignGeneratorService);

  patients = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);
  showVitalSignsModal = signal(false);
  showLocationModal = signal(false);
  showAddPatientModal = signal(false);
  showHistoryModal = signal(false);
  activeAlerts = signal<VitalAlert[]>([]);
  showAlertBanner = signal(false);

  ngOnInit(): void {
    this.loadPatients();
  }

  private loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients.set(data);
        this.checkVitalAlerts(data);
      },
      error: (err) => console.error('Error fetching patients:', err),
    });
  }

  private checkVitalAlerts(patients: Patient[]): void {
    const results = this.vitalGenerator.generateForPatients(patients);
    const allAlerts = results.flatMap(r => r.alerts);
    if (allAlerts.length > 0) {
      this.activeAlerts.set(allAlerts);
      this.showAlertBanner.set(true);
    }
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
