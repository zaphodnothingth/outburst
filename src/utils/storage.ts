// Persistent IndexedDB + LocalStorage hybrid storage for Outburst!
// Ensures custom categories, played card history, teams, and match logs persist reliably for years.

import { CategoryCard, Team, MatchRecord, GameSettings } from '../types/game';
import { STARTER_CARDS, DECK_CATEGORIES } from '../data/starterCards';
import { EXPANSION_CARDS } from '../data/expansionCards';
import { VARIETY_CARDS } from '../data/varietyCards';

const DB_NAME = 'OutburstGameDB';
const DB_VERSION = 1;

export interface PersistedData {
  teams: Team[];
  activeTeamIds: string[];
  customCards: CategoryCard[];
  playedCardIds: string[];
  matchHistory: MatchRecord[];
  settings: GameSettings;
}

export const DEFAULT_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Guys',
    colorVar: '--team-1',
    colorHex: '#06B6D4',
    gamesPlayed: 0,
    gamesWon: 0,
    totalPointsAllTime: 0,
    totalCardsCleared: 0
  },
  {
    id: 'team-2',
    name: 'Girls',
    colorVar: '--team-2',
    colorHex: '#F43F5E',
    gamesPlayed: 0,
    gamesWon: 0,
    totalPointsAllTime: 0,
    totalCardsCleared: 0
  }
];

export const DEFAULT_SETTINGS: GameSettings = {
  endCondition: 'target_score',
  targetScore: 50,
  totalRounds: 5,
  timerSeconds: 60,
  bonusTargetEnabled: true,
  bonusPointsValue: 2, // +2 bonus on top of 1 base pt = 3 pts total
  stealEnabled: true,
  maxStealsPerCard: 2,
  skipMode: 'point_penalty',
  passesPerTeam: 1,
  skipPenaltyPoints: 2,
  selectedDecks: [...DECK_CATEGORIES],
  activeMetaPresetId: 'all-party'
};

const LS_KEYS = {
  TEAMS: 'outburst_teams_v1',
  ACTIVE_TEAMS: 'outburst_active_teams_v1',
  CUSTOM_CARDS: 'outburst_custom_cards_v1',
  PLAYED_CARDS: 'outburst_played_cards_v1',
  MATCH_HISTORY: 'outburst_match_history_v1',
  SETTINGS: 'outburst_settings_v1'
};

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function openIDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('kv')) {
          db.createObjectStore('kv');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveToIDB(key: string, value: unknown): Promise<void> {
  const db = await openIDB();
  if (!db) return;
  try {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(value, key);
  } catch {
    // Ignore IDB write error
  }
}

export async function syncFromIDBIfNeeded(): Promise<Partial<PersistedData>> {
  const db = await openIDB();
  if (!db) return {};
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('kv', 'readonly');
      const store = tx.objectStore('kv');
      const result: Partial<PersistedData> = {};

      const keys: Array<[keyof PersistedData, string]> = [
        ['teams', LS_KEYS.TEAMS],
        ['activeTeamIds', LS_KEYS.ACTIVE_TEAMS],
        ['customCards', LS_KEYS.CUSTOM_CARDS],
        ['playedCardIds', LS_KEYS.PLAYED_CARDS],
        ['matchHistory', LS_KEYS.MATCH_HISTORY],
        ['settings', LS_KEYS.SETTINGS]
      ];

      let pending = keys.length;
      keys.forEach(([prop, lsKey]) => {
        const getReq = store.get(lsKey);
        getReq.onsuccess = () => {
          if (getReq.result !== undefined && !localStorage.getItem(lsKey)) {
            localStorage.setItem(lsKey, JSON.stringify(getReq.result));
            (result as Record<string, unknown>)[prop] = getReq.result;
          }
          pending--;
          if (pending === 0) resolve(result);
        };
        getReq.onerror = () => {
          pending--;
          if (pending === 0) resolve(result);
        };
      });
    } catch {
      resolve({});
    }
  });
}

