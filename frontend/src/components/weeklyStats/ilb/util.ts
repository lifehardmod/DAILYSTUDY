import { getUserName } from "@/lib/utils";
import { UserStat } from "../type/type";

// 1등(가장 많이 납부한 사람) 찾기
export const maxPayed = (payedUsers: UserStat[]) =>
  payedUsers.length > 0
    ? Math.max(...payedUsers.map((user: UserStat) => user.payedCount))
    : 0;

// 이름(횟수) + 1등 트로피
export const payedNames = (payedUsers: UserStat[]) =>
  payedUsers.map((user: UserStat) => {
    const name = getUserName(user.userId);
    const count = user.payedCount;
    const isTop = count === maxPayed(payedUsers) && maxPayed(payedUsers) > 0;
    return `${name}(${count}회)${isTop ? "🏆" : ""}`;
  });

export const getWeekLabel = (start: Date, end: Date) => {
  return `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${
    end.getMonth() + 1
  }월 ${end.getDate()}일`;
};

export const getMonday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay() || 7; // 일요일(0)을 7로 처리
  d.setDate(d.getDate() - day + 1); // 월요일 날짜로 보정
  return d;
};
