import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Volume2, GraduationCap, MessageCircle, BookOpen } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";

interface Avatar {
  id: string;
  name: string;
  role: string;
  specialty: string;
  icon: React.ReactNode;
  color: string;
  intro: string;
}

const avatars: Avatar[] = [
  {
    id: 'grammar',
    name: 'Professor James',
    role: 'Especialista em Gramática',
    specialty: 'Simple Present Tense',
    icon: <GraduationCap className="h-8 w-8" />,
    color: 'bg-blue-600',
    intro: 'Hello! I\'m Professor James. Let\'s learn the Simple Present tense together. This is the foundation of English grammar!'
  },
  {
    id: 'vocabulary',
    name: 'Teacher Sarah',
    role: 'Especialista em Vocabulário',
    specialty: 'Construção de Palavras',
    icon: <BookOpen className="h-8 w-8" />,
    color: 'bg-emerald-600',
    intro: 'Hi there! I\'m Teacher Sarah. I\'ll help you learn new words and their meanings. Let\'s expand your vocabulary!'
  },
  {
    id: 'conversation',
    name: 'Coach Maria',
    role: 'Treinadora de Conversação',
    specialty: 'Prática de Conversação',
    icon: <MessageCircle className="h-8 w-8" />,
    color: 'bg-amber-600',
    intro: 'Welcome! I\'m Coach Maria. I\'ll help you practice speaking and having conversations in English. Let\'s talk!'
  }
];

interface InteractiveAvatarProps {
  onStartLesson: (type: string) => void;
}

export function InteractiveAvatar({ onStartLesson }: InteractiveAvatarProps) {
  const [activeAvatar, setActiveAvatar] = useState<string | null>(null);
  const { speak, isPlaying } = useSpeech();

  const handleAvatarClick = (avatar: Avatar) => {
    setActiveAvatar(avatar.id);
    speak(avatar.intro, { rate: 0.85, pitch: 1.0 });
  };

  const handleStartLesson = (avatarId: string) => {
    onStartLesson(avatarId);
  };

  return (
    <section className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Conheça Seus Professores</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {avatars.map((avatar) => (
          <Card 
            key={avatar.id} 
            className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
              activeAvatar === avatar.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="text-center mb-4">
                {/* Avatar Circle */}
                <div 
                  className={`w-20 h-20 ${avatar.color} rounded-full mx-auto mb-3 flex items-center justify-center text-white hover:scale-105 transition-transform duration-200 cursor-pointer ${
                    isPlaying && activeAvatar === avatar.id ? 'avatar-pulse' : ''
                  }`}
                  onClick={() => handleAvatarClick(avatar)}
                >
                  {avatar.icon}
                </div>
                <h4 className="font-semibold text-gray-900">{avatar.name}</h4>
                <p className="text-sm text-gray-500">{avatar.role}</p>
                <p className="text-xs text-gray-400">{avatar.specialty}</p>
              </div>
              
              <div className="space-y-3">
                <Button
                  className={`w-full ${avatar.color.replace('bg-', 'academy-button-').replace('-600', '')}`}
                  onClick={() => handleStartLesson(avatar.id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Começar com {avatar.name}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleAvatarClick(avatar)}
                  disabled={isPlaying && activeAvatar === avatar.id}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  {isPlaying && activeAvatar === avatar.id ? 'Falando...' : 'Ouvir Apresentação'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
