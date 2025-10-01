import { useState, useMemo } from "react";
import { getTodayString, formatDate } from "@/lib/utils";

// 초기 날짜를 props로 받을 수 있게 설계 (없으면 오늘 날짜)
export const useDateNavigator = (initialDate = getTodayString()) => {
  const [date, setDate] = useState(initialDate);

  const goToPreviousDay = () => {
    const [year, month, day] = date.split("-").map(Number);
    const currentDate = new Date(year, month - 1, day);
    currentDate.setDate(currentDate.getDate() - 1);

    const newYear = currentDate.getFullYear();
    const newMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
    const newDay = String(currentDate.getDate()).padStart(2, "0");
    setDate(`${newYear}-${newMonth}-${newDay}`);
  };

  const goToNextDay = () => {
    const todayStr = getTodayString();
    if (date < todayStr) {
      const [year, month, day] = date.split("-").map(Number);
      const currentDate = new Date(year, month - 1, day);
      currentDate.setDate(currentDate.getDate() + 1);

      const newYear = currentDate.getFullYear();
      const newMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
      const newDay = String(currentDate.getDate()).padStart(2, "0");
      setDate(`${newYear}-${newMonth}-${newDay}`);
    }
  };

  // date 값이 바뀔 때만 isToday와 formattedDate가 다시 계산되도록 useMemo 사용
  const isToday = useMemo(() => date === getTodayString(), [date]);
  const formattedDate = useMemo(() => formatDate(date), [date]);

  return {
    date, // 현재 날짜 문자열 (YYYY-MM-DD)
    setDate, // 날짜를 직접 설정할 함수
    formattedDate, // 포맷된 날짜 문자열
    isToday, // 오늘인지 여부
    goToPreviousDay, // 이전 날로 이동
    goToNextDay, // 다음 날로 이동
  };
};
