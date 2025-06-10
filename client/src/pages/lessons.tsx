import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Star, Trophy, Lock, CheckCircle, Play, Target, Flame, MessageCircle, Mic, Palette, Filter, Search, TrendingUp, Users, Globe } from "lucide-react";
import { useLocation } from "wouter";
import { readingLessons } from "@/lib/reading-lessons";
import { useState } from "react";

export default function Lessons() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["/api/lessons"],
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["/api/progress"],
  });

  const categories = [
    {
      name: "Vocabulário",
      description: "Aprenda novas palavras e expressões",
      icon: BookOpen,
      color: "from-pink-400 to-red-500",
      path: "/vocabulary",
      count: (lessons as any[]).filter((l: any) => l.category === "vocabulary").length,
      completed: (lessons as any[]).filter((l: any) => l.category === "vocabulary" && l.completed).length,
    },
    {
      name: "Gramática",
      description: "Domine as regras da língua inglesa",
      icon: Palette,
      color: "from-blue-400 to-purple-500",
      path: "/grammar",
      count: (lessons as any[]).filter((l: any) => l.category === "grammar").length,
      completed: (lessons as any[]).filter((l: any) => l.category === "grammar" && l.completed).length,
    },
    {
      name: "Frases",
      description: "Pratique conversação do dia a dia",
      icon: MessageCircle,
      color: "from-green-400 to-teal-500",
      path: "/phrases",
      count: (lessons as any[]).filter((l: any) => l.category === "phrases").length,
      completed: (lessons as any[]).filter((l: any) => l.category === "phrases" && l.completed).length,
    },
    {
      name: "Pronúncia",
      description: "Fale com sotaque nativo",
      icon: Mic,
      color: "from-yellow-400 to-orange-500",
      path: "/pronunciation",
      count: (lessons as any[]).filter((l: any) => l.category === "pronunciation").length,
      completed: (lessons as any[]).filter((l: any) => l.category === "pronunciation" && l.completed).length,
    },
  ];

  const goToReadingLesson = () => {
    setLocation("/reading");
  };

  const goToCategory = (path: string) => {
    setLocation(path);
  };

  const totalLessons = (lessons as any[]).length;
  const completedLessons = (lessons as any[]).filter((l: any) => l.completed).length;
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <Layout user={user as any}>
      {/* Page Header - Enhanced */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8 lg:mb-12"
      >
        <h1 className="heading-responsive font-bold gradient-text mb-3 sm:mb-4">
          Aulas & Lições
        </h1>
        <p className="text-responsive text-muted-foreground max-w-2xl mx-auto px-4">
          Explore todas as categorias de estudo e acompanhe seu progresso
        </p>
      </motion.div>

      {/* Overall Progress Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <Card className="card-elevated">
          <CardContent className="mobile-card-compact sm:p-6">
            <div className="responsive-flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-responsive font-bold text-gray-800 dark:text-white">Seu Progresso Geral</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Continue aprendendo para alcançar seus objetivos</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.round(overallProgress)}%</div>
                <div className="text-xs text-muted-foreground">concluído</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Progress value={overallProgress} className="h-3" />
              <div className="responsive-flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {completedLessons} de {totalLessons} lições completadas
                </span>
                <Badge variant="secondary" className="text-xs">
                  {totalLessons} lições disponíveis
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Special Reading Lesson */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 sm:mb-8"
      >
        <Card className="card-interactive relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10"></div>
          <CardContent className="mobile-card-compact sm:p-6 relative">
            <div className="responsive-flex justify-between items-center">
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="text-white" size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-responsive font-bold text-gray-800 dark:text-white mb-1">Lição de Leitura Especial</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Pratique leitura com textos interessantes</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      Inglês
                    </Badge>
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      15-20 min
                    </Badge>
                  </div>
                </div>
              </div>
              <Button 
                onClick={goToReadingLesson}
                className="btn-primary ml-4"
              >
                <Play size={16} className="mr-2" />
                <span className="hidden sm:inline">Começar</span>
                <span className="sm:hidden">▶</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 sm:mb-8"
      >
        <div className="responsive-flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-responsive font-bold text-gray-800 dark:text-white">Categorias de Estudo</h2>
        </div>

        <div className="responsive-grid">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const progressPercent = category.count > 0 ? (category.completed / category.count) * 100 : 0;

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card 
                  className="card-interactive touch-friendly"
                  onClick={() => goToCategory(category.path)}
                >
                  <CardContent className="mobile-card-compact sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 smooth-transition`}>
                          <Icon className="text-white" size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-responsive font-bold text-gray-800 dark:text-white mb-1 truncate">{category.name}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                        </div>
                      </div>
                      <div className="text-center sm:text-right flex-shrink-0">
                        <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{Math.round(progressPercent)}%</div>
                        <div className="text-xs text-muted-foreground">completo</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Progress value={progressPercent} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {category.completed} de {category.count} lições
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {category.count > 0 ? `${category.count} lições` : 'Em breve'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-6 sm:mb-8"
      >
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center text-responsive">
              <Trophy className="text-yellow-500 mr-2" size={20} />
              Estatísticas Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="responsive-grid">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Flame className="text-orange-500" size={20} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{(user as any)?.streak || 0}</div>
                <div className="text-xs text-muted-foreground">dias seguidos</div>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="text-blue-500" size={20} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{(user as any)?.totalXP || 0}</div>
                <div className="text-xs text-muted-foreground">XP total</div>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="text-green-500" size={20} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{(user as any)?.level || 1}</div>
                <div className="text-xs text-muted-foreground">nível atual</div>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="text-purple-500" size={20} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{completedLessons}</div>
                <div className="text-xs text-muted-foreground">lições completas</div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full mt-4 touch-friendly" onClick={() => setLocation("/profile")}>
              Ver Perfil Completo
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </Layout>
  );
}