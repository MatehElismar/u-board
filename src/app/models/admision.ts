import * as firebase from "firebase";
export interface Admission {
  uid?: string;
  id?: string;
  date: firebase.default.firestore.Timestamp;
  status: "filling" | "on-process";
  career?: string;
}
