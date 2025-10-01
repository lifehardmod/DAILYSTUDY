// utils.test.ts
import { UserStat } from "../type/type";
import { maxPayed, payedNames, getWeekLabel, getMonday } from "./util";

describe("유틸 함수 테스트", () => {
  const mockUsers = [
    { userId: "1", payedCount: 3 },
    { userId: "2", payedCount: 5 },
    { userId: "3", payedCount: 5 },
    { userId: "4", payedCount: 1 },
  ];

  // getUserName이 외부 함수이면 간단히 모킹
  jest.mock("@/lib/utils", () => ({
    getUserName: (id: string) => `User${id}`,
  }));

  it("maxPayed: 가장 많이 납부한 횟수 반환", () => {
    expect(maxPayed(mockUsers as UserStat[])).toBe(5);
    expect(maxPayed([])).toBe(0); // 빈 배열 테스트
  });

  it("payedNames: 이름+횟수 + 1등 트로피", () => {
    const result = payedNames(mockUsers as UserStat[]);
    expect(result).toContain("2(5회)🏆");
    expect(result).toContain("3(5회)🏆");
    expect(result).toContain("1(3회)");
    expect(result).toContain("4(1회)");
  });

  it("getWeekLabel: 날짜 범위 문자열 반환", () => {
    const start = new Date("2025-10-01");
    const end = new Date("2025-10-05");
    expect(getWeekLabel(start, end)).toBe("10월 1일 ~ 10월 5일");
  });

  it("getMonday: 해당 주 월요일 반환", () => {
    const date = new Date();
    const monday = getMonday(date);
    expect(monday.getDate()).toBe(29);
    expect(monday.getDay()).toBe(1);
  });
});
