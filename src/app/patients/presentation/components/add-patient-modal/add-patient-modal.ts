import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { Patient } from '../../../domain/model/patient.entity';
import { PatientService } from '../../../infrastructure/services/patient.service';

@Component({
  selector: 'app-add-patient-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-patient-modal.html',
  styleUrl: './add-patient-modal.css',
})
export class AddPatientModal {
  @Output() close = new EventEmitter<void>();
  @Output() patientAdded = new EventEmitter<Patient>();

  private patientService = inject(PatientService);

  // Form state
  name = signal('');
  patchCode = signal('');
  birthDate = signal('');
  gender = signal<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  photo = signal<string | null>(null);
  photoFile = signal<File | null>(null);

  isLoading = signal(false);
  error = signal<string | null>(null);


  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.photoFile.set(file);

      // Preview de la foto
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.photo.set(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }


  addPatient(): void {
    if (!this.name() || !this.birthDate()) {
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const newPatient: Patient = {
      id: 0,
      name: this.name(),
      photo: this.photoFile()?.name || 'default.jpg',
      birthDate: this.birthDate(),
      gender: this.gender(),
      userId: 1,
    };

    this.patientService.create(newPatient).subscribe({
      next: (patient) => {
        this.isLoading.set(false);
        this.patientAdded.emit(patient);
        this.onCancel();
      },
      error: (err) => {
        console.error('Error adding patient:', err);
        this.error.set('Error al agregar el paciente');
        this.isLoading.set(false);
      },
    });
  }


  onCancel(): void {
    this.resetForm();
    this.close.emit();
  }


  private resetForm(): void {
    this.name.set('');
    this.patchCode.set('');
    this.birthDate.set('');
    this.gender.set('MALE');
    this.photo.set(null);
    this.photoFile.set(null);
    this.error.set(null);
  }
}

