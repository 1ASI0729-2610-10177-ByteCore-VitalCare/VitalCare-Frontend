import { BaseResource } from '../../../shared/infrastructure/base-response';

export interface PatchResource extends BaseResource {
  patch_code: string;
  linked_at: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOW_BATTERY' | 'ERROR';
  patients_id: number;
}

