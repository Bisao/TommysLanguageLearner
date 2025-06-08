import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RotateCcw, ArrowRight } from "lucide-react";
import { grammarExercises, vocabularyExercises } from "@/lib/lesson-data";

interface ExerciseResult {
  exerciseId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface ExerciseSectionProps {
  onExerciseComplete: (result: ExerciseResult) => void;
}

export function ExerciseSection({ onExerciseComplete }: ExerciseSectionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const exercises = grammarExercises;
  const currentExercise = exercises[currentExerciseIndex];

  const selectAnswer = (exerciseId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [exerciseId]: answer
    }));
  };

  const checkAnswer = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const selectedAnswer = selectedAnswers[exerciseId];

    if (!exercise || !selectedAnswer) return;

    const isCorrect = selectedAnswer === exercise.correctAnswer;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    const result: ExerciseResult = {
      exerciseId,
      selectedAnswer,
      isCorrect,
      timeSpent
    };

    setExerciseResults(prev => [...prev, result]);
    setShowResults(prev => ({ ...prev, [exerciseId]: true }));
    onExerciseComplete(result);
  };

  const goToNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setStartTime(Date.now());
    }
  };

  const resetExercises = () => {
    setCurrentExerciseIndex(0);
    setSelectedAnswers({});
    setShowResults({});
    setExerciseResults([]);
    setStartTime(Date.now());
  };

  const getScore = () => {
    const correctAnswers = exerciseResults.filter(result => result.isCorrect).length;
    return Math.round((correctAnswers / exerciseResults.length) * 100);
  };

  const isAnswerCorrect = (exerciseId: string, answer: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    return exercise?.correctAnswer === answer;
  };

  const getOptionStyle = (exerciseId: string, option: string) => {
    const isSelected = selectedAnswers[exerciseId] === option;
    const showResult = showResults[exerciseId];
    const isCorrect = isAnswerCorrect(exerciseId, option);

    if (!showResult) {
      return isSelected 
        ? 'border-blue-500 bg-blue-50 text-blue-700' 
        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50';
    }

    if (isSelected && isCorrect) {
      return 'border-green-500 bg-green-50 text-green-700';
    }

    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 text-red-700';
    }

    if (!isSelected && isCorrect) {
      return 'border-green-500 bg-green-50 text-green-700';
    }

    return 'border-gray-300 text-gray-500';
  };

  return (
    <section id="exercises" className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Grammar Exercises</h3>
        <div className="flex items-center gap-4">
          {exerciseResults.length > 0 && (
            <Badge variant="outline" className="text-blue-600">
              Score: {getScore()}%
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={resetExercises}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </CardTitle>
            <div className="w-48">
              <Progress 
                value={((currentExerciseIndex + 1) / exercises.length) * 100} 
                className="h-2" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
            <p className="text-lg font-medium text-blue-900">{currentExercise.question}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentExercise.options?.map((option) => (
              <button
                key={option}
                onClick={() => !showResults[currentExercise.id] && selectAnswer(currentExercise.id, option)}
                disabled={showResults[currentExercise.id]}
                className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${getOptionStyle(currentExercise.id, option)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {showResults[currentExercise.id] && (
                    <span>
                      {isAnswerCorrect(currentExercise.id, option) ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : selectedAnswers[currentExercise.id] === option ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : null}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {showResults[currentExercise.id] && currentExercise.explanation && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Explanation:</h4>
              <p className="text-yellow-700">{currentExercise.explanation}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedAnswers[currentExercise.id] ? (
                showResults[currentExercise.id] ? (
                  <span className="flex items-center">
                    {isAnswerCorrect(currentExercise.id, selectedAnswers[currentExercise.id]) ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    {isAnswerCorrect(currentExercise.id, selectedAnswers[currentExercise.id]) 
                      ? 'Correct!' 
                      : 'Incorrect'
                    }
                  </span>
                ) : (
                  'Answer selected'
                )
              ) : (
                'Select an answer'
              )}
            </div>

            <div className="flex gap-2">
              {!showResults[currentExercise.id] && selectedAnswers[currentExercise.id] && (
                <Button
                  onClick={() => checkAnswer(currentExercise.id)}
                  className="academy-button-blue"
                >
                  Check Answer
                </Button>
              )}

              {showResults[currentExercise.id] && currentExerciseIndex < exercises.length - 1 && (
                <Button
                  onClick={goToNextExercise}
                  className="academy-button-green"
                >
                  Next Exercise
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}