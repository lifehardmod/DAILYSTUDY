export interface UserStat {
  userId: string;
  payedCount: number;
}

export interface WeeklyStatsResponse {
  startDate: string;
  endDate: string;
  totalDays: number;
  users: UserStat[];
}
