import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}
