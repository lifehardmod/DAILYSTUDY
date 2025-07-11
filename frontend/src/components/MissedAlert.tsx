import { Button } from "@/components/ui/button";
import { USER_LIST } from "@/constants/userList";

// 성을 제외한 이름만 반환하는 함수
function getFirstName(fullName: string) {
  if (!fullName) return "";
  return fullName.length > 1 ? fullName.slice(1) : fullName;
}

export function MissedAlert({
  failedUsers,
}: {
  failedUsers: { userId: string }[];
}) {
  const names = failedUsers
    .map((user) => {
      const userInfo = USER_LIST.find((u) => u.handle === user.userId);
      return userInfo ? getFirstName(userInfo.name) : user.userId;
    })
    .filter(Boolean);

  const handleCopy = async () => {
    const text = names.join(", ") + " 제출!!!!";
    try {
      await navigator.clipboard.writeText(text);
      alert("클립보드에 복사되었습니다!");
    } catch {
      alert("복사에 실패했습니다.");
    }
  };

  if (names.length === 0) return null;

  return (
    <div className="flex justify-end mb-2">
      <Button size="sm" onClick={handleCopy} className="bg-red-500 text-white">
        미제출자 알림 복사
      </Button>
    </div>
  );
}
