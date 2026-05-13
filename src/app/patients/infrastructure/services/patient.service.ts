import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiEndpoint } from '../../../shared/infrastructure/base-api-endpoint';
import { BaseResponse } from '../../../shared/infrastructure/base-response';
import { Patient } from '../../domain/model/patient.entity';
import { PatientResource } from '../model/patient.resource';
import { PatientAssembler } from '../model/patient.assembler';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PatientService extends BaseApiEndpoint<
  Patient,
  PatientResource,
  BaseResponse,
  PatientAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}${environment.platformProviderPatientsEndpointPath}`,
      new PatientAssembler(),
    );
  }

  /**
   * Crea un nuevo paciente
   * @param patient - Datos del nuevo paciente
   * @returns Observable con el paciente creado
   */
  override create(patient: Patient): Observable<Patient> {
    const resource = this.assembler.toResourceFromEntity(patient);
    return this.http.post<PatientResource>(this.endpointUrl, resource).pipe(
      map(response => this.assembler.toEntityFromResource(response)),
    );
  }
}
