import { useState, useCallback } from 'react';

interface Translation {
  text: string;
  language: string;
}

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);

  const toggleTranslations = useCallback(() => {
    setShowTranslations(prev => !prev);
  }, []);

  // Simple translation helper for Portuguese/English pairs
  const getTranslation = useCallback((text: string, targetLang: 'pt' | 'en'): string => {
    const translations: Record<string, { pt: string; en: string }> = {
      'What is your favorite snack?': { 
        pt: 'Qual é seu lanche favorito?', 
        en: 'What is your favorite snack?' 
      },
      'What unhealthy food do you love?': { 
        pt: 'Que comida não saudável você adora?', 
        en: 'What unhealthy food do you love?' 
      },
      'How often do you eat out?': { 
        pt: 'Com que frequência você come fora?', 
        en: 'How often do you eat out?' 
      },
      'I like coffee': { 
        pt: 'Eu gosto de café', 
        en: 'I like coffee' 
      },
      'She likes coffee': { 
        pt: 'Ela gosta de café', 
        en: 'She likes coffee' 
      },
      'I do not like coffee': { 
        pt: 'Eu não gosto de café', 
        en: 'I do not like coffee' 
      },
      'She does not like coffee': { 
        pt: 'Ela não gosta de café', 
        en: 'She does not like coffee' 
      }
    };

    return translations[text]?.[targetLang] || text;
  }, []);

  // In a real implementation, this would call a translation API
  const translateText = useCallback(async (text: string, targetLang: string): Promise<string> => {
    setIsTranslating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For now, use the built-in translations
      const result = getTranslation(text, targetLang as 'pt' | 'en');
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [getTranslation]);

  return {
    translateText,
    isTranslating,
    showTranslations,
    toggleTranslations,
    getTranslation
  };
}
