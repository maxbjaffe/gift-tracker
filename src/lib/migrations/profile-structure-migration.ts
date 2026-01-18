/**
 * Profile Structure Migration
 *
 * Maps existing free-form profile data to the new structured format.
 * Run this after seeding the interests and enums tables.
 */

// =============================================================================
// RELATIONSHIP MAPPING
// =============================================================================

/**
 * Maps free-form relationship strings to structured category + sub_type
 */
export const RELATIONSHIP_TO_STRUCTURED: Record<string, { category: string; sub_type: string }> = {
  // Immediate Family
  mother: { category: 'immediate_family', sub_type: 'parent' },
  mom: { category: 'immediate_family', sub_type: 'parent' },
  mama: { category: 'immediate_family', sub_type: 'parent' },
  mommy: { category: 'immediate_family', sub_type: 'parent' },
  father: { category: 'immediate_family', sub_type: 'parent' },
  dad: { category: 'immediate_family', sub_type: 'parent' },
  daddy: { category: 'immediate_family', sub_type: 'parent' },
  papa: { category: 'immediate_family', sub_type: 'parent' },
  parent: { category: 'immediate_family', sub_type: 'parent' },

  wife: { category: 'immediate_family', sub_type: 'spouse' },
  husband: { category: 'immediate_family', sub_type: 'spouse' },
  spouse: { category: 'immediate_family', sub_type: 'spouse' },
  partner: { category: 'immediate_family', sub_type: 'spouse' },

  daughter: { category: 'immediate_family', sub_type: 'child' },
  son: { category: 'immediate_family', sub_type: 'child' },
  child: { category: 'immediate_family', sub_type: 'child' },
  kid: { category: 'immediate_family', sub_type: 'child' },

  sister: { category: 'immediate_family', sub_type: 'sibling' },
  brother: { category: 'immediate_family', sub_type: 'sibling' },
  sibling: { category: 'immediate_family', sub_type: 'sibling' },

  stepdaughter: { category: 'immediate_family', sub_type: 'step_child' },
  stepson: { category: 'immediate_family', sub_type: 'step_child' },
  stepchild: { category: 'immediate_family', sub_type: 'step_child' },
  stepmother: { category: 'immediate_family', sub_type: 'step_parent' },
  stepfather: { category: 'immediate_family', sub_type: 'step_parent' },
  stepmom: { category: 'immediate_family', sub_type: 'step_parent' },
  stepdad: { category: 'immediate_family', sub_type: 'step_parent' },

  // Extended Family
  grandmother: { category: 'extended_family', sub_type: 'grandparent' },
  grandma: { category: 'extended_family', sub_type: 'grandparent' },
  granny: { category: 'extended_family', sub_type: 'grandparent' },
  nana: { category: 'extended_family', sub_type: 'grandparent' },
  grandfather: { category: 'extended_family', sub_type: 'grandparent' },
  grandpa: { category: 'extended_family', sub_type: 'grandparent' },
  gramps: { category: 'extended_family', sub_type: 'grandparent' },
  grandparent: { category: 'extended_family', sub_type: 'grandparent' },

  granddaughter: { category: 'extended_family', sub_type: 'grandchild' },
  grandson: { category: 'extended_family', sub_type: 'grandchild' },
  grandchild: { category: 'extended_family', sub_type: 'grandchild' },

  'mother-in-law': { category: 'extended_family', sub_type: 'in_law_parent' },
  'father-in-law': { category: 'extended_family', sub_type: 'in_law_parent' },
  'mother in law': { category: 'extended_family', sub_type: 'in_law_parent' },
  'father in law': { category: 'extended_family', sub_type: 'in_law_parent' },
  mil: { category: 'extended_family', sub_type: 'in_law_parent' },
  fil: { category: 'extended_family', sub_type: 'in_law_parent' },

  'sister-in-law': { category: 'extended_family', sub_type: 'in_law_sibling' },
  'brother-in-law': { category: 'extended_family', sub_type: 'in_law_sibling' },
  'sister in law': { category: 'extended_family', sub_type: 'in_law_sibling' },
  'brother in law': { category: 'extended_family', sub_type: 'in_law_sibling' },
  sil: { category: 'extended_family', sub_type: 'in_law_sibling' },
  bil: { category: 'extended_family', sub_type: 'in_law_sibling' },

  'daughter-in-law': { category: 'extended_family', sub_type: 'in_law_child' },
  'son-in-law': { category: 'extended_family', sub_type: 'in_law_child' },

  aunt: { category: 'extended_family', sub_type: 'aunt_uncle' },
  auntie: { category: 'extended_family', sub_type: 'aunt_uncle' },
  uncle: { category: 'extended_family', sub_type: 'aunt_uncle' },

  cousin: { category: 'extended_family', sub_type: 'cousin' },

  niece: { category: 'extended_family', sub_type: 'niece_nephew' },
  nephew: { category: 'extended_family', sub_type: 'niece_nephew' },

  // Friends
  friend: { category: 'friends', sub_type: 'close_friend' },
  bestfriend: { category: 'friends', sub_type: 'close_friend' },
  'best friend': { category: 'friends', sub_type: 'close_friend' },
  bff: { category: 'friends', sub_type: 'close_friend' },
  buddy: { category: 'friends', sub_type: 'close_friend' },
  pal: { category: 'friends', sub_type: 'close_friend' },

  coworker: { category: 'friends', sub_type: 'work_friend' },
  'co-worker': { category: 'friends', sub_type: 'work_friend' },
  colleague: { category: 'friends', sub_type: 'work_friend' },
  'work friend': { category: 'friends', sub_type: 'work_friend' },

  neighbor: { category: 'friends', sub_type: 'neighbor_friend' },
  neighbour: { category: 'friends', sub_type: 'neighbor_friend' },

  // Professional
  boss: { category: 'professional', sub_type: 'boss' },
  manager: { category: 'professional', sub_type: 'boss' },
  supervisor: { category: 'professional', sub_type: 'boss' },

  client: { category: 'professional', sub_type: 'client' },
  customer: { category: 'professional', sub_type: 'client' },

  assistant: { category: 'professional', sub_type: 'assistant' },

  mentor: { category: 'professional', sub_type: 'mentor' },
  mentee: { category: 'professional', sub_type: 'mentee' },

  // Community
  teacher: { category: 'community', sub_type: 'teacher' },
  coach: { category: 'community', sub_type: 'coach' },
  tutor: { category: 'community', sub_type: 'tutor' },
  babysitter: { category: 'community', sub_type: 'babysitter' },
  nanny: { category: 'community', sub_type: 'babysitter' },
  hairdresser: { category: 'community', sub_type: 'hairdresser' },
  stylist: { category: 'community', sub_type: 'hairdresser' },
  doctor: { category: 'community', sub_type: 'therapist' },
  therapist: { category: 'community', sub_type: 'therapist' },
  trainer: { category: 'community', sub_type: 'personal_trainer' },
  'personal trainer': { category: 'community', sub_type: 'personal_trainer' },
};

