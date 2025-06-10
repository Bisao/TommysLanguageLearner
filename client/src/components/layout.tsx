
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
    <div className="w-full h-screen flex flex-col overflow-hidden">
      {/* Header Panel - Fixed at top, outside scroll */}
      <div className="flex-shrink-0 z-50 w-full">
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
      <div className="flex-1 overflow-auto w-full">
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
