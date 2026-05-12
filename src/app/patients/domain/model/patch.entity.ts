import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export interface Patch extends BaseEntity {
  patchCode: string;
  linkedAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOW_BATTERY' | 'ERROR';
  patientId: number;
}

