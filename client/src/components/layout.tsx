
import React from 'react';
import Header from './header';
import { ScrollArea } from './ui/scroll-area';

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  audioControls?: React.ReactNode;
  showAudioControls?: boolean;
  isReadingPage?: boolean;
  onGoBack?: () => void;
  lessonTitle?: string;
}

export default function Layout({ 
  children, 
  user, 
  audioControls, 
  showAudioControls, 
  isReadingPage, 
  onGoBack, 
  lessonTitle 
}: LayoutProps) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Fixed Header - Enhanced with better responsive backdrop */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full glass-effect border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="w-full max-w-none">
          <Header 
            user={user}
            audioControls={audioControls}
            showAudioControls={showAudioControls}
            isReadingPage={isReadingPage}
            onGoBack={onGoBack}
            lessonTitle={lessonTitle}
          />
        </div>
      </header>

      {/* Main Content - Enhanced responsive spacing */}
      <main className="relative w-full">
        {/* Content container with responsive padding */}
        <div className="pt-16 min-h-screen">
          <div className="w-full max-w-none px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12">
            <div className="py-2 sm:py-4 md:py-6 lg:py-8 pb-4 sm:pb-8 md:pb-12 lg:pb-16">
              <div className="w-full max-w-none overflow-hidden">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Background Pattern - Responsive */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-20 sm:opacity-30 dark:opacity-5 dark:sm:opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:12px_12px] sm:[background-size:16px_16px] lg:[background-size:20px_20px]"></div>
      </div>
    </div>
  );
}
