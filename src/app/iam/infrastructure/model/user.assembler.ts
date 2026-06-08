import { User } from '../../domain/model/user.entity';
import { UserResource } from './user.resource';

export class UserAssembler {
  toEntityFromResource(resource: UserResource): User {
    return {
      id: resource.id,
      name: resource.name,
      email: resource.email,
      createdAt: resource.created_at,
    };
  }
}
