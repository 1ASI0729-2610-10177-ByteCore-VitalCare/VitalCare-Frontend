import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiEndpoint } from '../../../shared/infrastructure/base-api-endpoint';
import { BaseResponse } from '../../../shared/infrastructure/base-response';
import { VitalSign } from '../../domain/model/vital-sign.entity';
import { VitalSignResource } from '../model/vital-sign.resource';
import { VitalSignAssembler } from '../model/vital-sign.assembler';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VitalSignService extends BaseApiEndpoint<
  VitalSign,
  VitalSignResource,
  BaseResponse,
  VitalSignAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}api/v1/vital_signs`,
      new VitalSignAssembler(),
    );
  }

  /**
   * Obtiene los signos vitales más recientes para un parche específico
   * @param patchId - ID del parche
   * @returns Observable con el último registro de signos vitales
   */
  getLatestByPatchId(patchId: number): Observable<VitalSign | null> {
    return this.http.get<VitalSignResource[]>(`${this.endpointUrl}?patches_id=${patchId}`).pipe(
      map(resources => {
        if (!Array.isArray(resources) || resources.length === 0) {
          return null;
        }
        // Retorna el último registro (el más reciente)
        const latestResource = resources[resources.length - 1];
        return this.assembler.toEntityFromResource(latestResource);
      }),
    );
  }

  /**
   * Obtiene todos los signos vitales para un parche específico
   * @param patchId - ID del parche
   * @returns Observable con array de signos vitales
   */
  getAllByPatchId(patchId: number): Observable<VitalSign[]> {
    return this.http.get<VitalSignResource[]>(`${this.endpointUrl}?patches_id=${patchId}`).pipe(
      map(resources => {
        if (!Array.isArray(resources)) {
          return [];
        }
        return resources.map(resource => this.assembler.toEntityFromResource(resource));
      }),
    );
  }
}

