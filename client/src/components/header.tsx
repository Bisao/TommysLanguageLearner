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
import Mascot from "./mascot";
import tommyLogoPath from "@assets/Screenshot_2025-06-04_015828-removebg-preview.png";

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
    <header className="w-full bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="w-full max-w-none mx-0 px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-2 sm:py-4">
          {/* Logo Section / Reading Lesson Navigation */}
          {isReadingPage ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center w-full"
            >
              <Button 
                onClick={onGoBack}
                variant="ghost" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 transition-all duration-200"
              >
                <ArrowLeft size={16} />
                Voltar
              </Button>
              
              <div className="flex-1 text-center mx-2 sm:mx-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-1 sm:space-y-2"
                >
                  <h1 className="text-sm sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Lição de Leitura
                  </h1>
                  <div className="hidden sm:flex flex-wrap justify-center gap-2">
                    <Badge className="bg-green-100 text-green-700 border border-green-200">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {lessonTitle || "How Will We Eat in 2021?"}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                      <Clock className="w-3 h-3 mr-1" />
                      15-20 min
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Nível Intermediário
                    </Badge>
                  </div>
                  {/* Mobile-only simplified badge */}
                  <div className="sm:hidden">
                    <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      15-20 min
                    </Badge>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
              onClick={() => setLocation("/home")}
            >
              <img 
                src={tommyLogoPath} 
                alt="Tommy's Academy Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain"
              />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text hidden sm:block">Tommy's Academy</h1>
              <h1 className="text-base font-bold gradient-text sm:hidden">Tommy's</h1>
            </motion.div>
          )}

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
            className="flex items-center space-x-2 sm:space-x-4"
          >
            {/* Show stats only on home page */}
            {isHomePage && (
            <>
              {/* Daily Goal for larger screens */}
              <div className="hidden sm:flex items-center space-x-3">
                {/* Daily Progress */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-2 bg-teal-100 dark:bg-teal-900/30 px-3 py-2 rounded-full border border-teal-200 dark:border-teal-800"
                >
                  <Target className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-teal-700 dark:text-teal-300 font-medium">Meta Diária</span>
                    <span className="text-xs text-teal-600 dark:text-teal-400">0%</span>
                  </div>
                </motion.div>

                {/* Streak */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-800"
                >
                  <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                  <span className="text-orange-700 dark:text-orange-300 font-bold text-sm">{user.streak}</span>
                </motion.div>

                {/* XP */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800"
                >
                  <Star className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">{user.totalXP}</span>
                </motion.div>

                {/* Level */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-200 dark:border-green-800"
                >
                  <Trophy className="w-4 h-4 text-green-500 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 font-bold text-sm">{user.level}</span>
                </motion.div>

                {/* Theme Toggle */}
                <ThemeToggle />
              </div>

                {/* Compact stats for mobile screens */}
                <div className="flex sm:hidden items-center space-x-2">
                  {/* Combined streak/XP display for mobile */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-2 bg-white/10 dark:bg-black/10 px-2 py-1 rounded-full border border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
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

                  {/* Theme Toggle for mobile */}
                  <ThemeToggle />
                </div>

                {/* Notifications for all screen sizes */}
                <NotificationSystem
                  notifications={notifications}
                  onMarkRead={markAsRead}
                  onDismiss={dismissNotification}
                  onClearAll={clearAllNotifications}
                />
              </>
            )}

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