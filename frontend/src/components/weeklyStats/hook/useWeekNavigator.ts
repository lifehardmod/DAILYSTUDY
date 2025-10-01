import { useState } from "react";
import { getMonday } from "../ilb/util";

export const useWeekNavigator = (initialDate = new Date()) => {
  // 1. 월요일 날짜로 일요일까지 구함
  const [mondayDate, setMondayDate] = useState(getMonday(initialDate));
  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(mondayDate.getDate() + 6);

  // 2. 이전 주로 이동하는 함수
  const goToPreviousWeek = () => {
    const newDate = new Date(mondayDate);
    newDate.setDate(newDate.getDate() - 7);
    setMondayDate(newDate);
  };

  // 3. 다음 주로 이동하는 함수
  const goToNextWeek = () => {
    const newDate = new Date(mondayDate);
    newDate.setDate(newDate.getDate() + 7); // 현재 날짜에서 7일을 더합니다.
    setMondayDate(newDate);
  };

  return {
    monday: mondayDate,
    sunday: sundayDate,
    goToPreviousWeek,
    goToNextWeek,
  };
};
