import { BaseAssembler } from '../../../shared/infrastructure/base-assembler';
import { BaseResponse } from '../../../shared/infrastructure/base-response';
import { Patient } from '../../domain/model/patient.entity';
import { PatientResource } from './patient.resource';

export class PatientAssembler implements BaseAssembler<Patient, PatientResource, BaseResponse> {
  toEntityFromResource(resource: PatientResource): Patient {
    return {
      id: resource.id,
      name: resource.name,
      photo: resource.photo,
      birthDate: resource.birth_date,
      gender: resource.gender,
      userId: resource.users_id,
    };
  }

  toResourceFromEntity(entity: Patient): PatientResource {
    return {
      id: entity.id,
      name: entity.name,
      photo: entity.photo,
      birth_date: entity.birthDate,
      gender: entity.gender,
      users_id: entity.userId,
    };
  }

  toEntitiesFromResponse(response: BaseResponse): Patient[] {
    return [];
  }
}
