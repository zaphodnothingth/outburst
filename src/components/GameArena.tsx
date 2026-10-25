import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  SkipForward,
  CheckCircle2,
  Sparkles,
  Flame,
  ShieldAlert,
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Clock,
  Pause,
  Check,
  Award,
  Zap,
  Users,
  Flag,
  Layers,
  ChevronDown,
  ChevronUp,
  Headphones
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CategoryCard,
  Team,
  GameSettings,
  GamePhase,
  TurnLog,
  MatchRecord,
  MetaCategoryPreset,
  GameSnapshot
} from '../types/game';
import { META_CATEGORY_PRESETS, DECK_CATEGORIES } from '../data/starterCards';
import { sound } from '../utils/SoundManager';

interface GameArenaProps {
  activeTeams: Team[];
  settings: GameSettings;
  availableCards: CategoryCard[];
  playedCardIds: string[];
  onMarkCardPlayed: (cardId: string) => void;
  onResetPlayedCards: () => void;
  onCompleteMatch: (
    record: MatchRecord,
    updatedStats: {
      teamId: string;
      points: number;
      won: boolean;
      cardsCleared: number;
    }[]
  ) => void;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onOpenTeamSelect: () => void;
  onPhaseChange?: (phase: GamePhase) => void;
  quitSignal?: number;
}

