// Original file: proto/groups.proto

import type { Account as _accounts_Account, Account__Output as _accounts_Account__Output } from '../accounts/Account';

export interface Group {
  'Codigo'?: (number);
  'Nombre'?: (string);
  'Tipo'?: (number);
  'accounts'?: (_accounts_Account)[];
}

export interface Group__Output {
  'Codigo'?: (number);
  'Nombre'?: (string);
  'Tipo'?: (number);
  'accounts'?: (_accounts_Account__Output)[];
}
