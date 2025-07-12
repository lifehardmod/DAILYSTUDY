import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function UpdateButton({
  onUpdateSuccess,
}: {
  onUpdateSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [lastCrawlTime, setLastCrawlTime] = useState<string | null>(null);

  const fetchLastCrawlTime = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/stats/last-crawl`);
      if (res.ok) {
        const data = await res.json();
        setLastCrawlTime(data.lastCrawlTime);
      }
    } catch (error) {
      console.error("마지막 크롤링 시간 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchLastCrawlTime();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/crawl`);
      if (!res.ok) throw new Error("크롤링 실패");
      alert("업데이트(크롤링)가 완료되었습니다!");
      fetchLastCrawlTime(); // 업데이트 후 마지막 크롤링 시간 갱신
      if (onUpdateSuccess) onUpdateSuccess();
    } catch {
      alert("업데이트에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatLastCrawlTime = (timeString: string | null) => {
    if (!timeString) return "마지막 업데이트: 정보 없음";

    const date = new Date(timeString);
    // 한국 시간대(UTC+9)를 고려한 현재 시간 계산
    const now = new Date();
    const koreanTime = now.getTime() + 9 * 60 * 60 * 1000; // UTC+9 시간대 적용

    const diffMs = koreanTime - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `마지막 업데이트: ${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `마지막 업데이트: ${diffHours}시간 전`;
    } else {
      return `마지막 업데이트: ${diffMinutes}분 전`;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleUpdate}
        disabled={loading}
        className=" text-white h-[32px]"
      >
        {loading ? "업데이트 중..." : "업데이트"}
      </Button>
      <div className="text-xs text-gray-500 text-center">
        {formatLastCrawlTime(lastCrawlTime)}
      </div>
    </div>
  );
}
