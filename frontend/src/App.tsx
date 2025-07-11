import { SubmissionStatus } from "./components/SubmissionStatus";
import { WeeklyStats } from "./components/WeeklyStats";

function App() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-8">
      <WeeklyStats />
      <SubmissionStatus />
    </div>
  );
}

export default App;
