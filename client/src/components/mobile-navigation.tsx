import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLocation } from 'wouter';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  MessageCircle, 
  Mic, 
  User,
  Trophy,
  Star,
  Flame
} from 'lucide-react';

interface MobileNavigationProps {
  user?: {
    username: string;
    streak: number;
    totalXP: number;
    level: number;
  };
}

export default function MobileNavigation({ user }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const navigationItems = [
    { name: 'Início', icon: Home, path: '/home' },
    { name: 'Vocabulário', icon: BookOpen, path: '/vocabulary' },
    { name: 'Frases', icon: MessageCircle, path: '/phrases' },
    { name: 'Pronúncia', icon: Mic, path: '/pronunciation' },
    { name: 'Perfil', icon: User, path: '/profile' },
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 touch-target"
          >
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-80 bg-white dark:bg-gray-900 p-0 custom-scrollbar">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold gradient-text">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="touch-friendly"
                >
                  <X size={18} />
                </Button>
              </div>
              
              {user && (
                <div className="glass-card p-4 mx-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center avatar-ring">
                      <span className="text-white font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Nível {user.level}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 bg-orange-100 dark:bg-orange-900/30 py-1 px-2 rounded-full">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
                          {user.streak}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Sequência</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 bg-blue-100 dark:bg-blue-900/30 py-1 px-2 rounded-full">
                        <Star className="w-3 h-3 text-blue-500" />
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                          {user.totalXP}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">XP</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 bg-green-100 dark:bg-green-900/30 py-1 px-2 rounded-full">
                        <Trophy className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-bold text-green-700 dark:text-green-300">
                          {user.level}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Nível</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <div className="flex-1 p-4">
              <nav className="space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start p-3 h-auto transition-all ${
                          isActive 
                            ? 'bg-cartoon-blue text-white shadow-md' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => handleNavigation(item.path)}
                      >
                        <Icon 
                          size={20} 
                          className={`mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} 
                        />
                        <span className="font-medium">{item.name}</span>
                      </Button>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Tommy's Academy v1.0
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}