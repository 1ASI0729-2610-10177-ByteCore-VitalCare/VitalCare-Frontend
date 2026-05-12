import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';

import { TranslateModule } from '@ngx-translate/core';

import { PatientService } from '../../../infrastructure/services/patient.service';
import { Patient } from '../../../domain/model/patient.entity';
import { VitalSignsModal } from '../../components/vital-signs-modal/vital-signs-modal';
import { LocationModal } from '../../components/location-modal/location-modal';
import { PatchService } from '../../../infrastructure/services/patch.service';
import { VitalSignService } from '../../../infrastructure/services/vital-sign.service';
import { Patch } from '../../../domain/model/patch.entity';
import { VitalSign } from '../../../domain/model/vital-sign.entity';

// Rangos normales de signos vitales para validación
const VITAL_RANGES = {
  glucose: { min: 70, max: 180 },
  bloodPressure: { min: 90, max: 140 },
  heartRate: { min: 60, max: 100 },
  temperature: { min: 36.1, max: 37.5 },
  oxygenSaturation: { min: 95, max: 100 },
};

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TranslateModule, VitalSignsModal, LocationModal],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit {
  private patientService = inject(PatientService);
  private patchService = inject(PatchService);
  private vitalSignService = inject(VitalSignService);

  patients = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);
  showVitalSignsModal = signal(false);
  showLocationModal = signal(false);
  showHistoryModal = signal(false);
  historyLoading = signal(false);
  historyError = signal<string | null>(null);
  historyData = signal<VitalSign[]>([]);

  ngOnInit(): void {
    this.loadPatients();
  }

  private loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (data) => this.patients.set(data),
      error: (err) => console.error('Error fetching patients:', err),
    });
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
    this.loadPatientHistory(patient);
  }

  closeHistoryModal(): void {
    this.showHistoryModal.set(false);
    this.selectedPatient.set(null);
    this.historyData.set([]);
    this.historyError.set(null);
  }

  /**
   * Carga el historial de signos vitales del paciente
   * 1. Obtiene el parche del paciente
   * 2. Obtiene todos los signos vitales del parche
   * 3. Los ordena por fecha (más reciente primero)
   */
  private loadPatientHistory(patient: Patient): void {
    this.historyLoading.set(true);
    this.historyError.set(null);

    this.patchService.getByPatientId(patient.id).subscribe({
      next: (patch: Patch | null) => {
        if (!patch) {
          this.historyError.set('No patch found for this patient');
          this.historyLoading.set(false);
          return;
        }

        this.vitalSignService.getAllByPatchId(patch.id).subscribe({
          next: (vitalSigns: VitalSign[]) => {
            // Ordena por fecha descendente (más reciente primero)
            const sorted = [...vitalSigns].sort((a, b) => {
              const dateA = new Date(a.recordedAt).getTime();
              const dateB = new Date(b.recordedAt).getTime();
              return dateB - dateA;
            });
            this.historyData.set(sorted);
            this.historyLoading.set(false);
          },
          error: (err) => {
            console.error('Error loading vital signs history:', err);
            this.historyError.set('Error loading vital signs history');
            this.historyLoading.set(false);
          },
        });
      },
      error: (err) => {
        console.error('Error loading patch information:', err);
        this.historyError.set('Error loading patch information');
        this.historyLoading.set(false);
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

  /**
   * Valida si un signo vital está fuera de los parámetros normales
   * Compara contra VITAL_RANGES definido arriba
   */
  isIrregular(vital: VitalSign): boolean {
    return (
      vital.glucoseLevel < VITAL_RANGES.glucose.min ||
      vital.glucoseLevel > VITAL_RANGES.glucose.max ||
      vital.bloodPressure < VITAL_RANGES.bloodPressure.min ||
      vital.bloodPressure > VITAL_RANGES.bloodPressure.max ||
      vital.heartRate < VITAL_RANGES.heartRate.min ||
      vital.heartRate > VITAL_RANGES.heartRate.max ||
      vital.temperature < VITAL_RANGES.temperature.min ||
      vital.temperature > VITAL_RANGES.temperature.max ||
      (vital.oxygenSaturation != null && vital.oxygenSaturation < VITAL_RANGES.oxygenSaturation.min)
    );
  }

  /**
   * Retorna las razones por las que un signo vital está fuera de rango
   * Se usa para mostrar alertas específicas en la timeline
   */
  getIrregularReasons(vital: VitalSign): string[] {
    const reasons: string[] = [];

    if (
      vital.glucoseLevel < VITAL_RANGES.glucose.min ||
      vital.glucoseLevel > VITAL_RANGES.glucose.max
    ) {
      const status = vital.glucoseLevel < VITAL_RANGES.glucose.min ? 'baja' : 'alta';
      reasons.push(`Glucosa ${status}: ${vital.glucoseLevel} mg/dL`);
    }

    if (
      vital.bloodPressure < VITAL_RANGES.bloodPressure.min ||
      vital.bloodPressure > VITAL_RANGES.bloodPressure.max
    ) {
      const status = vital.bloodPressure < VITAL_RANGES.bloodPressure.min ? 'baja' : 'alta';
      reasons.push(`P.A. ${status}: ${vital.bloodPressure} mmHg`);
    }

    if (
      vital.heartRate < VITAL_RANGES.heartRate.min ||
      vital.heartRate > VITAL_RANGES.heartRate.max
    ) {
      const status = vital.heartRate < VITAL_RANGES.heartRate.min ? 'baja' : 'alta';
      reasons.push(`FC ${status}: ${vital.heartRate} bpm`);
    }

    if (
      vital.temperature < VITAL_RANGES.temperature.min ||
      vital.temperature > VITAL_RANGES.temperature.max
    ) {
      const status = vital.temperature < VITAL_RANGES.temperature.min ? 'baja' : 'alta';
      reasons.push(`Temp. ${status}: ${vital.temperature}°C`);
    }

    if (
      vital.oxygenSaturation != null &&
      vital.oxygenSaturation < VITAL_RANGES.oxygenSaturation.min
    ) {
      reasons.push(`SpO₂ baja: ${vital.oxygenSaturation}%`);
    }

    return reasons;
  }
}
