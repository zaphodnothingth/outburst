import { useState, useEffect } from 'react';
import { Zap, Layers, Users, Sun, Moon, Sliders } from 'lucide-react';
import {
  CategoryCard,
  Team,
  GameSettings,
  MatchRecord,
  GamePhase
} from './types/game';
import {
  loadInitialData,
  syncFromIDBIfNeeded,
  saveTeams,
  saveActiveTeamIds,
  saveCustomCards,
  savePlayedCardIds,
  saveMatchHistory,
  saveSettings,
  getAllAvailableCards,
  PersistedData
} from './utils/storage';
import { GameArena } from './components/GameArena';
import { DeckManager } from './components/DeckManager';
import { TeamManager } from './components/TeamManager';
import { SettingsPanel } from './components/SettingsPanel';

type ActiveTab = 'play' | 'decks' | 'teams' | 'settings';

export function App() {
  const initial = loadInitialData();

  const [activeTab, setActiveTab] = useState<ActiveTab>('play');
  const [currentGamePhase, setCurrentGamePhase] = useState<GamePhase>('lobby');
  const [quitSignal, setQuitSignal] = useState<number>(0);

  const [teams, setTeams] = useState<Team[]>(initial.teams);
  const [activeTeamIds, setActiveTeamIds] = useState<string[]>(
    initial.activeTeamIds
  );
  const [customCards, setCustomCards] = useState<CategoryCard[]>(
    initial.customCards
  );
  const [playedCardIds, setPlayedCardIds] = useState<string[]>(
    initial.playedCardIds
  );
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(
    initial.matchHistory
  );
  const [settings, setSettings] = useState<GameSettings>(initial.settings);
  const [lightTheme, setLightTheme] = useState<boolean>(false);

  // Sync from IndexedDB on mount in case browser localStorage was ever cleared
  useEffect(() => {
    syncFromIDBIfNeeded().then((restored) => {
      if (restored.teams) setTeams(restored.teams);
      if (restored.activeTeamIds) setActiveTeamIds(restored.activeTeamIds);
      if (restored.customCards) setCustomCards(restored.customCards);
      if (restored.playedCardIds) setPlayedCardIds(restored.playedCardIds);
      if (restored.matchHistory) setMatchHistory(restored.matchHistory);
      if (restored.settings) setSettings(restored.settings);
    });
  }, []);

  useEffect(() => {
    if (lightTheme) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [lightTheme]);

  const activeTeams = teams.filter((t) => activeTeamIds.includes(t.id));
  const allAvailableCards = getAllAvailableCards(customCards);
  const isGameInProgress =
    currentGamePhase !== 'lobby' && currentGamePhase !== 'gameover';

  // Handle clicking top-left "OUTBURST!" brand logo or bottom-left "Play Game" tab
  const handlePlayOrHomeClick = () => {
    if (activeTab !== 'play') {
      // Coming back from Decks, Teams, or Settings -> resume game in progress without losing it!
      setActiveTab('play');
      return;
    }

    // Already on Play tab: if a match is in progress, ask to confirm quitting
    if (isGameInProgress) {
      if (window.confirm('Are you sure you want to quit the game?')) {
        setQuitSignal((s) => s + 1);
      }
    }
  };

  const handleUpdateSettings = (next: GameSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  const handleMarkCardPlayed = (cardId: string) => {
    if (!playedCardIds.includes(cardId)) {
      const next = [...playedCardIds, cardId];
      setPlayedCardIds(next);
      savePlayedCardIds(next);
    }
  };

  const handleResetPlayedCards = () => {
    setPlayedCardIds([]);
    savePlayedCardIds([]);
  };

  const handleCompleteMatch = (
    record: MatchRecord,
    updatedStats: {
      teamId: string;
      points: number;
      won: boolean;
      cardsCleared: number;
    }[]
  ) => {
    const nextHistory = [record, ...matchHistory];
    setMatchHistory(nextHistory);
    saveMatchHistory(nextHistory);

    const nextTeams = teams.map((team) => {
      const stat = updatedStats.find((s) => s.teamId === team.id);
      if (!stat) return team;
      return {
        ...team,
        gamesPlayed: team.gamesPlayed + 1,
        gamesWon: team.gamesWon + (stat.won ? 1 : 0),
        totalPointsAllTime: team.totalPointsAllTime + stat.points,
        totalCardsCleared: team.totalCardsCleared + stat.cardsCleared
      };
    });

    setTeams(nextTeams);
    saveTeams(nextTeams);
  };

  const handleAddTeam = (name: string, colorHex: string) => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      colorVar: '--team-custom',
      colorHex,
      gamesPlayed: 0,
      gamesWon: 0,
      totalPointsAllTime: 0,
      totalCardsCleared: 0
    };
    const nextTeams = [...teams, newTeam];
    setTeams(nextTeams);
    saveTeams(nextTeams);

    if (activeTeamIds.length < 4) {
      const nextActive = [...activeTeamIds, newTeam.id];
      setActiveTeamIds(nextActive);
      saveActiveTeamIds(nextActive);
    }
  };

  const handleRenameTeam = (teamId: string, newName: string) => {
    const nextTeams = teams.map((t) =>
      t.id === teamId ? { ...t, name: newName } : t
    );
    setTeams(nextTeams);
    saveTeams(nextTeams);
  };

  const handleToggleActiveTeam = (teamId: string) => {
    if (activeTeamIds.includes(teamId)) {
      if (activeTeamIds.length <= 2) return;
      const next = activeTeamIds.filter((id) => id !== teamId);
      setActiveTeamIds(next);
      saveActiveTeamIds(next);
    } else {
      if (activeTeamIds.length >= 4) return;
      const next = [...activeTeamIds, teamId];
      setActiveTeamIds(next);
      saveActiveTeamIds(next);
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    if (teams.length <= 2) return;
    const nextTeams = teams.filter((t) => t.id !== teamId);
    setTeams(nextTeams);
    saveTeams(nextTeams);

    if (activeTeamIds.includes(teamId)) {
      const nextActive = activeTeamIds.filter((id) => id !== teamId);
      if (nextActive.length < 2 && nextTeams.length >= 2) {
        const fallback = nextTeams.slice(0, 2).map((t) => t.id);
        setActiveTeamIds(fallback);
        saveActiveTeamIds(fallback);
      } else {
        setActiveTeamIds(nextActive);
        saveActiveTeamIds(nextActive);
      }
    }
  };

  const handleAddOrUpdateCustomCard = (card: CategoryCard) => {
    const exists = customCards.some((c) => c.id === card.id);
    const next = exists
      ? customCards.map((c) => (c.id === card.id ? card : c))
      : [card, ...customCards];
    setCustomCards(next);
    saveCustomCards(next);
  };

  const handleDeleteCustomCard = (id: string) => {
    const next = customCards.filter((c) => c.id !== id);
    setCustomCards(next);
    saveCustomCards(next);
  };

  const handleToggleDeck = (deck: string) => {
    const exists = settings.selectedDecks.includes(deck);
    if (exists && settings.selectedDecks.length <= 1) return;
    const nextDecks = exists
      ? settings.selectedDecks.filter((d) => d !== deck)
      : [...settings.selectedDecks, deck];
    handleUpdateSettings({
      ...settings,
      activeMetaPresetId: undefined,
      selectedDecks: nextDecks
    });
  };

  const handleRestoreBackup = (data: PersistedData) => {
    setTeams(data.teams);
    setActiveTeamIds(data.activeTeamIds);
    setCustomCards(data.customCards);
    setPlayedCardIds(data.playedCardIds);
    setMatchHistory(data.matchHistory);
    setSettings(data.settings);
  };

  return (
    <div className="app-container">
      {/* Top App Header */}
      <header className="app-header">
        <div
          className="brand-logo"
          onClick={handlePlayOrHomeClick}
          title={
            isGameInProgress
              ? 'Click to quit or return to game'
              : 'Outburst Home'
          }
        >
          <div className="brand-icon">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <span className="brand-title">OUTBURST!</span>
            <span className="brand-tag">
              {isGameInProgress ? '● MATCH LIVE' : 'PARTY EDITION'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isGameInProgress && activeTab !== 'play' && (
            <button
              className="btn-resume-pill"
              onClick={() => setActiveTab('play')}
            >
              Resume Game
            </button>
          )}
          <button
            className="btn-icon-tiny"
            onClick={() => setLightTheme((v) => !v)}
            title="Toggle Theme"
          >
            {lightTheme ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area — GameArena stays mounted so switching to Decks/Teams/Settings never loses a game in progress! */}
      <main className="app-content">
        <div
          style={{
            display: activeTab === 'play' ? 'flex' : 'none',
            flexDirection: 'column',
            flex: 1
          }}
        >
          <GameArena
            activeTeams={
              activeTeams.length >= 2 ? activeTeams : teams.slice(0, 2)
            }
            settings={settings}
            availableCards={allAvailableCards}
            playedCardIds={playedCardIds}
            onMarkCardPlayed={handleMarkCardPlayed}
            onResetPlayedCards={handleResetPlayedCards}
            onCompleteMatch={handleCompleteMatch}
            onUpdateSettings={handleUpdateSettings}
            onOpenTeamSelect={() => setActiveTab('teams')}
            onPhaseChange={setCurrentGamePhase}
            quitSignal={quitSignal}
          />
        </div>

        {activeTab === 'decks' && (
          <DeckManager
            allCards={allAvailableCards}
            customCards={customCards}
            playedCardIds={playedCardIds}
            selectedDecks={settings.selectedDecks}
            onToggleDeck={handleToggleDeck}
            onAddOrUpdateCustomCard={handleAddOrUpdateCustomCard}
            onDeleteCustomCard={handleDeleteCustomCard}
            onResetPlayedCards={handleResetPlayedCards}
          />
        )}

        {activeTab === 'teams' && (
          <TeamManager
            teams={teams}
            activeTeamIds={activeTeamIds}
            matchHistory={matchHistory}
            onAddTeam={handleAddTeam}
            onRenameTeam={handleRenameTeam}
            onToggleActiveTeam={handleToggleActiveTeam}
            onDeleteTeam={handleDeleteTeam}
            onClearHistory={() => {
              setMatchHistory([]);
              saveMatchHistory([]);
            }}
            onRestoreBackup={handleRestoreBackup}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav nav-4-cols">
        <button
          className={`nav-tab ${activeTab === 'play' ? 'active' : ''}`}
          onClick={handlePlayOrHomeClick}
        >
          <Zap size={19} />
          <span>{isGameInProgress ? 'Play (Live)' : 'Play Game'}</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'decks' ? 'active' : ''}`}
          onClick={() => setActiveTab('decks')}
        >
          <Layers size={19} />
          <span>Decks ({allAvailableCards.length})</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          <Users size={19} />
          <span>Teams &amp; History</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Sliders size={19} />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
