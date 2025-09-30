import { CheckCircle, MessageSquare, Clock } from "lucide-react";
import { UserSubmission } from "../types/submission";
import { getUserName } from "@/lib/utils";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import useModalStore from "@/store/useModalStore";

export interface UserCardProps {
  user: UserSubmission;
  setSelectedUserId?: (userId: string) => void;
}

const UserCard = ({ user, setSelectedUserId }: UserCardProps) => {
  const setIsModalOpen = useModalStore((state) => state.setIsModalOpen);

  return (
    <div
      key={user.userId}
      className="bg-white border border-gray-400 rounded-xs hover:shadow-md p-6 flex flex-col gap-4"
    >
      {/* 상단 이름 및 제출 현황 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">
            {getUserName(user.userId)}
          </span>
          <Badge className="bg-gray-100 text-gray-800 border-gray-400">
            <CheckCircle className="h-3 w-3" />
            {user.status === "PASS" ? "제출 완료" : "미제출"}
          </Badge>
        </div>
        <div>
          {setSelectedUserId && (
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
          )}
        </div>
      </div>
      {user.status === "PASS" && (
        <div>
          {user.problems?.[0].excuse ? (
            <div className="flex items-start gap-3">
              <MessageSquare className="h-4 w-4 mt-0.5 text-gray-600" />
              <div>
                <p className="text-sm text-black font-medium">
                  사유:{" "}
                  {user.problems?.[0].excuse === "payed"
                    ? "납부 완료"
                    : user.problems?.[0].excuse}
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {user.problems?.map((problem, index) => (
                <li
                  key={index}
                  className="space-y-2 border border-gray-300 bg-gray-50 rounded-xs p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium  text-gray-900">
                      {problem.titleKo}
                    </span>
                    <Badge className="text-xs rounded-xs" variant="outline">
                      티어: {problem.tier}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {problem.submitTime}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default UserCard;
