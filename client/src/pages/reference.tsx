
import Layout from "@/components/layout";
import SVOTable from "@/components/svo-table";
import RememberTable from "@/components/remember-table";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, MessageCircle, Mic, Palette } from "lucide-react";
import { motion } from "framer-motion";

export default function Reference() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["/api/lessons"],
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
  });

  // Filter lessons by progress
  const lessonsWithProgress = lessons.map((lesson: any) => {
    const lessonProgress = progress?.progress?.find((p: any) => p.lessonId === lesson.id);
    return {
      ...lesson,
      completed: lessonProgress?.completed || false
    };
  });

  const categories = [
    {
      name: "Vocabulário",
      description: "Aprenda novas palavras",
      icon: BookOpen,
      color: "from-pink-400 to-red-500",
      lessons: lessonsWithProgress.filter((l: any) => l.category === "vocabulary"),
    },
    {
      name: "Gramática", 
      description: "Domine as regras",
      icon: Palette,
      color: "from-blue-400 to-purple-500",
      lessons: lessonsWithProgress.filter((l: any) => l.category === "grammar"),
    },
    {
      name: "Frases",
      description: "Conversação prática",
      icon: MessageCircle,
      color: "from-green-400 to-teal-500",
      lessons: lessonsWithProgress.filter((l: any) => l.category === "phrases"),
    },
    {
      name: "Pronúncia",
      description: "Fale como um nativo",
      icon: Mic,
      color: "from-yellow-400 to-orange-500",
      lessons: lessonsWithProgress.filter((l: any) => l.category === "pronunciation"),
    },
  ];

  return (
    <Layout user={user as any}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h1 className="heading-responsive font-bold gradient-text mb-3 sm:mb-4">
          Referência de Estudo
        </h1>
        <p className="text-responsive text-muted-foreground px-4">
          Tabelas de referência e progresso por categoria
        </p>
      </motion.div>

        {/* Categories Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 sm:mb-12"
      >
        <h2 className="text-responsive font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center">
          Progresso por Categoria
        </h2>
        <div className="responsive-grid">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const completedLessons = category.lessons.filter((l: any) => l.completed).length;
            const totalLessons = category.lessons.length;
            const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="card-elevated">
                  <CardContent className="mobile-card-compact sm:p-6">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-responsive font-bold text-gray-800 dark:text-white">{category.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="text-muted-foreground">{completedLessons} de {totalLessons} lições</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        {Math.round(progressPercent)}% concluído
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Reference Tables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-8 sm:space-y-12"
      >
        <div>
          <h2 className="text-responsive font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center">
            Tabela S.V.O. (Subject-Verb-Object)
          </h2>
          <SVOTable />
        </div>

        <div>
          <h2 className="text-responsive font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center">
            Vocabulário de Conectores
          </h2>
          <RememberTable />
        </div>
      </motion.div>
    </Layout>
  );
}
