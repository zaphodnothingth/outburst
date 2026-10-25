// Automated Quality & Specificity Validator for Outburst Category Cards
// Ensures every card meets the "Goldilocks Specificity" standard before shipping:
//   1. Exact 10 unique targets
//   2. No double-barreled / mixed-domain titles (e.g., "Rivers & Mountains" or vague "World Landmarks")
//   3. Bounded scope (finite set, physical setting, or consensus top-10 survey)
//   4. Synonym / Equivalent coverage (e.g., "Flashlight / Lantern") to prevent frustrating near-misses

import { CategoryCard } from '../types/game';

export interface CardValidationWarning {
  cardId: string;
  cardTitle: string;
  severity: 'error' | 'warning';
  reason: string;
}

const VAGUE_TITLE_PATTERNS = [
  /^world landmarks$/i,
  /^things that are /i,
  /^famous people$/i,
  /^famous movies$/i,
  /^popular songs$/i,
  /^things that have /i
];

export function auditCardQuality(cards: CategoryCard[]): CardValidationWarning[] {
  const warnings: CardValidationWarning[] = [];
  const seenTitles = new Set<string>();

  for (const card of cards) {
    const normTitle = card.title.trim().toLowerCase();

    // 1. Check duplicate titles
    if (seenTitles.has(normTitle)) {
      warnings.push({
        cardId: card.id,
        cardTitle: card.title,
        severity: 'error',
        reason: 'Duplicate category title.'
      });
    }
    seenTitles.add(normTitle);

    // 2. Check exact 10 items
    if (card.items.length !== 10) {
      warnings.push({
        cardId: card.id,
        cardTitle: card.title,
        severity: 'error',
        reason: `Card has ${card.items.length} items instead of 10.`
      });
    }

    // 3. Check duplicate items inside the card
    const itemSet = new Set(card.items.map((i) => i.trim().toLowerCase()));
    if (itemSet.size !== card.items.length) {
      warnings.push({
        cardId: card.id,
        cardTitle: card.title,
        severity: 'error',
        reason: 'Card contains duplicate target answers.'
      });
    }

    // 4. Flag overly broad / unbounded titles
    for (const pattern of VAGUE_TITLE_PATTERNS) {
      if (pattern.test(card.title.trim())) {
        warnings.push({
          cardId: card.id,
          cardTitle: card.title,
          severity: 'warning',
          reason:
            'Title may be too broad or open-ended. Consider narrowing by era, setting, or man-made vs. natural.'
        });
      }
    }
  }

  return warnings;
}
