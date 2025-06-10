
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, Volume2, BookOpen, Mic, Eye, Repeat, Clock } from 'lucide-react';

interface ReadingTipsPanelProps {
  isVisible: boolean;
  onClose: () => void;
  autoHideDelay?: number;
}

export const ReadingTipsPanel: React.FC<ReadingTipsPanelProps> = ({
  isVisible,
  onClose,
  autoHideDelay = 5000
}) => {
  const [timeLeft, setTimeLeft] = useState(autoHideDelay / 1000);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoHideDelay);

    const countdownTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [isVisible, autoHideDelay, onClose]);

  useEffect(() => {
    if (isVisible) {
      setTimeLeft(autoHideDelay / 1000);
    }
  }, [isVisible, autoHideDelay]);

  if (!isVisible) return null;

  const tips = [
    {
      icon: <Volume2 className="w-4 h-4" />,
      text: "Clique nas palavras para ouvir a pronúncia"
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      text: "Use o modo de leitura guiada"
    },
    {
      icon: <Mic className="w-4 h-4" />,
      text: "Pratique a pronúncia repetindo as palavras"
    },
    {
      icon: <Eye className="w-4 h-4" />,
      text: "Observe as traduções ao passar o mouse"
    },
    {
      icon: <Repeat className="w-4 h-4" />,
      text: "Repita as lições para fixar o conteúdo"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      text: "Pratique diariamente para manter o progresso"
    }
  ];

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 fade-in-0 duration-300">
      <Card className="w-80 bg-blue-50 border-blue-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-blue-800">💡 Dicas de Leitura</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {timeLeft}s
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-center gap-3 text-sm text-blue-700">
                <div className="text-blue-500 flex-shrink-0">
                  {tip.icon}
                </div>
                <span>• {tip.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
