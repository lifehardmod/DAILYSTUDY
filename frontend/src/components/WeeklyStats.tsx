import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { USER_LIST } from "@/constants/userList";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

function getWeekRange(date: Date) {
  const day = date.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday };
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getWeekLabel(start: Date, end: Date) {
  return `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${
    end.getMonth() + 1
  }월 ${end.getDate()}일`;
}

interface UserStat {
  userId: string;
  missingCount: number;
}
interface StatsResponse {
  startDate: string;
  endDate: string;
  totalDays: number;
  users: UserStat[];
}

function getUserName(handle: string) {
  const user = USER_LIST.find((u) => u.handle === handle);
  return user ? user.name : handle;
}

function getRecentWeeks(n: number): { start: Date; end: Date }[] {
  const result = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const { start, end } = getWeekRange(d);
    result.unshift({ start: new Date(start), end: new Date(end) });
    d.setDate(start.getDate() - 1);
  }
  return result;
}

export function WeeklyStats() {
  const WEEK_COUNT = 5;
  const weekRanges = useMemo(() => getRecentWeeks(WEEK_COUNT), [WEEK_COUNT]);
  const [statsArr, setStatsArr] = useState<(StatsResponse | null)[]>(
    Array(WEEK_COUNT).fill(null)
  );
  const [loadingArr, setLoadingArr] = useState<boolean[]>(
    Array(WEEK_COUNT).fill(false)
  );
  const [errorArr, setErrorArr] = useState<(string | null)[]>(
    Array(WEEK_COUNT).fill(null)
  );
  const [currentIdx, setCurrentIdx] = useState(WEEK_COUNT - 1);

  useEffect(() => {
    // 이미 데이터가 있거나 로딩 중이면 fetch하지 않음
    if (statsArr[currentIdx] || loadingArr[currentIdx]) return;
    setLoadingArr((arr) => {
      const copy = [...arr];
      copy[currentIdx] = true;
      return copy;
    });
    setErrorArr((arr) => {
      const copy = [...arr];
      copy[currentIdx] = null;
      return copy;
    });
    const { start, end } = weekRanges[currentIdx];
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    fetch(`${API_URL}/stats?start=${formatDate(start)}&end=${formatDate(end)}`)
      .then((res) => res.json())
      .then((data: StatsResponse) => {
        setStatsArr((arr) => {
          const copy = [...arr];
          copy[currentIdx] = data;
          return copy;
        });
      })
      .catch(() => {
        setErrorArr((arr) => {
          const copy = [...arr];
          copy[currentIdx] = "데이터를 불러오지 못했습니다.";
          return copy;
        });
      })
      .finally(() => {
        setLoadingArr((arr) => {
          const copy = [...arr];
          copy[currentIdx] = false;
          return copy;
        });
      });
    // eslint-disable-next-line
  }, [currentIdx]);

  const { start, end } = weekRanges[currentIdx];
  const weekLabel = getWeekLabel(start, end);
  const stats = statsArr[currentIdx];
  const loading = loadingArr[currentIdx];
  const error = errorArr[currentIdx];

  // 미제출자만 추출 (missingCount > 0)
  const missedUsers = (
    stats?.users.filter((u) => u.missingCount > 0) || []
  ).sort((a, b) => b.missingCount - a.missingCount);
  // 1등(미제출 가장 많은 사람) 찾기
  const maxMissed =
    missedUsers.length > 0
      ? Math.max(...missedUsers.map((u) => u.missingCount))
      : 0;
  // 이름(횟수) + 1등 트로피
  const missedNames = missedUsers.map((u) => {
    const name = getUserName(u.userId);
    const count = u.missingCount;
    const isTop = count === maxMissed && maxMissed > 0;
    return `${name}(${count}회)${isTop ? "🏆" : ""}`;
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
        >
          <ChevronLeft />
        </Button>
        <div className="text-lg font-bold">
          {weekLabel} ({WEEKDAYS[0]}~{WEEKDAYS[6]})
        </div>
        <Button
          variant="ghost"
          onClick={() => setCurrentIdx((i) => Math.min(WEEK_COUNT - 1, i + 1))}
          disabled={currentIdx === WEEK_COUNT - 1}
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="text-center text-xl font-semibold mb-4">납부 현황</div>
      <div className="transition-all duration-300">
        {loading ? (
          <div>로딩 중...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="text-center text-base font-medium">
            {missedNames.length > 0 ? (
              <span>{missedNames.join(", ")}</span>
            ) : (
              <span>미제출자 없음</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
