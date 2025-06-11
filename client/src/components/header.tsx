import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Star, Trophy, BookOpen, Home, Target, ArrowLeft, Clock, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import NotificationSystem from "@/components/notification-system";
import { useNotifications } from "@/hooks/use-notifications";
import MobileNavigation from "@/components/mobile-navigation";
import Mascot from "./mascot";
import tommyLogoPath from "@assets/Screenshot_2025-06-04_015828-removebg-preview.png";

// Function to get page name based on location
const getPageName = (location: string): string => {
  const pageNames: Record<string, string> = {
    "/home": "Início",
    "/lessons": "Lições",
    "/reading": "Leitura",
    "/vocabulary": "Vocabulário",
    "/grammar": "Gramática",
    "/exercises": "Exercícios",
    "/pronunciation": "Pronúncia",
    "/phrases": "Frases",
    "/profile": "Perfil",
    "/reference": "Referência"
  };
  
  return pageNames[location] || "Tommy's Academy";
};

interface HeaderProps {
  user?: {
    username: string;
    streak: number;
    totalXP: number;
    level: number;
  };
  audioControls?: React.ReactNode;
  showAudioControls?: boolean;
  isReadingPage?: boolean;
  onGoBack?: () => void;
  lessonTitle?: string;
}

export default function Header({ user, audioControls, showAudioControls, isReadingPage, onGoBack, lessonTitle }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    notifications,
    markAsRead,
    dismissNotification,
    clearAllNotifications,
    notifyAchievement,
  } = useNotifications();

  // Check if we're on the home page
  const isHomePage = location === "/home";

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até logo!",
      });
      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null);
      // Redirect to login
      setLocation("/login");
    },
    onError: () => {
      // Even if logout fails on server, clear local data
      queryClient.setQueryData(["/api/user"], null);
      setLocation("/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) return null;

  return (
    <header className="w-full h-16">
      <div className="h-full container-responsive">
        <div className="flex justify-between items-center h-full">
          {/* Mobile Navigation & Logo Section */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <MobileNavigation user={user} />

            {/* Logo Section / Reading Lesson Navigation */}
            <div className="flex-1 min-w-0">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer touch-friendly"
                onClick={() => setLocation("/home")}
              >
                <img 
                  src={tommyLogoPath} 
                  alt="Tommy's Academy Logo" 
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain"
                />
                <div className="flex items-center space-x-2">
                  {isReadingPage && onGoBack && (
                    <Button 
                      onClick={onGoBack}
                      variant="ghost" 
                      size="sm"
                      className="touch-friendly text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 smooth-transition"
                    >
                      <ArrowLeft size={16} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline ml-1">Voltar</span>
                    </Button>
                  )}
                  <h1 className="text-sm sm:text-base lg:text-lg font-bold gradient-text">
                    {isReadingPage ? "Lição de Leitura" : getPageName(location)}
                  </h1>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Audio Controls for Reading Lesson */}
          {showAudioControls && audioControls && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center"
            >
              {audioControls}
            </motion.div>
          )}

          {/* User Stats and Profile */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3"
          >
            {/* Show stats only on home page */}
            {isHomePage && (
            <>
              {/* Desktop Stats */}
              <div className="hidden lg:flex items-center space-x-2">
                {/* Streak */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-800"
                >
                  <Flame className="w-3 h-3 text-orange-500 dark:text-orange-400" />
                  <span className="text-orange-700 dark:text-orange-300 font-bold text-xs">{user.streak}</span>
                </motion.div>

                {/* XP */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800"
                >
                  <Star className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-xs">{user.totalXP}</span>
                </motion.div>

                {/* Level */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-200 dark:border-green-800"
                >
                  <Trophy className="w-3 h-3 text-green-500 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 font-bold text-xs">{user.level}</span>
                </motion.div>
              </div>

              {/* Tablet Stats */}
              <div className="hidden sm:flex lg:hidden items-center space-x-1">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/30 dark:to-blue-900/30 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-800"
                >
                  <div className="flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-orange-700 dark:text-orange-300 font-bold text-xs">{user.streak}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-blue-500" />
                    <span className="text-blue-700 dark:text-blue-300 font-bold text-xs">{user.totalXP}</span>
                  </div>
                </motion.div>
              </div>

              {/* Mobile Stats */}
              <div className="flex sm:hidden items-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1 bg-gradient-to-r from-orange-100 to-blue-100 dark:from-orange-900/30 dark:to-blue-900/30 px-1.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800"
                >
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-orange-700 dark:text-orange-300 font-bold text-xs">{user.streak}</span>
                  <Star className="w-3 h-3 text-blue-500 ml-1" />
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-xs">{user.totalXP}</span>
                </motion.div>
              </div>

              {/* Notifications */}
              <NotificationSystem
                notifications={notifications}
                onMarkRead={markAsRead}
                onDismiss={dismissNotification}
                onClearAll={clearAllNotifications}
              />
            </>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Avatar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/profile")}
              className="flex items-center space-x-1 sm:space-x-2 hover:bg-cartoon-teal/10"
            >
              <Avatar className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-cartoon-blue cursor-pointer transform hover:scale-110 transition-transform">
                <AvatarFallback className="bg-cartoon-blue text-white font-bold text-xs sm:text-sm">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>

          </motion.div>
        </div>
      </div>
    </header>
  );
}