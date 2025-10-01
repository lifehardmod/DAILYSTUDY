import { Button } from "@/components/shared";
import { USER_LIST } from "@/constants/userList";
import { useState } from "react";

interface MissedAlertProps {
  failedUsers: { userId: string }[];
}

export function MissedAlert({ failedUsers }: MissedAlertProps) {
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    setLoading(true);
    try {
      const names = failedUsers
        .map((user) => {
          const userInfo = USER_LIST.find((u) => u.handle === user.userId);
          return userInfo ? userInfo.name : user.userId;
        })
        .filter(Boolean);

      if (names.length === 0) {
        alert("오늘 미제출자가 없습니다!");
        return;
      }

      // 성씨 제거 (한국 이름의 첫 글자 제거)
      const firstNamesOnly = names.map((name) =>
        name.length > 1 ? name.slice(1) : name
      );
      const text = firstNamesOnly.join(", ") + " 알고리즘 !!!!!!";
      await navigator.clipboard.writeText(text);
      alert("클립보드에 복사되었습니다!\n" + text);
    } catch {
      alert("복사에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (failedUsers.length === 0) return null;

  return (
    <Button
      size="sm"
      onClick={handleCopy}
      className="bg-red-500 text-white w-fit"
      disabled={loading}
    >
      미제출자 독촉하기
    </Button>
  );
}
