// Original file: proto/accounts.proto

import type { StateAccount as _accounts_StateAccount } from '../accounts/StateAccount';

export interface AccountsRequest {
  'accounts'?: (number)[];
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

export interface AccountsRequest__Output {
  'accounts'?: (number)[];
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
