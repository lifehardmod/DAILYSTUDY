import { Button } from "@/components/shared/ui";
import { USER_LIST } from "@/constants/userList";
import { UserSubmission } from "@/components/dailySubmissonStat/types/submission";

// 날짜를 한국어 형식으로 포맷팅하는 함수
function formatKoreanDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

interface YesterdayMissedAlertProps {
  failedUsers: UserSubmission[];
  date: string;
}

export function YesterdayMissedAlert({
  failedUsers,
  date,
}: YesterdayMissedAlertProps) {
  const fetchMissed = async () => {
    // 이름 변환
    const userNames = failedUsers.map((user) => {
      const userInfo = USER_LIST.find((u) => u.handle === user.userId);
      return userInfo ? userInfo.name : user.userId;
    });

    const text = `${formatKoreanDate(date)}\n당첨자 ${userNames.join(
      ", "
    )} 당첨!!!`;
    await navigator.clipboard.writeText(text);
    alert("클립보드에 복사되었습니다!\n" + text);
  };

  return (
    <Button
      size="sm"
      onClick={fetchMissed}
      className="bg-orange-500 text-white h-8 w-fit"
    >
      돈 주세요
    </Button>
  );
}
