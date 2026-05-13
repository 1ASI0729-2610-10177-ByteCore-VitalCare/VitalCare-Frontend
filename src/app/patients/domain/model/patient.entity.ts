import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export interface Patient extends BaseEntity {
  name: string;
  photo: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  userId: number;
}


