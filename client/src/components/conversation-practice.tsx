import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Volume2, Mic, MicOff, Play, Send } from "lucide-react";
import { useSpeech, useSpeechRecognition } from "@/hooks/use-speech";
import { conversationQuestions } from "@/lib/lesson-data";

interface ConversationPracticeProps {
  showTranslations: boolean;
}

export function ConversationPractice({ showTranslations }: ConversationPracticeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const { speak, isPlaying } = useSpeech();
  const { startListening, stopListening, isListening, transcript } = useSpeechRecognition();

  const currentQuestion = conversationQuestions[currentQuestionIndex];

  const playQuestion = (question: string) => {
    speak(question, { rate: 0.7 });
  };

  const playExample = (example: string) => {
    speak(example, { rate: 0.8 });
  };

  const handleRecordAnswer = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setCurrentAnswer(transcript);
      }
    } else {
      startListening();
    }
  };

  const submitAnswer = () => {
    if (currentAnswer.trim()) {
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: currentAnswer
      }));
      setCurrentAnswer('');
      
      if (currentQuestionIndex < conversationQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < conversationQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(userAnswers[conversationQuestions[currentQuestionIndex - 1].id] || '');
    }
  };

  useEffect(() => {
    if (transcript) {
      setCurrentAnswer(transcript);
    }
  }, [transcript]);

  return (
    <section id="conversation" className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Conversation Practice</h3>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Question Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Question {currentQuestionIndex + 1} of {conversationQuestions.length}</span>
              <Badge variant="outline">{Math.round(((currentQuestionIndex + 1) / conversationQuestions.length) * 100)}% Complete</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-lg font-medium text-blue-900">{currentQuestion.question}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playQuestion(currentQuestion.question)}
                  disabled={isPlaying}
                  className="text-blue-600"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              {showTranslations && currentQuestion.translation && (
                <p className="text-blue-700 text-sm italic">{currentQuestion.translation}</p>
              )}
            </div>

            {/* Example Answer */}
            {currentQuestion.exampleAnswer && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-green-800">Example Answer:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playExample(currentQuestion.exampleAnswer!)}
                    disabled={isPlaying}
                    className="text-green-600"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-green-700">{currentQuestion.exampleAnswer}</p>
                {showTranslations && currentQuestion.exampleTranslation && (
                  <p className="text-green-600 text-sm italic mt-1">{currentQuestion.exampleTranslation}</p>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === conversationQuestions.length - 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Answer Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              placeholder="Type your answer here or use voice recording..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              rows={6}
              className="resize-none"
            />

            {/* Recording Interface */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">Voice Recording</h4>
                <Button
                  variant={isListening ? "destructive" : "default"}
                  size="sm"
                  onClick={handleRecordAnswer}
                  className={isListening ? 'academy-button-red' : 'academy-button-blue'}
                >
                  {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                  {isListening ? 'Stop Recording' : 'Start Recording'}
                </Button>
              </div>
              
              {isListening && (
                <div className="text-sm text-gray-600">
                  <p className="mb-2">🎤 Listening... Speak clearly!</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-red-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}
              
              {transcript && !isListening && (
                <div className="text-sm text-green-600">
                  <p>✓ Recorded: "{transcript}"</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={submitAnswer}
              disabled={!currentAnswer.trim()}
              className="w-full academy-button-green"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Answer
            </Button>

            {/* Previous Answers */}
            {userAnswers[currentQuestion.id] && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Your Previous Answer:</h4>
                <p className="text-blue-700">{userAnswers[currentQuestion.id]}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
