import { Button } from "@/components/ui/button";
import { USER_LIST } from "@/constants/userList";
import { useState } from "react";

// 날짜를 한국어 형식으로 포맷팅하는 함수
function formatKoreanDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

interface YesterdayMissedAlertProps {
  date: string;
}

export function YesterdayMissedAlert({ date }: YesterdayMissedAlertProps) {
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const fetchMissed = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/submissions?date=${date}`);
      if (!response.ok) throw new Error("불러오기 실패");
      const data = await response.json();
      const failed = (data.users || []).filter(
        (user: { status: string }) => user.status !== "PASS"
      );
      // 이름 변환
      const userNames = failed.map((user: { userId: string }) => {
        const userInfo = USER_LIST.find((u) => u.handle === user.userId);
        return userInfo ? userInfo.name : user.userId;
      });
      if (userNames.length === 0) {
        alert(`${formatKoreanDate(date)} 미제출자가 없습니다!`);
        return;
      }
      const text = `${formatKoreanDate(date)}\n당첨자 ${userNames.join(
        ", "
      )}, 당첨!!!`;
      await navigator.clipboard.writeText(text);
      alert("클립보드에 복사되었습니다!\n" + text);
    } catch {
      alert("복사에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      onClick={fetchMissed}
      className="bg-orange-500 text-white h-8"
      disabled={loading}
    >
      돈 주세요
    </Button>
  );
}
