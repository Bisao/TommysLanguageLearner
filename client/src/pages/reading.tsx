
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/header";
import ReadingLesson from "@/components/reading-lesson";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Book, Clock, Trophy, Star, Target, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Reading() {
  const [, setLocation] = useLocation();
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [audioControls, setAudioControls] = useState<React.ReactNode>(null);
  const [currentLessonData, setCurrentLessonData] = useState({
    title: "How Will We Eat in 2021?",
    text: `The pandemic has changed how we think about food. Many people are cooking more at home. Restaurants have had to adapt quickly. Food delivery services have become more popular than ever.

Some experts believe that these changes will continue even after the pandemic ends. Home cooking might remain more common. People might keep ordering food for delivery. Restaurants might focus more on takeout and delivery.

Technology is also changing how we eat. Smart kitchens are becoming more popular. Apps help people plan meals and order groceries. Virtual cooking classes teach people new skills.

The environment is another important factor. More people want to eat sustainable food. Plant-based meat alternatives are growing in popularity. Reducing food waste has become a priority for many families.

Local food systems are also getting more attention. Community gardens are expanding. Farmers markets are adapting to new safety requirements. People want to know where their food comes from.

These trends suggest that the future of food will be more diverse, more sustainable, and more connected to technology than ever before.`
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleLessonComplete = () => {
    setLessonCompleted(true);
  };

  const goBack = () => {
    setLocation("/lessons");
  };

  const handleControlsReady = useCallback((controls: React.ReactNode) => {
    setAudioControls(controls);
  }, []);

  if (lessonCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Header user={user} />
        
        <main className="pt-20 sm:pt-24 px-3 sm:px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className="text-center"
            >
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -5, 5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="mx-auto mb-6"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Trophy className="w-12 h-12 text-yellow-900" />
                    </div>
                  </motion.div>
                  
                  <CardTitle className="text-3xl sm:text-4xl text-green-800 mb-4 font-bold">
                    🎉 Parabéns!
                  </CardTitle>
                  
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <Badge className="bg-green-500 text-white">
                      <Star className="w-4 h-4 mr-1" />
                      Lição Concluída
                    </Badge>
                    <Badge className="bg-blue-500 text-white">
                      <Target className="w-4 h-4 mr-1" />
                      +50 XP
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="text-center pb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-lg text-green-700 mb-8 leading-relaxed">
                      Você concluiu sua lição de leitura com sucesso! <br />
                      Continue praticando para melhorar ainda mais suas habilidades.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        onClick={goBack}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                      >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Voltar às Lições
                      </Button>
                      <Button 
                        onClick={() => setLocation("/home")}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                      >
                        <Book className="mr-2 h-5 w-5" />
                        Ir para Home
                      </Button>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <Header 
        user={user} 
        audioControls={audioControls}
        showAudioControls={true}
      />
      
      <main className="pt-20 sm:pt-24">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <Button 
              onClick={goBack}
              variant="ghost" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 transition-all duration-200"
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>
            
            <div className="flex-1 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Lição de Leitura
                </h1>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                    <Clock className="w-3 h-3 mr-1" />
                    15-20 min
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Nível Intermediário
                  </Badge>
                </div>
              </motion.div>
            </div>
            
            <div className="w-20 sm:w-auto"></div>
          </div>
        </motion.div>

        {/* Lesson Content with Enhanced Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <ReadingLesson
            title={currentLessonData.title}
            text={currentLessonData.text}
            onComplete={handleLessonComplete}
            onControlsReady={handleControlsReady}
          />
        </motion.div>

        {/* Floating Tips */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block"
          >
            <Card className="w-64 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800 text-sm mb-2">
                      💡 Dicas de Leitura
                    </h3>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Clique nas palavras para ouvir</li>
                      <li>• Use o modo de leitura guiada</li>
                      <li>• Pratique a pronúncia</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
