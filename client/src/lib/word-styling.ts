/**
 * Sistema de Estilização de Palavras - Módulo de Styling
 * 
 * Este módulo gerencia a aplicação de estilos CSS para diferentes estados
 * das palavras durante a leitura guiada.
 */

import { WordData, PronunciationFeedback } from './reading-guide';

export interface WordStyling {
  className: string;
  title: string;
  style?: React.CSSProperties;
}

/**
 * Classe responsável pela estilização das palavras
 */
export class WordStyleManager {
  private readingMode: 'guided' | 'practice';
  private audioIsPlaying: boolean;

  constructor(readingMode: 'guided' | 'practice' = 'guided', audioIsPlaying: boolean = false) {
    this.readingMode = readingMode;
    this.audioIsPlaying = audioIsPlaying;
  }

  /**
   * Atualiza o estado do gerenciador de estilos
   */
  public updateState(readingMode: 'guided' | 'practice', audioIsPlaying: boolean): void {
    this.readingMode = readingMode;
    this.audioIsPlaying = audioIsPlaying;
  }

  /**
   * Gera o estilo para uma palavra baseado em seu estado
   */
  public getWordStyling(wordData: WordData): WordStyling {
    const { 
      text, 
      globalIndex, 
      hasLinking, 
      completesLinking, 
      isCurrentWord, 
      isCompleted, 
      pronunciationFeedback 
    } = wordData;

    let className = '';
    let title = `Palavra ${globalIndex + 1}: ${text}`;
    const style: React.CSSProperties = {
      zIndex: isCurrentWord && this.readingMode === 'guided' ? 10 : 1
    };

    // Adicionar informações sobre linking sounds
    title += this.getLinkingSoundInfo(hasLinking, completesLinking);

    // Aplicar estilos baseados no estado da palavra
    if (this.isNextToRead(wordData)) {
      className = this.getNextToReadStyle();
    } else if (pronunciationFeedback) {
      className = this.getPronunciationFeedbackStyle(pronunciationFeedback);
      title += this.getPronunciationInfo(pronunciationFeedback);
    } else if (this.isCurrentWordPlaying(isCurrentWord)) {
      className = this.getCurrentWordStyle(hasLinking, completesLinking);
    } else if (isCompleted) {
      className = this.getCompletedWordStyle(hasLinking, completesLinking);
    } else {
      className = this.getDefaultWordStyle(hasLinking, completesLinking);
    }

    return { className, title, style };
  }

  /**
   * Verifica se a palavra é a próxima a ser lida no modo prática
   */
  private isNextToRead(wordData: WordData): boolean {
    return this.readingMode === 'practice' && 
           wordData.isCurrentWord && 
           !wordData.isCompleted;
  }

  /**
   * Verifica se a palavra é a atual e está sendo reproduzida
   */
  private isCurrentWordPlaying(isCurrentWord: boolean): boolean {
    return isCurrentWord && 
           this.readingMode === 'guided' && 
           this.audioIsPlaying;
  }

  /**
   * Gera informações sobre linking sounds para o título
   */
  private getLinkingSoundInfo(hasLinking: boolean, completesLinking: boolean): string {
    let info = '';
    if (hasLinking) {
      info += ' - Conecta com a próxima palavra (linking sound)';
    }
    if (completesLinking) {
      info += ' - Completa linking sound da palavra anterior';
    }
    return info;
  }

  /**
   * Gera informações sobre pronúncia para o título
   */
  private getPronunciationInfo(feedback: PronunciationFeedback): string {
    const scorePercentage = Math.round(feedback.score * 100);
    const statusText = {
      correct: 'Excelente',
      close: 'Boa',
      incorrect: 'Precisa melhorar'
    }[feedback.status];
    
    return ` - Pronúncia: ${statusText} (${scorePercentage}%)`;
  }

  /**
   * Estilo para palavra próxima a ser lida (modo prática)
   */
  private getNextToReadStyle(): string {
    return 'bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold shadow-xl transform scale-110 animate-pulse border-2 border-blue-600';
  }

  /**
   * Estilo baseado no feedback de pronúncia
   */
  private getPronunciationFeedbackStyle(feedback: PronunciationFeedback): string {
    const styles = {
      correct: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-bold border-2 border-green-300 shadow-md',
      close: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 font-medium border-2 border-yellow-300 shadow-md',
      incorrect: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 font-medium border-2 border-red-300 shadow-md'
    };
    
    return styles[feedback.status];
  }

  /**
   * Estilo para palavra atual sendo reproduzida
   */
  private getCurrentWordStyle(hasLinking: boolean, completesLinking: boolean): string {
    const baseStyle = 'bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold shadow-xl transform scale-110';
    
    if (hasLinking && completesLinking) {
      // Palavra que inicia E completa linking sound
      return `${baseStyle} border-2 border-orange-300 animate-pulse`;
    } else if (hasLinking) {
      // Palavra que inicia linking sound (borda esquerda laranja)
      return `${baseStyle} border-l-4 border-orange-400 border-t-2 border-b-2 border-r-2 border-blue-300`;
    } else if (completesLinking) {
      // Palavra que completa linking sound (borda direita laranja)
      return `${baseStyle} border-r-4 border-orange-400 border-t-2 border-b-2 border-l-2 border-blue-300`;
    } else {
      return `${baseStyle} border-2 border-blue-300`;
    }
  }

  /**
   * Estilo para palavra completada
   */
  private getCompletedWordStyle(hasLinking: boolean, completesLinking: boolean): string {
    const baseStyle = 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-medium border border-green-300';
    
    if (hasLinking && completesLinking) {
      return 'bg-gradient-to-r from-orange-50 to-pink-50 text-orange-800 font-medium border-2 border-orange-200 shadow-sm';
    } else if (hasLinking) {
      return `${baseStyle} border-l-2 border-l-orange-200`;
    } else if (completesLinking) {
      return `${baseStyle} border-r-2 border-r-orange-200`;
    } else {
      return baseStyle;
    }
  }

  /**
   * Estilo padrão para palavras não lidas
   */
  private getDefaultWordStyle(hasLinking: boolean, completesLinking: boolean): string {
    const baseStyle = 'hover:bg-gray-100 hover:shadow-md text-gray-700';
    
    if (hasLinking && completesLinking) {
      return `${baseStyle} border-2 border-orange-200`;
    } else if (hasLinking) {
      return `${baseStyle} border-l-2 border-orange-200`;
    } else if (completesLinking) {
      return `${baseStyle} border-r-2 border-orange-200`;
    } else {
      return baseStyle;
    }
  }

  /**
   * Gera classe CSS completa para uma palavra
   */
  public getCompleteWordClassName(wordData: WordData): string {
    const styling = this.getWordStyling(wordData);
    return `
      inline-block mx-0.5 sm:mx-1 my-0.5 sm:my-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md cursor-pointer
      transition-all duration-200 hover:scale-105 relative
      ${styling.className}
    `.trim();
  }
}