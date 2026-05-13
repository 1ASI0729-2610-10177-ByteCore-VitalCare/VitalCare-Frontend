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
  sodium_potassium?: number;
  alcohol_level?: number;
  alcohol_level_2?: number;
  ketones?: number;
  citocines?: number;
  specialized_cells?: number;
  atmospheric_pressure?: number;
  air_quality?: number;
  patches_id: number;
}

