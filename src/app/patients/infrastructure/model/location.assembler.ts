import { BaseAssembler } from '../../../shared/infrastructure/base-assembler';
import { BaseResponse } from '../../../shared/infrastructure/base-response';
import { Location } from '../../domain/model/location.entity';
import { LocationResource } from './location.resource';

export class LocationAssembler implements BaseAssembler<Location, LocationResource, BaseResponse> {
  toEntityFromResource(resource: LocationResource): Location {
    return {
      id: resource.id,
      latitude: resource.latitude,
      longitude: resource.longitude,
      recordedAt: resource.recorded_at,
      patchId: resource.patches_id,
    };
  }

  toResourceFromEntity(entity: Location): LocationResource {
    return {
      id: entity.id,
      latitude: entity.latitude,
      longitude: entity.longitude,
      recorded_at: entity.recordedAt,
      patches_id: entity.patchId,
    };
  }

  toEntitiesFromResponse(response: BaseResponse): Location[] {
    return [];
  }
}

