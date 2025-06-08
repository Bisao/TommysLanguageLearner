
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ReadingLesson from "@/components/reading-lesson";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Book } from "lucide-react";
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

  // Future: Load lesson data dynamically based on URL params or lesson ID
  // const { data: lessonData } = useQuery({
  //   queryKey: ["/api/lessons", lessonId],
  //   enabled: !!lessonId
  // });

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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 pt-16 sm:pt-20">
        <Header user={user} />
        
        <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-3xl text-green-800 mb-4">
                🎉 Parabéns!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-green-700 mb-6">
                Você concluiu sua primeira aula de leitura!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={goBack}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar às Aulas
                </Button>
                <Button 
                  onClick={() => setLocation("/home")}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Book className="mr-2 h-4 w-4" />
                  Ir para Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const lessonTitle = "My First Day at School";
  const lessonText = `Today was my first day at school. I was very excited and a little nervous. I woke up early and had breakfast with my family. My mom packed my lunch and gave me a big hug. 

At school, I met my teacher, Miss Johnson. She was very kind and friendly. She showed me around the classroom and introduced me to my new classmates. Everyone was welcoming and I made some new friends quickly.

We started with reading time. I love reading stories about adventures and magical places. After that, we had math class where we learned about numbers and counting. 

During lunch break, I played with my new friends in the playground. We had so much fun on the swings and slides. 

In the afternoon, we had art class. We drew pictures of our families and colored them with bright crayons. I drew my mom, dad, and my little sister.

When school finished, my mom was waiting for me at the gate. I told her all about my wonderful first day. I can't wait to go back tomorrow and learn more new things!`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50">
      <Header 
        user={user} 
        audioControls={audioControls}
        showAudioControls={true}
      />
      
      <main className="pt-20 sm:pt-24">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 mb-4">
          <Button 
            onClick={goBack}
            variant="ghost" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
        </div>

        <ReadingLesson
          title={currentLessonData.title}
          text={currentLessonData.text}
          onComplete={handleLessonComplete}
          onControlsReady={handleControlsReady}
        />
      </main>
    </div>
  );
}
