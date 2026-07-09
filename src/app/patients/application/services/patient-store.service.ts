import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PatientService } from '../../infrastructure/services/patient.service';
import { Patient } from '../../domain/model/patient.entity';

/**
 * Application-layer store for the Patients bounded context.
 * Owns the patient collection state and orchestrates the CRUD operations
 * against the infrastructure PatientService, so presentation components
 * consume state instead of talking to infrastructure directly.
 */
@Injectable({ providedIn: 'root' })
export class PatientStore {
  private readonly patientService = inject(PatientService);

  private readonly patientsSignal = signal<Patient[]>([]);
  readonly patients = this.patientsSignal.asReadonly();

  /** Loads the patient list and updates the store. Callers may subscribe to react to the loaded data. */
  load(): Observable<Patient[]> {
    return this.patientService.getAll().pipe(
      tap(patients => this.patientsSignal.set(patients)),
    );
  }

  add(patient: Patient): void {
    this.patientsSignal.update(list => [...list, patient]);
  }

  /** Deletes a patient and removes it from the store on success. */
  delete(id: number): Observable<void> {
    return this.patientService.delete(id).pipe(
      tap(() => this.patientsSignal.update(list => list.filter(p => p.id !== id))),
    );
  }
}
