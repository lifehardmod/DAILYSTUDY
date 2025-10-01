import { getSubmissions } from "@/components/dailySubmissonStat/api/SubmissionAPI";
import SubmissionStatus from "@/components/dailySubmissonStat/ui/SubmissionStatus";
import RulesModal from "@/components/Modal/RuleModal";
import RuleButton from "@/components/RuleButton";
import TodayStat from "@/components/todayStat/ui/TodayStat";
import {
  getLastCrawlTime,
  updateCrawl,
} from "@/components/updateButton/api/api";
import WeeklyStats from "@/components/weeklyStats/ui/WeeklyStats";
import { useDateNavigator } from "@/hook/useDateNavigator";
import useModalStore from "@/store/useModalStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserSubmission } from "@/types/submission";

const StudyCheck = () => {
  const openRulesModal = useModalStore((state) => state.openRulesModal);
  const isRulesModalOpen = useModalStore((state) => state.isRulesModalOpen);
  const { date, formattedDate, isToday, goToPreviousDay, goToNextDay } =
    useDateNavigator();
  const queryClient = useQueryClient();

  const { data: lastCrawlTime, error: lastCrawlTimeError } = useQuery({
    queryKey: ["lastCrawlTime"],
    queryFn: getLastCrawlTime,
  });

  const {
    data: submissions,
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useQuery({
    queryKey: ["submissions", date],
    queryFn: () => getSubmissions(date),
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: handleUpdate, isPending: isCrawlUpdatePending } = useMutation(
    {
      mutationFn: updateCrawl,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["lastCrawlTime"] });
        queryClient.invalidateQueries({ queryKey: ["submissions"] });
        alert("업데이트(크롤링) 완료");
      },
      onError: (error: Error) => {
        alert(error.message);
      },
    }
  );

  const { passedUsers, failedUsers } = (submissions?.data?.users ?? []).reduce(
    (acc, user) => {
      if (user.status === "PASS") {
        acc.passedUsers.push(user);
      } else {
        acc.failedUsers.push(user);
      }
      return acc;
    },
    { passedUsers: [] as UserSubmission[], failedUsers: [] as UserSubmission[] }
  );

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4">
        <WeeklyStats />
        <TodayStat
          passedUsers={passedUsers || []}
          failedUsers={failedUsers || []}
          totalUsers={submissions?.data?.users?.length || 0}
        />
        <div className="flex justify-center">
          <RuleButton setIsRulesModalOpen={openRulesModal} />
        </div>
      </div>
      <SubmissionStatus
        lastCrawlTime={lastCrawlTime?.data?.lastCrawlTime || null}
        lastCrawlTimeError={lastCrawlTimeError}
        handleUpdate={handleUpdate}
        failedUsers={failedUsers || []}
        passedUsers={passedUsers || []}
        loading={submissionsLoading}
        error={submissionsError}
        date={date}
        formattedDate={formattedDate}
        isToday={isToday}
        goToPreviousDay={goToPreviousDay}
        goToNextDay={goToNextDay}
        isCrawlUpdatePending={isCrawlUpdatePending}
      />
      <RulesModal isOpen={isRulesModalOpen} />
    </div>
  );
};

export default StudyCheck;
