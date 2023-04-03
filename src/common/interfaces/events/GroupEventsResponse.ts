// Original file: proto/events.proto

import type { AccountEventResponse as _events_AccountEventResponse, AccountEventResponse__Output as _events_AccountEventResponse__Output } from '../events/AccountEventResponse';

export interface GroupEventsResponse {
  'Codigo'?: (number);
  'Nombre'?: (string);
  'Tipo'?: (number);
  'cuentas'?: (_events_AccountEventResponse)[];
}

export interface GroupEventsResponse__Output {
  'Codigo'?: (number);
  'Nombre'?: (string);
  'Tipo'?: (number);
  'cuentas'?: (_events_AccountEventResponse__Output)[];
}
