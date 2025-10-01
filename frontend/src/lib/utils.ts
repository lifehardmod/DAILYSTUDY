import { USER_LIST } from "@/constants/userList";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// handle(아이디)로 name(이름) 찾는 함수 추가
export const getUserName = (handle: string) => {
  const user = USER_LIST.find((u) => u.handle === handle);
  return user ? user.name : handle;
};

// 날짜 포맷 함수 추가 (년,월,일)
export const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
};

export const isToday = (date: string) => {
  const today = new Date();
  // 현재 로컬 시간 사용
  const todayYear = today.getFullYear();
  const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
  const todayDay = String(today.getDate()).padStart(2, "0");
  const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
  return date === todayStr;
};

export const getTodayString = () => {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
  const todayDay = String(today.getDate()).padStart(2, "0");
  return `${todayYear}-${todayMonth}-${todayDay}`;
};

export const Dateformat = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
