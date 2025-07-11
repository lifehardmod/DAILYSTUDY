import { useState, useEffect } from "react";

export function KoreanTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const options = {
      timeZone: "Asia/Seoul",
      hour12: false,
    };

    const year = date
      .toLocaleString("ko-KR", { ...options, year: "numeric" })
      .replace("년", "")
      .trim();
    const month = date
      .toLocaleString("ko-KR", { ...options, month: "2-digit" })
      .replace("월", "")
      .trim();
    const day = date
      .toLocaleString("ko-KR", { ...options, day: "2-digit" })
      .replace("일", "")
      .trim();
    const hour = date
      .toLocaleString("ko-KR", { ...options, hour: "2-digit" })
      .trim();
    const minute = date
      .toLocaleString("ko-KR", { ...options, minute: "2-digit" })
      .trim();
    const second = date
      .toLocaleString("ko-KR", { ...options, second: "2-digit" })
      .trim();

    return `${year}년 ${month}월 ${day}일 ${hour} ${minute}분 ${second}초`;
  };

  return <div className="text-2xl font-bold">{formatTime(currentTime)}</div>;
}
