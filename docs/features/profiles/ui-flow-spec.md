# GiftStash Profile Creation - UI Flow Specification

## Overview

The profile creation flow is designed to be fast, structured, and mobile-first. Every field is selectable—no free-form text except names and notes. The flow adapts based on the relationship category selected.

---

## Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTRY POINTS                                  │
├─────────────────────────────────────────────────────────────────┤
│  1. "Add Person" button in app                                  │
│  2. SMS: "Add [name]" or "New recipient"                        │
│  3. Quick-add from gift capture ("Who is this for?" → "New")    │
│  4. Bulk add flow for teachers                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 1: RELATIONSHIP CATEGORY                       │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 🏠       │ │ 👥       │ │ ❤️       │ │ 💼       │           │
│  │Immediate │ │Extended  │ │ Friends  │ │Professional│          │
│  │ Family   │ │ Family   │ │          │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ 📍       │ │ 📅       │ │ 📦       │                        │
│  │Community │ │ Events   │ │Gift Stash│                        │
│  │          │ │          │ │(On Hand) │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
│                                                                  │
│  Visual: Large tap targets, icon + label, 2x4 grid             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 2: RELATIONSHIP SUB-TYPE                       │
│                                                                  │
│  [Dynamic based on category selected]                           │
│                                                                  │
│  Example for "Immediate Family":                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Spouse/  │ │  Child   │ │  Parent  │ │ Sibling  │           │
│  │ Partner  │ │          │ │          │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  Visual: Scrollable horizontal chips or vertical list          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 3: BASIC INFO (Contextual)                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Name/Nickname                                [free-form] │   │
│  │ "What do you call them?"                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [IF child/grandchild/niece-nephew/party-guest]                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Age          [number picker or life stage selector]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Grade        [scrollable picker: Pre-K through College]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [IF any]                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Gender       ○ Male  ○ Female  ○ Non-binary  ○ Skip     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Visual: Clean form, only showing fields relevant to sub-type  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 4: INTERESTS (Multi-Select)                    │
│                                                                  │
│  "What are they into?"                                          │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 🏋️       │ │ 🍳       │ │ 🎬       │ │ 🎨       │           │
│  │ Sports & │ │ Food &   │ │Entertain-│ │Creative  │           │
│  │ Fitness  │ │ Drink    │ │  ment    │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 📱       │ │ 👔       │ │ 🏠       │ │ 💆       │           │
│  │ Tech     │ │ Style    │ │ Home     │ │ Wellness │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ ✈️       │ │ 👶       │ │ 🐕       │ │ 📚       │           │
│  │ Travel   │ │ Kids     │ │ Pets     │ │Collecting│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  [Tap category → expand to show subcategories]                  │
│                                                                  │
│  EXPANDED VIEW (e.g., "Food & Drink" tapped):                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ← Food & Drink                                           │   │
│  │                                                          │   │
│  │ Cooking & Kitchen                                        │   │
│  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │   │
│  │ │Home    │ │Baking  │ │Grilling│ │Pizza   │            │   │
│  │ │Cooking │ │        │ │& BBQ   │ │Making  │            │   │
│  │ └────────┘ └────────┘ └────────┘ └────────┘            │   │
│  │                                                          │   │
│  │ Beverages                                                │   │
│  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │   │
│  │ │ Wine   │ │ Craft  │ │Whiskey │ │Coffee  │            │   │
│  │ │        │ │ Beer   │ │        │ │        │            │   │
│  │ └────────┘ └────────┘ └────────┘ └────────┘            │   │
│  │                                                          │   │
│  │ ┌────────────────────────────────────────────────────┐ │   │
│  │ │ + Other (specify)                         [free-form]│ │   │
│  │ └────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Selected interests show as chips at top:                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Grilling ×] [Craft Beer ×] [Golf ×]           + Add   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Visual: Collapsible accordion or drill-down navigation        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 5: GIFT PREFERENCES (Optional)                 │
│                                                                  │
│  "How do they like to receive gifts?"                           │
│                                                                  │
│  Budget Comfort:                                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Under   │ │$25-75  │ │$75-150 │ │$150+   │ │No      │       │
│  │$25     │ │        │ │        │ │        │ │Limit   │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                                  │
│  Gift Style (multi-select):                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Practical│ │Experien│ │Sentimen│ │Funny   │ │Luxuriou│       │
│  │/Useful │ │-tial   │ │-tal    │ │        │ │s       │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                                  │
│  Avoid (multi-select):                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Alcohol │ │Food    │ │Clothing│ │Jewelry │ │Home    │       │
│  │        │ │        │ │        │ │        │ │Decor   │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                  │
│  │Fragrance│ │Candles │ │Plants  │ │Clutter │                  │
│  │        │ │        │ │        │ │(minimal)│                  │
│  └────────┘ └────────┘ └────────┘ └────────┘                  │
│                                                                  │
│  Visual: Chip toggle selection, items highlight when selected  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 6: OCCASIONS & REMINDERS                       │
│                                                                  │
│  "When do you typically give them gifts?"                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🎂 Birthday                                              │   │
│  │    Date: [Month picker] [Day picker]                     │   │
│  │    Remind me: [2 weeks before ▼]                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [IF spouse/partner]                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 💍 Anniversary                                           │   │
│  │    Date: [Month picker] [Day picker]                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Other Occasions (toggle on/off):                               │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Christmas│ │Hanukkah│ │Mother's│ │Father's│ │Valentine│      │
│  │   ✓    │ │        │ │Day  ✓  │ │Day     │ │'s      │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                                  │
│  Visual: Pre-populated based on relationship (Mother = Mother's │
│  Day pre-checked, etc.)                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 7: NOTES (Optional, Free-Form)                 │
│                                                                  │
│  "Anything else to remember?"                                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │ She mentioned wanting an air fryer last month...        │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Suggestions:                                                   │
│  • Allergies or dietary restrictions                           │
│  • Recent life changes (new house, new job)                    │
│  • Specific things they mentioned wanting                      │
│                                                                  │
│  Visual: Multi-line text area with helper text                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 8: REVIEW & SAVE                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  👤 Mom                                                  │   │
│  │  Parent • Adult • Female                                │   │
│  │                                                          │   │
│  │  Interests:                                              │   │
│  │  [Gardening] [Wine] [Reading] [Italian Food]            │   │
│  │                                                          │   │
│  │  Prefers: Sentimental, Experiential                     │   │
│  │  Avoid: Tech                                            │   │
│  │  Budget: $50-100                                        │   │
│  │                                                          │   │
│  │  🎂 Birthday: March 15 (remind 2 weeks before)          │   │
│  │  🎄 Christmas ✓  💐 Mother's Day ✓                      │   │
│  │                                                          │   │
│  │  Notes: Mentioned wanting to learn watercolor           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    [ Save Profile ]                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Visual: Card summary with edit buttons per section            │
└─────────────────────────────────────────────────────────────────┘

