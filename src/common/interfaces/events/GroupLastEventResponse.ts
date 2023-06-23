// Original file: proto/events.proto

import type { AccountLastEventResponse as _events_AccountLastEventResponse, AccountLastEventResponse__Output as _events_AccountLastEventResponse__Output } from '../events/AccountLastEventResponse';

export interface GroupLastEventResponse {
  'Codigo'?: (number);
  'Nombre'?: (string);
  'Tipo'?: (number);
  'cuentas'?: (_events_AccountLastEventResponse)[];
}

export interface GroupLastEventResponse__Output {
  'Codigo'?: (number);
  'Nombre'?: (string);
  'Tipo'?: (number);
  'cuentas'?: (_events_AccountLastEventResponse__Output)[];
}
