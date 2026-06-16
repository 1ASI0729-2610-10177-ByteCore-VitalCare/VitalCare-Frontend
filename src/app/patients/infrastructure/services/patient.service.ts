import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiEndpoint } from '../../../shared/infrastructure/base-api-endpoint';
import { BaseResponse } from '../../../shared/infrastructure/base-response';
import { Patient } from '../../domain/model/patient.entity';
import { PatientResource } from '../model/patient.resource';
import { PatientAssembler } from '../model/patient.assembler';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../iam/application/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PatientService extends BaseApiEndpoint<
  Patient,
  PatientResource,
  BaseResponse,
  PatientAssembler
> {
  private authService = inject(AuthService);

  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}${environment.platformProviderPatientsEndpointPath}`,
      new PatientAssembler(),
    );
  }

  override getAll(): Observable<Patient[]> {
    const userId = this.authService.currentUser()?.id ?? 1;
    return this.http.get<PatientResource[]>(`${this.endpointUrl}?users_id=${userId}`).pipe(
      map(resources => resources.map(r => this.assembler.toEntityFromResource(r))),
    );
  }

  override create(patient: Patient): Observable<Patient> {
    const resource = this.assembler.toResourceFromEntity(patient);
    return this.http.post<PatientResource>(this.endpointUrl, resource).pipe(
      map(response => this.assembler.toEntityFromResource(response)),
    );
  }
}
