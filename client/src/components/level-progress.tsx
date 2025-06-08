
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Zap, Trophy } from "lucide-react";

interface LevelProgressProps {
  level: number;
  currentXP: number;
  xpForNextLevel?: number;
  totalXP: number;
}

// Função para calcular XP necessário baseado no nível
function calculateXPForLevel(level: number): number {
  return Math.floor(1000 * Math.pow(1.2, level - 1));
}

export default function LevelProgress({
  level,
  currentXP,
  xpForNextLevel,
  totalXP,
}: LevelProgressProps) {
  const xpRequired = xpForNextLevel || calculateXPForLevel(level + 1);
  const progressPercent = Math.min((currentXP / xpRequired) * 100, 100);
  const xpToNext = Math.max(xpRequired - currentXP, 0);

  return (
    <Card className="cartoon-card overflow-hidden border-2 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Star className="text-white" size={32} />
            </motion.div>
            <div>
              <motion.h3 
                className="text-3xl font-bold text-cartoon-dark"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Nível {level}
              </motion.h3>
              <p className="text-sm text-gray-600 font-medium">
                {totalXP.toLocaleString()} XP Total
              </p>
            </div>
          </div>
          
          <motion.div
            className="text-right bg-gradient-to-br from-yellow-100 to-orange-100 p-3 rounded-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 text-orange-600">
              <Zap size={20} />
              <span className="text-xl font-bold">{currentXP}</span>
            </div>
            <p className="text-xs text-gray-600">
              {xpToNext} para próximo nível
            </p>
          </motion.div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-cartoon-dark">
              Progresso para Nível {level + 1}
            </span>
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {Math.round(progressPercent)}%
            </span>
          </div>
          
          <div className="relative">
            <Progress value={progressPercent} className="h-4 bg-gray-200" />
            <motion.div
              className="absolute top-0 left-0 h-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full overflow-hidden"
              style={{ 
                background: `linear-gradient(90deg, 
                  #fbbf24 0%, 
                  #f97316 ${progressPercent/2}%, 
                  #dc2626 100%)`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: 1.5 
                }}
              />
            </motion.div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <motion.div 
            className="text-center bg-blue-50 p-3 rounded-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-center justify-center mb-1">
              <Zap size={16} className="text-blue-600 mr-1" />
              <p className="text-lg font-bold text-blue-600">{currentXP}</p>
            </div>
            <p className="text-xs text-gray-600 font-medium">XP Atual</p>
          </motion.div>
          
          <motion.div 
            className="text-center bg-green-50 p-3 rounded-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-center justify-center mb-1">
              <Trophy size={16} className="text-green-600 mr-1" />
              <p className="text-lg font-bold text-green-600">{xpRequired}</p>
            </div>
            <p className="text-xs text-gray-600 font-medium">Para Próximo</p>
          </motion.div>
          
          <motion.div 
            className="text-center bg-purple-50 p-3 rounded-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-center justify-center mb-1">
              <Star size={16} className="text-purple-600 mr-1" />
              <p className="text-lg font-bold text-purple-600">{level + 1}</p>
            </div>
            <p className="text-xs text-gray-600 font-medium">Próximo Nível</p>
          </motion.div>
        </div>

        {/* Barra de conquistas */}
        {level > 1 && (
          <motion.div 
            className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <Trophy size={16} className="text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Parabéns! Você está no nível {level}!
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
