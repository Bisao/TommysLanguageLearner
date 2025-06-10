
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Fixed Header - Enhanced with better backdrop */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <Header 
          user={user}
          audioControls={audioControls}
          showAudioControls={showAudioControls}
          isReadingPage={isReadingPage}
          onGoBack={onGoBack}
          lessonTitle={lessonTitle}
        />
      </div>

      {/* Main Content - Enhanced responsive spacing with proper scrolling */}
      <main className="pt-16 sm:pt-20 lg:pt-24 min-h-screen overflow-y-auto">
        <div className="container-responsive">
          <div className="py-4 sm:py-6 lg:py-8 pb-8 sm:pb-12 lg:pb-16">
            <div className="w-full max-w-none">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Optional Background Pattern */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-30 dark:opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
      </div>
    </div>
  );
}
