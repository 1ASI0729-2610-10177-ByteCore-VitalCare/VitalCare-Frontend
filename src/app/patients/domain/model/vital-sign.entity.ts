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
  sodiumPotassium?: number;
  alcoholLevel?: number;
  alcoholLevel2?: number;
  ketones?: number;
  cytokines?: number;
  specializedCells?: number;
  atmosphericPressure?: number;
  airQuality?: number;
  patchId: number;
}

