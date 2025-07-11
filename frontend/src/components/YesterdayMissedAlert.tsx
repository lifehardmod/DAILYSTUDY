import { Button } from "@/components/ui/button";
import { USER_LIST } from "@/constants/userList";
import { useState } from "react";

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function YesterdayMissedAlert() {
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const fetchYesterdayMissed = async () => {
    setLoading(true);
    try {
      const yesterday = getYesterday();
      const response = await fetch(`${API_URL}/submissions?date=${yesterday}`);
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
        alert("어제 미제출자가 없습니다!");
        return;
      }
      const text = userNames.join(", ") + " 당첨!!당첨!!당첨!!당첨!!";
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
      onClick={fetchYesterdayMissed}
      className="bg-orange-500 text-white"
      disabled={loading}
    >
      돈낼사람
    </Button>
  );
}
