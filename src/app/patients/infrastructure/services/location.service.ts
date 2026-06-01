import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiEndpoint } from '../../../shared/infrastructure/base-api-endpoint';
import { BaseResponse } from '../../../shared/infrastructure/base-response';
import { Location } from '../../domain/model/location.entity';
import { LocationResource } from '../model/location.resource';
import { LocationAssembler } from '../model/location.assembler';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LocationService extends BaseApiEndpoint<
  Location,
  LocationResource,
  BaseResponse,
  LocationAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}locations`,
      new LocationAssembler(),
    );
  }

  /**
   * Obtiene la ubicación más reciente para un parche específico
   * @param patchId - ID del parche
   * @returns Observable con la última ubicación registrada
   */
  getLatestByPatchId(patchId: number): Observable<Location | null> {
    return this.http.get<LocationResource[]>(`${this.endpointUrl}?patches_id=${patchId}`).pipe(
      map(resources => {
        if (!Array.isArray(resources) || resources.length === 0) {
          return null;
        }
        // Retorna la última ubicación (la más reciente)
        const latestResource = resources[resources.length - 1];
        return this.assembler.toEntityFromResource(latestResource);
      }),
    );
  }

  /**
   * Obtiene todas las ubicaciones para un parche específico
   * @param patchId - ID del parche
   * @returns Observable con array de ubicaciones
   */
  getAllByPatchId(patchId: number): Observable<Location[]> {
    return this.http.get<LocationResource[]>(`${this.endpointUrl}?patches_id=${patchId}`).pipe(
      map(resources => {
        if (!Array.isArray(resources)) {
          return [];
        }
        return resources.map(resource => this.assembler.toEntityFromResource(resource));
      }),
    );
  }
}

