import { APIResponse } from "@/components/shared/type/api";
import { MissedSubmissionsResponse } from "../type/type";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getMissedSubmissions = async (
  startDate: string,
  endDate: string
): Promise<APIResponse<MissedSubmissionsResponse>> => {
  const response = await fetch(
    `${API_URL}/stats/missed?start=${startDate}&end=${endDate}`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  return response.json();
};