export const GameArena: React.FC<GameArenaProps> = ({
  activeTeams,
  settings,
  availableCards,
  playedCardIds,
  onMarkCardPlayed,
  onResetPlayedCards,
  onCompleteMatch,
  onUpdateSettings,
  onOpenTeamSelect,
  onPhaseChange,
  quitSignal
}) => {
  // Match state
  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [currentTeamIdx, setCurrentTeamIdx] = useState<number>(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [passesLeft, setPassesLeft] = useState<Record<string, number>>({});
  const [cardsClearedCount, setCardsClearedCount] = useState<
    Record<string, number>
  >({});
  const [turnsLog, setTurnsLog] = useState<TurnLog[]>([]);

  // Active turn state
  const [currentCard, setCurrentCard] = useState<CategoryCard | null>(null);
  const [bonusIndex, setBonusIndex] = useState<number | null>(null);
  const [guessedIndices, setGuessedIndices] = useState<number[]>([]);
  const [stolenIndices, setStolenIndices] = useState<number[]>([]);
  const [stealingTeamId, setStealingTeamId] = useState<string | null>(null);

  // Snapshot history stack for persistent "Back" button
  const [historyStack, setHistoryStack] = useState<GameSnapshot[]>([]);

  // Collapsible Lobby Sections (compact default so Start button is visible without scrolling!)
  const [decksExpanded, setDecksExpanded] = useState<boolean>(false);
  const [teamsExpanded, setTeamsExpanded] = useState<boolean>(false);
  const [rulesExpanded, setRulesExpanded] = useState<boolean>(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(settings.timerSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(sound.getSoundEnabled());

  const timerRef = useRef<number | null>(null);

  // Notify parent when phase changes so header/nav knows if a match is in progress
  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  // Listen for confirmed quit signal from top-left Outburst logo or bottom-left Play button
  useEffect(() => {
    if (quitSignal && quitSignal > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setHistoryStack([]);
      setPhase('lobby');
    }
  }, [quitSignal]);

  const currentTeam = activeTeams[currentTeamIdx] || activeTeams[0];
  const nextTeam =
    activeTeams[(currentTeamIdx + 1) % activeTeams.length] || activeTeams[0];

  // Filter cards by selected decks
  const deckFilteredCards = availableCards.filter((c) =>
    settings.selectedDecks.includes(c.deck)
  );
  const unplayedPool = deckFilteredCards.filter(
    (c) => !playedCardIds.includes(c.id)
  );

  // Capture current state before transitioning to next phase
  const pushSnapshot = () => {
    const snap: GameSnapshot = {
      phase,
      roundNumber,
      currentTeamIdx,
      scores: { ...scores },
      passesLeft: { ...passesLeft },
      cardsClearedCount: { ...cardsClearedCount },
      turnsLog: [...turnsLog],
      currentCard,
      bonusIndex,
      guessedIndices: [...guessedIndices],
      stolenIndices: [...stolenIndices],
      stealingTeamId,
      timeLeft
    };
    setHistoryStack((prev) => [...prev.slice(-20), snap]);
  };

  // Persistent Back Button handler
  const handleStepBack = () => {
    if (historyStack.length === 0) {
      if (
        window.confirm('Return to the Match Setup lobby and cancel this match?')
      ) {
        if (timerRef.current) clearInterval(timerRef.current);
        setPhase('lobby');
      }
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));

    setPhase(previous.phase);
    setRoundNumber(previous.roundNumber);
    setCurrentTeamIdx(previous.currentTeamIdx);
    setScores(previous.scores);
    setPassesLeft(previous.passesLeft);
    setCardsClearedCount(previous.cardsClearedCount);
    setTurnsLog(previous.turnsLog);
    setCurrentCard(previous.currentCard);
    setBonusIndex(previous.bonusIndex);
    setGuessedIndices(previous.guessedIndices);
    setStolenIndices(previous.stolenIndices);
    setStealingTeamId(previous.stealingTeamId);
    // If stepping back into active timer, pause it so the reader isn't caught off guard
    setTimeLeft(previous.timeLeft > 0 ? previous.timeLeft : settings.timerSeconds);
    setIsPaused(previous.phase === 'active');
  };

  // Select a Meta-Category Preset
  const handleSelectMetaPreset = (preset: MetaCategoryPreset) => {
    onUpdateSettings({
      ...settings,
      activeMetaPresetId: preset.id,
      selectedDecks: [...preset.decks]
    });
  };

  // Toggle an individual deck chip in the Lobby
  const handleToggleSingleDeck = (deck: string) => {
    const exists = settings.selectedDecks.includes(deck);
    if (exists && settings.selectedDecks.length <= 1) return;
    const nextDecks = exists
      ? settings.selectedDecks.filter((d) => d !== deck)
      : [...settings.selectedDecks, deck];
    onUpdateSettings({
      ...settings,
      activeMetaPresetId: undefined,
      selectedDecks: nextDecks
    });
  };

  // Draw a random card
  const drawNextCard = (excludeId?: string): CategoryCard => {
    let pool = unplayedPool.filter((c) => c.id !== excludeId);
    if (pool.length === 0) {
      pool = deckFilteredCards.filter((c) => c.id !== excludeId);
      if (pool.length === 0) pool = availableCards;
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  };

  // Start a brand new Match
  const handleStartMatch = () => {
    if (activeTeams.length < 2) return;
    const initScores: Record<string, number> = {};
    const initPasses: Record<string, number> = {};
    const initCleared: Record<string, number> = {};
    activeTeams.forEach((t) => {
      initScores[t.id] = 0;
      initPasses[t.id] = settings.passesPerTeam;
      initCleared[t.id] = 0;
    });

    setHistoryStack([]);
    setScores(initScores);
    setPassesLeft(initPasses);
    setCardsClearedCount(initCleared);
    setTurnsLog([]);
    setRoundNumber(1);
    setCurrentTeamIdx(0);

    const card = drawNextCard();
    setCurrentCard(card);
    setGuessedIndices([]);
    setStolenIndices([]);
    setStealingTeamId(
      activeTeams.length >= 2 ? activeTeams[1]?.id : null
    );
    setBonusIndex(
      settings.bonusTargetEnabled ? Math.floor(Math.random() * 10) : null
    );
    setTimeLeft(settings.timerSeconds);
    setIsPaused(false);
    setPhase('ready');
  };

  useEffect(() => {
    if (activeTeams.length >= 2) {
      const nextIdx = (currentTeamIdx + 1) % activeTeams.length;
      setStealingTeamId(activeTeams[nextIdx].id);
    }
  }, [currentTeamIdx, activeTeams]);

  // Pass / Skip Card before timer starts (supports both Free Passes and Point Penalty!)
  const handleSkipCard = () => {
    if (!currentTeam || !currentCard) return;

    if (settings.skipMode === 'limited_free') {
      const remaining = passesLeft[currentTeam.id] ?? 0;
      if (remaining <= 0) return;
      pushSnapshot();
      sound.playCardSwap();
      setPassesLeft((prev) => ({
        ...prev,
        [currentTeam.id]: prev[currentTeam.id] - 1
      }));
    } else {
      // Point penalty mode
      pushSnapshot();
      sound.playCardSwap();
      const penalty = settings.skipPenaltyPoints ?? 2;
      setScores((prev) => ({
        ...prev,
        [currentTeam.id]: (prev[currentTeam.id] || 0) - penalty
      }));
    }

    const nextCard = drawNextCard(currentCard.id);
    setCurrentCard(nextCard);
    setBonusIndex(
      settings.bonusTargetEnabled ? Math.floor(Math.random() * 10) : null
    );
  };

  // Start 60s Timer!
  const handleBeginCountdown = () => {
    if (!currentCard) return;
    pushSnapshot();
    onMarkCardPlayed(currentCard.id);
    sound.playRoundStart();
    if (sound.getSpeechEnabled()) {
      sound.speak(currentCard.title);
    }
    setTimeLeft(settings.timerSeconds);
    setIsPaused(false);
    setPhase('active');
  };

  // Timer effect -> goes to 'review' (Missed-by-Reader Check) when time runs out!
  useEffect(() => {
    if (phase !== 'active' || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          sound.playBuzzer();
          setPhase((currentPhase) => {
            if (currentPhase === 'active') {
              return 'review';
            }
            return currentPhase;
          });
          return 0;
        }
        if (prev <= 11) {
          sound.playTimerTick(prev <= 6);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isPaused]);

  // Toggle a target during active round, review phase, or summary
  const handleToggleTarget = (index: number) => {
    if (guessedIndices.includes(index)) {
      sound.playTargetUndo();
      setGuessedIndices((prev) => prev.filter((i) => i !== index));
    } else {
      if (stolenIndices.includes(index)) {
        setStolenIndices((prev) => prev.filter((i) => i !== index));
      }
      const nextCount = guessedIndices.length + 1;
      if (index === bonusIndex) {
        sound.playBonusHit();
      } else {
        sound.playTargetHit(nextCount);
      }

      const updated = [...guessedIndices, index];
      setGuessedIndices(updated);

      if (updated.length === 10 && phase === 'active') {
        if (timerRef.current) clearInterval(timerRef.current);
        sound.playOutburstSweep();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          setPhase('summary');
        }, 650);
      }
    }
  };

  // Toggle a stolen target during steal phase
  const handleToggleStealTarget = (index: number) => {
    if (guessedIndices.includes(index)) return;

    if (stolenIndices.includes(index)) {
      sound.playTargetUndo();
      setStolenIndices((prev) => prev.filter((i) => i !== index));
    } else {
      if (stolenIndices.length >= settings.maxStealsPerCard) {
        return;
      }
      sound.playTargetHit(8);
      setStolenIndices((prev) => [...prev, index]);
    }
  };

  // Calculate current turn points
  const basePoints = guessedIndices.length;
  const bonusHit = bonusIndex !== null && guessedIndices.includes(bonusIndex);
  const bonusPoints = bonusHit ? settings.bonusPointsValue : 0;
  const turnTotalForActiveTeam = basePoints + bonusPoints;
  const stealPoints = stolenIndices.length;

  // Finish the entire game immediately ("End Game Early")
  const handleEndGameEarly = (includeCurrentTurnPoints: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    pushSnapshot();

    const finalScores = { ...scores };
    const finalCleared = { ...cardsClearedCount };
    const finalTurns = [...turnsLog];

    if (includeCurrentTurnPoints && currentCard && currentTeam) {
      finalScores[currentTeam.id] =
        (finalScores[currentTeam.id] || 0) + turnTotalForActiveTeam;

      if (stealPoints > 0 && stealingTeamId) {
        finalScores[stealingTeamId] =
          (finalScores[stealingTeamId] || 0) + stealPoints;
      }

      if (guessedIndices.length === 10) {
        finalCleared[currentTeam.id] =
          (finalCleared[currentTeam.id] || 0) + 1;
      }

      finalTurns.push({
        roundNumber,
        teamId: currentTeam.id,
        cardId: currentCard.id,
        cardTitle: currentCard.title,
        guessedIndices,
        bonusIndex,
        bonusHit,
        basePoints,
        bonusPoints,
        stolenByTeamId: stealPoints > 0 ? stealingTeamId : null,
        stolenIndices,
        stealPoints
      });
    }

    setScores(finalScores);
    setCardsClearedCount(finalCleared);
    setTurnsLog(finalTurns);

    const sortedTeams = [...activeTeams].sort(
      (a, b) => (finalScores[b.id] || 0) - (finalScores[a.id] || 0)
    );
    const winner = sortedTeams[0] || activeTeams[0];

    sound.playOutburstSweep();
    confetti({
      particleCount: 120,
      spread: 85,
      origin: { y: 0.5 }
    });

    const record: MatchRecord = {
      id: `match-${Date.now()}`,
      timestamp: Date.now(),
      teams: activeTeams.map((t) => ({
        id: t.id,
        name: t.name,
        colorHex: t.colorHex,
        finalScore: finalScores[t.id] || 0
      })),
      winnerTeamId: winner.id,
      roundsPlayed: roundNumber,
      endCondition: settings.endCondition,
      turns: finalTurns
    };

    const statsUpdate = activeTeams.map((t) => ({
      teamId: t.id,
      points: finalScores[t.id] || 0,
      won: t.id === winner.id,
      cardsCleared: finalCleared[t.id] || 0
    }));

    onCompleteMatch(record, statsUpdate);
    setPhase('gameover');
  };

  // Commit turn scores and move to next team or end match
  const handleCommitTurnAndAdvance = () => {
    if (!currentCard || !currentTeam) return;
    pushSnapshot();

    const updatedScores = { ...scores };
    updatedScores[currentTeam.id] =
      (updatedScores[currentTeam.id] || 0) + turnTotalForActiveTeam;

    if (stealPoints > 0 && stealingTeamId) {
      updatedScores[stealingTeamId] =
        (updatedScores[stealingTeamId] || 0) + stealPoints;
    }

    const updatedCleared = { ...cardsClearedCount };
    if (guessedIndices.length === 10) {
      updatedCleared[currentTeam.id] = (updatedCleared[currentTeam.id] || 0) + 1;
    }

    const newTurnLog: TurnLog = {
      roundNumber,
      teamId: currentTeam.id,
      cardId: currentCard.id,
      cardTitle: currentCard.title,
      guessedIndices,
      bonusIndex,
      bonusHit,
      basePoints,
      bonusPoints,
      stolenByTeamId: stealPoints > 0 ? stealingTeamId : null,
      stolenIndices,
      stealPoints
    };

    const nextTurnsLog = [...turnsLog, newTurnLog];
    setScores(updatedScores);
    setCardsClearedCount(updatedCleared);
    setTurnsLog(nextTurnsLog);

    const isLastTeamInRotation = currentTeamIdx === activeTeams.length - 1;

    if (isLastTeamInRotation) {
      const highestScore = Math.max(
        ...activeTeams.map((t) => updatedScores[t.id] || 0)
      );
      const topTeams = activeTeams.filter(
        (t) => (updatedScores[t.id] || 0) === highestScore
      );

      const targetReached =
        settings.endCondition === 'target_score' &&
        highestScore >= settings.targetScore;
      const roundsReached =
        settings.endCondition === 'fixed_rounds' &&
        roundNumber >= settings.totalRounds;

      if ((targetReached || roundsReached) && topTeams.length === 1) {
        const winner = topTeams[0];
        sound.playOutburstSweep();
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.5 }
        });

        const record: MatchRecord = {
          id: `match-${Date.now()}`,
          timestamp: Date.now(),
          teams: activeTeams.map((t) => ({
            id: t.id,
            name: t.name,
            colorHex: t.colorHex,
            finalScore: updatedScores[t.id] || 0
          })),
          winnerTeamId: winner.id,
          roundsPlayed: roundNumber,
          endCondition: settings.endCondition,
          turns: nextTurnsLog
        };

        const statsUpdate = activeTeams.map((t) => ({
          teamId: t.id,
          points: updatedScores[t.id] || 0,
          won: t.id === winner.id,
          cardsCleared: updatedCleared[t.id] || 0
        }));

        onCompleteMatch(record, statsUpdate);
        setPhase('gameover');
        return;
      }

      setRoundNumber((r) => r + 1);
      setCurrentTeamIdx(0);
    } else {
      setCurrentTeamIdx((idx) => idx + 1);
    }

    const nextCard = drawNextCard(currentCard.id);
    setCurrentCard(nextCard);
    setGuessedIndices([]);
    setStolenIndices([]);
    setBonusIndex(
      settings.bonusTargetEnabled ? Math.floor(Math.random() * 10) : null
    );
    setTimeLeft(settings.timerSeconds);
    setIsPaused(false);
    setPhase('ready');
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sound.setSoundEnabled(next);
  };

  // ============================================================================
  // RENDER PHASES
  // ============================================================================

  // 1. SLEEK, COMPACT LOBBY PHASE (No scrolling required to hit Start!)
  if (phase === 'lobby') {
    const activePreset = META_CATEGORY_PRESETS.find(
      (p) => p.id === settings.activeMetaPresetId
    );

    return (
      <div className="arena-container lobby-compact animate-fadein">
        {/* Compact Hero Banner */}
        <div className="hero-card-compact glass-panel">
          <div className="flex-row-center">
            <div>
              <div className="hero-badge" style={{ marginBottom: 4 }}>
                <Zap size={13} /> {unplayedPool.length} FRESH CARDS READY
              </div>
              <h1 style={{ fontSize: 22 }}>Ready to Outburst?</h1>
            </div>
            {playedCardIds.length > 0 && (
              <button
                className="btn-link-subtle"
                onClick={onResetPlayedCards}
                title="Mark all cards as unplayed"
              >
                <RotateCcw size={13} /> Reset ({playedCardIds.length})
              </button>
            )}
          </div>
        </div>

        {/* 1. Expandable Game Mode & Generations Selector */}
        <div className="collapsible-card glass-card">
          <div className="meta-presets-compact-grid">
            {META_CATEGORY_PRESETS.map((preset) => {
              const isSelected = settings.activeMetaPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  className={`meta-chip-btn ${isSelected ? 'selected' : ''}`}
                  style={{
                    borderColor: isSelected ? preset.badgeColor : undefined,
                    background: isSelected ? `${preset.badgeColor}20` : undefined
                  }}
                  onClick={() => handleSelectMetaPreset(preset)}
                >
                  <span
                    className="score-chip-dot"
                    style={{ backgroundColor: preset.badgeColor }}
                  />
                  <span className="meta-chip-title">{preset.name}</span>
                </button>
              );
            })}
          </div>

          <button
            className="accordion-trigger-bar"
            onClick={() => setDecksExpanded((v) => !v)}
          >
            <span>
              <Layers size={14} />{' '}
              {activePreset ? activePreset.name : 'Custom Deck Mix'} (
              {settings.selectedDecks.length} decks • {deckFilteredCards.length}{' '}
              cards)
            </span>
            {decksExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {decksExpanded && (
            <div className="accordion-body">
              <div className="deck-pills-wrap">
                {DECK_CATEGORIES.map((deck) => {
                  const count = availableCards.filter(
                    (c) => c.deck === deck
                  ).length;
                  if (count === 0 && deck === 'Custom') return null;
                  const isSelected = settings.selectedDecks.includes(deck);
                  return (
                    <button
                      key={deck}
                      className={`deck-filter-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => handleToggleSingleDeck(deck)}
                    >
                      <span>{deck}</span>
                      <span className="deck-count-badge">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Expandable Active Teams Row */}
        <div className="collapsible-card glass-card">
          <div
            className="accordion-header"
            onClick={() => setTeamsExpanded((v) => !v)}
          >
            <div className="accordion-title-group">
              <Users size={16} color="#06B6D4" />
              <span className="accordion-title">Active Teams</span>
              <div className="inline-team-badges">
                {activeTeams.map((t) => (
                  <span
                    key={t.id}
                    className="mini-team-pill"
                    style={{
                      borderColor: `${t.colorHex}88`,
                      background: `${t.colorHex}18`
                    }}
                  >
                    <span
                      className="score-chip-dot"
                      style={{ backgroundColor: t.colorHex }}
                    />
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
            {teamsExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </div>

          {teamsExpanded && (
            <div className="accordion-body">
              <div className="lobby-teams-grid" style={{ marginBottom: 10 }}>
                {activeTeams.map((team, idx) => (
                  <div
                    key={team.id}
                    className="lobby-team-pill"
                    style={{
                      borderColor: `${team.colorHex}66`,
                      background: `linear-gradient(135deg, ${team.colorHex}22, transparent)`
                    }}
                  >
                    <div
                      className="team-dot"
                      style={{ backgroundColor: team.colorHex }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="team-pill-name">{team.name}</div>
                      <div className="team-pill-meta">
                        {team.gamesWon}W - {team.gamesPlayed - team.gamesWon}L •{' '}
                        {team.totalPointsAllTime} pts
                      </div>
                    </div>
                    <span className="turn-order-badge">#{idx + 1}</span>
                  </div>
                ))}
              </div>
              <button
                className="btn-chip"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={onOpenTeamSelect}
              >
                Manage Teams &amp; Generate Names
              </button>
            </div>
          )}
        </div>

        {/* 3. Expandable Match Rules & Twists Row (with 2 Presets + Custom Input!) */}
        <div className="collapsible-card glass-card">
          <div
            className="accordion-header"
            onClick={() => setRulesExpanded((v) => !v)}
          >
            <div className="accordion-title-group">
              <Sparkles size={16} color="#F59E0B" />
              <span className="accordion-title">Match Rules &amp; Twists</span>
              <span className="rules-summary-pill">
                {settings.endCondition === 'target_score'
                  ? `${settings.targetScore} pts`
                  : `${settings.totalRounds} rnds`}{' '}
                • {settings.timerSeconds}s
                {settings.bonusTargetEnabled ? ' • Bonus' : ''}
                {settings.stealEnabled ? ' • Steal' : ''}
              </span>
            </div>
            {rulesExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </div>

          {rulesExpanded && (
            <div className="accordion-body">
              {/* Win Condition */}
              <div className="rule-row" style={{ marginBottom: 10 }}>
                <div className="rule-title">Win Mode</div>
                <div className="segmented-control">
                  <button
                    className={
                      settings.endCondition === 'target_score' ? 'active' : ''
                    }
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        endCondition: 'target_score'
                      })
                    }
                  >
                    Target Score
                  </button>
                  <button
                    className={
                      settings.endCondition === 'fixed_rounds' ? 'active' : ''
                    }
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        endCondition: 'fixed_rounds'
                      })
                    }
                  >
                    Fixed Rounds
                  </button>
                </div>
              </div>

              {/* 2 Default Options + Custom Number Box */}
              {settings.endCondition === 'target_score' ? (
                <div className="rule-row" style={{ marginBottom: 12 }}>
                  <div className="rule-desc">Target Score (2 presets or custom)</div>
                  <div className="preset-plus-custom">
                    {[50, 60].map((pts) => (
                      <button
                        key={pts}
                        className={`option-pill-sm ${
                          settings.targetScore === pts ? 'selected' : ''
                        }`}
                        onClick={() =>
                          onUpdateSettings({ ...settings, targetScore: pts })
                        }
                      >
                        {pts} pts
                      </button>
                    ))}
                    <input
                      type="number"
                      min={10}
                      max={500}
                      className="input-custom-num"
                      value={settings.targetScore}
                      onChange={(e) => {
                        const val = Math.max(
                          5,
                          parseInt(e.target.value, 10) || 50
                        );
                        onUpdateSettings({ ...settings, targetScore: val });
                      }}
                      title="Custom target score"
                    />
                  </div>
                </div>
              ) : (
                <div className="rule-row" style={{ marginBottom: 12 }}>
                  <div className="rule-desc">Rounds Per Team (2 presets or custom)</div>
                  <div className="preset-plus-custom">
                    {[5, 10].map((rnds) => (
                      <button
                        key={rnds}
                        className={`option-pill-sm ${
                          settings.totalRounds === rnds ? 'selected' : ''
                        }`}
                        onClick={() =>
                          onUpdateSettings({ ...settings, totalRounds: rnds })
                        }
                      >
                        {rnds} Rnds
                      </button>
                    ))}
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className="input-custom-num"
                      value={settings.totalRounds}
                      onChange={(e) => {
                        const val = Math.max(
                          1,
                          parseInt(e.target.value, 10) || 5
                        );
                        onUpdateSettings({ ...settings, totalRounds: val });
                      }}
                      title="Custom number of rounds"
                    />
                  </div>
                </div>
              )}

              {/* Round Timer: 2 Default Options + Custom Box */}
              <div className="rule-row" style={{ marginBottom: 12 }}>
                <div className="rule-desc">Round Timer (seconds)</div>
                <div className="preset-plus-custom">
                  {[45, 60].map((sec) => (
                    <button
                      key={sec}
                      className={`option-pill-sm ${
                        settings.timerSeconds === sec ? 'selected' : ''
                      }`}
                      onClick={() =>
                        onUpdateSettings({ ...settings, timerSeconds: sec })
                      }
                    >
                      {sec}s
                    </button>
                  ))}
                  <input
                    type="number"
                    min={10}
                    max={300}
                    className="input-custom-num"
                    value={settings.timerSeconds}
                    onChange={(e) => {
                      const val = Math.max(
                        5,
                        parseInt(e.target.value, 10) || 60
                      );
                      onUpdateSettings({ ...settings, timerSeconds: val });
                    }}
                    title="Custom timer seconds"
                  />
                </div>
              </div>

              {/* Twists Toggles */}
              <div className="twists-grid" style={{ marginTop: 8 }}>
                <button
                  className={`twist-toggle-card ${
                    settings.bonusTargetEnabled ? 'enabled' : ''
                  }`}
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      bonusTargetEnabled: !settings.bonusTargetEnabled
                    })
                  }
                >
                  <div className="twist-header">
                    <Sparkles size={16} className="twist-icon-gold" />
                    <span className="twist-badge">
                      {settings.bonusTargetEnabled
                        ? `ON (+${settings.bonusPointsValue})`
                        : 'OFF'}
                    </span>
                  </div>
                  <div className="twist-name">Bonus Target</div>
                </button>

                <button
                  className={`twist-toggle-card ${
                    settings.stealEnabled ? 'enabled' : ''
                  }`}
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      stealEnabled: !settings.stealEnabled
                    })
                  }
                >
                  <div className="twist-header">
                    <Flame size={16} className="twist-icon-cyan" />
                    <span className="twist-badge">
                      {settings.stealEnabled
                        ? `ON (MAX ${settings.maxStealsPerCard})`
                        : 'OFF'}
                    </span>
                  </div>
                  <div className="twist-name">Steal Chance</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Start Match CTA - Always immediately reachable */}
        <button
          className="btn-start-match"
          onClick={handleStartMatch}
          disabled={activeTeams.length < 2}
        >
          <Play size={22} fill="currentColor" />
          START OUTBURST MATCH
        </button>
      </div>
    );
  }

  // Persistent Top Bar for all in-game phases (Includes Back button + Round + End Game Early + Sound)
  const renderScoreboardStrip = (includeCurrentInEarlyEnd: boolean) => (
    <div className="scoreboard-strip">
      <div className="scoreboard-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            className="btn-step-back"
            onClick={handleStepBack}
            title="Step back and undo last action"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span className="round-pill">
            RND {roundNumber}
            {settings.endCondition === 'fixed_rounds'
              ? `/${settings.totalRounds}`
              : ''}
          </span>
          {settings.endCondition === 'target_score' && (
            <span className="goal-pill">Goal: {settings.targetScore}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            className="btn-end-game-early"
            onClick={() => {
              if (
                window.confirm(
                  'End the game now and crown the current leader as Champion?'
                )
              ) {
                handleEndGameEarly(includeCurrentInEarlyEnd);
              }
            }}
            title="Finish game now and crown current winner"
          >
            <Flag size={12} /> End Game
          </button>
          <button
            className="btn-icon-tiny"
            onClick={toggleSound}
            title="Toggle Sound"
          >
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>

      <div className="scoreboard-teams">
        {activeTeams.map((team, idx) => {
          const isCurrent = idx === currentTeamIdx;
          return (
            <div
              key={team.id}
              className={`score-chip ${isCurrent ? 'active-turn' : ''}`}
              style={{
                borderColor: isCurrent ? team.colorHex : 'transparent',
                background: isCurrent ? `${team.colorHex}25` : undefined
              }}
            >
              <span
                className="score-chip-dot"
                style={{ backgroundColor: team.colorHex }}
              />
              <span className="score-chip-name">{team.name}</span>
              <span className="score-chip-pts">{scores[team.id] || 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // 2. READY PHASE (Hand device to Reader, preview topic, Skip option)
  if (phase === 'ready' && currentCard && currentTeam) {
    const teamPasses = passesLeft[currentTeam.id] ?? 0;
    const canSkip =
      settings.skipMode === 'point_penalty' || teamPasses > 0;

    return (
      <div className="arena-container animate-fadein">
        {renderScoreboardStrip(false)}

        <div
          className="ready-card glass-panel"
          style={{
            borderColor: `${currentTeam.colorHex}77`,
            boxShadow: `0 12px 40px -10px ${currentTeam.colorHex}33`
          }}
        >
          <div
            className="turn-banner-pill"
            style={{
              backgroundColor: `${currentTeam.colorHex}33`,
              color: currentTeam.colorHex
            }}
          >
            UP NOW: {currentTeam.name.toUpperCase()}
          </div>

          <div className="reader-warning-box">
            <ShieldAlert
              size={20}
              style={{ color: '#F59E0B', flexShrink: 0 }}
            />
            <span>
              <strong>READER / HOST EYES ONLY!</strong> Hand the device to{' '}
              <strong>{nextTeam.name}</strong> so{' '}
              <strong>{currentTeam.name}</strong> can&apos;t see the 10 targets!
            </span>
          </div>

          <div className="topic-preview-box">
            <div className="topic-deck-tag">{currentCard.deck}</div>
            <div className="topic-announcement-label">YOUR CATEGORY IS:</div>
            <h2 className="topic-preview-title">
              &ldquo;{currentCard.title}&rdquo;
            </h2>
          </div>

          <p className="ready-instructions">
            Read the category title aloud to <strong>{currentTeam.name}</strong>.
            When they are ready to shout answers, hit{' '}
            <strong>Start {settings.timerSeconds}s Timer</strong>!
          </p>

          <div className="ready-actions">
            <button className="btn-start-timer" onClick={handleBeginCountdown}>
              <Play size={22} fill="currentColor" />
              START {settings.timerSeconds}s TIMER
            </button>

            {canSkip && (
              <button className="btn-skip-card" onClick={handleSkipCard}>
                <SkipForward size={17} />
                {settings.skipMode === 'point_penalty'
                  ? `Skip Topic (-${settings.skipPenaltyPoints} pts)`
                  : `Pass & Draw New Topic (${teamPasses} left)`}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. ACTIVE 60-SECOND ROUND PHASE
  if (phase === 'active' && currentCard && currentTeam) {
    const progressPct = (timeLeft / settings.timerSeconds) * 100;
    const isUrgent = timeLeft <= 10;

    return (
      <div className="arena-container active-round-layout animate-fadein">
        <div className={`live-hud ${isUrgent ? 'urgent-pulse' : ''}`}>
          <div className="hud-top-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                className="btn-step-back"
                onClick={handleStepBack}
                title="Go back to Ready screen"
              >
                <ArrowLeft size={13} /> Back
              </button>
              <div
                className="hud-team-badge"
                style={{ color: currentTeam.colorHex }}
              >
                <span
                  className="team-dot"
                  style={{ backgroundColor: currentTeam.colorHex }}
                />
                {currentTeam.name}
              </div>
            </div>

            <div className="hud-timer-controls">
              <button
                className="btn-pause-pill"
                onClick={() => setIsPaused((p) => !p)}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <div
                className={`digital-clock ${isUrgent ? 'clock-danger' : ''}`}
              >
                <Clock size={18} />
                <span>{timeLeft}s</span>
              </div>
            </div>

            <div className="hud-score-pill">
              <span className="hud-hits">{guessedIndices.length}/10</span>
              <span className="hud-pts">+{turnTotalForActiveTeam}</span>
            </div>
          </div>

          <div className="timer-bar-track">
            <div
              className="timer-bar-fill"
              style={{
                width: `${progressPct}%`,
                backgroundColor: isUrgent ? '#EF4444' : currentTeam.colorHex
              }}
            />
          </div>

          <div className="hud-topic-title">{currentCard.title}</div>
        </div>

        <div className="targets-grid">
          {currentCard.items.map((item, idx) => {
            const isGuessed = guessedIndices.includes(idx);
            const isBonus = idx === bonusIndex;

            return (
              <button
                key={idx}
                className={`target-btn ${isGuessed ? 'target-checked' : ''} ${
                  isBonus ? 'target-bonus' : ''
                }`}
                onClick={() => handleToggleTarget(idx)}
              >
                <div className="target-num">
                  {isGuessed ? <Check size={18} strokeWidth={3} /> : idx + 1}
                </div>
                <div className="target-text">{item}</div>
                {isBonus && (
                  <div
                    className="bonus-star-pill"
                    title={`Bonus Target (+${settings.bonusPointsValue} extra pts)`}
                  >
                    <Sparkles size={13} /> +{settings.bonusPointsValue + 1}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="active-footer-bar">
          <button
            className="btn-end-game-early"
            onClick={() => {
              if (
                window.confirm(
                  'End the entire game now (including points earned so far this round) and crown the winner?'
                )
              ) {
                handleEndGameEarly(true);
              }
            }}
          >
            <Flag size={13} /> End Game Early
          </button>

          <button
            className="btn-end-timer-early"
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              pushSnapshot();
              setPhase('review');
            }}
          >
            End Round Early <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // 4. POST-BUZZER REVIEW PHASE (Check off any answers the original team shouted that the reader missed BEFORE Steal!)
  if (phase === 'review' && currentCard && currentTeam) {
    return (
      <div className="arena-container active-round-layout animate-fadein">
        <div className="review-banner glass-panel">
          <div className="steal-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                className="btn-step-back"
                onClick={handleStepBack}
                title="Step back to timer"
              >
                <ArrowLeft size={13} /> Back
              </button>
              <div className="buzzer-pill">TIME&apos;S UP!</div>
            </div>
            <div
              className="steal-team-label"
              style={{ color: currentTeam.colorHex }}
            >
              <Headphones size={16} /> Check {currentTeam.name}&apos;s Answers
            </div>
          </div>

          <h3 className="steal-topic-title">{currentCard.title}</h3>
          <p className="steal-instructions">
            <strong>Before any steal attempt:</strong> Tap any answers below
            that <strong style={{ color: currentTeam.colorHex }}>{currentTeam.name}</strong>{' '}
            shouted out during the round that the reader didn&apos;t hear or tap in time!
          </p>
        </div>

        <div className="targets-grid">
          {currentCard.items.map((item, idx) => {
            const isGuessed = guessedIndices.includes(idx);
            const isBonus = idx === bonusIndex;

            return (
              <button
                key={idx}
                className={`target-btn ${isGuessed ? 'target-checked' : ''} ${
                  isBonus ? 'target-bonus' : ''
                }`}
                onClick={() => handleToggleTarget(idx)}
              >
                <div className="target-num">
                  {isGuessed ? <Check size={18} strokeWidth={3} /> : idx + 1}
                </div>
                <div className="target-text">{item}</div>
                {isBonus && (
                  <div className="bonus-star-pill">
                    <Sparkles size={13} /> +{settings.bonusPointsValue + 1}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="active-footer-bar">
          <button
            className="btn-end-game-early"
            onClick={() => {
              if (
                window.confirm(
                  'End the entire game now (including points earned this round) and crown the winner?'
                )
              ) {
                handleEndGameEarly(true);
              }
            }}
          >
            <Flag size={13} /> End Game Early
          </button>

          <button
            className="btn-primary-glow btn-finish-steal"
            onClick={() => {
              pushSnapshot();
              if (settings.stealEnabled && guessedIndices.length < 10) {
                setPhase('steal');
              } else {
                setPhase('summary');
              }
            }}
          >
            {settings.stealEnabled && guessedIndices.length < 10
              ? `Next: ${nextTeam.name} Steal Chance`
              : 'Complete & Score'}{' '}
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  // 5. STEAL PHASE (Opposing team gets a chance to snipe missed items)
  if (phase === 'steal' && currentCard && currentTeam) {
    const opposingTeams = activeTeams.filter((t) => t.id !== currentTeam.id);
    const activeStealTeam =
      activeTeams.find((t) => t.id === stealingTeamId) || opposingTeams[0];

    return (
      <div className="arena-container active-round-layout animate-fadein">
        <div className="steal-banner glass-panel">
          <div className="steal-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                className="btn-step-back"
                onClick={handleStepBack}
                title="Back to Answer Check"
              >
                <ArrowLeft size={13} /> Back
              </button>
              <div className="steal-badge-pill">STEAL ROUND</div>
            </div>
            {opposingTeams.length > 1 ? (
              <div className="steal-team-selector">
                <span>Stealing:</span>
                {opposingTeams.map((ot) => (
                  <button
                    key={ot.id}
                    className={`steal-team-chip ${
                      stealingTeamId === ot.id ? 'selected' : ''
                    }`}
                    style={{
                      borderColor:
                        stealingTeamId === ot.id ? ot.colorHex : undefined
                    }}
                    onClick={() => setStealingTeamId(ot.id)}
                  >
                    {ot.name}
                  </button>
                ))}
              </div>
            ) : (
              <div
                className="steal-team-label"
                style={{ color: activeStealTeam?.colorHex }}
              >
                <Flame size={16} /> {activeStealTeam?.name} Steal Chance!
              </div>
            )}
          </div>

          <h3 className="steal-topic-title">{currentCard.title}</h3>
          <p className="steal-instructions">
            Give{' '}
            <strong style={{ color: activeStealTeam?.colorHex }}>
              {activeStealTeam?.name}
            </strong>{' '}
            one quick burst to guess up to{' '}
            <strong>{settings.maxStealsPerCard}</strong> missed answers (+1 pt
            each).
          </p>
        </div>

        <div className="targets-grid">
          {currentCard.items.map((item, idx) => {
            const isGuessed = guessedIndices.includes(idx);
            const isStolen = stolenIndices.includes(idx);
            const isBonus = idx === bonusIndex;

            return (
              <div
                key={idx}
                className={`target-btn steal-mode-btn ${
                  isGuessed
                    ? 'target-checked'
                    : isStolen
                    ? 'target-stolen'
                    : 'target-missed-stealable'
                }`}
                onClick={() => {
                  if (!isGuessed) {
                    handleToggleStealTarget(idx);
                  }
                }}
              >
                <div className="target-num">
                  {isGuessed ? (
                    <Check size={16} strokeWidth={3} />
                  ) : isStolen ? (
                    <Flame size={16} />
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className="target-text">{item}</div>

                {isBonus && (
                  <span className="bonus-star-pill">
                    <Sparkles size={12} /> +{settings.bonusPointsValue + 1}
                  </span>
                )}

                {isGuessed && <span className="guessed-tag">FOUND</span>}
                {isStolen && <span className="stolen-tag">STOLEN +1</span>}
              </div>
            );
          })}
        </div>

        <div className="active-footer-bar">
          <button
            className="btn-end-game-early"
            onClick={() => {
              if (
                window.confirm(
                  'End the entire game now (including points earned this round) and crown the winner?'
                )
              ) {
                handleEndGameEarly(true);
              }
            }}
          >
            <Flag size={13} /> End Game Early
          </button>

          <button
            className="btn-primary-glow btn-finish-steal"
            onClick={() => {
              pushSnapshot();
              setPhase('summary');
            }}
          >
            Complete &amp; Score <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  // 6. TURN SUMMARY PHASE
  if (phase === 'summary' && currentCard && currentTeam) {
    const stealTeamObj = activeTeams.find((t) => t.id === stealingTeamId);

    return (
      <div className="arena-container animate-fadein">
        {renderScoreboardStrip(true)}

        <div className="summary-card glass-panel">
          <div className="summary-header">
            <div>
              <span className="summary-kicker">
                {guessedIndices.length === 10
                  ? '🔥 PERFECT 10/10 OUTBURST!'
                  : `TURN COMPLETE • ${guessedIndices.length}/10 FOUND`}
              </span>
              <h2 className="summary-title">{currentCard.title}</h2>
            </div>

            <div
              className="turn-points-badge"
              style={{
                backgroundColor: `${currentTeam.colorHex}25`,
                borderColor: currentTeam.colorHex,
                color: currentTeam.colorHex
              }}
            >
              +{turnTotalForActiveTeam} PTS
            </div>
          </div>

          <div className="points-breakdown-row">
            <span className="breakdown-pill">
              <CheckCircle2 size={14} /> {basePoints} Targets Found (+
              {basePoints})
            </span>
            {bonusHit && (
              <span className="breakdown-pill bonus-pill">
                <Sparkles size={14} /> Bonus Target Hit! (+{bonusPoints} extra)
              </span>
            )}
            {stealPoints > 0 && stealTeamObj && (
              <span
                className="breakdown-pill steal-pill"
                style={{ borderColor: stealTeamObj.colorHex }}
              >
                <Flame size={14} /> {stealTeamObj.name} Stole {stealPoints} (+
                {stealPoints})
              </span>
            )}
          </div>

          <div className="summary-targets-list">
            {currentCard.items.map((item, idx) => {
              const isGuessed = guessedIndices.includes(idx);
              const isStolen = stolenIndices.includes(idx);
              const isBonus = idx === bonusIndex;

              return (
                <div
                  key={idx}
                  className={`summary-item-row ${
                    isGuessed
                      ? 'row-guessed'
                      : isStolen
                      ? 'row-stolen'
                      : 'row-missed'
                  }`}
                  onClick={() => handleToggleTarget(idx)}
                  title="Tap to toggle if an answer needs adjustment"
                >
                  <span className="row-index">{idx + 1}.</span>
                  <span className="row-text">{item}</span>
                  {isBonus && (
                    <span className="row-badge bonus">
                      <Sparkles size={11} /> BONUS
                    </span>
                  )}
                  {isGuessed && <span className="row-badge hit">FOUND</span>}
                  {isStolen && <span className="row-badge stolen">STOLEN</span>}
                  {!isGuessed && !isStolen && (
                    <span className="row-badge missed">MISSED</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="summary-actions-row">
            <button
              className="btn-start-match"
              onClick={handleCommitTurnAndAdvance}
            >
              Save Points &amp; Next Team ({nextTeam.name}){' '}
              <ArrowRight size={20} />
            </button>

            <button
              className="btn-end-game-early-wide"
              onClick={() => {
                if (
                  window.confirm(
                    'Save this round and finish the match right now?'
                  )
                ) {
                  handleEndGameEarly(true);
                }
              }}
            >
              <Flag size={15} /> Save Round &amp; End Game Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7. GAME OVER PHASE
  if (phase === 'gameover') {
    const sortedTeams = [...activeTeams].sort(
      (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
    );
    const winner = sortedTeams[0];

    return (
      <div className="arena-container animate-fadein">
        <div className="gameover-card glass-panel">
          <div style={{ alignSelf: 'flex-start' }}>
            <button className="btn-step-back" onClick={handleStepBack}>
              <ArrowLeft size={14} /> Back to Match
            </button>
          </div>

          <div className="trophy-badge">
            <Trophy size={42} color="#F59E0B" />
          </div>
          <div className="winner-kicker">OUTBURST CHAMPIONS!</div>
          <h1
            className="winner-title"
            style={{ color: winner?.colorHex || '#fff' }}
          >
            {winner?.name} Wins!
          </h1>
          <p className="winner-sub">
            Completed {roundNumber} rounds ({turnsLog.length} total cards
            played)
          </p>

          <div className="final-standings-list">
            {sortedTeams.map((team, idx) => (
              <div
                key={team.id}
                className={`standing-row ${idx === 0 ? 'standing-first' : ''}`}
                style={{
                  borderColor: idx === 0 ? team.colorHex : undefined
                }}
              >
                <div className="standing-rank">
                  {idx === 0 ? (
                    <Award size={20} color="#F59E0B" />
                  ) : (
                    `#${idx + 1}`
                  )}
                </div>
                <div
                  className="team-dot"
                  style={{ backgroundColor: team.colorHex }}
                />
                <div className="standing-info">
                  <div className="standing-name">{team.name}</div>
                  <div className="standing-meta">
                    {cardsClearedCount[team.id] || 0} Perfect Sweeps
                  </div>
                </div>
                <div className="standing-score">{scores[team.id] || 0} pts</div>
              </div>
            ))}
          </div>

          <div className="gameover-actions">
            <button className="btn-start-match" onClick={handleStartMatch}>
              <RotateCcw size={20} /> Play Rematch
            </button>
            <button
              className="btn-premium"
              style={{ width: '100%' }}
              onClick={() => setPhase('lobby')}
            >
              Return to Match Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
