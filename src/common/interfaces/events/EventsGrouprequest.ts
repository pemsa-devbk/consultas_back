// Original file: proto/events.proto

import type { TypeGroup as _groups_TypeGroup } from '../groups/TypeGroup';
import type { StateAccount as _accounts_StateAccount } from '../accounts/StateAccount';
import type { FilterEvents as _events_FilterEvents, FilterEvents__Output as _events_FilterEvents__Output } from '../events/FilterEvents';
import type { Order as _events_Order } from '../events/Order';

export interface EventsGrouprequest {
  'typeAccount'?: (_groups_TypeGroup | keyof typeof _groups_TypeGroup);
  'accounts'?: (number)[];
  'state'?: (_accounts_StateAccount | keyof typeof _accounts_StateAccount);
  'dateStart'?: (string);
  'dateEnd'?: (string);
  'startQuery'?: (string);
  'endQuery'?: (string);
  'exclude'?: (boolean);
  'scheduled'?: (boolean);
  'comments'?: (boolean);
  'partitions'?: (boolean);
  'filter'?: (_events_FilterEvents)[];
  'order'?: (_events_Order | keyof typeof _events_Order);
}

export interface EventsGrouprequest__Output {
  'typeAccount'?: (_groups_TypeGroup);
  'accounts'?: (number)[];
  'state'?: (_accounts_StateAccount);
  'dateStart'?: (string);
  'dateEnd'?: (string);
  'startQuery'?: (string);
  'endQuery'?: (string);
  'exclude'?: (boolean);
  'scheduled'?: (boolean);
  'comments'?: (boolean);
  'partitions'?: (boolean);
  'filter'?: (_events_FilterEvents__Output)[];
  'order'?: (_events_Order);
}
