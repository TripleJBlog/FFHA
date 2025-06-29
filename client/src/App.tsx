import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Game from "./components/Game";
import NotFound from "./pages/not-found";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/FFHA">
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<Game />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-center" richColors closeButton duration={3000} />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
