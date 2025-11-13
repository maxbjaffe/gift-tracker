// Personality Survey Questions for Building Recipient Profiles

export interface SurveyQuestion {
  id: string;
  category: string;
  question: string;
  type: 'multiple-choice' | 'multi-select' | 'scale' | 'text';
  options?: string[];
  placeholder?: string;
}

export const SURVEY_CATEGORIES = [
  'Lifestyle & Interests',
  'Shopping Preferences',
  'Gift Style',
  'Personal Details'
] as const;

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  // Lifestyle & Interests
  {
    id: 'lifestyle_activities',
    category: 'Lifestyle & Interests',
    question: 'What does this person typically do in their free time?',
    type: 'multi-select',
    options: [
      'Reading books/magazines',
      'Watching movies/TV shows',
      'Playing video games',
      'Outdoor activities (hiking, camping, etc.)',
      'Sports & fitness',
      'Cooking & baking',
      'Arts & crafts',
      'Music (listening or playing)',
      'Gardening',
      'Travel & exploration',
      'Gaming (board games, card games)',
      'Photography',
      'Writing or journaling',
      'Social gatherings with friends/family'
    ]
  },
  {
    id: 'interests_themes',
    category: 'Lifestyle & Interests',
    question: 'What themes or topics are they passionate about?',
    type: 'multi-select',
    options: [
      'Technology & gadgets',
      'Fashion & style',
      'Food & cooking',
      'Health & wellness',
      'Nature & environment',
      'Art & design',
      'Sports teams',
      'Science & learning',
      'Pop culture (movies, TV, music)',
      'History',
      'Animals & pets',
      'Home decor',
      'Cars & vehicles',
      'Travel destinations'
    ]
  },
  {
    id: 'personality_type',
    category: 'Lifestyle & Interests',
    question: 'How would you describe their personality?',
    type: 'multi-select',
    options: [
      'Adventurous & spontaneous',
      'Practical & organized',
      'Creative & artistic',
      'Tech-savvy',
      'Sentimental & nostalgic',
      'Minimalist',
      'Collector/enthusiast',
      'Social butterfly',
      'Homebody',
      'Eco-conscious',
      'Trendy & fashionable',
      'Traditional & classic'
    ]
  },

  // Shopping Preferences
  {
    id: 'shopping_style',
    category: 'Shopping Preferences',
    question: 'Where do they prefer to shop?',
    type: 'multi-select',
    options: [
      'Online (Amazon, etc.)',
      'Local boutiques',
      'Department stores',
      'Specialty stores',
      'Thrift/vintage shops',
      'Farmers markets',
      'Handmade/Etsy',
      'Big box retailers (Target, Walmart)',
      'Luxury brands',
      'Sustainable/eco brands'
    ]
  },
  {
    id: 'favorite_brands',
    category: 'Shopping Preferences',
    question: 'What are their favorite brands or stores? (Optional)',
    type: 'text',
    placeholder: 'e.g., Apple, Nike, Anthropologie, Patagonia...'
  },
  {
    id: 'quality_vs_quantity',
    category: 'Shopping Preferences',
    question: 'Do they prefer quality over quantity?',
    type: 'scale',
    options: ['Many affordable items', '2', '3', '4', 'Few high-quality items']
  },
  {
    id: 'style_preference',
    category: 'Shopping Preferences',
    question: 'What style resonates with them?',
    type: 'multi-select',
    options: [
      'Modern & minimalist',
      'Classic & timeless',
      'Bohemian & eclectic',
      'Rustic & farmhouse',
      'Industrial & urban',
      'Colorful & vibrant',
      'Neutral & understated',
      'Luxury & elegant',
      'Quirky & unique',
      'Vintage & retro'
    ]
  },

  // Gift Style
  {
    id: 'gift_type_preference',
    category: 'Gift Style',
    question: 'What types of gifts do they appreciate most?',
    type: 'multi-select',
    options: [
      'Practical & useful items',
      'Experiences (tickets, classes, trips)',
      'Personalized/custom items',
      'Handmade gifts',
      'Tech & electronics',
      'Books & learning materials',
      'Food & drink items',
      'Self-care & pampering',
      'Home decor',
      'Clothing & accessories',
      'Hobby-related items',
      'Gift cards (with flexibility)'
    ]
  },
  {
    id: 'meaningful_vs_fun',
    category: 'Gift Style',
    question: 'Do they prefer meaningful sentimental gifts or fun trendy items?',
    type: 'scale',
    options: ['Fun & trendy', '2', '3', '4', 'Meaningful & sentimental']
  },
  {
    id: 'experience_vs_physical',
    category: 'Gift Style',
    question: 'Would they prefer an experience or a physical gift?',
    type: 'scale',
    options: ['Physical gift', '2', '3', '4', 'Experience']
  },
  {
    id: 'gift_avoid',
    category: 'Gift Style',
    question: 'What should you avoid gifting them?',
    type: 'multi-select',
    options: [
      'Clothing (sizing issues)',
      'Perfume/cologne (scent preferences)',
      'Clutter/knick-knacks',
      'Generic gift cards',
      'Food items (dietary restrictions)',
      'Candles (scent sensitivity)',
      'Jokes/gag gifts',
      'Anything used/secondhand',
      'Religious items',
      'Political items',
      'Nothing - they appreciate everything!'
    ]
  },
  {
    id: 'surprise_preference',
    category: 'Gift Style',
    question: 'How do they feel about surprise gifts?',
    type: 'multiple-choice',
    options: [
      'Love surprises - be creative!',
      'Like surprises but within their interests',
      'Prefer to know what they\'re getting',
      'Would rather pick items themselves (gift cards)'
    ]
  },

  // Personal Details
  {
    id: 'favorite_colors',
    category: 'Personal Details',
    question: 'What are their favorite colors?',
    type: 'text',
    placeholder: 'e.g., blue, emerald green, rose gold...'
  },
  {
    id: 'current_interests',
    category: 'Personal Details',
    question: 'What are they currently interested in or collecting?',
    type: 'text',
    placeholder: 'e.g., vinyl records, succulents, yoga accessories...'
  },
  {
    id: 'dietary_restrictions',
    category: 'Personal Details',
    question: 'Any dietary restrictions or allergies?',
    type: 'text',
    placeholder: 'e.g., vegan, gluten-free, nut allergy...'
  },
  {
    id: 'items_owned',
    category: 'Personal Details',
    question: 'What do they already have plenty of? (To avoid duplicates)',
    type: 'text',
    placeholder: 'e.g., coffee mugs, candles, scarves...'
  }
];

export function getSurveyQuestionsByCategory(category: string): SurveyQuestion[] {
  return SURVEY_QUESTIONS.filter(q => q.category === category);
}

export function getSurveyCategories(): string[] {
  return Array.from(new Set(SURVEY_QUESTIONS.map(q => q.category)));
}
