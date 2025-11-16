import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { Analytics } from "@vercel/analytics/react";

// QueryClient 생성 - 캐싱 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분 동안 fresh 상태 유지
      gcTime: 10 * 60 * 1000, // 10분 동안 캐시 유지 (이전 cacheTime)
      refetchOnWindowFocus: false, // 창 포커스 시 자동 refetch 비활성화
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    <Analytics />
  </StrictMode>
);
