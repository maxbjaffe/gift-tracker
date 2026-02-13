// Maps freeform text values to standard taxonomy matches
// Used for: migrating existing data, processing SMS input, SmartTagPicker auto-suggest

export interface TaxonomyItem {
  id: string;
  name: string;
  keywords?: string[];
}

export interface TaxonomyMatch {
  standardId: string;
  standardName: string;
  confidence: number;
  matchedOn: "exact" | "keyword" | "fuzzy";
}

export interface BatchResult {
  original: string;
  match: TaxonomyMatch | null;
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
}

export function mapToStandard(
  freeformValue: string,
  taxonomy: TaxonomyItem[]
): TaxonomyMatch | null {
  const input = normalize(freeformValue);
  if (!input) return null;

  let bestMatch: TaxonomyMatch | null = null;

  for (const item of taxonomy) {
    const itemName = normalize(item.name);

    // 1. Exact match (case-insensitive)
    if (itemName === input) {
      return {
        standardId: item.id,
        standardName: item.name,
        confidence: 1.0,
        matchedOn: "exact",
      };
    }

    // 2. Keyword exact match
    if (item.keywords) {
      for (const kw of item.keywords) {
        if (normalize(kw) === input) {
          return {
            standardId: item.id,
            standardName: item.name,
            confidence: 0.95,
            matchedOn: "keyword",
          };
        }
      }
    }

    // 3. Name contains input or input contains name
    if (itemName.includes(input) || input.includes(itemName)) {
      const overlap = Math.min(input.length, itemName.length);
      const longer = Math.max(input.length, itemName.length);
      const confidence = 0.5 + (overlap / longer) * 0.35;
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = {
          standardId: item.id,
          standardName: item.name,
          confidence,
          matchedOn: "fuzzy",
        };
      }
    }

    // 4. Keyword partial match
    if (item.keywords) {
      for (const kw of item.keywords) {
        const kwNorm = normalize(kw);
        if (kwNorm.includes(input) || input.includes(kwNorm)) {
          const overlap = Math.min(input.length, kwNorm.length);
          const longer = Math.max(input.length, kwNorm.length);
          const confidence = 0.4 + (overlap / longer) * 0.3;
          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = {
              standardId: item.id,
              standardName: item.name,
              confidence,
              matchedOn: "fuzzy",
            };
          }
        }
      }
    }
  }

  // Only return fuzzy matches with reasonable confidence
  if (bestMatch && bestMatch.confidence >= 0.5) {
    return bestMatch;
  }

  return null;
}

export function mapBatchToStandard(
  freeformValues: string[],
  taxonomy: TaxonomyItem[]
): BatchResult[] {
  return freeformValues.map((original) => ({
    original,
    match: mapToStandard(original, taxonomy),
  }));
}
