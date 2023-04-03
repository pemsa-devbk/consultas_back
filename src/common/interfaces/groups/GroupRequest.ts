// Original file: proto/groups.proto

import type { TypeGroup as _groups_TypeGroup } from '../groups/TypeGroup';

export interface GroupRequest {
  'id'?: (number);
  'type'?: (_groups_TypeGroup | keyof typeof _groups_TypeGroup);
}

export interface GroupRequest__Output {
  'id'?: (number);
  'type'?: (_groups_TypeGroup);
}
