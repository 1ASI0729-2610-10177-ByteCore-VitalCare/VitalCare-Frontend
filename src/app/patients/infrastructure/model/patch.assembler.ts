import { BaseAssembler } from '../../../shared/infrastructure/base-assembler';
import { BaseResponse } from '../../../shared/infrastructure/base-response';
import { Patch } from '../../domain/model/patch.entity';
import { PatchResource } from './patch.resource';

export class PatchAssembler implements BaseAssembler<Patch, PatchResource, BaseResponse> {
  toEntityFromResource(resource: PatchResource): Patch {
    return {
      id: resource.id,
      patchCode: resource.patch_code,
      linkedAt: resource.linked_at,
      status: resource.status,
      patientId: resource.patients_id,
    };
  }

  toResourceFromEntity(entity: Patch): PatchResource {
    return {
      id: entity.id,
      patch_code: entity.patchCode,
      linked_at: entity.linkedAt,
      status: entity.status,
      patients_id: entity.patientId,
    };
  }

  toEntitiesFromResponse(response: BaseResponse): Patch[] {
    return [];
  }
}

