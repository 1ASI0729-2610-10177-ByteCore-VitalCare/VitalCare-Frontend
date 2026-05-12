import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';

import { TranslateModule } from '@ngx-translate/core';

import { PatientService } from '../../../infrastructure/services/patient.service';
import { Patient } from '../../../domain/model/patient.entity';
import { VitalSignsModal } from '../../components/vital-signs-modal/vital-signs-modal';
import { LocationModal } from '../../components/location-modal/location-modal';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TranslateModule, VitalSignsModal, LocationModal],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit {
  private patientService = inject(PatientService);

  patients = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);
  showVitalSignsModal = signal(false);
  showLocationModal = signal(false);

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
