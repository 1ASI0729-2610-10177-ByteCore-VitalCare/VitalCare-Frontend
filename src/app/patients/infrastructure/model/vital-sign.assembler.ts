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
      sodiumPotassium: resource.sodium_potassium,
      alcoholLevel: resource.alcohol_level,
      alcoholLevel2: resource.alcohol_level_2,
      ketones: resource.ketones,
      cytokines: resource.citocines,
      specializedCells: resource.specialized_cells,
      atmosphericPressure: resource.atmospheric_pressure,
      airQuality: resource.air_quality,
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
      sodium_potassium: entity.sodiumPotassium,
      alcohol_level: entity.alcoholLevel,
      alcohol_level_2: entity.alcoholLevel2,
      ketones: entity.ketones,
      citocines: entity.cytokines,
      specialized_cells: entity.specializedCells,
      atmospheric_pressure: entity.atmosphericPressure,
      air_quality: entity.airQuality,
      patches_id: entity.patchId,
    };
  }

  toEntitiesFromResponse(response: BaseResponse): VitalSign[] {
    return [];
  }
}

