// Original file: proto/events.proto

import type { EventoTopResponse as _events_EventoTopResponse, EventoTopResponse__Output as _events_EventoTopResponse__Output } from '../events/EventoTopResponse';

export interface AccountTopEventResponse {
  'Nombre'?: (string);
  'Direccion'?: (string);
  'CodigoCte'?: (string);
  'CodigoAbonado'?: (string);
  'eventos'?: (_events_EventoTopResponse)[];
}

export interface AccountTopEventResponse__Output {
  'Nombre'?: (string);
  'Direccion'?: (string);
  'CodigoCte'?: (string);
  'CodigoAbonado'?: (string);
  'eventos'?: (_events_EventoTopResponse__Output)[];
}
