export const formatLastCrawlTime = (timeString: string | null) => {
  if (!timeString) return "마지막 업데이트: 정보 없음";

  const date = new Date(timeString);
  // 유효하지 않은 날짜 체크
  if (isNaN(date.getTime())) {
    return "마지막 업데이트: 날짜 형식 오류";
  }

  // 한국 시간대(UTC+9)를 고려한 현재 시간 계산
  const now = new Date();
  const diffMs = Math.abs(now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // 미래 날짜인지 확인
  const isFuture = date.getTime() > now.getTime();
  const suffix = isFuture ? "후" : "전";

  if (diffDays > 0) {
    return `마지막 업데이트: ${diffDays}일 ${suffix}`;
  } else if (diffHours > 0) {
    return `마지막 업데이트: ${diffHours}시간 ${suffix}`;
  } else {
    return `마지막 업데이트: ${diffMinutes}분 ${suffix}`;
  }
};
