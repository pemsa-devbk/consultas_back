// Original file: proto/accounts.proto

import type { StateAccount as _accounts_StateAccount } from '../accounts/StateAccount';

export interface FilterRequest {
  'zones'?: (boolean);
  'partitions'?: (boolean);
  'users'?: (boolean);
  'contacts'?: (boolean);
  'panel'?: (boolean);
  'security'?: (boolean);
  'generalData'?: (boolean);
  'deviceZone'?: (boolean);
  'state'?: (_accounts_StateAccount | keyof typeof _accounts_StateAccount);
}

export interface FilterRequest__Output {
  'zones'?: (boolean);
  'partitions'?: (boolean);
  'users'?: (boolean);
  'contacts'?: (boolean);
  'panel'?: (boolean);
  'security'?: (boolean);
  'generalData'?: (boolean);
  'deviceZone'?: (boolean);
  'state'?: (_accounts_StateAccount);
}
