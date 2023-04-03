// Original file: proto/groups.proto

import type { StateAccount as _accounts_StateAccount } from '../accounts/StateAccount';

export interface GroupsRequestFilter {
  'showAccounts'?: (boolean);
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

export interface GroupsRequestFilter__Output {
  'showAccounts'?: (boolean);
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
