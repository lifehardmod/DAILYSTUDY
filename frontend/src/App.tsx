import { SubmissionStatus } from "./components/SubmissionStatus";
import { WeeklyStats } from "./components/WeeklyStats";
import UserCard from "./components/UserCard";

const user = {
  userId: "chuhini",
  status: "PASS" as const,
  problems: [
    {
      problemId: 123,
      titleKo: "타이틀",
      level: 1,
      tier: "BRONZE",
      submitTime: "2025-01-01 12:00:00",
    },
    {
      problemId: 789,
      titleKo: "타이틀",
      level: 1,
      tier: "BRONZE",
      submitTime: "2025-01-01 12:00:00",
    },
  ],
};

function App() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-8">
      <WeeklyStats />
      <UserCard user={user} />
      <SubmissionStatus />
    </div>
  );
}

export default App;
