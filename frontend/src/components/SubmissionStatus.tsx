import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SubmissionResponse } from "../types/submission";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Users,
  Clock,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { USER_LIST } from "@/constants/userList";
import { MissedAlert } from "./MissedAlert";
import { UpdateButton } from "./UpdateButton";
import { YesterdayMissedAlert } from "./YesterdayMissedAlert";

// handle(아이디)로 name(이름) 찾는 함수 추가
function getUserName(handle: string) {
  const user = USER_LIST.find((u) => u.handle === handle);
  return user ? user.name : handle;
}

// 사유 라벨 목록
const EXCUSE_LABELS = [
  "돈 냈어요.",
  "다른 사이트를 이용했어요",
  "코테 혹은 시험이 있었어요",
  "다른 공부를 했어요",
  "기타 사유",
];

interface ExcuseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (excuse: { excuse: string }) => void;
}

function ExcuseModal({ isOpen, onClose, onSubmit }: ExcuseModalProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [otherDetail, setOtherDetail] = useState("");
  const [showKakaoCheck, setShowKakaoCheck] = useState(false);
  const [kakaoConfirmed, setKakaoConfirmed] = useState(false);

  const handleExcuseSubmit = () => {
    if (!selectedLabel) return;

    if (!showKakaoCheck) {
      setShowKakaoCheck(true);
      return;
    }

    if (!kakaoConfirmed) {
      alert("카카오톡 방에 인증 사진을 먼저 올려주세요!");
      return;
    }

    onSubmit({
      excuse: selectedLabel === "기타 사유" ? otherDetail : selectedLabel,
    });
    onClose();
    // Reset states
    setSelectedLabel(null);
    setOtherDetail("");
    setShowKakaoCheck(false);
    setKakaoConfirmed(false);
  };

  const handleClose = () => {
    onClose();
    // Reset states
    setSelectedLabel(null);
    setOtherDetail("");
    setShowKakaoCheck(false);
    setKakaoConfirmed(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            미제출 사유 등록
          </DialogTitle>
          <DialogDescription>
            {!showKakaoCheck
              ? "미제출 사유를 선택해주세요."
              : "카카오톡에 먼저 인증을 올려주세요."}
          </DialogDescription>
        </DialogHeader>

        {!showKakaoCheck ? (
          <div className="space-y-4">
            <RadioGroup
              value={selectedLabel || ""}
              onValueChange={(value) => setSelectedLabel(value)}
              className="space-y-3 "
            >
              {EXCUSE_LABELS.map((label, idx) => (
                <div
                  key={label}
                  className="flex items-center space-x-3 p-4 border border-gray-400 rounded-sm hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem
                    value={label}
                    id={`excuse-${idx}`}
                    className="border-gray-500"
                  />
                  <Label
                    htmlFor={`excuse-${idx}`}
                    className="cursor-pointer text-sm"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {selectedLabel === "기타 사유" && (
              <div className="space-y-2">
                <Label htmlFor="detail" className="text-sm font-medium">
                  상세 사유
                </Label>
                <Textarea
                  id="detail"
                  value={otherDetail}
                  onChange={(e) => setOtherDetail(e.target.value)}
                  placeholder="사유를 입력해주세요"
                  className="resize-none min-h-[80px] "
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className=" bg-gray-50 font-semibold">
              카카오톡 방에 인증 사진을 올리셨나요?
            </p>
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <Checkbox
                id="kakao-confirm"
                checked={kakaoConfirmed}
                onCheckedChange={(checked) =>
                  setKakaoConfirmed(checked as boolean)
                }
              />
              <Label htmlFor="kakao-confirm" className="cursor-pointer text-sm">
                네, 올렸습니다
              </Label>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button
            onClick={handleExcuseSubmit}
            disabled={
              !selectedLabel || (selectedLabel === "기타 사유" && !otherDetail)
            }
          >
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SubmissionStatus() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // TanStack Query를 사용한 데이터 페칭 및 캐싱
  const {
    data: submissions,
    isLoading: loading,
    error,
    refetch: fetchSubmissions,
  } = useQuery({
    queryKey: ["submissions", date], // 날짜별로 캐시 분리
    queryFn: async () => {
      const response = await fetch(`${API_URL}/submissions?date=${date}`);
      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }
      return response.json() as Promise<SubmissionResponse>;
    },
    staleTime: 2 * 60 * 1000, // 2분 동안 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분 동안 캐시 유지
  });

  // 날짜 포맷 함수 추가
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  // 날짜 이동 함수들 추가
  const goToPreviousDay = () => {
    const [year, month, day] = date.split("-").map(Number);
    const currentDate = new Date(year, month - 1, day);
    currentDate.setDate(currentDate.getDate() - 1);
    const newYear = currentDate.getFullYear();
    const newMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
    const newDay = String(currentDate.getDate()).padStart(2, "0");
    setDate(`${newYear}-${newMonth}-${newDay}`);
  };

  const goToNextDay = () => {
    const [year, month, day] = date.split("-").map(Number);
    const currentDate = new Date(year, month - 1, day);
    const today = new Date();

    // 오늘 날짜와 비교 (시간 제외)
    const todayStr = today.toISOString().split("T")[0];

    if (date < todayStr) {
      currentDate.setDate(currentDate.getDate() + 1);
      const newYear = currentDate.getFullYear();
      const newMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
      const newDay = String(currentDate.getDate()).padStart(2, "0");
      setDate(`${newYear}-${newMonth}-${newDay}`);
    }
  };

  const isToday = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    return date === todayStr;
  };

  const handleExcuse = async (excuse: { excuse: string }) => {
    if (!selectedUserId) return;
    try {
      const response = await fetch(`${API_URL}/excuse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
          date,
          excuse: excuse.excuse,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit excuse");
      }
      // 성공 시 현재 날짜 데이터만 새로고침
      await fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert("사유 제출 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-600"></div>
        <p className="text-gray-600 font-medium">제출 현황을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-800">
                오류가 발생했습니다
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {error?.message || "알 수 없는 오류가 발생했습니다."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const passedUsers =
    submissions?.users.filter((user) => user.status === "PASS") || [];
  const failedUsers =
    submissions?.users.filter((user) => user.status !== "PASS") || [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 날짜 선택 제거 */}
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border">
          <Users className="h-5 w-5 text-gray-600" />
          <span className="text-gray-800 font-medium">제출 현황</span>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-gray-600" />
              <span className="text-gray-800 font-medium">제출 완료</span>
            </div>
            <p className="text-2xl font-bold text-gray-700 text-center mt-2">
              {passedUsers.length}명
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2">
              <XCircle className="h-5 w-5 text-gray-600" />
              <span className="text-gray-800 font-medium">미제출</span>
            </div>
            <p className="text-2xl font-bold text-gray-700 text-center mt-2">
              {failedUsers.length}명
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <span className="text-gray-800 font-medium">전체</span>
            </div>
            <p className="text-2xl font-bold text-gray-700 text-center mt-2">
              {submissions?.users.length || 0}명
            </p>
          </div>
        </div>
      </div>
      {/* User Cards */}
      <div className="space-y-6">
        {/* 미제출자 복사 버튼 */}
        <div className="flex-row flex gap-2 justify-end">
          <UpdateButton onUpdateSuccess={() => fetchSubmissions()} />
        </div>

        {/* 날짜 선택 */}
        <div className="flex items-center justify-center gap-4 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousDay}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold text-gray-800 px-4">
            {formatDate(date)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextDay}
            disabled={isToday()}
            className="flex items-center gap-1"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {failedUsers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              미제출 ({failedUsers.length}명){" "}
              <YesterdayMissedAlert date={date} />
              <MissedAlert failedUsers={failedUsers} />
            </h3>
            <div className="grid gap-4">
              {failedUsers.map((user) => (
                <div
                  key={user.userId}
                  className="bg-white border border-gray-200 rounded-xs shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border">
                          <span className="text-gray-700 font-semibold">
                            {user.userId.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">
                            {getUserName(user.userId)}
                          </h4>
                          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                            <XCircle className="h-3 w-3 mr-1" />
                            미제출
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUserId(user.userId);
                          setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 rounded-sm border-gray-600"
                      >
                        <MessageSquare className="h-4 w-4" />
                        사유 제출
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {passedUsers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              제출 완료 ({passedUsers.length}명)
            </h3>
            <div className="grid gap-4">
              {passedUsers.map((user) => (
                <div
                  key={user.userId}
                  className="bg-white border border-gray-200 rounded-xs shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border">
                          <span className="text-gray-700 font-semibold">
                            {user.userId.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">
                            {getUserName(user.userId)}
                          </h4>
                          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            제출 완료
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {user.problems && user.problems.length > 0 && (
                      <div className="space-y-3">
                        {user.problems.map((problem, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 border border-gray-200 rounded-xs p-4"
                          >
                            {problem.excuse ? (
                              <div className="flex items-start gap-3">
                                <MessageSquare className="h-4 w-4 mt-0.5 text-gray-600" />
                                <div>
                                  <p className="text-sm text-black font-medium">
                                    사유: {problem.excuse}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium text-gray-900">
                                    {problem.titleKo}
                                  </h5>
                                  <Badge
                                    variant="outline"
                                    className="text-xs rounded-xs"
                                  >
                                    티어: {problem.tier}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {problem.submitTime}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ExcuseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUserId(null);
        }}
        onSubmit={handleExcuse}
      />
    </div>
  );
}
