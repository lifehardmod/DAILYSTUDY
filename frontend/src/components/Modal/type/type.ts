export interface MissedSubmission {
  userId: string;
  date: string;
}

export interface MissedSubmissionsResponse {
  startDate: string;
  endDate: string;
  missedSubmissions: MissedSubmission[];
}
