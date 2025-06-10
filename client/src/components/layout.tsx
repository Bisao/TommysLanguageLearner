
import React from 'react';
import Header from './header';

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
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header Panel - Sempre no topo e separado */}
      <div className="flex-shrink-0 w-full sticky top-0 z-50 shadow-md">
        <Header 
          user={user}
          audioControls={audioControls}
          showAudioControls={showAudioControls}
          isReadingPage={isReadingPage}
          onGoBack={onGoBack}
          lessonTitle={lessonTitle}
        />
      </div>

      {/* Content Panel - Separado visualmente do header */}
      <div className="flex-1 w-full mt-2 bg-white dark:bg-gray-800 rounded-t-lg shadow-inner overflow-hidden">
        <div className="h-full p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
