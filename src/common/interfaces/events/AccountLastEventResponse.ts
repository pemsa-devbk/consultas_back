// Original file: proto/events.proto

import type { LastEventoResponse as _events_LastEventoResponse, LastEventoResponse__Output as _events_LastEventoResponse__Output } from '../events/LastEventoResponse';

export interface AccountLastEventResponse {
  'Nombre'?: (string);
  'Direccion'?: (string);
  'CodigoCte'?: (string);
  'CodigoAbonado'?: (string);
  'evento'?: (_events_LastEventoResponse | null);
}

export interface AccountLastEventResponse__Output {
  'Nombre'?: (string);
  'Direccion'?: (string);
  'CodigoCte'?: (string);
  'CodigoAbonado'?: (string);
  'evento'?: (_events_LastEventoResponse__Output);
}