// =============================================================================
// INTEREST MAPPING
// =============================================================================

/**
 * Maps common free-form interest strings to structured interest IDs
 * These are the most common variations we might see in existing data
 */
export const INTEREST_TO_STRUCTURED: Record<string, string> = {
  // Sports
  football: 'football',
  soccer: 'soccer',
  basketball: 'basketball',
  baseball: 'baseball',
  hockey: 'hockey',
  golf: 'golf',
  golfing: 'golf',
  tennis: 'tennis',
  pickleball: 'pickleball',
  running: 'running',
  jogging: 'running',
  marathons: 'running',
  cycling: 'cycling',
  biking: 'cycling',
  swimming: 'swimming',
  yoga: 'yoga',
  pilates: 'pilates',
  crossfit: 'crossfit',
  gym: 'weightlifting',
  weights: 'weightlifting',
  weightlifting: 'weightlifting',
  hiking: 'hiking',
  camping: 'camping',
  fishing: 'fishing',
  hunting: 'hunting',
  skiing: 'skiing',
  snowboarding: 'snowboarding',
  surfing: 'surfing',

  // Food & Drink
  cooking: 'home_cooking',
  baking: 'baking',
  grilling: 'grilling',
  bbq: 'grilling',
  barbecue: 'grilling',
  wine: 'wine',
  beer: 'craft_beer',
  'craft beer': 'craft_beer',
  whiskey: 'whiskey',
  bourbon: 'whiskey',
  scotch: 'whiskey',
  cocktails: 'cocktails',
  mixology: 'cocktails',
  coffee: 'coffee',
  espresso: 'coffee',
  tea: 'tea',
  foodie: 'foodie',
  restaurants: 'foodie',
  'dining out': 'foodie',
  cheese: 'cheese',
  chocolate: 'chocolate',

  // Entertainment
  movies: 'movies',
  film: 'movies',
  tv: 'tv_streaming',
  television: 'tv_streaming',
  streaming: 'tv_streaming',
  netflix: 'tv_streaming',
  anime: 'anime',
  'video games': 'video_games',
  gaming: 'video_games',
  videogames: 'video_games',
  'board games': 'board_games',
  boardgames: 'board_games',
  puzzles: 'puzzles',
  reading: 'fiction',
  books: 'fiction',
  fiction: 'fiction',
  'non-fiction': 'non_fiction',
  nonfiction: 'non_fiction',
  mystery: 'mystery',
  'true crime': 'true_crime_pods',
  podcasts: 'podcasts_general',
  music: 'music_general',
  concerts: 'concerts',
  theater: 'theater',
  theatre: 'theater',
  broadway: 'theater',

  // Creative
  photography: 'photography',
  painting: 'painting',
  drawing: 'drawing',
  art: 'painting',
  crafts: 'scrapbooking',
  knitting: 'knitting',
  crocheting: 'crocheting',
  sewing: 'sewing',
  woodworking: 'woodworking',
  diy: 'home_improvement',
  gardening: 'vegetable_garden',
  plants: 'houseplants',
  houseplants: 'houseplants',

  // Tech
  tech: 'gadget_lover',
  technology: 'gadget_lover',
  gadgets: 'gadget_lover',
  computers: 'computers',
  programming: 'programming',
  coding: 'programming',
  'smart home': 'smart_home_general',

  // Style
  fashion: 'fashion_general',
  clothes: 'fashion_general',
  clothing: 'fashion_general',
  jewelry: 'jewelry',
  watches: 'watches',
  sneakers: 'sneakers',
  shoes: 'sneakers',
  skincare: 'skincare',
  makeup: 'makeup',
  beauty: 'makeup',

  // Home
  'home decor': 'interior_design',
  decorating: 'interior_design',
  'interior design': 'interior_design',
  candles: 'candles_home',
  organization: 'organization',
  cookware: 'cookware',

  // Wellness
  spa: 'spa_self_care',
  massage: 'massage',
  meditation: 'meditation',
  mindfulness: 'meditation',
  'self care': 'spa_self_care',
  'self-care': 'spa_self_care',

  // Travel
  travel: 'adventure_travel',
  traveling: 'adventure_travel',
  travelling: 'adventure_travel',
  vacation: 'beach_travel',
  beach: 'beach_travel',
  'road trips': 'road_trips',

  // Kids
  lego: 'lego',
  legos: 'lego',
  dolls: 'dolls',
  disney: 'disney',
  marvel: 'marvel_kids',
  'star wars': 'star_wars_kids',
  starwars: 'star_wars_kids',
  pokemon: 'pokemon',
  minecraft: 'minecraft',
  roblox: 'roblox',

  // Pets
  dogs: 'dog_lover',
  dog: 'dog_lover',
  cats: 'cat_lover',
  cat: 'cat_lover',
  pets: 'dog_lover',
};