---

## TEACHER BULK ADD FLOW

Special flow for quickly adding multiple teachers/coaches.

```
┌─────────────────────────────────────────────────────────────────┐
│              TEACHER BULK ADD - ENTRY                            │
│                                                                  │
│  "Add teachers for which child?"                                │
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                  │
│  │   Riley    │ │   Parker   │ │   Devin    │                  │
│  │ 5th Grade  │ │ 3rd Grade  │ │ 1st Grade  │                  │
│  │ Bronxville │ │ Bronxville │ │ Bronxville │                  │
│  └────────────┘ └────────────┘ └────────────┘                  │
│                                                                  │
│  Visual: Child cards with school/grade info                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              TEACHER BULK ADD - TEMPLATE                         │
│                                                                  │
│  "What kind of school?"                                         │
│                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐                     │
│  │ 📚 Elementary    │ │ 🏫 Middle School │                     │
│  │ (Typical)        │ │                  │                     │
│  └──────────────────┘ └──────────────────┘                     │
│  ┌──────────────────┐ ┌──────────────────┐                     │
│  │ 🎒 Elementary    │ │ 🧒 Preschool     │                     │
│  │ (Full Staff)     │ │                  │                     │
│  └──────────────────┘ └──────────────────┘                     │
│  ┌──────────────────┐ ┌──────────────────┐                     │
│  │ ⚽ Sports Team   │ │ ✏️ Custom        │                     │
│  │                  │ │                  │                     │
│  └──────────────────┘ └──────────────────┘                     │
│                                                                  │
│  Visual: Template cards that pre-populate roles                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              TEACHER BULK ADD - BATCH ENTRY                      │
│                                                                  │
│  Riley's Teachers (Elementary Typical)                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📖 Homeroom Teacher                          [Required] │   │
│  │    Name: [Mrs. Patterson          ]                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 👩‍🏫 Assistant Teacher                       [Optional] │   │
│  │    Name: [Ms. Rodriguez           ]    [ ] Skip        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🎨 Art Teacher                               [Required] │   │
│  │    Name: [Mr. Chen                ]                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🎵 Music Teacher                             [Required] │   │
│  │    Name: [Mrs. Williams           ]                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🏃 PE Teacher                                [Required] │   │
│  │    Name: [Coach Martinez          ]                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📚 Librarian                                 [Required] │   │
│  │    Name: [Mrs. Thompson           ]                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [ + Add Another Role ]                                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ School Gift Policy:                                      │   │
│  │ ○ Unknown  ○ Gift Cards OK  ○ Anything Goes  ○ Other   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            [ Save 6 Teachers ]                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Visual: Vertical list with role pre-filled, just enter names  │
└─────────────────────────────────────────────────────────────────┘
```

