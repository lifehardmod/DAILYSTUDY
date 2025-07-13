import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * "2025년 7월 11일 02:32:32" 같은 submitTime 문자열을
 * JS Date 객체로 변환합니다.
 */
export function parseKoreanTimestamp(ts: string): Date {
  const m = ts.match(
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(\d{1,2}):(\d{2}):(\d{2})/
  );
  if (!m) {
    throw new Error(`Invalid Korean timestamp: ${ts}`);
  }
  const [_all, yy, MM, dd, hh, mi, ss] = m;

  // 명시적으로 KST 시간대로 파싱 (서버 환경 무관)
  return dayjs
    .tz(
      `${yy}-${MM.padStart(2, "0")}-${dd.padStart(2, "0")}T${hh.padStart(
        2,
        "0"
      )}:${mi}:${ss}`,
      "Asia/Seoul"
    )
    .toDate();
}
/**
 * 주어진 제출 시간과 레벨이
 * 기록 조건을 만족하는지 판단합니다.
 *
 * - 월(1)~금(5): level >= 6
 * - 토(6), 일(0): level >= 11
 */
export function isRecordable(submitTime: string, level: number): boolean {
  const date = parseKoreanTimestamp(submitTime);
  // KST 기준으로 요일 추출
  const kstDay = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
  ).getDay();
  if (kstDay >= 1 && kstDay <= 5) {
    return level >= 6;
  } else {
    return level >= 11;
  }
}

/**
 * level 에 대응하는 tier 문자열로 매핑합니다.
 * -  6~10 → Silver5~1
 * - 11~15 → Gold5~1
 * - 16~20 → Platinum5~1
 * - 21~25 → Diamond5~1
 * - 26~30 → Ruby5~1
 */
export function levelToTier(level: number): string {
  const groups = ["실버", "골드", "플래티넘", "다이아", "루비"];
  if (level < 6 || level > 30) return "?";

  const offset = level - 6;
  const groupIdx = Math.floor(offset / 5); // 0~4
  const rank = 5 - (offset % 5); // 5~1

  return `${groups[groupIdx]}${rank}`;
}
