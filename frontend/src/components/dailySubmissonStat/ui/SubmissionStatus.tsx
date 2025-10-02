import { useState } from "react";
import useModalStore from "@/store/useModalStore";
import Pending from "@/components/Pending";
import Error from "@/components/Error";
import { Button } from "@/components/shared/ui";
import { ChevronLeft, ChevronRight, Trophy, XCircle } from "lucide-react";
import UserSubmissionStatusList from "@/components/dailySubmissonStat/ui/UserSubmissionStatusList";
import { YesterdayMissedAlert } from "@/components/dailySubmissonStat/ui/YesterdayMissedAlert";
import { MissedAlert } from "@/components/dailySubmissonStat/ui/MissedAlert";
import ExcuseModal from "@/components/Modal/ExcuseModal";
import { UserSubmission } from "@/components/dailySubmissonStat/types/submission";
import UpdateButton from "@/components/updateButton/ui/UpdateButton";

interface SubmissionStatusProps {
  failedUsers: UserSubmission[];
  passedUsers: UserSubmission[];
  loading: boolean;
  error: Error | null;
  date: string;
  formattedDate: string;
  isToday: boolean;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  lastCrawlTime: string | null;
  lastCrawlTimeError: Error | null;
  handleUpdate: () => void;
  isCrawlUpdatePending: boolean;
}

const SubmissionStatus = ({
  lastCrawlTime,
  lastCrawlTimeError,
  handleUpdate,
  failedUsers,
  passedUsers,
  loading,
  error,
  date,
  formattedDate,
  isToday,
  goToPreviousDay,
  goToNextDay,
  isCrawlUpdatePending,
}: SubmissionStatusProps) => {
  const isExcuseModalOpen = useModalStore((state) => state.isExcuseModalOpen);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (loading) {
    return <Pending />;
  }

  if (error) {
    return <Error error={error} />;
  }
  return (
    <div className="mx-auto space-y-8">
      <div className="space-y-6">
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
        <div className="flex justify-end">
          <UpdateButton
            isCrawlUpdatePending={isCrawlUpdatePending}
            lastCrawlTime={lastCrawlTime || null}
            lastCrawlTimeError={lastCrawlTimeError}
            handleUpdate={handleUpdate}
          />
        </div>
        {failedUsers.length > 0 && (
          <UserSubmissionStatusList
            title="미제출"
            icon={<XCircle className="h-5 w-5" />}
            users={failedUsers}
            setSelectedUserId={setSelectedUserId}
            children={
              <>
                <YesterdayMissedAlert failedUsers={failedUsers} date={date} />
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
        date={formattedDate}
        isOpen={isExcuseModalOpen}
        userId={selectedUserId}
      />
    </div>
  );
};

export default SubmissionStatus;
