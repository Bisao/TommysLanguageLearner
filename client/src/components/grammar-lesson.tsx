import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, BookOpen, CheckCircle } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { grammarRules } from "@/lib/lesson-data";

interface GrammarLessonProps {
  showTranslations: boolean;
}

export function GrammarLesson({ showTranslations }: GrammarLessonProps) {
  const [completedRules, setCompletedRules] = useState<Set<string>>(new Set());
  const { speak, isPlaying } = useSpeech();

  const markRuleComplete = (ruleId: string) => {
    setCompletedRules(prev => new Set([...prev, ruleId]));
  };

  const playExample = (text: string) => {
    speak(text, { rate: 0.7 });
  };

  return (
    <section id="grammar" className="mb-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Simple Present Tense - Regras de Gramática
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="formation" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="formation">Formation</TabsTrigger>
              <TabsTrigger value="negative">Negative</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>
            
            {grammarRules.map((rule) => (
              <TabsContent 
                key={rule.id} 
                value={rule.id.replace('simple-present-', '')}
                className="space-y-6"
              >
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">{rule.title}</h3>
                      <p className="text-blue-800 mt-2">{rule.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => speak(rule.description)}
                      disabled={isPlaying}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Examples:</h4>
                  {rule.examples.map((example, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium mb-1">{example.english}</p>
                          {showTranslations && example.portuguese && (
                            <p className="text-gray-600 text-sm italic">{example.portuguese}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playExample(example.english)}
                          disabled={isPlaying}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {completedRules.has(rule.id) ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </span>
                    ) : (
                      'Listen to all examples to complete this lesson'
                    )}
                  </div>
                  <Button
                    onClick={() => markRuleComplete(rule.id)}
                    disabled={completedRules.has(rule.id)}
                    className="academy-button-blue"
                  >
                    {completedRules.has(rule.id) ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
