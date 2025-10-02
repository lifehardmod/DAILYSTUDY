import { APIResponse } from "@/components/shared/type/api";
import { UpdateCrawlResponse } from "../type/type";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getLastCrawlTime = async (): Promise<
  APIResponse<UpdateCrawlResponse>
> => {
  const response = await fetch(`${API_URL}/crawl/last-crawl`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  return response.json();
};

export const updateCrawl = async (): Promise<APIResponse<void>> => {
  const response = await fetch(`${API_URL}/crawl`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  return response.json();
};
