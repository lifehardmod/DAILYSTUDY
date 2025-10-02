import { APIResponse } from "@/components/shared/type/api";
import { WeeklyStatsResponse } from "../type/type";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getWeeklyStats = async (
  start: string,
  end: string
): Promise<APIResponse<WeeklyStatsResponse>> => {
  const response = await fetch(`${API_URL}/stats?start=${start}&end=${end}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  return response.json();
};

export { getWeeklyStats };
