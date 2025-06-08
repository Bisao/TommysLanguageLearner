import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Star } from "lucide-react";
import { useLocation } from "wouter";
import { readingLessons } from "@/lib/reading-lessons";

export default function Lessons() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const goToReadingLesson = () => {
    setLocation("/reading");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
      <Header user={user as any} />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cartoon-dark mb-4">
            Aulas
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Comece sua jornada de aprendizado com nossa primeira aula de leitura
          </p>
        </motion.div>

        {/* Reading Lessons Grid */}
        <div className="grid gap-6 max-w-6xl mx-auto">
          {readingLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="max-w-2xl mx-auto w-full"
            >
              <Card className="cartoon-card border-2 hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-cartoon-teal flex items-center justify-center mb-4">
                    <BookOpen className="text-white" size={32} />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-cartoon-dark">
                    Aula {index + 1} - Leitura
                  </CardTitle>
                  <p className="text-gray-600 text-sm sm:text-base">
                    "{lesson.title}" - Pratique sua pronúncia e compreensão
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="bg-cartoon-teal/10 p-4 rounded-lg">
                      <h3 className="font-semibold text-cartoon-dark mb-2">O que você vai aprender:</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Leitura de texto em inglês sobre {lesson.category}</li>
                        <li>• Pronúncia com feedback do Professor Tommy</li>
                        <li>• Vocabulário e compreensão textual</li>
                        <li>• Prática de speaking com reconhecimento de voz</li>
                      </ul>
                    </div>

                    <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
                      <span className="bg-white px-3 py-1 rounded-full border flex items-center gap-1">
                        📖 Nível: {lesson.level === 'beginner' ? 'Iniciante' : lesson.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                      </span>
                      <span className="bg-white px-3 py-1 rounded-full border flex items-center gap-1">
                        <Clock size={14} />
                        {lesson.estimatedTime} min
                      </span>
                      <span className="bg-white px-3 py-1 rounded-full border flex items-center gap-1">
                        <Star size={14} />
                        +{lesson.xpReward} XP
                      </span>
                    </div>

                    <Button
                      onClick={goToReadingLesson}
                      className="w-full cartoon-button bg-cartoon-teal hover:bg-cartoon-teal/80 text-lg py-6"
                      disabled={index > 0} // Temporarily disable lessons beyond the first
                    >
                      {index === 0 ? `Começar Aula ${index + 1}` : `Aula ${index + 1} - Em breve`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 max-w-lg mx-auto border">
            <h3 className="text-lg font-semibold text-cartoon-dark mb-2">
              Mais aulas em breve! 🚀
            </h3>
            <p className="text-gray-600 text-sm">
              Estamos preparando mais conteúdo incrível para você. Continue praticando!
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}