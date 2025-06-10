/**
 * Sistema de Leitura Guiada - Módulo Principal
 * 
 * Este módulo contém a lógica principal para processamento de texto,
 * detecção de linking sounds e gerenciamento do estado da leitura guiada.
 */

export interface WordData {
  text: string;
  globalIndex: number;
  paragraphIndex: number;
  wordIndex: number;
  hasLinking: boolean;
  completesLinking: boolean;
  isCurrentWord: boolean;
  isCompleted: boolean;
  pronunciationFeedback?: PronunciationFeedback;
}

export interface PronunciationFeedback {
  status: 'correct' | 'close' | 'incorrect';
  score: number;
}

export interface ReadingGuideState {
  currentWordIndex: number;
  completedWords: Set<number>;
  readingProgress: number;
  isPlaying: boolean;
  isPaused: boolean;
  readingMode: 'guided' | 'practice';
  pronunciationScores: Map<number, PronunciationFeedback>;
  lastCompletedWordIndex: number;
  isListening: boolean;
}

/**
 * Classe principal para gerenciamento da leitura guiada
 */
export class ReadingGuide {
  private state: ReadingGuideState;
  private titleWords: string[] = [];
  private textWords: string[] = [];
  private allWords: string[] = [];
  private paragraphs: string[] = [];

  constructor() {
    this.state = this.createInitialState();
  }

  /**
   * Cria o estado inicial da leitura guiada
   */
  private createInitialState(): ReadingGuideState {
    return {
      currentWordIndex: -1,
      completedWords: new Set(),
      readingProgress: 0,
      isPlaying: false,
      isPaused: false,
      readingMode: 'guided',
      pronunciationScores: new Map(),
      lastCompletedWordIndex: -1,
      isListening: false,
    };
  }

  /**
   * Inicializa o sistema com um texto específico
   */
  public initialize(title: string, text: string): void {
    this.titleWords = this.splitTextIntoWords(title);
    this.paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    this.textWords = this.splitTextIntoWords(text);
    this.allWords = [...this.titleWords, ...this.textWords];
    
    console.log('[ReadingGuide] Inicializado com:', {
      titleWords: this.titleWords.length,
      textWords: this.textWords.length,
      totalWords: this.allWords.length,
      paragraphs: this.paragraphs.length
    });
  }

