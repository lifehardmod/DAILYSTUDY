import { APIResponse } from "@/types/api";
import { ExcuseResponse } from "@/types/excuse";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const SubmitExcuseAPI = async (
  userId: string,
  date: string,
  excuse: string
): Promise<APIResponse<ExcuseResponse>> => {
  const response = await fetch(`${API_URL}/excuse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
      date,
      excuse: excuse,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  return response.json();
};
