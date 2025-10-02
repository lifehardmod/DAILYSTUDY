export interface Problem {
  problemId: number;
  titleKo: string;
  level: number;
  tier: string;
  submitTime: string;
  excuse?: string;
}

export interface UserSubmission {
  userId: string;
  status: "PASS" | "NONE";
  problems?: Problem[];
}

export interface SubmissionResponse {
  date: string;
  users: UserSubmission[];
}

export type SubmissionStatus = "PASS" | "IMAGE";
