import { useEffect, useState, useMemo } from "react";
import { Button } from "@/shared/ui/button";
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
  // 로컬 시간 기준으로 정확한 날짜 포맷팅
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekLabel(start: Date, end: Date) {
  return `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${
    end.getMonth() + 1
  }월 ${end.getDate()}일`;
}

interface UserStat {
  userId: string;
  payedCount: number;
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
  // 현재 로컬 시간 사용 (이미 한국 시간대인 경우)
  const today = new Date();

  // 현재 주부터 시작
  for (let i = 0; i < n; i++) {
    // 현재 날짜에서 i주 전의 월요일을 계산
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i * 7);

    const { start, end } = getWeekRange(targetDate);
    result.unshift({ start: new Date(start), end: new Date(end) });
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
  // 현재 주 인덱스 (가장 최신)
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

  // 납부한 사람들 추출 (payedCount > 0)
  const payedUsers = (stats?.users.filter((u) => u.payedCount > 0) || []).sort(
    (a, b) => b.payedCount - a.payedCount
  );

  // 1등(가장 많이 납부한 사람) 찾기
  const maxPayed =
    payedUsers.length > 0
      ? Math.max(...payedUsers.map((u) => u.payedCount))
      : 0;

  // 이름(횟수) + 1등 트로피
  const payedNames = payedUsers.map((u) => {
    const name = getUserName(u.userId);
    const count = u.payedCount;
    const isTop = count === maxPayed && maxPayed > 0;
    return `${name}(${count}회)${isTop ? "🏆" : ""}`;
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          title="이전 주"
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
          title="다음 주 (현재 주까지만)"
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
            {payedNames.length > 0 ? (
              <span>{payedNames.join(", ")}</span>
            ) : (
              <span>납부자 없음</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
