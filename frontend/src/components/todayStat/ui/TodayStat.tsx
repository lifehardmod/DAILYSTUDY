import SubmitStatusCard from "@/components/SubmitStatusCard";
import { UserSubmission } from "@/types/submission";
import { Users } from "lucide-react";

interface TodayStatProps {
  passedUsers: UserSubmission[];
  failedUsers: UserSubmission[];
  totalUsers: number;
}

const TodayStat = ({
  passedUsers,
  failedUsers,
  totalUsers,
}: TodayStatProps) => {
  return (
    <section className="flex flex-col items-center gap-4 w-full">
      {/* 제출 현황 타이틀 */}
      <div className="flex flex-row items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border">
        <Users className="h-5 w-5 text-gray-600" />
        <span className="text-gray-800 font-medium">제출 현황</span>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 sm:gap-4 gap-2 w-full">
        <SubmitStatusCard value={passedUsers.length} variant="제출 완료" />
        <SubmitStatusCard value={failedUsers.length} variant="미제출" />
        <SubmitStatusCard value={totalUsers} variant="전체" />
      </div>
    </section>
  );
};

export default TodayStat;
