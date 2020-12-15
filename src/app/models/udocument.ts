export interface UDocument {
    url?: string;
    status?: Status;
    message?: string;
  }

  export type Status = "aceptado" | "rechazado";