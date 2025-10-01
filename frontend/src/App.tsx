import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StudyCheck from "./page/StudyCheck";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-8">
        <StudyCheck />
      </main>
    </QueryClientProvider>
  );
}

export default App;
