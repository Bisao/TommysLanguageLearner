export interface VocabularyWord {
  id: string;
  english: string;
  portuguese: string;
  pronunciation?: string;
  example?: string;
}

export interface ConversationQuestion {
  id: string;
  question: string;
  translation?: string;
  exampleAnswer?: string;
  exampleTranslation?: string;
}

export interface GrammarRule {
  id: string;
  title: string;
  description: string;
  examples: {
    english: string;
    portuguese?: string;
  }[];
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'ordering';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

// Module 1 Data from the PDF
export const module1Vocabulary: VocabularyWord[] = [
  {
    id: 'trend',
    english: 'trend',
    portuguese: 'tendência',
    pronunciation: '/trend/',
    example: 'Fashion trends change quickly.'
  },
  {
    id: 'cork',
    english: 'cork',
    portuguese: 'rolha',
    pronunciation: '/kɔːrk/',
    example: 'Remove the cork from the bottle.'
  },
  {
    id: 'bottle',
    english: 'bottle',
    portuguese: 'garrafa',
    pronunciation: '/ˈbɒtl/',
    example: 'She drinks water from a bottle.'
  },
  {
    id: 'summer',
    english: 'summer',
    portuguese: 'verão',
    pronunciation: '/ˈsʌmər/',
    example: 'Summer is my favorite season.'
  },
  {
    id: 'winter',
    english: 'winter',
    portuguese: 'inverno',
    pronunciation: '/ˈwɪntər/',
    example: 'Winter weather is very cold.'
  },
  {
    id: 'wave',
    english: 'wave',
    portuguese: 'onda',
    pronunciation: '/weɪv/',
    example: 'The wave crashed on the shore.'
  },
  {
    id: 'forecast',
    english: 'forecast',
    portuguese: 'previsão',
    pronunciation: '/ˈfɔːrkæst/',
    example: 'The weather forecast predicts rain.'
  },
  {
    id: 'other',
    english: 'other',
    portuguese: 'outro',
    pronunciation: '/ˈʌðər/',
    example: 'Do you have any other questions?'
  },
  {
    id: 'slower',
    english: 'slower',
    portuguese: 'mais lento',
    pronunciation: '/ˈsloʊər/',
    example: 'This car is slower than that one.'
  },
  {
    id: 'world',
    english: 'world',
    portuguese: 'mundo',
    pronunciation: '/wɜːrld/',
    example: 'The world is full of beautiful places.'
  }
];

export const module1Verbs: VocabularyWord[] = [
  {
    id: 'have',
    english: 'have',
    portuguese: 'ter, possuir',
    example: 'I have a car.'
  },
  {
    id: 'read',
    english: 'read',
    portuguese: 'ler',
    example: 'She reads books every day.'
  },
  {
    id: 'agree',
    english: 'agree',
    portuguese: 'concordar',
    example: 'We agree with your opinion.'
  },
  {
    id: 'deliver',
    english: 'deliver',
    portuguese: 'entregar',
    example: 'They deliver packages daily.'
  },
  {
    id: 'come',
    english: 'come',
    portuguese: 'vir',
    example: 'Please come to the party.'
  }
];

export const conversationQuestions: ConversationQuestion[] = [
  {
    id: 'favorite-snack',
    question: 'What is your favorite snack?',
    translation: 'Qual é seu lanche favorito?',
    exampleAnswer: 'My favorite snack is chocolate.',
    exampleTranslation: 'Meu lanche favorito é chocolate.'
  },
  {
    id: 'unhealthy-food',
    question: 'What unhealthy food do you love?',
    translation: 'Que comida não saudável você adora?',
    exampleAnswer: 'I love pizza and hamburgers.',
    exampleTranslation: 'Eu amo pizza e hambúrgueres.'
  },
  {
    id: 'mother-advice',
    question: 'What food did your mother always tell you to eat and not to eat?',
    translation: 'Que comida sua mãe sempre disse para você comer e não comer?',
    exampleAnswer: 'My mother told me to eat vegetables and not to eat too much candy.',
    exampleTranslation: 'Minha mãe me disse para comer vegetais e não comer muitos doces.'
  },
  {
    id: 'eat-out',
    question: 'How often do you eat out?',
    translation: 'Com que frequência você come fora?',
    exampleAnswer: 'I eat out twice a week.',
    exampleTranslation: 'Eu como fora duas vezes por semana.'
  },
  {
    id: 'sick-food',
    question: 'What is the best food to eat when you are sick?',
    translation: 'Qual é a melhor comida para comer quando você está doente?',
    exampleAnswer: 'Soup is the best food when you are sick.',
    exampleTranslation: 'Sopa é a melhor comida quando você está doente.'
  }
];

export const grammarRules: GrammarRule[] = [
  {
    id: 'simple-present-formation',
    title: 'Simple Present Formation',
    description: 'The Present Simple tense uses the base form of the verb (except for the verb be). The only change from the base is the addition of s for third person singular.',
    examples: [
      { english: 'I, you, we, they like coffee.', portuguese: 'Eu, você, nós, eles gostam de café.' },
      { english: 'He, she, it likes coffee.', portuguese: 'Ele, ela gosta de café.' }
    ]
  },
  {
    id: 'simple-present-negative',
    title: 'Negative Form',
    description: 'To make negative sentences, use do not (don\'t) or does not (doesn\'t) + base verb.',
    examples: [
      { english: 'I, you, we, they do not like coffee.', portuguese: 'Eu, você, nós, eles não gostam de café.' },
      { english: 'He, she, it does not like coffee.', portuguese: 'Ele, ela não gosta de café.' }
    ]
  },
  {
    id: 'simple-present-questions',
    title: 'Question Form',
    description: 'To make questions, use Do or Does + subject + base verb.',
    examples: [
      { english: 'Do I, you, we, they like coffee?', portuguese: 'Eu, você, nós, eles gostam de café?' },
      { english: 'Does he, she, it like coffee?', portuguese: 'Ele, ela gosta de café?' }
    ]
  }
];

export const grammarExercises: Exercise[] = [
  {
    id: 'simple-present-1',
    type: 'multiple-choice',
    question: 'She _____ coffee every morning.',
    options: ['drink', 'drinks', 'drinking', 'drank'],
    correctAnswer: 'drinks',
    explanation: 'Use "drinks" with third person singular (she, he, it) in Simple Present.'
  },
  {
    id: 'simple-present-2',
    type: 'multiple-choice',
    question: 'They _____ English at school.',
    options: ['studies', 'study', 'studying', 'studied'],
    correctAnswer: 'study',
    explanation: 'Use the base form "study" with plural subjects (they) in Simple Present.'
  },
  {
    id: 'simple-present-3',
    type: 'multiple-choice',
    question: '_____ you like pizza?',
    options: ['Does', 'Do', 'Are', 'Is'],
    correctAnswer: 'Do',
    explanation: 'Use "Do" to form questions with "you" in Simple Present.'
  },
  {
    id: 'negative-1',
    type: 'multiple-choice',
    question: 'He _____ speak Portuguese.',
    options: ['don\'t', 'doesn\'t', 'not', 'no'],
    correctAnswer: 'doesn\'t',
    explanation: 'Use "doesn\'t" with third person singular (he, she, it) in negative sentences.'
  },
  {
    id: 'negative-2',
    type: 'multiple-choice',
    question: 'We _____ like spicy food.',
    options: ['don\'t', 'doesn\'t', 'not', 'no'],
    correctAnswer: 'don\'t',
    explanation: 'Use "don\'t" with plural subjects (we, they) in negative sentences.'
  }
];

export const vocabularyExercises: Exercise[] = [
  {
    id: 'vocab-match-1',
    type: 'matching',
    question: 'Match the English words with their Portuguese translations:',
    correctAnswer: ['trend-tendência', 'summer-verão', 'bottle-garrafa', 'world-mundo'],
    explanation: 'These are the correct translations from Module 1 vocabulary.'
  }
];