// =============================================================================
// MIGRATION FUNCTIONS
// =============================================================================

export interface ExistingRecipient {
  id: string;
  name: string;
  relationship?: string | null;
  interests?: string[] | null;
  hobbies?: string[] | null;
  gender?: string | null;
  age_range?: string | null;
  birthday?: string | null;
}

export interface StructuredRecipient {
  id: string;
  category: string | null;
  sub_type: string | null;
  interest_ids: string[];
  gender: string | null;
  life_stage: string | null;
  exact_age: number | null;
  migration_notes: string[];
}

/**
 * Converts a free-form relationship string to structured category/sub_type
 */
export function mapRelationship(relationship: string | null | undefined): {
  category: string | null;
  sub_type: string | null;
  confidence: 'high' | 'medium' | 'low' | 'unmapped';
} {
  if (!relationship) {
    return { category: null, sub_type: null, confidence: 'unmapped' };
  }

  const normalized = relationship.toLowerCase().trim();

  // Direct match
  if (RELATIONSHIP_TO_STRUCTURED[normalized]) {
    const mapped = RELATIONSHIP_TO_STRUCTURED[normalized];
    return { ...mapped, confidence: 'high' };
  }

  // Try partial matches
  for (const [key, value] of Object.entries(RELATIONSHIP_TO_STRUCTURED)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { ...value, confidence: 'medium' };
    }
  }

  return { category: null, sub_type: null, confidence: 'unmapped' };
}

