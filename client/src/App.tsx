
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense, lazy, useEffect, useState } from "react";

// Lazy load components
const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Profile = lazy(() => import("@/pages/profile-new"));
const Reference = lazy(() => import("@/pages/reference"));
const Reading = lazy(() => import("@/pages/reading"));
const Lesson = lazy(() => import("@/pages/lesson"));
const Lessons = lazy(() => import("@/pages/lessons"));
const Exercises = lazy(() => import("@/pages/exercises"));
const Vocabulary = lazy(() => import("@/pages/vocabulary"));
const Grammar = lazy(() => import("@/pages/grammar"));
const Phrases = lazy(() => import("@/pages/phrases"));
const Pronunciation = lazy(() => import("@/pages/pronunciation"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component with retry functionality
function LoadingFallback() {
  const [loadingTime, setLoadingTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 px-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4">
      </div>
      <span className="text-lg text-gray-700 text-center">Carregando Tommy\"s Academy...</span>
      <div className="mt-2 text-sm text-gray-500 text-center">
        {loadingTime < 5 ? (
          "Preparando sua experiência de aprendizado..."
        ) : loadingTime < 10 ? (
          "Ainda carregando, por favor aguarde..."
        ) : (
          <>
            <div className="mb-3">Carregamento demorado detectado</div>
            <button 
              onClick={handleReload}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Recarregar Página
            </button>
          </>
        )}
      </div>
      {loadingTime > 5 && (
        <div className="mt-4 text-xs text-gray-400 text-center max-w-md">
          Tempo de carregamento: {loadingTime}s
          <br />
          Se o problema persistir, verifique sua conexão com a internet
        </div>
      )}
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/home" component={Home} />
        <Route path="/lessons" component={Lessons} />
        <Route path="/exercises" component={Exercises} />
        <Route path="/profile" component={Profile} />
        <Route path="/reference" component={Reference} />
        <Route path="/reading" component={Reading} />
        <Route path="/lesson/:id" component={Lesson} />
        <Route path="/vocabulary" component={Vocabulary} />
        <Route path="/grammar" component={Grammar} />
        <Route path="/phrases" component={Phrases} />
        <Route path="/pronunciation" component={Pronunciation} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Network status monitoring
    const handleOnline = () => {
      setIsOnline(true);
      console.log("Connection restored");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("Connection lost");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      // Prevent the default browser behavior
      event.preventDefault();
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error("Uncaught error:", event.error);
    };

    // Handle chunk load errors (common in development)
    const handleChunkError = () => {
      console.log("Chunk load error detected, reloading page...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);
    
    // Listen for chunk load errors
    window.addEventListener("error", (e) => {
      if (e.message.includes("Loading chunk") || 
          e.message.includes("Loading CSS chunk") ||
          e.message.includes("Failed to fetch")) {
        handleChunkError();
      }
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="tommy-academy-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {!isOnline && (
            <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
              <span className="text-sm font-medium">
                Conexão perdida - Tentando reconectar...
              </span>
            </div>
          )}
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;


