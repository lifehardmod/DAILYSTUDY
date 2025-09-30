export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

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

export interface ExcuseResponse {
  userId: string;
  date: string;
  status: SubmissionStatus;
  excuse: string;
  submitTime: string;
}

export type SubmissionStatus = "PASS" | "IMAGE";
