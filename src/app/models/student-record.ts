import { UDocument } from "./udocument";

export interface StudentRecord {
    uid?: string;
    names?: string;
    lastnames?: string;
    cedula: string;
    birthdate?: string;
    gender?: string;
    career?: string;
    streetName?: string;
    streetNumber?: string;
    province?: string;
    documents: UDocument;
  }
  