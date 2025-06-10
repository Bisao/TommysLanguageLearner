
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Fixed Header - Separado e fixo no topo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <Header 
          user={user}
          audioControls={audioControls}
          showAudioControls={showAudioControls}
          isReadingPage={isReadingPage}
          onGoBack={onGoBack}
          lessonTitle={lessonTitle}
        />
      </div>

      {/* Main Content - Com padding-top para compensar header fixo */}
      <main className="pt-16 sm:pt-20 lg:pt-24 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
