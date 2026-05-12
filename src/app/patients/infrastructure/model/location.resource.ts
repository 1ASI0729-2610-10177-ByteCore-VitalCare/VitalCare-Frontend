import { BaseResource } from '../../../shared/infrastructure/base-response';

export interface LocationResource extends BaseResource {
  latitude: number;
  longitude: number;
  recorded_at: string;
  patches_id: number;
}

