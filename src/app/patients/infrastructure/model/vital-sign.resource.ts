import { BaseResource } from '../../../shared/infrastructure/base-response';

export interface VitalSignResource extends BaseResource {
  recorded_at: string;
  glucose_level: number;
  lactate_concentration?: number;
  blood_pressure: number;
  temperature: number;
  oxygen_saturation?: number;
  heart_rate: number;
  humidity?: number;
  patches_id: number;
}

