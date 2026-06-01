import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

import { Patient } from '../../../domain/model/patient.entity';
import { VitalSign } from '../../../domain/model/vital-sign.entity';
import { Patch } from '../../../domain/model/patch.entity';
import { VitalSignService } from '../../../infrastructure/services/vital-sign.service';
import { PatchService } from '../../../infrastructure/services/patch.service';
import { GeneratedVitalSign } from '../../../infrastructure/services/vital-sign-generator.service';

@Component({
  selector: 'app-vital-signs-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule],
  templateUrl: './vital-signs-modal.html',
  styleUrl: './vital-signs-modal.css',
})
export class VitalSignsModal implements OnInit {
  @Input() patient!: Patient;
  @Input() generatedVitals: GeneratedVitalSign | null = null;
  @Output() close = new EventEmitter<void>();

  vitalSigns = signal<VitalSign | null>(null);
  patch = signal<Patch | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private vitalSignService: VitalSignService,
    private patchService: PatchService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.patchService.getByPatientId(this.patient.id).subscribe({
      next: (patch) => {
        if (!patch) {
          this.error.set('No patch found for this patient');
          this.isLoading.set(false);
          return;
        }

        this.patch.set(patch);

        this.vitalSignService.getLatestByPatchId(patch.id).subscribe({
          next: (vitalSign) => {
            this.vitalSigns.set(vitalSign);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Error loading vital signs:', err);
            this.error.set('Error loading vital signs');
            this.isLoading.set(false);
          },
        });
      },
      error: (err) => {
        console.error('Error loading patch:', err);
        this.error.set('Error loading patch information');
        this.isLoading.set(false);
      },
    });
  }

  onClose(): void {
    this.close.emit();
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

  calculateAge(birthDate: string): number {
    const date = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  }

  getGenderLabel(gender: string): string {
    const genderMap: { [key: string]: string } = {
      MALE: 'Masculino',
      FEMALE: 'Femenino',
      OTHER: 'Otro',
    };
    return genderMap[gender] || gender;
  }

  getVitalValue(value: number | undefined): number {
    return value ?? 0;
  }

  // Retorna el valor generado si existe, sino el del DB, sino 0
  get temperature(): number {
    return this.generatedVitals?.temperature ?? this.vitalSigns()?.temperature ?? 0;
  }
  get heartRate(): number {
    return this.generatedVitals?.heartRate ?? this.vitalSigns()?.heartRate ?? 0;
  }
  get bloodPressure(): number {
    return this.generatedVitals?.bloodPressure ?? this.vitalSigns()?.bloodPressure ?? 0;
  }
  get glucoseLevel(): number {
    return this.generatedVitals?.glucoseLevel ?? this.vitalSigns()?.glucoseLevel ?? 0;
  }
  get oxygenSaturation(): number {
    return this.generatedVitals?.oxygenSaturation ?? this.vitalSigns()?.oxygenSaturation ?? 0;
  }
}
