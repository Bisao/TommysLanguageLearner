import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, BookmarkPlus, Check, Bookmark } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { module1Vocabulary, module1Verbs } from "@/lib/lesson-data";

interface VocabularyStatus {
  [key: string]: 'learning' | 'known' | 'mastered';
}

interface VocabularySectionProps {
  showTranslations: boolean;
}

export function VocabularySection({ showTranslations }: VocabularySectionProps) {
  const [vocabularyStatus, setVocabularyStatus] = useState<VocabularyStatus>({});
  const [studyList, setStudyList] = useState<Set<string>>(new Set());
  const { speak, isPlaying } = useSpeech();

  const allWords = [...module1Vocabulary, ...module1Verbs];

  const markWordKnown = (wordId: string) => {
    setVocabularyStatus(prev => ({
      ...prev,
      [wordId]: prev[wordId] === 'known' ? 'mastered' : 'known'
    }));
  };

  const toggleStudyList = (wordId: string) => {
    setStudyList(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

  const playWordPronunciation = (word: string) => {
    speak(word, { rate: 0.6 });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'known':
        return 'bg-blue-100 text-blue-800';
      case 'mastered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'known':
        return 'Known';
      case 'mastered':
        return 'Mastered';
      default:
        return 'Learning';
    }
  };

  return (
    <section id="vocabulary" className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Module 1 Vocabulary</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Known: {Object.values(vocabularyStatus).filter(s => s === 'known').length}</span>
          <span>Mastered: {Object.values(vocabularyStatus).filter(s => s === 'mastered').length}</span>
          <span>Studying: {studyList.size}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allWords.map((word) => (
          <Card 
            key={word.id} 
            className={`word-card ${studyList.has(word.id) ? 'ring-2 ring-amber-500 ring-opacity-50' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{word.english}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playWordPronunciation(word.english)}
                  disabled={isPlaying}
                  className="text-blue-600 hover:text-blue-700 p-1"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              
              {word.pronunciation && (
                <p className="text-xs text-gray-500 mb-2">{word.pronunciation}</p>
              )}
              
              {showTranslations && (
                <p className="text-sm text-gray-600 mb-3 italic">{word.portuguese}</p>
              )}
              
              {word.example && (
                <p className="text-xs text-gray-500 mb-3 border-l-2 border-gray-200 pl-2">
                  "{word.example}"
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <Badge 
                  variant="secondary" 
                  className={getStatusColor(vocabularyStatus[word.id])}
                >
                  {getStatusText(vocabularyStatus[word.id])}
                </Badge>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markWordKnown(word.id)}
                    className={`p-1 ${
                      vocabularyStatus[word.id] ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStudyList(word.id)}
                    className={`p-1 ${
                      studyList.has(word.id) ? 'text-amber-600' : 'text-gray-400'
                    }`}
                  >
                    {studyList.has(word.id) ? <Bookmark className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
