
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Target } from "lucide-react";

interface DailyStreakProps {
  streak: number;
  todayCompleted: boolean;
  weeklyGoal?: number;
  weeklyProgress?: number;
}

export default function DailyStreak({ 
  streak, 
  todayCompleted, 
  weeklyGoal = 7, 
  weeklyProgress = 0 
}: DailyStreakProps) {
  const streakLevel = Math.floor(streak / 7);
  const daysInWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date().getDay();

  return (
    <Card className="cartoon-card border-2 hover:shadow-lg transition-all duration-300">
      <CardHeader className="text-center pb-4">
        <motion.div
          className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-4 shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Flame className="text-white" size={32} />
        </motion.div>
        <CardTitle className="text-2xl font-bold text-cartoon-dark">
          Sequência Diária
        </CardTitle>
        <motion.div
          className="text-4xl font-bold text-orange-600"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          {streak} dias
        </motion.div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status de hoje */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-gray-600" />
            <span className="font-medium text-gray-700">Hoje</span>
          </div>
          <Badge 
            variant={todayCompleted ? "default" : "outline"}
            className={todayCompleted ? "bg-green-500" : ""}
          >
            {todayCompleted ? "Concluído" : "Pendente"}
          </Badge>
        </div>

        {/* Calendário semanal */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Target size={16} className="mr-2" />
            Esta Semana
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {daysInWeek.map((day, index) => (
              <motion.div
                key={day}
                className={`
                  text-center p-2 rounded-lg text-xs font-medium
                  ${index === today 
                    ? (todayCompleted ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600 border-2 border-blue-300')
                    : index < today 
                      ? (weeklyProgress > index ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400')
                      : 'bg-gray-50 text-gray-400'
                  }
                `}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="font-bold">{day}</div>
                <div className="mt-1">
                  {index === today 
                    ? (todayCompleted ? '✓' : '○')
                    : index < today 
                      ? (weeklyProgress > index ? '✓' : '○')
                      : '○'
                  }
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{streakLevel}</div>
            <div className="text-xs text-gray-600">Semanas</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{weeklyProgress}</div>
            <div className="text-xs text-gray-600">Esta semana</div>
          </div>
        </div>

        {/* Mensagem motivacional */}
        <motion.div 
          className="text-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-sm font-medium text-yellow-800">
            {streak === 0 
              ? "Comece sua sequência hoje!"
              : streak < 7 
                ? `Continue assim! Faltam ${7 - (streak % 7)} dias para completar a semana.`
                : `Incrível! Você tem ${streak} dias de sequência!`
            }
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
