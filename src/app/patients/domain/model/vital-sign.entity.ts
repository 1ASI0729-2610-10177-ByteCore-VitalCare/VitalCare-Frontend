import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export interface VitalSign extends BaseEntity {
  recordedAt: string;
  glucoseLevel: number;
  lactateConcentration?: number;
  bloodPressure: number;
  temperature: number;
  oxygenSaturation?: number;
  heartRate: number;
  humidity?: number;
  patchId: number;
}

