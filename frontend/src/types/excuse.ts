import { SubmissionStatus } from "./submission";

export interface ExcuseResponse {
  userId: string;
  date: string;
  status: SubmissionStatus;
  excuse: string;
  submitTime: string;
}
