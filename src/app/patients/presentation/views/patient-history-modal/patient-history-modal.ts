import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

import { Patient } from '../../../domain/model/patient.entity';
import { VitalSign } from '../../../domain/model/vital-sign.entity';
import { Patch } from '../../../domain/model/patch.entity';
import { VitalSignService } from '../../../infrastructure/services/vital-sign.service';
import { PatchService } from '../../../infrastructure/services/patch.service';

const VITAL_RANGES = {
  glucose: { min: 70, max: 180 },
  bloodPressure: { min: 90, max: 140 },
  heartRate: { min: 60, max: 100 },
  temperature: { min: 36.1, max: 37.5 },
  oxygenSaturation: { min: 95, max: 100 },
};

@Component({
  selector: 'app-patient-history-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule, DatePipe],
  templateUrl: './patient-history-modal.html',
  styleUrl: './patient-history-modal.css',
})
export class PatientHistoryModal implements OnInit {
  @Input() patient!: Patient;
  @Output() close = new EventEmitter<void>();

  selectedPatient = signal<Patient | null>(null);
  historyLoading = signal(false);
  historyError = signal<string | null>(null);
  historyData = signal<VitalSign[]>([]);

  constructor(
    private vitalSignService: VitalSignService,
    private patchService: PatchService,
  ) {}

  ngOnInit(): void {
    if (this.patient) {
      this.selectedPatient.set(this.patient);
      this.loadPatientHistory(this.patient);
    }
  }

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

  closeHistoryModal(): void {
    this.close.emit();
  }

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
