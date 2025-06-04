import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Star, Clock, Users } from "lucide-react";
import { Header } from "@/components/header";
import { InteractiveAvatar } from "@/components/interactive-avatar";
import { GrammarLesson } from "@/components/grammar-lesson";
import { VocabularySection } from "@/components/vocabulary-section";
import { ConversationPractice } from "@/components/conversation-practice";
import { ExerciseSection } from "@/components/exercise-section";
import { ProgressTracker } from "@/components/progress-tracker";
import { useTranslation } from "@/hooks/use-translation";

export default function Home() {
  const [activeSection, setActiveSection] = useState('overview');
  const [userProgress, setUserProgress] = useState({
    overall: 45,
    grammar: 60,
    vocabulary: 70,
    conversation: 30,
    exercisesCompleted: 8,
    totalExercises: 15,
    timeSpent: 127,
    streak: 3
  });
  
  const [recentActivities, setRecentActivities] = useState([
    {
      id: '1',
      type: 'grammar' as const,
      description: 'Completed Simple Present Formation lesson',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      score: 85
    },
    {
      id: '2',
      type: 'vocabulary' as const,
      description: 'Learned 5 new words from Module 1',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: '3',
      type: 'exercise' as const,
      description: 'Grammar exercise: Simple Present Tense',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      score: 92
    }
  ]);

  const { showTranslations, toggleTranslations } = useTranslation();

  const handleStartLesson = (type: string) => {
    setActiveSection(type);
  };

  const handleExerciseComplete = (result: any) => {
    // Update progress and add to recent activities
    const newActivity = {
      id: Date.now().toString(),
      type: 'exercise' as const,
      description: `Completed exercise: ${result.exerciseId}`,
      timestamp: new Date(),
      score: result.isCorrect ? 100 : 0
    };
    
    setRecentActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    
    // Update overall progress
    if (result.isCorrect) {
      setUserProgress(prev => ({
        ...prev,
        exercisesCompleted: prev.exercisesCompleted + 1,
        overall: Math.min(prev.overall + 2, 100)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        progress={userProgress.overall} 
        onToggleTranslation={toggleTranslations}
        showTranslations={showTranslations}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Module Header */}
        <div className="academy-gradient rounded-xl p-8 mb-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Módulo 1
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Nível Iniciante
                </Badge>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">Simple Present Tense</h1>
              <p className="text-xl text-blue-100 mb-6">Domine os fundamentos da gramática inglesa com aulas interativas e exercícios práticos</p>
              
              {/* Module Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">30-45 min</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-sm">Aprendizado Interativo</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Amigável para Iniciantes</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Tommy's Academy</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  <GraduationCap className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => setActiveSection('grammar')}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Começar a Aprender
              </Button>
            </div>
          </div>
        </div>

        {/* Interactive Learning Sections */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-8">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="grammar">Gramática</TabsTrigger>
            <TabsTrigger value="vocabulary">Vocabulário</TabsTrigger>
            <TabsTrigger value="conversation">Conversação</TabsTrigger>
            <TabsTrigger value="exercises">Exercícios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <InteractiveAvatar onStartLesson={handleStartLesson} />
            <ProgressTracker progress={userProgress} recentActivities={recentActivities} />
          </TabsContent>

          <TabsContent value="grammar">
            <GrammarLesson showTranslations={showTranslations} />
          </TabsContent>

          <TabsContent value="vocabulary">
            <VocabularySection showTranslations={showTranslations} />
          </TabsContent>

          <TabsContent value="conversation">
            <ConversationPractice showTranslations={showTranslations} />
          </TabsContent>

          <TabsContent value="exercises">
            <ExerciseSection onExerciseComplete={handleExerciseComplete} />
          </TabsContent>
        </Tabs>

        {/* Quick Navigation Cards */}
        {activeSection === 'overview' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveSection('grammar')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Regras de Gramática</h3>
                <p className="text-sm text-gray-600">Aprenda a formação do Simple Present</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveSection('vocabulary')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Vocabulário</h3>
                <p className="text-sm text-gray-600">10 palavras essenciais para aprender</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveSection('conversation')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Conversação</h3>
                <p className="text-sm text-gray-600">Pratique perguntas de conversação</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveSection('exercises')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Exercícios</h3>
                <p className="text-sm text-gray-600">Teste seus conhecimentos</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
