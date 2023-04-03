// Original file: proto/events.proto

import type { StateAccount as _accounts_StateAccount } from '../accounts/StateAccount';
import type { FilterEvents as _events_FilterEvents, FilterEvents__Output as _events_FilterEvents__Output } from '../events/FilterEvents';

export interface EventsTopRequest {
  'accounts'?: (number)[];
  'top'?: (number);
  'state'?: (_accounts_StateAccount | keyof typeof _accounts_StateAccount);
  'exclude'?: (boolean);
  'partitions'?: (boolean);
  'filter'?: (_events_FilterEvents)[];
}

export interface EventsTopRequest__Output {
  'accounts'?: (number)[];
  'top'?: (number);
  'state'?: (_accounts_StateAccount);
  'exclude'?: (boolean);
  'partitions'?: (boolean);
  'filter'?: (_events_FilterEvents__Output)[];
}
