import { UAddress } from "./address.model";
import { UDocument } from "./udocument";

export interface StudentRecord {
  id?: string;
  uid?: string;
  names?: string;
  lastnames?: string;
  cedula: string;
  email: string;
  birthdate?: string;
  gender?: string;
  career?: string;
  address?: UAddress;
  documents?: {
    ACTA_NACIMIENTO: UDocument;
    CERTIFICACION_BACHILLERATO: UDocument;
    RECORD_BACHILLERATO: UDocument;
    RECORD_INSTITUCION: UDocument;
    CEDULA: UDocument;
    FOTOS2X2: UDocument;
    VISA: UDocument;
    EXAMEN_ESPANOL: UDocument;
  };
}