/**
 * Converts a free-form interest string to a structured interest ID
 */
export function mapInterest(interest: string): {
  id: string | null;
  confidence: 'high' | 'medium' | 'low';
} {
  const normalized = interest.toLowerCase().trim();

  // Direct match
  if (INTEREST_TO_STRUCTURED[normalized]) {
    return { id: INTEREST_TO_STRUCTURED[normalized], confidence: 'high' };
  }

  // Try partial matches
  for (const [key, value] of Object.entries(INTEREST_TO_STRUCTURED)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { id: value, confidence: 'medium' };
    }
  }

  return { id: null, confidence: 'low' };
}

/**
 * Maps age_range string to life_stage ID
 */
export function mapAgeRange(ageRange: string | null | undefined): {
  life_stage: string | null;
  exact_age: number | null;
} {
  if (!ageRange) {
    return { life_stage: null, exact_age: null };
  }

  const normalized = ageRange.toLowerCase().trim();

  // Try to extract a number
  const numberMatch = normalized.match(/(\d+)/);
  const age = numberMatch ? parseInt(numberMatch[1], 10) : null;

  // Map to life stages based on age or range strings
  if (normalized.includes('baby') || (age !== null && age <= 1)) {
    return { life_stage: 'baby', exact_age: age };
  }
  if (normalized.includes('toddler') || (age !== null && age >= 2 && age <= 4)) {
    return { life_stage: 'toddler', exact_age: age };
  }
  if ((age !== null && age >= 5 && age <= 7)) {
    return { life_stage: 'young_kid', exact_age: age };
  }
  if (normalized.includes('tween') || (age !== null && age >= 8 && age <= 12)) {
    return { life_stage: 'tween', exact_age: age };
  }
  if (normalized.includes('teen') || (age !== null && age >= 13 && age <= 17)) {
    return { life_stage: 'teen', exact_age: age };
  }
  if (normalized.includes('young adult') || (age !== null && age >= 18 && age <= 25)) {
    return { life_stage: 'young_adult', exact_age: age };
  }
  if (normalized.includes('senior') || (age !== null && age >= 65)) {
    return { life_stage: 'senior', exact_age: age };
  }
  if (age !== null && age >= 26 && age < 65) {
    return { life_stage: 'adult', exact_age: age };
  }

  // Common range patterns
  if (normalized.includes('20') || normalized.includes('30')) {
    return { life_stage: 'adult', exact_age: null };
  }
  if (normalized.includes('40') || normalized.includes('50') || normalized.includes('60')) {
    return { life_stage: 'adult', exact_age: null };
  }

  return { life_stage: null, exact_age: age };
}

