
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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header Panel - Fixed at top, outside scroll */}
      <div className="flex-shrink-0 z-50">
        <Header 
          user={user}
          audioControls={audioControls}
          showAudioControls={showAudioControls}
          isReadingPage={isReadingPage}
          onGoBack={onGoBack}
          lessonTitle={lessonTitle}
        />
      </div>

      {/* Content Panel - Scrollable area below header */}
      <div className="flex-1 overflow-auto">
        <div className="w-full min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
