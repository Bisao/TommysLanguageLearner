import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Mascot from "@/components/mascot";
import LessonModal from "@/components/lesson-modal";
import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, Mic, Palette, Trophy, Medal, Star, Flame, Target, Calendar, Clock, Award, TrendingUp, Zap, Brain } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["/api/lessons"],
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
  });

  const { data: dailyStats } = useQuery({
    queryKey: ["/api/stats/daily"],
  });

  const categories = [
    {
      name: "Vocabulário",
      description: "Aprenda novas palavras",
      icon: BookOpen,
      color: "cartoon-coral",
      path: "/vocabulary",
      lessons: (lessons as any[]).filter((l: any) => l.category === "vocabulary"),
    },
    {
      name: "Gramática",
      description: "Domine as regras",
      icon: Palette,
      color: "cartoon-blue",
      path: "/grammar",
      lessons: (lessons as any[]).filter((l: any) => l.category === "grammar"),
    },
    {
      name: "Frases",
      description: "Conversação prática",
      icon: MessageCircle,
      color: "cartoon-mint",
      path: "/phrases",
      lessons: (lessons as any[]).filter((l: any) => l.category === "phrases"),
    },
    {
      name: "Pronúncia",
      description: "Fale como um nativo",
      icon: Mic,
      color: "cartoon-yellow",
      path: "/pronunciation",
      lessons: (lessons as any[]).filter((l: any) => l.category === "pronunciation"),
    },
  ];

  const achievements = [
    { name: "Primeira Lição", icon: Medal, earned: true },
    { name: "7 Dias Seguidos", icon: Flame, earned: true },
    { name: "1000 XP", icon: Star, earned: true },
    { name: "Mestre das Palavras", icon: Trophy, earned: false },
  ];

  const openLesson = (lessonId: number) => {
    setSelectedLesson(lessonId);
    setShowLessonModal(true);
  };

  const closeLesson = () => {
    setShowLessonModal(false);
    setSelectedLesson(null);
  };

  const dailyProgress = dailyStats ? ((dailyStats as any).lessonsCompleted / ((user as any)?.dailyGoal || 4)) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header user={user as any} />

      {/* Spacing between header and content */}
      <div className="h-6"></div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-block mb-3 sm:mb-4 floating-card">
            <Mascot />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-4 px-2">
            Olá {(user as any)?.username}! Vamos aprender inglês hoje?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground px-4 mb-6">Continue sua jornada de aprendizado com lições divertidas!</p>
        </motion.div>

        {/* Daily Progress Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {/* Daily Goal Progress */}
          <Card className="cartoon-card border-cartoon-coral">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Target className="text-cartoon-coral mr-2" size={20} />
                Meta Diária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-cartoon-coral mb-2">
                  {Math.round(dailyProgress)}%
                </div>
                <Progress value={dailyProgress} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {(dailyStats as any)?.lessonsCompleted || 0} de {(user as any)?.dailyGoal || 4} lições
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card className="cartoon-card border-cartoon-yellow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Flame className="text-cartoon-yellow mr-2" size={20} />
                Sequência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-cartoon-yellow mb-2">
                  {(user as any)?.streak || 0}
                </div>
                <p className="text-sm text-muted-foreground">dias seguidos</p>
                <div className="flex justify-center mt-2">
                  {[...Array(Math.min((user as any)?.streak || 0, 7))].map((_, i) => (
                    <Flame key={i} className="text-cartoon-yellow mx-0.5" size={16} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total XP */}
          <Card className="cartoon-card border-cartoon-blue">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Star className="text-cartoon-blue mr-2" size={20} />
                XP Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-cartoon-blue mb-2">
                  {(user as any)?.totalXP || 0}
                </div>
                <p className="text-sm text-muted-foreground">pontos de experiência</p>
                <Badge variant="outline" className="mt-2">
                  Nível {(user as any)?.level || 1}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        {/* Recommended Next Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="cartoon-card border-cartoon-mint relative overflow-hidden">
            <CardContent className="p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-l from-green-200/30 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-cartoon-mint rounded-full flex items-center justify-center">
                    <Zap className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cartoon-dark">Continue de onde parou</h3>
                    <p className="text-muted-foreground">
                      {(() => {
                        const nextLesson = (lessons as any[]).find((l: any) => !l.completed);
                        return nextLesson ? `Próxima lição: ${nextLesson.title}` : "Parabéns! Você completou todas as lições disponíveis";
                      })()}
                    </p>
                  </div>
                </div>
                <Button 
                  className="cartoon-button flex items-center space-x-2"
                  onClick={() => {
                    const nextLesson = (lessons as any[]).find((l: any) => !l.completed);
                    if (nextLesson) {
                      openLesson(nextLesson.id);
                    }
                  }}
                  disabled={!(lessons as any[]).find((l: any) => !l.completed)}
                >
                  <Brain size={16} />
                  <span>Continuar</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Access Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="cartoon-card group cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => setLocation("/lessons")}>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="text-white" size={20} />
              </div>
              <h4 className="font-semibold text-sm mb-1">Aulas</h4>
              <p className="text-xs text-muted-foreground">Lições estruturadas</p>
            </CardContent>
          </Card>

          <Card className="cartoon-card group cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => setLocation("/exercises")}>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="text-white" size={20} />
              </div>
              <h4 className="font-semibold text-sm mb-1">Exercícios</h4>
              <p className="text-xs text-muted-foreground">Prática dirigida</p>
            </CardContent>
          </Card>

          <Card className="cartoon-card group cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => setLocation("/profile")}>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="text-white" size={20} />
              </div>
              <h4 className="font-semibold text-sm mb-1">Conquistas</h4>
              <p className="text-xs text-muted-foreground">Seu progresso</p>
            </CardContent>
          </Card>

          <Card className="cartoon-card group cursor-pointer transition-all duration-300 hover:scale-105" onClick={() => setLocation("/reference")}>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="text-white" size={20} />
              </div>
              <h4 className="font-semibold text-sm mb-1">Referência</h4>
              <p className="text-xs text-muted-foreground">Material de apoio</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Study Categories Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-cartoon-dark flex items-center">
              <BookOpen className="text-cartoon-blue mr-3" size={24} />
              Categorias de Estudo
            </h3>
            <Button variant="outline" onClick={() => setLocation("/lessons")} className="text-sm">
              Ver Todas
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const completedLessons = category.lessons.filter((l: any) => l.completed).length;
              const totalLessons = category.lessons.length;
              const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="cartoon-card group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => setLocation(category.path)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${
                          category.color === 'cartoon-coral' ? 'from-pink-400 to-red-500' :
                          category.color === 'cartoon-blue' ? 'from-blue-400 to-purple-500' :
                          category.color === 'cartoon-mint' ? 'from-green-400 to-teal-500' :
                          'from-yellow-400 to-orange-500'
                        } rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="text-white" size={24} />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-cartoon-dark mb-1">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-cartoon-dark">{Math.round(progressPercent)}%</div>
                        <div className="text-xs text-muted-foreground">completo</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Progress value={progressPercent} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {completedLessons} de {totalLessons} lições
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {totalLessons > 0 ? `${totalLessons} lições` : 'Em breve'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Achievements */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="cartoon-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="text-cartoon-yellow mr-2" size={20} />
                  Conquistas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.slice(0, 3).map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <motion.div 
                        key={achievement.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                          achievement.earned 
                            ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" 
                            : "bg-gray-50 dark:bg-gray-800 opacity-60"
                        }`}
                      >
                        <div className={`w-10 h-10 ${
                          achievement.earned ? "bg-cartoon-yellow" : "bg-gray-400"
                        } rounded-full flex items-center justify-center flex-shrink-0`}>
                          <Icon className="text-white" size={16} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${
                            achievement.earned ? "text-cartoon-dark" : "text-gray-500"
                          }`}>
                            {achievement.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {achievement.earned ? "Conquistada!" : "Bloqueada"}
                          </p>
                        </div>
                        {achievement.earned && (
                          <Badge variant="secondary" className="text-xs">Nova!</Badge>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => setLocation("/profile")}
                >
                  Ver Todas as Conquistas
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Study Streak & Motivation */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="cartoon-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="text-cartoon-mint mr-2" size={20} />
                  Motivação Diária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">🔥</div>
                  <p className="text-2xl font-bold text-cartoon-dark mb-1">
                    {(user as any)?.streak || 0} dias
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">Sequência atual</p>
                  
                  {dailyProgress >= 100 ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                      <div className="text-2xl mb-2">🎉</div>
                      <p className="font-semibold text-green-700 dark:text-green-300">
                        Meta diária concluída!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Parabéns pelo seu esforço hoje!
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                      <div className="text-2xl mb-2">💪</div>
                      <p className="font-semibold text-blue-700 dark:text-blue-300">
                        Continue assim!
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Faltam {((user as any)?.dailyGoal || 4) - ((dailyStats as any)?.lessonsCompleted || 0)} lições para completar sua meta
                      </p>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full cartoon-button flex items-center justify-center space-x-2"
                  onClick={() => {
                    const nextLesson = (lessons as any[]).find((l: any) => !l.completed);
                    if (nextLesson) {
                      openLesson(nextLesson.id);
                    }
                  }}
                  disabled={!(lessons as any[]).find((l: any) => !l.completed)}
                >
                  <Zap size={16} />
                  <span>Estudar Agora</span>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Lesson Modal */}
      {showLessonModal && selectedLesson && (
        <LessonModal
          lessonId={selectedLesson}
          onClose={closeLesson}
        />
      )}
    </div>
  );
}