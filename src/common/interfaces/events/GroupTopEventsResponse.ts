// Original file: proto/events.proto

import type { AccountTopEventResponse as _events_AccountTopEventResponse, AccountTopEventResponse__Output as _events_AccountTopEventResponse__Output } from '../events/AccountTopEventResponse';

export interface GroupTopEventsResponse {
  'Codigo'?: (number);
  'Nombre'?: (string);
  'Tipo'?: (number);
  'cuentas'?: (_events_AccountTopEventResponse)[];
}

export interface GroupTopEventsResponse__Output {
  'Codigo'?: (number);
  'Nombre'?: (string);
  'Tipo'?: (number);
  'cuentas'?: (_events_AccountTopEventResponse__Output)[];
}
