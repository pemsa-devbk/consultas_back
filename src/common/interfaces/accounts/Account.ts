// Original file: proto/accounts.proto

import type { Panel as _accounts_Panel, Panel__Output as _accounts_Panel__Output } from '../accounts/Panel';
import type { Partition as _accounts_Partition, Partition__Output as _accounts_Partition__Output } from '../accounts/Partition';
import type { Zone as _accounts_Zone, Zone__Output as _accounts_Zone__Output } from '../accounts/Zone';
import type { User as _accounts_User, User__Output as _accounts_User__Output } from '../accounts/User';
import type { Contact as _accounts_Contact, Contact__Output as _accounts_Contact__Output } from '../accounts/Contact';
import type { GeneralData as _accounts_GeneralData, GeneralData__Output as _accounts_GeneralData__Output } from '../accounts/GeneralData';
import type { Security as _accounts_Security, Security__Output as _accounts_Security__Output } from '../accounts/Security';
import type { Schedule as _accounts_Schedule, Schedule__Output as _accounts_Schedule__Output } from '../accounts/Schedule';

export interface Account {
  'CodigoCte'?: (string);
  'CodigoAbonado'?: (string);
  'Nombre'?: (string);
  'Direccion'?: (string);
  'Status'?: (string);
  'panel'?: (_accounts_Panel | null);
  'particiones'?: (_accounts_Partition)[];
  'zonas'?: (_accounts_Zone)[];
  'usuarios'?: (_accounts_User)[];
  'contactos'?: (_accounts_Contact)[];
  'datosGeneralesDetallados'?: (_accounts_GeneralData | null);
  'seguridad'?: (_accounts_Security | null);
  'emails'?: (string)[];
  'horario'?: (_accounts_Schedule | null);
}

export interface Account__Output {
  'CodigoCte'?: (string);
  'CodigoAbonado'?: (string);
  'Nombre'?: (string);
  'Direccion'?: (string);
  'Status'?: (string);
  'panel'?: (_accounts_Panel__Output);
  'particiones'?: (_accounts_Partition__Output)[];
  'zonas'?: (_accounts_Zone__Output)[];
  'usuarios'?: (_accounts_User__Output)[];
  'contactos'?: (_accounts_Contact__Output)[];
  'datosGeneralesDetallados'?: (_accounts_GeneralData__Output);
  'seguridad'?: (_accounts_Security__Output);
  'emails'?: (string)[];
  'horario'?: (_accounts_Schedule__Output);
}
