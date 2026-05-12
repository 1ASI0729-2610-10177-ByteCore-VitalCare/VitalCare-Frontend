import { BaseResource } from '../../../shared/infrastructure/base-response';

export interface PatientResource extends BaseResource {
  name: string;
  users_id: number;
  photo: string;
  birth_date: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}
