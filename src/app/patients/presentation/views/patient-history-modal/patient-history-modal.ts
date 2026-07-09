import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Patient } from '../../../domain/model/patient.entity';
import { VitalSign } from '../../../domain/model/vital-sign.entity';
import { Patch } from '../../../domain/model/patch.entity';
import { VitalSignService } from '../../../infrastructure/services/vital-sign.service';
import { PatchService } from '../../../infrastructure/services/patch.service';
import { VitalSignGeneratorService } from '../../../infrastructure/services/vital-sign-generator.service';

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
  imports: [CommonModule, TranslateModule, MatButtonModule, MatIconModule, DatePipe],
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
    private vitalGenerator: VitalSignGeneratorService,
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
          // Sin patch: generar historial simulado
          this.historyData.set(this.generateFakeHistory(patient));
          this.historyLoading.set(false);
          return;
        }

        this.vitalSignService.getAllByPatchId(patch.id).subscribe({
          next: (vitalSigns: VitalSign[]) => {
            if (vitalSigns.length === 0) {
              this.historyData.set(this.generateFakeHistory(patient));
            } else {
              const sorted = [...vitalSigns].sort((a, b) =>
                new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
              );
              this.historyData.set(sorted);
            }
            this.historyLoading.set(false);
          },
          error: () => {
            this.historyData.set(this.generateFakeHistory(patient));
            this.historyLoading.set(false);
          },
        });
      },
      error: () => {
        this.historyData.set(this.generateFakeHistory(patient));
        this.historyLoading.set(false);
      },
    });
  }

  private generateFakeHistory(patient: Patient): VitalSign[] {
    const entries: VitalSign[] = [];
    const now = new Date();

    for (let i = 0; i < 5; i++) {
      const date = new Date(now);
      date.setHours(now.getHours() - i * 2);
      const gen = this.vitalGenerator.generateForPatient(patient);
      entries.push({
        id: -(i + 1),
        recordedAt: date.toISOString(),
        glucoseLevel: gen.glucoseLevel,
        bloodPressure: gen.bloodPressure,
        heartRate: gen.heartRate,
        temperature: gen.temperature,
        oxygenSaturation: gen.oxygenSaturation,
        humidity: gen.humidity,
        patchId: 0,
      });
    }
    return entries;
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
