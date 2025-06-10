
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
    <div className="min-h-screen bg-background">
      {/* Header Panel - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header 
          user={user}
          audioControls={audioControls}
          showAudioControls={showAudioControls}
          isReadingPage={isReadingPage}
          onGoBack={onGoBack}
          lessonTitle={lessonTitle}
        />
      </div>

      {/* Content Panel - Below header */}
      <div className="pt-16 sm:pt-20 lg:pt-24">
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
