# GiftStash Profile System - Complete Specification

## Overview

This package contains everything needed to implement structured profiles for GiftStash, replacing free-form text fields with curated, selectable options.

---

## Files Included

| File | Description |
|------|-------------|
| `seed-data/interests.json` | Complete interest taxonomy with 13 categories, 70+ subcategories, 350+ specific interests, each with AI-matching keywords |
| `seed-data/enums.json` | All enum/reference data: relationship categories, life stages, grades, genders, budget tiers, gift styles, avoid categories, occasions, reminder lead times, sizing options |
| `seed-data/teacher-profiles.json` | Teacher-specific data: roles, subjects, gift policies, bulk-add templates, common gift suggestions |
| `ui-flow-spec.md` | Complete UI flow specification with wireframes for profile creation wizard, teacher bulk add, and gift stash inventory |

---

## Key Design Decisions

### 1. Structured Selection First
Every profile field uses selectable options rather than free-form text. The only free-form fields are:
- Display name (nicknames are unpredictable)
- Notes (catch-all for truly unique information)
- "Other" escape hatch within interest categories

### 2. Contextual Field Display
Fields shown depend on relationship category:
- Children/party guests → show age, grade
- Spouse → show anniversary
- Teachers → show role, subject, associated child, gift policy
- Gift stash → show quantity, location, age appropriateness

### 3. Teacher First-Class Support
Teachers are a major gift-giving category for families. Features:
- Bulk add templates (elementary, middle school, preschool, sports team)
- Role-specific pre-population
- Gift policy tracking
- Association with specific children

### 4. Gift Stash Inventory
New capability to track gifts already purchased and on hand:
- Kids party backups with age/gender targeting
- Hostess/host gifts
- Wine stash
- Regift inventory
- Location tracking ("hall closet, top shelf")
- Usage logging

### 5. AI-Friendly Taxonomy
Every interest includes:
- Unique ID for database storage
- Display name for UI
- Keywords array for SMS parsing and AI matching

Example: `{ "id": "grilling", "name": "Grilling & BBQ", "keywords": ["smoker", "barbecue", "outdoor cooking", "charcoal"] }`

---

## Interest Taxonomy Summary

| Category | Subcategories | Total Interests |
|----------|---------------|-----------------|
| Sports & Fitness | 5 (Team, Individual, Fitness, Outdoor, Fan) | 45 |
| Food & Drink | 4 (Cooking, Beverages, Enthusiast, Cuisines) | 38 |
| Entertainment | 6 (Movies/TV, Music, Gaming, Reading, Performing Arts, Podcasts) | 52 |
| Creative & Hobbies | 6 (Visual Arts, Music Playing, Crafts, DIY, Writing, Gardening) | 42 |
| Tech & Gadgets | 4 (Gadgets, Computing, Smart Home, Gaming Tech) | 22 |
| Style & Fashion | 3 (Fashion, Accessories, Grooming) | 25 |
| Home & Living | 4 (Decor, Goods, Kitchen, Entertaining) | 20 |
| Wellness & Self-Care | 4 (Self-Care, Mental, Sleep, Health) | 14 |
| Travel & Experiences | 3 (Style, Gear, Experiences) | 18 |
| Kids & Family | 5 (Toys, Learning, Characters, Baby, Activities) | 45 |
| Pets | 3 (Dogs, Cats, Other) | 12 |
| Collecting | 1 (Collectibles) | 12 |
| Causes & Values | 2 (Social, Lifestyle) | 13 |

**Total: ~358 specific interests**

---

## Relationship Categories

1. **Immediate Family** — Spouse, Child, Parent, Sibling, Step-relations
2. **Extended Family** — Grandparents, In-laws, Aunts/Uncles, Cousins, Nieces/Nephews
3. **Friends** — Close, Couple, Kids' friend parents, Kids' friends, Work friends
4. **Professional** — Boss, Reports, Coworkers, Clients, Mentors
5. **Community** — Neighbors, Teachers, Coaches, Babysitters, Service providers
6. **Events** — Party guests, Weddings, Baby showers, Graduations, Housewarmings
7. **Gift Stash** — Kids party backup, Hostess, Wine, Generic, Regift, Teacher bulk

---

## Implementation Priority

### Phase 1: Foundation
- [ ] Database migrations for new schema
- [ ] Seed interests and enums into reference tables
- [ ] Basic CRUD APIs for structured recipients

### Phase 2: Profile Creation
- [ ] UI component library (category selector, interest picker, chip toggles)
- [ ] Profile creation wizard
- [ ] Edit existing profile to new structure

### Phase 3: Teacher Flow
- [ ] Teacher bulk add UI
- [ ] School/child association
- [ ] Gift policy tracking

### Phase 4: Gift Stash
- [ ] Stash inventory management
- [ ] Age/gender matching for party gifts
- [ ] Usage tracking and replenishment prompts

### Phase 5: SMS & AI
- [ ] Update SMS parser for structured data
- [ ] Interest matching from natural language
- [ ] Smart suggestions based on structured profiles

### Phase 6: Migration
- [ ] Script to convert existing free-form profiles
- [ ] User prompt to enhance profiles with structured data

---

## Quick Start

1. Import seed data files into your Supabase project
2. Run database migrations from `ui-flow-spec.md`
3. Build UI components following the wireframes
4. Update SMS parsing logic with new schema
5. Test with Alex's existing profiles as migration targets

---

## Notes for Claude Code

When implementing:
- Use shadcn/ui components for consistency
- Interests picker should use accordion pattern on mobile
- Bulk teacher add should pre-fill names from previous years if available
- Gift stash should surface matching items when viewing recipient profiles
- All selections should be stored as IDs, not display names (for i18n later)
