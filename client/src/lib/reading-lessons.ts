
export interface ReadingLessonData {
  id: string;
  title: string;
  text: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  estimatedTime: number; // em minutos
  xpReward: number;
}

export const readingLessons: ReadingLessonData[] = [
  {
    id: "lesson-1-food-trends",
    title: "How Will We Eat in 2021?",
    text: `The pandemic has changed how we think about food. Many people are cooking more at home. Restaurants have had to adapt quickly. Food delivery services have become more popular than ever.

Some experts believe that these changes will continue even after the pandemic ends. Home cooking might remain more common. People might keep ordering food for delivery. Restaurants might focus more on takeout and delivery.

Technology is also changing how we eat. Smart kitchens are becoming more popular. Apps help people plan meals and order groceries. Virtual cooking classes teach people new skills.

The environment is another important factor. More people want to eat sustainable food. Plant-based meat alternatives are growing in popularity. Reducing food waste has become a priority for many families.

Local food systems are also getting more attention. Community gardens are expanding. Farmers markets are adapting to new safety requirements. People want to know where their food comes from.

These trends suggest that the future of food will be more diverse, more sustainable, and more connected to technology than ever before.`,
    level: 'beginner',
    category: 'lifestyle',
    estimatedTime: 15,
    xpReward: 50
  },
  {
    id: "lesson-2-organize-fridge",
    title: "How to Organize Your Fridge Like a Pro",
    text: `A well-organized refrigerator can save you time, money, and reduce food waste. Professional chefs and home organization experts have specific strategies for maximizing your fridge space.

The top shelf should store ready-to-eat foods like leftovers, drinks, and snacks. This area has the most consistent temperature. Keep dairy products like milk and yogurt here too.

The middle shelves are perfect for eggs, butter, and other dairy items. These shelves maintain a steady temperature that's ideal for these products.

The bottom shelf is the coldest part of your fridge. Store raw meat, poultry, and fish here. Use containers or wrap them well to prevent drips from contaminating other foods.

The crisper drawers have humidity controls. Use the high-humidity drawer for vegetables and the low-humidity drawer for fruits. This helps them stay fresh longer.

Door storage should be reserved for condiments, dressings, and drinks. The door temperature fluctuates the most, so don't store eggs or dairy here despite what some fridge designs suggest.

Following these guidelines will help you maintain food safety and extend the life of your groceries.`,
    level: 'beginner',
    category: 'lifestyle',
    estimatedTime: 12,
    xpReward: 40
  },
  {
    id: "lesson-3-dna-faces",
    title: "China Uses DNA to Map Faces",
    text: `Scientists in China have developed technology that can predict what a person looks like based on their DNA. This forensic technique could revolutionize criminal investigations and missing person cases.

The research team analyzed genetic markers that influence facial features. They studied thousands of individuals to understand how specific genes affect nose shape, eye distance, and other characteristics.

The technology works by examining single nucleotide polymorphisms (SNPs) in a person's genetic code. These tiny variations can influence everything from hair color to facial bone structure.

Current accuracy rates vary depending on the facial feature. The system is most reliable at predicting broad characteristics like ancestry and general facial shape. Fine details remain more challenging to determine.

Law enforcement agencies are interested in this technology for cold cases where traditional identification methods have failed. However, the technique also raises important privacy and ethical questions.

Critics worry about potential misuse of genetic information and the implications for personal privacy. There are also concerns about accuracy across different ethnic groups.

As the technology continues to develop, society will need to balance its investigative benefits with protecting individual rights and preventing discrimination.`,
    level: 'intermediate',
    category: 'science',
    estimatedTime: 20,
    xpReward: 75
  }
];

export const getReadingLessonById = (id: string): ReadingLessonData | undefined => {
  return readingLessons.find(lesson => lesson.id === id);
};

export const getReadingLessonsByLevel = (level: 'beginner' | 'intermediate' | 'advanced'): ReadingLessonData[] => {
  return readingLessons.filter(lesson => lesson.level === level);
};

export const getReadingLessonsByCategory = (category: string): ReadingLessonData[] => {
  return readingLessons.filter(lesson => lesson.category === category);
};
