import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
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
    <div className="min-h-screen bg-background">
      <Header user={user as any} />

      <div className="h-6"></div>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Aulas & Lições
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore todas as categorias de estudo e acompanhe seu progresso
          </p>
        </motion.div>

        {/* Overall Progress Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="cartoon-card border-cartoon-blue">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-cartoon-blue rounded-full flex items-center justify-center">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cartoon-dark">Seu Progresso Geral</h3>
                    <p className="text-muted-foreground">Continue aprendendo para alcançar seus objetivos</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cartoon-blue">{Math.round(overallProgress)}%</div>
                  <div className="text-sm text-muted-foreground">completo</div>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={overallProgress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{completedLessons} lições concluídas</span>
                  <span>{totalLessons} lições totais</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Study Categories Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-cartoon-dark flex items-center">
              <BookOpen className="text-cartoon-blue mr-3" size={24} />
              Categorias de Estudo
            </h2>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Globe size={14} />
              <span>Inglês</span>
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const progressPercent = category.count > 0 ? (category.completed / category.count) * 100 : 0;
              const isLocked = category.count === 0;

              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`cartoon-card group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${isLocked ? 'opacity-75' : ''}`}
                  onClick={() => !isLocked && goToCategory(category.path)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative`}>
                          <Icon className="text-white" size={28} />
                          {isLocked && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                              <Lock className="text-white" size={12} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-cartoon-dark mb-1 flex items-center">
                            {category.name}
                            {category.completed === category.count && category.count > 0 && (
                              <CheckCircle className="text-green-500 ml-2" size={18} />
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                          <div className="flex items-center space-x-4 text-xs">
                            <span className="flex items-center space-x-1">
                              <Users size={12} />
                              <span>{category.count} lições</span>
                            </span>
                            {!isLocked && (
                              <span className="flex items-center space-x-1">
                                <Trophy size={12} />
                                <span>{category.completed} concluídas</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {isLocked ? (
                          <Badge variant="secondary" className="text-xs">Em breve</Badge>
                        ) : (
                          <>
                            <div className="text-2xl font-bold text-cartoon-dark">{Math.round(progressPercent)}%</div>
                            <div className="text-xs text-muted-foreground">completo</div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {!isLocked && (
                      <div className="space-y-3">
                        <Progress value={progressPercent} className="h-2" />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          <Play size={14} className="mr-2" />
                          {progressPercent === 0 ? 'Começar' : 'Continuar'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Featured Reading Lessons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-cartoon-dark flex items-center">
              <BookOpen className="text-cartoon-teal mr-3" size={24} />
              Lições de Leitura
            </h2>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Star size={14} />
              <span>Destaque</span>
            </Badge>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {readingLessons.slice(0, 3).map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="w-full"
              >
                <Card className="cartoon-card group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <BookOpen className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-cartoon-dark">Lição {index + 1}</h4>
                          <p className="text-xs text-muted-foreground">Leitura</p>
                        </div>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Disponível
                        </Badge>
                      )}
                      {index > 0 && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Lock size={12} />
                          <span>Bloqueada</span>
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm mb-2 line-clamp-2">"{lesson.title}"</h5>
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-3">
                        Pratique leitura, pronúncia e compreensão com este texto sobre {lesson.category}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{lesson.estimatedTime}min</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Star size={12} />
                            <span>+{lesson.xpReward}</span>
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {lesson.level === 'beginner' ? 'Iniciante' : lesson.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                        </Badge>
                      </div>
                      
                      <Button
                        onClick={index === 0 ? goToReadingLesson : undefined}
                        disabled={index > 0}
                        size="sm"
                        className={`w-full ${index === 0 ? 'cartoon-button' : ''}`}
                        variant={index === 0 ? 'default' : 'outline'}
                      >
                        {index === 0 ? (
                          <>
                            <Play size={14} className="mr-2" />
                            Começar Lição
                          </>
                        ) : (
                          <>
                            <Lock size={14} className="mr-2" />
                            Em Breve
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Learning Path & Recommendations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recommended Learning Path */}
          <Card className="cartoon-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="text-cartoon-coral mr-2" size={20} />
                Trilha Recomendada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Vocabulário Básico</p>
                    <p className="text-xs text-muted-foreground">Aprenda palavras essenciais</p>
                  </div>
                  <CheckCircle className="text-green-500" size={16} />
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Lições de Leitura</p>
                    <p className="text-xs text-muted-foreground">Pratique compreensão textual</p>
                  </div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-60">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Gramática Avançada</p>
                    <p className="text-xs text-muted-foreground">Estruturas complexas</p>
                  </div>
                  <Lock className="text-gray-400" size={16} />
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-4">
                Ver Trilha Completa
              </Button>
            </CardContent>
          </Card>

          {/* Study Statistics */}
          <Card className="cartoon-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Flame className="text-cartoon-yellow mr-2" size={20} />
                Estatísticas de Estudo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Flame className="text-orange-500" size={16} />
                    <span className="font-medium text-sm">Sequência Atual</span>
                  </div>
                  <span className="text-lg font-bold text-orange-500">{(user as any)?.streak || 0} dias</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="text-blue-500" size={16} />
                    <span className="font-medium text-sm">XP Total</span>
                  </div>
                  <span className="text-lg font-bold text-blue-500">{(user as any)?.totalXP || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Trophy className="text-purple-500" size={16} />
                    <span className="font-medium text-sm">Nível Atual</span>
                  </div>
                  <span className="text-lg font-bold text-purple-500">{(user as any)?.level || 1}</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => setLocation("/profile")}>
                Ver Perfil Completo
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}