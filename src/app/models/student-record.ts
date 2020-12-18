import { UAddress } from "./address.model";
import { UDocument } from "./udocument";
import * as firebase from "firebase";

export interface StudentRecord {
  id?: string;
  uid?: string;
  names?: string;
  lastnames?: string;
  createdAt: firebase.default.firestore.Timestamp;
  telephone?: string;
  religion?: string;
  cellphone?: string;
  cedula: string;
  email: string;
  civil_status: string;
  birthdate?: number;
  gender?: string;
  address?: UAddress;
  nationality?: string;
  // academic
  academic?: {
    study_type?: string;
    career?: string;
    highSchool_name?: string;
    grade_career?: string;
    previousUniversity_name?: string;
    previousUniversity_career?: string;
  };
  // medical
  medical?: {
    blood_type?: string;
    isAlergic?: string;
    disease?: string;
    treatment?: string;
  };
  // family
  family?: {
    father_names: string;
    father_lastnames: string;
    father_telephone: string;
    father_occupation: string;
    father_civil_status: string;
    mother_names: string;
    mother_lastnames: string;
    mother_telephone: string;
    mother_occupation: string;
    mother_civil_status: string;
    wife_or_husband_names: string;
    wife_or_husband_lastnames: string;
    wife_or_husband_telephone: string;
    wife_or_husband_occupation: string;
  };
  documents?: {
    ACTA_NACIMIENTO: UDocument;
    CERTIFICACION_BACHILLERATO: UDocument;
    RECORD_BACHILLERATO: UDocument;
    RECORD_INSTITUCION: UDocument;
    CEDULA: UDocument;
    FOTOS2X2: UDocument;
    VISA: UDocument;
    EXAMEN_ESPANOL: UDocument;
    PASAPORTE: UDocument;
  };
}
