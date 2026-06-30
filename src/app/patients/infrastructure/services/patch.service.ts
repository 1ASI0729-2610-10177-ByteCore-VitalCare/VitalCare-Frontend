import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiEndpoint } from '../../../shared/infrastructure/base-api-endpoint';
import { BaseResponse } from '../../../shared/infrastructure/base-response';
import { Patch } from '../../domain/model/patch.entity';
import { PatchResource } from '../model/patch.resource';
import { PatchAssembler } from '../model/patch.assembler';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PatchService extends BaseApiEndpoint<
  Patch,
  PatchResource,
  BaseResponse,
  PatchAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}api/v1/patches`,
      new PatchAssembler(),
    );
  }

  /**
   * Obtiene el parche activo para un paciente específico
   * @param patientId - ID del paciente
   * @returns Observable con el primer parche del paciente
   */
  getByPatientId(patientId: number): Observable<Patch | null> {
    return this.http.get<PatchResource[]>(`${this.endpointUrl}?patients_id=${patientId}`).pipe(
      map(resources => {
        if (!Array.isArray(resources) || resources.length === 0) {
          return null;
        }
        // Retorna el primer parche (generalmente hay uno por paciente)
        return this.assembler.toEntityFromResource(resources[0]);
      }),
    );
  }
}