---

## GIFT STASH (ON-HAND INVENTORY) FLOW

For adding items you already have available for gifting.

```
┌─────────────────────────────────────────────────────────────────┐
│              GIFT STASH - ADD ITEM                               │
│                                                                  │
│  "What kind of gift?"                                           │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 🎈 Kids  │ │ 🏠 Host/ │ │ 🍷 Wine  │ │ 🎁 Generic│          │
│  │ Party    │ │ Hostess  │ │          │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ 👩‍🏫 Teacher│ │ 🔄 Regift│ │ 🎄 Holiday│                       │
│  │ Bulk     │ │          │ │ Generic  │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              GIFT STASH - KIDS PARTY ITEM                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Item: [LEGO City Police Set              ]              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Appropriate for:                                               │
│  Age Range: [5] to [8] years                                   │
│  Gender: ○ Boy  ○ Girl  ● Either                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Quantity: [ 2 ]  (how many do you have?)                │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Cost per item: [$24.99]                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Location: [Hall closet ▼]                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Source:                                                        │
│  ○ Purchased  ○ Received as gift  ○ Regift                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   [ Add to Stash ]                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## SMS PARSING UPDATES

The AI needs to parse natural language into the new structured schema.

### Example Parses:

**Input:** "Add my brother-in-law Tom, he's into golf and whiskey"
```json
{
  "action": "create_recipient",
  "parsed": {
    "display_name": "Tom",
    "category": "extended_family",
    "sub_type": "in_law_sibling",
    "interests": ["golf", "whiskey"]
  },
  "confidence": 0.95,
  "clarification_needed": null
}
```

**Input:** "Add Riley's art teacher Mrs. Chen"
```json
{
  "action": "create_recipient",
  "parsed": {
    "display_name": "Mrs. Chen",
    "category": "community",
    "sub_type": "teacher",
    "teacher_role": "specialist_art",
    "teacher_subject": "art",
    "associated_child": "Riley"
  },
  "confidence": 0.98,
  "clarification_needed": null
}
```

**Input:** "Add backup present for 7 year old boy birthday party"
```json
{
  "action": "create_stash_item",
  "parsed": {
    "category": "gift_stash",
    "sub_type": "kids_party_backup",
    "age_range": [6, 8],
    "gender": "male"
  },
  "confidence": 0.85,
  "clarification_needed": "What item do you want to add to your stash?"
}
```

**Input:** "New recipient"
```json
{
  "action": "start_wizard",
  "clarification_needed": "Who would you like to add? You can say something like 'my sister' or 'Riley's teacher Mrs. Smith'"
}
```

### Fuzzy Matching Rules:

| Input Pattern | Mapped To |
|---------------|-----------|
| "brother in law", "BIL", "sister's husband" | extended_family → in_law_sibling |
| "my kid's friend", "Riley's friend" | friends → kids_friend |
| "coach", "baseball coach", "her swim coach" | community → coach |
| "backup gift", "party present", "on-hand gift" | gift_stash → kids_party_backup |
| "hostess gift", "bring to dinner", "housewarming" | gift_stash → hostess |

---

## MOBILE-FIRST DESIGN PRINCIPLES

1. **Large tap targets** — Minimum 44x44px, prefer 48x48px
2. **Thumb-friendly zones** — Primary actions in bottom half of screen
3. **Progressive disclosure** — Don't show all options at once
4. **Sensible defaults** — Pre-select common options based on context
5. **Skip-friendly** — Every optional step has clear "Skip" or "Later" option
6. **Visual hierarchy** — Icons + text, not text-only lists
7. **Immediate feedback** — Selections highlight instantly
8. **Minimal typing** — Structured selection everywhere possible

---

## STATE MANAGEMENT

```typescript
interface ProfileWizardState {
  step: number;
  category: RelationshipCategory | null;
  subType: string | null;
  displayName: string;
  demographics: {
    lifeStage: LifeStage | null;
    exactAge: number | null;
    grade: Grade | null;
    gender: Gender | null;
  };
  interests: string[]; // array of interest IDs
  preferences: {
    budgetTier: BudgetTier | null;
    giftStyles: GiftStyle[];
    avoidCategories: AvoidCategory[];
  };
  occasions: Occasion[];
  notes: string;
  
