import { BaseAssembler } from '../../../shared/infrastructure/base-assembler';
import { BaseResponse } from '../../../shared/infrastructure/base-response';
import { VitalSign } from '../../domain/model/vital-sign.entity';
import { VitalSignResource } from './vital-sign.resource';

export class VitalSignAssembler implements BaseAssembler<VitalSign, VitalSignResource, BaseResponse> {
  toEntityFromResource(resource: VitalSignResource): VitalSign {
    return {
      id: resource.id,
      recordedAt: resource.recorded_at,
      glucoseLevel: resource.glucose_level,
      lactateConcentration: resource.lactate_concentration,
      bloodPressure: resource.blood_pressure,
      temperature: resource.temperature,
      oxygenSaturation: resource.oxygen_saturation,
      heartRate: resource.heart_rate,
      humidity: resource.humidity,
      patchId: resource.patches_id,
    };
  }

  toResourceFromEntity(entity: VitalSign): VitalSignResource {
    return {
      id: entity.id,
      recorded_at: entity.recordedAt,
      glucose_level: entity.glucoseLevel,
      lactate_concentration: entity.lactateConcentration,
      blood_pressure: entity.bloodPressure,
      temperature: entity.temperature,
      oxygen_saturation: entity.oxygenSaturation,
      heart_rate: entity.heartRate,
      humidity: entity.humidity,
      patches_id: entity.patchId,
    };
  }

  toEntitiesFromResponse(response: BaseResponse): VitalSign[] {
    return [];
  }
}

