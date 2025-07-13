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
        console.log(data.lastCrawlTime);
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
      alert("업데이트에 실패했습니다. 다시 시도하면 될지도.");
    } finally {
      setLoading(false);
    }
  };

  const formatLastCrawlTime = (timeString: string | null) => {
    if (!timeString) return "마지막 업데이트: 정보 없음";

    // 잘못된 시간 형식 수정 (+00db -> +00:00 또는 Z)
    let cleanedTimeString = timeString;
    if (timeString.includes("+00db")) {
      cleanedTimeString = timeString.replace("+00db", "Z");
    }

    const date = new Date(cleanedTimeString);

    // 유효하지 않은 날짜 체크
    if (isNaN(date.getTime())) {
      return "마지막 업데이트: 날짜 형식 오류";
    }

    // 한국 시간대(UTC+9)를 고려한 현재 시간 계산
    const now = new Date();
    console.log("현재 시간:", now);
    console.log("마지막 크롤링 시간:", date);
    console.log("원본 데이터:", timeString);
    console.log("정리된 데이터:", cleanedTimeString);

    const diffMs = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // 미래 날짜인지 확인
    const isFuture = date.getTime() > now.getTime();
    const suffix = isFuture ? "후" : "전";

    if (diffDays > 0) {
      return `마지막 업데이트: ${diffDays}일 ${suffix}`;
    } else if (diffHours > 0) {
      return `마지막 업데이트: ${diffHours}시간 ${suffix}`;
    } else {
      return `마지막 업데이트: ${diffMinutes}분 ${suffix}`;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleUpdate}
        disabled={loading}
        className=" text-white h-[32px]"
      >
        {loading ? "업데이트 중... 1분소요" : "업데이트"}
      </Button>
      <div className="text-xs text-gray-500 text-center">
        {formatLastCrawlTime(lastCrawlTime)}
      </div>
    </div>
  );
}