  // Teacher-specific
  teacherInfo?: {
    role: TeacherRole;
    subject: TeacherSubject;
    associatedChild: string;
    schoolId: string;
    giftPolicy: GiftPolicy;
  };
  
  // Stash-specific
  stashInfo?: {
    quantity: number;
    costPerItem: number;
    location: string;
    source: 'purchased' | 'received' | 'regift';
    ageRange?: [number, number];
    genderAppropriate?: Gender;
  };
}
```

---

## DATABASE SCHEMA CHANGES

### New Tables

```sql
-- Reference table for interests
CREATE TABLE interests (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  name TEXT NOT NULL,
  keywords TEXT[], -- for AI matching
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for recipient interests
CREATE TABLE recipient_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  interest_id TEXT REFERENCES interests(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipient_id, interest_id)
);

-- Recipient occasions
CREATE TABLE recipient_occasions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  occasion_type TEXT NOT NULL,
  date DATE,
  remind_days_before INT DEFAULT 14,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipient sizing info
CREATE TABLE recipient_sizing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  size_type TEXT NOT NULL,
  size_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipient_id, size_type)
);

-- Teacher-specific info (extends recipients)
CREATE TABLE teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  subject TEXT,
  associated_child_id UUID REFERENCES recipients(id),
  school_name TEXT,
  gift_policy TEXT DEFAULT 'unknown',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift stash inventory
CREATE TABLE gift_stash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id),
  item_name TEXT NOT NULL,
  stash_type TEXT NOT NULL, -- kids_party, hostess, wine, generic, regift, etc.
  quantity INT DEFAULT 1,
  cost_per_item DECIMAL(10,2),
  location TEXT,
  source TEXT DEFAULT 'purchased', -- purchased, received, regift
  age_range_min INT,
  age_range_max INT,
  gender_appropriate TEXT, -- male, female, either
  notes TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track when stash items are used
CREATE TABLE gift_stash_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stash_item_id UUID REFERENCES gift_stash(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES recipients(id),
  occasion TEXT,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);
```

### Updated Recipients Table

```sql
ALTER TABLE recipients ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE recipients ADD COLUMN IF NOT EXISTS sub_type TEXT;
ALTER TABLE recipients ADD COLUMN IF NOT EXISTS life_stage TEXT;
ALTER TABLE recipients ADD COLUMN IF NOT EXISTS exact_age INT;
ALTER TABLE recipients ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE recipients ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE recipients ADD COLUMN IF NOT EXISTS budget_tier TEXT;
ALTER TABLE recipients ADD COLUMN IF NOT EXISTS gift_styles TEXT[];
ALTER TABLE recipients ADD COLUMN IF NOT EXISTS avoid_categories TEXT[];
```

---

## NEXT STEPS FOR IMPLEMENTATION

1. **Database migrations** — Add new tables/columns for structured data
2. **Seed data import** — Load interests.json and enums.json into reference tables
3. **API endpoints** — CRUD for new profile structure
4. **UI components** — Build reusable selector components
5. **SMS parser update** — Train on new structured schema
6. **Migration script** — Convert existing free-form profiles to structured
7. **Chrome extension update** — Better scraping with structured metadata
8. **Gift stash views** — Dashboard for browsing on-hand inventory
