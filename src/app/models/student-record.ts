import { UAddress } from "./address.model";
import { UDocument } from "./udocument";

export interface StudentRecord {
  id?: string;
  uid?: string;
  names?: string;
  lastnames?: string;
  cedula: string;
  birthdate?: string;
  gender?: string;
  career?: string;
  address?: UAddress;
  documents?: {
    ACTA_NACIMIENTO: UDocument;
  };
}
