import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SubmissionStatus from "./components/SubmissionStatus";
import { WeeklyStats } from "./components/WeeklyStats";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-8">
        <WeeklyStats />
        <SubmissionStatus />
      </div>
    </QueryClientProvider>
  );
}

export default App;
