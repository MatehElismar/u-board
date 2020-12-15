export interface UDocument {
  urls?: string[];
  status?: Status;
  message?: string;
}

export type Status = "sent" | "accepted" | "declined";
