import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CyberBackground } from './components/CyberBackground';
import Home from './pages/Home';
import AnalyzePage from './pages/AnalyzePage';
import ResultPage from './pages/ResultPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <CyberBackground />
          <div className="flex min-h-[100dvh] flex-col relative z-10 w-full overflow-hidden">
            <Navbar />
            <main className="flex-1 mt-16 flex flex-col w-full">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/analyze" element={<AnalyzePage />} />
                <Route path="/result/:id" element={<ResultPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
