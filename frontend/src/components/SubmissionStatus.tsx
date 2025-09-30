import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SubmissionResponse } from "../types/submission";
import { Button } from "@/shared/ui/button";
import {
  CheckCircle,
  XCircle,
  Users,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { MissedAlert } from "./MissedAlert";
import { UpdateButton } from "./UpdateButton";
import { YesterdayMissedAlert } from "./YesterdayMissedAlert";
import UserSubmissionStatusList from "./UserSubmissionStatusList";
import RulesModal from "./Modal/RuleModal";
import ExcuseModal from "./Modal/ExcuseModal";
import useModalStore from "@/app/store/useModalStore";
import { useSubmitExcuse } from "@/features/hook/useSubmitExcuse";
import Error from "./Error";
import Pending from "./Pending";
import { useDateNavigator } from "@/features/hook/useDateNavigator";
import SubmitStatusCard from "./SubmitStatusCard";

// 규칙 모달 컴포넌트 추가

const SubmissionStatus = () => {
  const setIsModalOpen = useModalStore((state) => state.setIsModalOpen);
  const isModalOpen = useModalStore((state) => state.isModalOpen);

  const { mutate, isPending } = useSubmitExcuse();
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { date, formattedDate, isToday, goToPreviousDay, goToNextDay } =
    useDateNavigator();

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

  if (loading) {
    return <Pending />;
  }

  if (error) {
    return <Error error={error} />;
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
        <div className="flex items-center justify-center gap-4">
          <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-gray-800 font-medium">제출 현황</span>
          </div>
          <div
            onClick={() => setIsRulesModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <Info className="h-5 w-5 text-gray-600" />
            <span className="text-gray-800 font-medium">규칙</span>
          </div>
        </div>
        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <SubmitStatusCard value={passedUsers.length} variant="제출 완료" />
          <SubmitStatusCard value={failedUsers.length} variant="미제출" />
          <SubmitStatusCard
            value={submissions?.users.length || 0}
            variant="전체"
          />
        </section>
      </div>
      <div className="space-y-6">
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
            {formattedDate}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextDay}
            disabled={isToday}
            className="flex items-center gap-1"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {failedUsers.length > 0 && (
          <UserSubmissionStatusList
            title="미제출"
            icon={<XCircle className="h-5 w-5" />}
            users={failedUsers}
            setSelectedUserId={setSelectedUserId}
            children={
              <>
                <YesterdayMissedAlert date={date} />
                <MissedAlert failedUsers={failedUsers} />
              </>
            }
          />
        )}
        {passedUsers.length > 0 && (
          <UserSubmissionStatusList
            title="제출 완료"
            icon={<Trophy className="h-5 w-5" />}
            users={passedUsers}
          />
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

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </div>
  );
};

export default SubmissionStatus;
