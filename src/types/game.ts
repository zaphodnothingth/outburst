export interface CategoryCard {
  id: string;
  title: string;
  deck: 'Classic' | 'Pop Culture' | 'Everyday' | 'Food & Drink' | 'Geography & Nature' | 'Custom';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  items: string[]; // Always 10 items
  isCustom?: boolean;
}

export interface Team {
  id: string;
  name: string;
  colorVar: string; // e.g. '--team-1'
  colorHex: string;
  gamesPlayed: number;
  gamesWon: number;
  totalPointsAllTime: number;
  totalCardsCleared: number; // 10/10 outbursts!
}

export type EndConditionMode = 'target_score' | 'fixed_rounds';

export interface GameSettings {
  endCondition: EndConditionMode;
  targetScore: number;        // e.g. 50, 60, 75
  totalRounds: number;        // e.g. 3, 5, 7 (rounds = full rotations where every team gets 1 card)
  timerSeconds: number;       // e.g. 45, 60, 75
  bonusTargetEnabled: boolean;// 1 random target per card gives +3 bonus points (worth 3 total or +2 extra)
  bonusPointsValue: number;   // default +2 extra (so 3 pts total for that target)
  stealEnabled: boolean;      // Opposing team(s) can steal up to 2 missed targets
  maxStealsPerCard: number;   // default 2
  passesPerTeam: number;      // e.g. 1 or 2 free card skips per match
  selectedDecks: string[];    // Decks to draw from
}

export interface TurnLog {
  roundNumber: number;        // 1-indexed round rotation
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
  | 'steal'           // Time's up! Next team gets a chance to steal missed items (or grace check)
  | 'summary'         // Turn summary & scoreboard before next team's turn
  | 'gameover';       // Match complete! Winner celebration & stats