  /**
   * Divide texto em palavras, mantendo pontuação anexa
   */
  private splitTextIntoWords(inputText: string): string[] {
    const normalizedText = inputText.replace(/\s+/g, ' ').trim();
    
    return normalizedText.split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.trim())
      .filter(word => word.length > 0);
  }

  /**
   * Detecta linking sounds entre duas palavras
   */
  public hasLinkingSound(currentWord: string, nextWord: string): boolean {
    if (!currentWord || !nextWord) return false;
    
    const currentClean = currentWord.toLowerCase().replace(/[^\w]/g, '');
    const nextClean = nextWord.toLowerCase().replace(/[^\w]/g, '');
    
    // Casos de linking sounds
    const patterns = {
      consonantToVowel: /[bcdfghjklmnpqrstvwxyz]$/i.test(currentClean) && /^[aeiou]/i.test(nextClean),
      vowelToVowel: /[aeiou]$/i.test(currentClean) && /^[aeiou]/i.test(nextClean),
      rLinking: /r$/i.test(currentClean) && /^[aeiou]/i.test(nextClean),
      sLinking: /s$/i.test(currentClean) && /^[aeiou]/i.test(nextClean),
      tLinking: /[td]$/i.test(currentClean) && /^[aeiou]/i.test(nextClean),
      nLinking: /n$/i.test(currentClean) && /^[aeiou]/i.test(nextClean),
      numberLinking: /\d$/i.test(currentClean) && /^[aeiou]/i.test(nextClean)
    };

    const hasLinking = Object.values(patterns).some(pattern => pattern);
    
    if (hasLinking) {
      console.log(`[LinkingSound] ✓ "${currentWord}" → "${nextWord}"`);
    }
    
    return hasLinking;
  }

  /**
   * Função pública para dividir texto (exposta para uso externo)
   */
  public splitTextIntoWords(inputText: string): string[] {
    const normalizedText = inputText.replace(/\s+/g, ' ').trim();
    
    return normalizedText.split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.trim())
      .filter(word => word.length > 0);
  }

  /**
   * Processa dados de uma palavra específica
   */
  public getWordData(word: string, paragraphIndex: number, wordIndex: number): WordData {
    const titleWordsCount = this.titleWords.length;
    let globalIndex = titleWordsCount;
    
    // Calcular índice global
    for (let i = 0; i < paragraphIndex; i++) {
      globalIndex += this.splitTextIntoWords(this.paragraphs[i]).length;
    }
    globalIndex += wordIndex;

    // Verificar linking sounds
    const paragraphWords = this.splitTextIntoWords(this.paragraphs[paragraphIndex]);
    const nextWord = wordIndex < paragraphWords.length - 1 ? paragraphWords[wordIndex + 1] : null;
    const previousWord = wordIndex > 0 ? paragraphWords[wordIndex - 1] : null;
    
    const hasLinking = nextWord ? this.hasLinkingSound(word, nextWord) : false;
    const completesLinking = previousWord ? this.hasLinkingSound(previousWord, word) : false;

    return {
      text: word,
      globalIndex,
      paragraphIndex,
      wordIndex,
      hasLinking,
      completesLinking,
      isCurrentWord: globalIndex === this.state.currentWordIndex && this.state.currentWordIndex >= 0,
      isCompleted: this.state.completedWords.has(globalIndex),
      pronunciationFeedback: this.state.pronunciationScores.get(globalIndex)
    };
  }

  /**
   * Processa dados do título
   */
  public getTitleWordData(word: string, wordIndex: number): WordData {
    const globalIndex = wordIndex;
    
    return {
      text: word,
      globalIndex,
      paragraphIndex: -1, // Título não é parágrafo
      wordIndex,
      hasLinking: wordIndex < this.titleWords.length - 1 ? 
        this.hasLinkingSound(word, this.titleWords[wordIndex + 1]) : false,
      completesLinking: wordIndex > 0 ? 
        this.hasLinkingSound(this.titleWords[wordIndex - 1], word) : false,
      isCurrentWord: globalIndex === this.state.currentWordIndex && this.state.currentWordIndex >= 0,
      isCompleted: this.state.completedWords.has(globalIndex),
      pronunciationFeedback: this.state.pronunciationScores.get(globalIndex)
    };
  }

  /**
   * Atualiza o estado da leitura guiada
   */
  public updateState(updates: Partial<ReadingGuideState>): void {
    this.state = { ...this.state, ...updates };
    
    // Recalcular progresso se palavras completadas foram alteradas
    if (updates.completedWords) {
      this.state.readingProgress = (this.state.completedWords.size / this.allWords.length) * 100;
    }
  }

  /**
   * Retorna o estado atual
   */
  public getState(): ReadingGuideState {
    return { ...this.state };
  }

  /**
   * Marca uma palavra como atual durante a leitura
   */
  public setCurrentWord(index: number): void {
    this.updateState({ 
      currentWordIndex: index,
      completedWords: new Set(this.state.completedWords).add(index),
      lastCompletedWordIndex: index
    });
  }

  /**
   * Reinicia o sistema de leitura guiada
   */
  public reset(): void {
    this.state = this.createInitialState();
    console.log('[ReadingGuide] Sistema reiniciado');
  }

  /**
   * Retorna informações sobre as palavras processadas
   */
  public getWordInfo() {
    return {
      titleWords: this.titleWords,
      textWords: this.textWords,
      allWords: this.allWords,
      totalWords: this.allWords.length,
      paragraphs: this.paragraphs
    };
  }

  /**
   * Adiciona feedback de pronúncia para uma palavra
   */
  public addPronunciationFeedback(wordIndex: number, feedback: PronunciationFeedback): void {
    const newScores = new Map(this.state.pronunciationScores);
    newScores.set(wordIndex, feedback);
    this.updateState({ pronunciationScores: newScores });
  }

  /**
   * Verifica se a leitura foi completada
   */
  public isReadingComplete(): boolean {
    return this.state.completedWords.size >= this.allWords.length;
  }
}