// Original file: proto/events.proto


export interface Scheduled {
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

export interface Scheduled__Output {
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
