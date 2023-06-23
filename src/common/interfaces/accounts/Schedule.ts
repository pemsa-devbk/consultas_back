// Original file: proto/accounts.proto


export interface Schedule {
  'VerificaApertura'?: (boolean);
  'VerificaCierre'?: (boolean);
  'HorariosApertura'?: (string)[];
  'HorariosCierre'?: (string)[];
  'CheckAntesApertura'?: (boolean);
  'CheckdespuesApertura'?: (boolean);
  'CheckAntesCierre'?: (boolean);
  'CheckDespuesCierre'?: (boolean);
  'ToleranciaAperturaAntes'?: (string);
  'ToleranciaAperturaDespues'?: (string);
  'ToleranciaCierreAntes'?: (string);
  'ToleranciaCierreDespues'?: (string);
}

export interface Schedule__Output {
  'VerificaApertura'?: (boolean);
  'VerificaCierre'?: (boolean);
  'HorariosApertura'?: (string)[];
  'HorariosCierre'?: (string)[];
  'CheckAntesApertura'?: (boolean);
  'CheckdespuesApertura'?: (boolean);
  'CheckAntesCierre'?: (boolean);
  'CheckDespuesCierre'?: (boolean);
  'ToleranciaAperturaAntes'?: (string);
  'ToleranciaAperturaDespues'?: (string);
  'ToleranciaCierreAntes'?: (string);
  'ToleranciaCierreDespues'?: (string);
}
