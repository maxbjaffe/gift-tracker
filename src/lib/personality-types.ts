// Personality Types for Gift Matcher

export interface PersonalityType {
  id: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  traits: string[];
  giftCategories: string[];
  giftSuggestions: string[];
}

export const PERSONALITY_TYPES: PersonalityType[] = [
  {
    id: 'practical-explorer',
    name: 'Practical Explorer',
    emoji: '🔧',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Loves functional items that make life easier. Values quality, efficiency, and innovation. Always seeking the next useful gadget or tool.',
    traits: ['Efficient', 'Tech-savvy', 'Problem-solver', 'Quality-focused'],
    giftCategories: ['Tech Gadgets', 'Tools & Equipment', 'Smart Home', 'Productivity Items'],
    giftSuggestions: [
      'Multi-tool',
      'Wireless charger',
      'Smart speaker',
      'Quality headphones',
      'Portable power bank',
      'Desk organizer'
    ]
  },
  {
    id: 'creative-dreamer',
    name: 'Creative Dreamer',
    emoji: '🎨',
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-pink-500',
    description: 'Imaginative soul who sees beauty everywhere. Appreciates unique, handmade, and artistic items. Loves expressing creativity through various mediums.',
    traits: ['Artistic', 'Imaginative', 'Unique', 'Expressive'],
    giftCategories: ['Art Supplies', 'Craft Kits', 'Unique Decor', 'Creative Tools'],
    giftSuggestions: [
      'Premium sketchbook',
      'Watercolor set',
      'DIY craft kit',
      'Art prints',
      'Unique sculpture',
      'Creative journal'
    ]
  },
  {
    id: 'cozy-homebody',
    name: 'Cozy Homebody',
    emoji: '🏠',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
    description: 'Finds joy in comfort and relaxation at home. Values warmth, softness, and peaceful environments. Creates cozy sanctuaries wherever they are.',
    traits: ['Comfortable', 'Peaceful', 'Warm', 'Nurturing'],
    giftCategories: ['Home Comfort', 'Cozy Textiles', 'Relaxation', 'Home Decor'],
    giftSuggestions: [
      'Soft blanket',
      'Scented candles',
      'Plush slippers',
      'Tea set',
      'Reading pillow',
      'Cozy throw'
    ]
  },
  {
    id: 'adventure-seeker',
    name: 'Adventure Seeker',
    emoji: '🏔️',
    color: '#10B981',
    gradient: 'from-green-500 to-teal-500',
    description: 'Thrives on excitement and new experiences. Always ready for the next adventure, whether near or far. Values freedom, exploration, and the great outdoors.',
    traits: ['Adventurous', 'Bold', 'Active', 'Free-spirited'],
    giftCategories: ['Outdoor Gear', 'Travel Accessories', 'Experience Gifts', 'Adventure Equipment'],
    giftSuggestions: [
      'Hiking backpack',
      'Travel journal',
      'Camping gear',
      'Action camera',
      'Map art',
      'Adventure book'
    ]
  },
  {
    id: 'foodie-enthusiast',
    name: 'Foodie Enthusiast',
    emoji: '🍕',
    color: '#EF4444',
    gradient: 'from-red-500 to-rose-500',
    description: 'Passionate about culinary experiences. Loves trying new recipes, exploring flavors, and sharing meals. The kitchen is their happy place.',
    traits: ['Culinary', 'Exploratory', 'Social', 'Tasteful'],
    giftCategories: ['Cooking Tools', 'Gourmet Food', 'Kitchen Gadgets', 'Recipe Books'],
    giftSuggestions: [
      'Quality knife set',
      'Cookbook collection',
      'Spice set',
      'Kitchen appliance',
      'Gourmet basket',
      'Cooking class'
    ]
  },
  {
    id: 'fashion-forward',
    name: 'Fashion Forward',
    emoji: '👗',
    color: '#EC4899',
    gradient: 'from-pink-500 to-purple-500',
    description: 'Expresses personality through style. Keeps up with trends while maintaining personal flair. Fashion is art and identity combined.',
    traits: ['Stylish', 'Trendy', 'Confident', 'Expressive'],
    giftCategories: ['Fashion Accessories', 'Clothing', 'Style Items', 'Beauty Products'],
    giftSuggestions: [
      'Designer accessory',
      'Fashion jewelry',
      'Stylish bag',
      'Quality sunglasses',
      'Fashion book',
      'Beauty set'
    ]
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    emoji: '📚',
    color: '#6366F1',
    gradient: 'from-indigo-500 to-purple-500',
    description: 'Endlessly curious about the world. Loves learning new things through books, courses, and experiences. Knowledge is the best gift.',
    traits: ['Curious', 'Intellectual', 'Thoughtful', 'Analytical'],
    giftCategories: ['Books', 'Educational Items', 'Puzzles', 'Learning Tools'],
    giftSuggestions: [
      'Book collection',
      'Online course',
      'Documentary series',
      'Quality notebook',
      'Brain teasers',
      'Museum membership'
    ]
  },
  {
    id: 'wellness-warrior',
    name: 'Wellness Warrior',
    emoji: '🧘',
    color: '#14B8A6',
    gradient: 'from-teal-500 to-green-500',
    description: 'Prioritizes health, balance, and self-care. Values mindfulness, fitness, and holistic living. Believes wellness is wealth.',
    traits: ['Health-conscious', 'Mindful', 'Balanced', 'Active'],
    giftCategories: ['Fitness Items', 'Wellness Products', 'Self-Care', 'Health Tools'],
    giftSuggestions: [
      'Yoga mat',
      'Fitness tracker',
      'Meditation app',
      'Water bottle',
      'Wellness journal',
      'Bath products'
    ]
  },
  {
    id: 'music-maven',
    name: 'Music Maven',
    emoji: '🎵',
    color: '#F43F5E',
    gradient: 'from-rose-500 to-pink-500',
    description: 'Lives life with a soundtrack. Music is essential to every moment. Appreciates all genres and loves discovering new artists.',
    traits: ['Musical', 'Passionate', 'Rhythmic', 'Expressive'],
    giftCategories: ['Audio Equipment', 'Concert Tickets', 'Music Accessories', 'Instruments'],
    giftSuggestions: [
      'Quality headphones',
      'Vinyl records',
      'Concert tickets',
      'Music lessons',
      'Instrument accessory',
      'Music biography'
    ]
  },
  {
    id: 'game-master',
    name: 'Game Master',
    emoji: '🎮',
    color: '#8B5CF6',
    gradient: 'from-purple-600 to-indigo-600',
    description: 'Loves gaming in all forms - video games, board games, puzzles. Values strategy, fun, and friendly competition. Play is serious business!',
    traits: ['Strategic', 'Competitive', 'Fun-loving', 'Social'],
    giftCategories: ['Video Games', 'Board Games', 'Gaming Accessories', 'Puzzle Collections'],
    giftSuggestions: [
      'Latest video game',
      'Board game classic',
      'Gaming headset',
      'Controller accessories',
      'Puzzle collection',
      'Gaming chair'
    ]
  }
];

export function getPersonalityType(id: string): PersonalityType | undefined {
  return PERSONALITY_TYPES.find(type => type.id === id);
}

export function getPersonalityEmoji(id: string): string {
  return getPersonalityType(id)?.emoji || '🎁';
}

export function getPersonalityColor(id: string): string {
  return getPersonalityType(id)?.color || '#9333EA';
}

export function getPersonalityGradient(id: string): string {
  return getPersonalityType(id)?.gradient || 'from-purple-600 to-pink-600';
}