/**
 * Maps gender string to structured gender ID
 */
export function mapGender(gender: string | null | undefined): string | null {
  if (!gender) return null;

  const normalized = gender.toLowerCase().trim();

  if (['male', 'm', 'man', 'boy'].includes(normalized)) return 'male';
  if (['female', 'f', 'woman', 'girl'].includes(normalized)) return 'female';
  if (['non-binary', 'nonbinary', 'nb', 'enby'].includes(normalized)) return 'non_binary';

  return 'unspecified';
}

/**
 * Migrates a single recipient to the new structured format
 */
export function migrateRecipient(recipient: ExistingRecipient): StructuredRecipient {
  const notes: string[] = [];

  // Map relationship
  const relationshipResult = mapRelationship(recipient.relationship);
  if (relationshipResult.confidence === 'unmapped' && recipient.relationship) {
    notes.push(`Unmapped relationship: "${recipient.relationship}"`);
  } else if (relationshipResult.confidence === 'medium') {
    notes.push(`Relationship mapped with medium confidence: "${recipient.relationship}" → ${relationshipResult.sub_type}`);
  }

  // Map interests
  const allInterests = [...(recipient.interests || []), ...(recipient.hobbies || [])];
  const mappedInterests: string[] = [];
  const unmappedInterests: string[] = [];

  for (const interest of allInterests) {
    const result = mapInterest(interest);
    if (result.id) {
      if (!mappedInterests.includes(result.id)) {
        mappedInterests.push(result.id);
      }
      if (result.confidence === 'medium') {
        notes.push(`Interest mapped with medium confidence: "${interest}" → ${result.id}`);
      }
    } else {
      unmappedInterests.push(interest);
    }
  }

  if (unmappedInterests.length > 0) {
    notes.push(`Unmapped interests: ${unmappedInterests.join(', ')}`);
  }

  // Map age/life stage
  const ageResult = mapAgeRange(recipient.age_range);

  // Map gender
  const gender = mapGender(recipient.gender);

  return {
    id: recipient.id,
    category: relationshipResult.category,
    sub_type: relationshipResult.sub_type,
    interest_ids: mappedInterests,
    gender,
    life_stage: ageResult.life_stage,
    exact_age: ageResult.exact_age,
    migration_notes: notes,
  };
}

/**
 * Generates SQL to update a recipient with structured data
 */
export function generateUpdateSQL(migrated: StructuredRecipient): string {
  const updates: string[] = [];

  if (migrated.category) {
    updates.push(`category = '${migrated.category}'`);
  }
  if (migrated.sub_type) {
    updates.push(`sub_type = '${migrated.sub_type}'`);
  }
  if (migrated.life_stage) {
    updates.push(`life_stage = '${migrated.life_stage}'`);
  }
  if (migrated.exact_age !== null) {
    updates.push(`exact_age = ${migrated.exact_age}`);
  }
  if (migrated.gender) {
    updates.push(`gender = '${migrated.gender}'`);
  }

  if (updates.length === 0) {
    return `-- No updates for recipient ${migrated.id}`;
  }

  return `UPDATE recipients SET ${updates.join(', ')} WHERE id = '${migrated.id}';`;
}

/**
 * Generates SQL to insert interest associations
 */
export function generateInterestInsertSQL(recipientId: string, interestIds: string[]): string[] {
  return interestIds.map(interestId =>
    `INSERT INTO recipient_interests (recipient_id, interest_id) VALUES ('${recipientId}', '${interestId}') ON CONFLICT DO NOTHING;`
  );
}
