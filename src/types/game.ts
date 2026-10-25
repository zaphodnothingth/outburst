export type DeckName =
  | 'Everyday'
  | 'Food & Drink'
  | 'Classic'
  | 'Pop Culture'
  | 'Geography & Nature'
  | 'Kids Mode'
  | 'Boomers (50s-70s)'
  | 'Gen X (80s-90s)'
  | 'Millennials (90s-00s)'
  | 'Gen Z & Alpha'
  | 'Sports & Games'
  | 'Music & Hits'
  | 'Custom';

export interface MetaCategoryPreset {
  id: string;
  name: string;
  tagline: string;
  badgeColor: string;
  decks: DeckName[];
}

export interface CategoryCard {
  id: string;
  title: string;
  deck: DeckName;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  items: string[]; // Always 10 items
  isCustom?: boolean;
}

export interface ProposedTopicIdea {
  id: string;
  title: string;
  deck: DeckName;
  sampleHint: string;
}

export interface Team {
  id: string;
  name: string;
  colorVar: string;
  colorHex: string;
  gamesPlayed: number;
  gamesWon: number;
  totalPointsAllTime: number;
  totalCardsCleared: number;
}

export type EndConditionMode = 'target_score' | 'fixed_rounds';
export type SkipRuleMode = 'limited_free' | 'point_penalty';

export interface GameSettings {
  endCondition: EndConditionMode;
  targetScore: number;        // e.g. 50, 60, or custom
  totalRounds: number;        // e.g. 5, 10, or custom
  timerSeconds: number;       // e.g. 60, 45, or custom
  bonusTargetEnabled: boolean;// 1 random target per card gives bonus points
  bonusPointsValue: number;   // default +2 extra (so 3 pts total for that target)
  stealEnabled: boolean;      // Opposing team(s) can steal missed targets
  maxStealsPerCard: number;   // default 2
  skipMode: SkipRuleMode;     // 'limited_free' vs 'point_penalty'
  passesPerTeam: number;      // e.g. 1 free pass per match when skipMode === 'limited_free'
  skipPenaltyPoints: number;  // default 2 pts deducted when skipMode === 'point_penalty'
  selectedDecks: string[];    // Decks to draw from
  activeMetaPresetId?: string;// Optional active Meta-Category group preset
}

export interface TurnLog {
  roundNumber: number;
  teamId: string;
  cardId: string;
  cardTitle: string;
  guessedIndices: number[];
  bonusIndex: number | null;
  bonusHit: boolean;
  basePoints: number;
  bonusPoints: number;
  stolenByTeamId?: string | null;
  stolenIndices: number[];
  stealPoints: number;
}

export interface MatchRecord {
  id: string;
  timestamp: number;
  teams: {
    id: string;
    name: string;
    colorHex: string;
    finalScore: number;
  }[];
  winnerTeamId: string;
  roundsPlayed: number;
  endCondition: EndConditionMode;
  turns: TurnLog[];
}

export type GamePhase =
  | 'lobby'           // Selecting teams, rules, starting match
  | 'ready'           // Hand device to reader/host, preview topic (option to pass/skip before timer)
  | 'active'          // 60s countdown! Reader taps off items as active team shouts them
  | 'review'          // Post-buzzer check: verify all answers the original team shouted that reader missed
  | 'steal'           // Next team gets a chance to steal missed items
  | 'summary'         // Turn summary & scoreboard before next team's turn
  | 'gameover';       // Match complete! Winner celebration & stats

export interface GameSnapshot {
  phase: GamePhase;
  roundNumber: number;
  currentTeamIdx: number;
  scores: Record<string, number>;
  passesLeft: Record<string, number>;
  cardsClearedCount: Record<string, number>;
  turnsLog: TurnLog[];
  currentCard: CategoryCard | null;
  bonusIndex: number | null;
  guessedIndices: number[];
  stolenIndices: number[];
  stealingTeamId: string | null;
  timeLeft: number;
}
