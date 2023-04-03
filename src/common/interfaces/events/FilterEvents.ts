// Original file: proto/events.proto

import type { TypeCode as _events_TypeCode } from '../events/TypeCode';

export interface FilterEvents {
  'code'?: (string);
  'type'?: (_events_TypeCode | keyof typeof _events_TypeCode);
}

export interface FilterEvents__Output {
  'code'?: (string);
  'type'?: (_events_TypeCode);
}
