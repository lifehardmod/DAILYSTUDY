import { Button } from "@/components/shared/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UserStat } from "../type/type";
import { useWeekNavigator } from "../hook/useWeekNavigator";
import { getWeekLabel } from "../ilb/util";
import { useQuery } from "@tanstack/react-query";
import { getWeeklyStats } from "../api/api";
import { Dateformat, getUserName } from "@/lib/utils";

const WeeklyStats = () => {
  const { monday, sunday, goToPreviousWeek, goToNextWeek } = useWeekNavigator(
    new Date()
  );

  const {
    data: stats,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["weeklyStats", monday, sunday],
    queryFn: () => getWeeklyStats(Dateformat(monday), Dateformat(sunday)),
  });

  const payedUsers = () => {
    if (stats?.data?.users.length === 0) return "납부자 없음";
    const payedUsers =
      stats?.data?.users
        .filter((user: UserStat) => user.payedCount > 0)
        .sort((a: UserStat, b: UserStat) => b.payedCount - a.payedCount) || [];

    const topScore = payedUsers[0];

    const RatingAndNaming = payedUsers.map((user: UserStat) =>
      user.payedCount === topScore.payedCount
        ? `🏆 ${getUserName(user.userId)} (${user.payedCount}회)`
        : `${getUserName(user.userId)} (${user.payedCount}회)`
    );
    return RatingAndNaming.join(", ");
  };

  return (
    <div className=" w-full p-6 space-y-6 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          onClick={() => goToPreviousWeek()}
          title="이전 주"
        >
          <ChevronLeft />
        </Button>
        <div className="text-base sm:text-lg font-semibold">
          {getWeekLabel(new Date(monday), new Date(sunday))} (월~일)
        </div>
        <Button
          variant="ghost"
          onClick={() => goToNextWeek()}
          disabled={new Date() <= new Date(sunday)}
          title="다음 주 (현재 주까지만)"
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="text-center text-xl font-semibold mb-4">납부 현황</div>
      <div className="flex justify-center">
        {loading ? (
          <div>로딩 중...</div>
        ) : error ? (
          <div className="text-red-500">{error.message}</div>
        ) : (
          <div className="text-center text-base font-medium">
            {payedUsers()}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyStats;
