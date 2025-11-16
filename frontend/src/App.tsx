import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StudyCheck from "./page/StudyCheck";
import { Analytics } from "@vercel/analytics/next";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="mx-auto max-w-4xl px-4 pb-20 sm:px-8">
        <StudyCheck />
      </main>
      <Analytics />
    </QueryClientProvider>
  );
}

export default App;