export function loadInitialData(): PersistedData {
  // Migrate untouched default teams ("Team Bolt" / "Team Surge") to "Guys" & "Girls"
  let loadedTeams = safeParse<Team[]>(
    localStorage.getItem(LS_KEYS.TEAMS),
    DEFAULT_TEAMS
  );
  if (
    loadedTeams.length === 2 &&
    loadedTeams[0].name === 'Team Bolt' &&
    loadedTeams[1].name === 'Team Surge' &&
    loadedTeams[0].gamesPlayed === 0 &&
    loadedTeams[1].gamesPlayed === 0
  ) {
    loadedTeams = DEFAULT_TEAMS;
    localStorage.setItem(LS_KEYS.TEAMS, JSON.stringify(DEFAULT_TEAMS));
  }

  const savedSettings = safeParse<Partial<GameSettings>>(
    localStorage.getItem(LS_KEYS.SETTINGS),
    {}
  );

  // If user had the original 6 decks or all-party preset, automatically include new decks (Science, History, Quirky, Generations, etc.)
  let mergedDecks = savedSettings.selectedDecks || [...DECK_CATEGORIES];
  if (
    !savedSettings.activeMetaPresetId ||
    savedSettings.activeMetaPresetId === 'all-party' ||
    mergedDecks.length === 6
  ) {
    mergedDecks = Array.from(new Set([...mergedDecks, ...DECK_CATEGORIES]));
  }

  return {
    teams: loadedTeams,
    activeTeamIds: safeParse<string[]>(
      localStorage.getItem(LS_KEYS.ACTIVE_TEAMS),
      ['team-1', 'team-2']
    ),
    customCards: safeParse<CategoryCard[]>(
      localStorage.getItem(LS_KEYS.CUSTOM_CARDS),
      []
    ),
    playedCardIds: safeParse<string[]>(
      localStorage.getItem(LS_KEYS.PLAYED_CARDS),
      []
    ),
    matchHistory: safeParse<MatchRecord[]>(
      localStorage.getItem(LS_KEYS.MATCH_HISTORY),
      []
    ),
    settings: {
      ...DEFAULT_SETTINGS,
      ...savedSettings,
      selectedDecks: mergedDecks
    }
  };
}

export function saveTeams(teams: Team[]) {
  localStorage.setItem(LS_KEYS.TEAMS, JSON.stringify(teams));
  saveToIDB(LS_KEYS.TEAMS, teams);
}

export function saveActiveTeamIds(ids: string[]) {
  localStorage.setItem(LS_KEYS.ACTIVE_TEAMS, JSON.stringify(ids));
  saveToIDB(LS_KEYS.ACTIVE_TEAMS, ids);
}

export function saveCustomCards(cards: CategoryCard[]) {
  localStorage.setItem(LS_KEYS.CUSTOM_CARDS, JSON.stringify(cards));
  saveToIDB(LS_KEYS.CUSTOM_CARDS, cards);
}

export function savePlayedCardIds(ids: string[]) {
  localStorage.setItem(LS_KEYS.PLAYED_CARDS, JSON.stringify(ids));
  saveToIDB(LS_KEYS.PLAYED_CARDS, ids);
}

export function saveMatchHistory(history: MatchRecord[]) {
  localStorage.setItem(LS_KEYS.MATCH_HISTORY, JSON.stringify(history));
  saveToIDB(LS_KEYS.MATCH_HISTORY, history);
}

export function saveSettings(settings: GameSettings) {
  localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(settings));
  saveToIDB(LS_KEYS.SETTINGS, settings);
}

export function getAllAvailableCards(
  customCards: CategoryCard[]
): CategoryCard[] {
  return [...customCards, ...VARIETY_CARDS, ...STARTER_CARDS, ...EXPANSION_CARDS];
}

export function exportFullBackup(): string {
  const data = loadInitialData();
  return JSON.stringify(
    {
      app: 'Outburst!',
      version: 1,
      exportedAt: new Date().toISOString(),
      data
    },
    null,
    2
  );
}

export function importFullBackup(jsonString: string): PersistedData | null {
  try {
    const parsed = JSON.parse(jsonString);
    const data: PersistedData = parsed.data || parsed;
    if (!Array.isArray(data.teams)) return null;

    if (data.teams) saveTeams(data.teams);
    if (data.activeTeamIds) saveActiveTeamIds(data.activeTeamIds);
    if (data.customCards) saveCustomCards(data.customCards);
    if (data.playedCardIds) savePlayedCardIds(data.playedCardIds);
    if (data.matchHistory) saveMatchHistory(data.matchHistory);
    if (data.settings) saveSettings(data.settings);

    return loadInitialData();
  } catch {
    return null;
  }
}
