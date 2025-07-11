import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UpdateButton({
  onUpdateSuccess,
}: {
  onUpdateSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/crawl`);
      if (!res.ok) throw new Error("크롤링 실패");
      alert("업데이트(크롤링)가 완료되었습니다!");
      if (onUpdateSuccess) onUpdateSuccess();
    } catch {
      alert("업데이트에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpdate}
      disabled={loading}
      className=" text-white h-[32px]"
    >
      {loading ? "업데이트 중...(3분걸림)" : "업데이트(자주 누르지 말기..)"}
    </Button>
  );
}
