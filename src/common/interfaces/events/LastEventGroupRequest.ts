// Original file: proto/events.proto

import type { GroupRequest as _groups_GroupRequest, GroupRequest__Output as _groups_GroupRequest__Output } from '../groups/GroupRequest';
import type { StateAccount as _accounts_StateAccount } from '../accounts/StateAccount';
import type { FilterEvents as _events_FilterEvents, FilterEvents__Output as _events_FilterEvents__Output } from '../events/FilterEvents';

export interface LastEventGroupRequest {
  'groups'?: (_groups_GroupRequest)[];
  'state'?: (_accounts_StateAccount | keyof typeof _accounts_StateAccount);
  'filterIsExclude'?: (boolean);
  'separatePartitions'?: (boolean);
  'filters'?: (_events_FilterEvents)[];
  'dateStart'?: (string);
  'dateEnd'?: (string);
  'startQuery'?: (string);
  'endQuery'?: (string);
}

export interface LastEventGroupRequest__Output {
  'groups'?: (_groups_GroupRequest__Output)[];
  'state'?: (_accounts_StateAccount);
  'filterIsExclude'?: (boolean);
  'separatePartitions'?: (boolean);
  'filters'?: (_events_FilterEvents__Output)[];
  'dateStart'?: (string);
  'dateEnd'?: (string);
  'startQuery'?: (string);
  'endQuery'?: (string);
}
