import { UserSubmission } from "@/components/dailySubmissonStat/types/submission";
import UserCard from "./UserCard";

export interface UserSubmissionstatusListProps {
  title: string;
  icon: React.ReactNode;
  users: UserSubmission[];
  children?: React.ReactNode;
  setSelectedUserId?: (userId: string) => void;
}

const UserSubmissionStatusList = ({
  title,
  icon,
  users,
  children,
  setSelectedUserId,
}: UserSubmissionstatusListProps) => {
  return (
    <section>
      <div className="space-x-2 mb-4 flex flex-col sm:flex-row gap-2">
        <h3 className="text-lg font-semibold text-gray-700 items-center flex flex-row gap-2">
          {icon}
          {title} ({users.length}명)
        </h3>
        <div className="flex flex-row gap-2">{children}</div>
      </div>
      <ul className="space-y-4">
        {users.map((user) => (
          <li key={user.userId}>
            <UserCard user={user} setSelectedUserId={setSelectedUserId} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default UserSubmissionStatusList;
