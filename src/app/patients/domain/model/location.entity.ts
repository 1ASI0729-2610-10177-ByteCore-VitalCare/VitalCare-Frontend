import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export interface Location extends BaseEntity {
  latitude: number;
  longitude: number;
  recordedAt: string;
  patchId: number;
}

