// Original file: proto/events.proto

import type { EventoResponse as _events_EventoResponse, EventoResponse__Output as _events_EventoResponse__Output } from '../events/EventoResponse';
import type { CommentResponse as _events_CommentResponse, CommentResponse__Output as _events_CommentResponse__Output } from '../events/CommentResponse';
import type { Scheduled as _events_Scheduled, Scheduled__Output as _events_Scheduled__Output } from '../events/Scheduled';

export interface AccountEventResponse {
  'Nombre'?: (string);
  'Direccion'?: (string);
  'CodigoCte'?: (string);
  'CodigoAbonado'?: (string);
  'eventos'?: (_events_EventoResponse)[];
  'comentarios'?: (_events_CommentResponse)[];
  'horario'?: (_events_Scheduled | null);
}

export interface AccountEventResponse__Output {
  'Nombre'?: (string);
  'Direccion'?: (string);
  'CodigoCte'?: (string);
  'CodigoAbonado'?: (string);
  'eventos'?: (_events_EventoResponse__Output)[];
  'comentarios'?: (_events_CommentResponse__Output)[];
  'horario'?: (_events_Scheduled__Output);
}
