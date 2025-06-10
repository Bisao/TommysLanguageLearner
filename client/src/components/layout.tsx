
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
    <div className="w-full min-h-screen flex flex-col">
      {/* Header Panel - Sempre no topo */}
      <div className="flex-shrink-0 w-full sticky top-0 z-50">
        <Header 
          user={user}
          audioControls={audioControls}
          showAudioControls={showAudioControls}
          isReadingPage={isReadingPage}
          onGoBack={onGoBack}
          lessonTitle={lessonTitle}
        />
      </div>

      {/* Content Panel - Ocupa o restante da tela abaixo do header */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
