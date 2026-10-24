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
  Clock,
  Pause,
  Check,
  Award,
  Zap,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CategoryCard,
  Team,
  GameSettings,
  GamePhase,
  TurnLog,
  MatchRecord
} from '../types/game';
import { sound } from '../utils/SoundManager';

interface GameArenaProps {
  activeTeams: Team[];
  settings: GameSettings;
  availableCards: CategoryCard[];
  playedCardIds: string[];
  onMarkCardPlayed: (cardId: string) => void;
  onResetPlayedCards: () => void;
  onCompleteMatch: (record: MatchRecord, updatedStats: {
    teamId: string;
    points: number;
    won: boolean;
    cardsCleared: number;
  }[]) => void;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onOpenTeamSelect: () => void;
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
  onOpenTeamSelect
}) => {
  // Match state
  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [currentTeamIdx, setCurrentTeamIdx] = useState<number>(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [passesLeft, setPassesLeft] = useState<Record<string, number>>({});
  const [cardsClearedCount, setCardsClearedCount] = useState<Record<string, number>>({});
  const [turnsLog, setTurnsLog] = useState<TurnLog[]>([]);

  // Active turn state
  const [currentCard, setCurrentCard] = useState<CategoryCard | null>(null);
  const [bonusIndex, setBonusIndex] = useState<number | null>(null);
  const [guessedIndices, setGuessedIndices] = useState<number[]>([]);
  const [stolenIndices, setStolenIndices] = useState<number[]>([]);
  const [stealingTeamId, setStealingTeamId] = useState<string | null>(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(settings.timerSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(sound.getSoundEnabled());

  const timerRef = useRef<number | null>(null);

  const currentTeam = activeTeams[currentTeamIdx] || activeTeams[0];
  const nextTeam = activeTeams[(currentTeamIdx + 1) % activeTeams.length] || activeTeams[0];

  // Filter cards by selected decks
  const deckFilteredCards = availableCards.filter((c) =>
    settings.selectedDecks.includes(c.deck)
  );
  const unplayedPool = deckFilteredCards.filter(
    (c) => !playedCardIds.includes(c.id)
  );

  // Draw a random card
  const drawNextCard = (excludeId?: string): CategoryCard => {
    let pool = unplayedPool.filter((c) => c.id !== excludeId);
    if (pool.length === 0) {
      // Auto-cycle if all cards in selected decks were played
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

    setScores(initScores);
    setPassesLeft(initPasses);
    setCardsClearedCount(initCleared);
    setTurnsLog([]);
    setRoundNumber(1);
    setCurrentTeamIdx(0);

    prepareNextTurn(drawNextCard());
  };

  const prepareNextTurn = (card: CategoryCard) => {
    setCurrentCard(card);
    setGuessedIndices([]);
    setStolenIndices([]);
    setStealingTeamId(activeTeams.length >= 2 ? activeTeams[(currentTeamIdx + 1) % activeTeams.length]?.id : null);
    setBonusIndex(
      settings.bonusTargetEnabled ? Math.floor(Math.random() * 10) : null
    );
    setTimeLeft(settings.timerSeconds);
    setIsPaused(false);
    setPhase('ready');
  };

  // Update default stealingTeamId when currentTeamIdx changes
  useEffect(() => {
    if (activeTeams.length >= 2) {
      const nextIdx = (currentTeamIdx + 1) % activeTeams.length;
      setStealingTeamId(activeTeams[nextIdx].id);
    }
  }, [currentTeamIdx, activeTeams]);

  // Pass / Skip Card before timer starts
  const handleSkipCard = () => {
    if (!currentTeam || !currentCard) return;
    const remaining = passesLeft[currentTeam.id] ?? 0;
    if (remaining <= 0) return;

    sound.playCardSwap();
    setPassesLeft((prev) => ({
      ...prev,
      [currentTeam.id]: prev[currentTeam.id] - 1
    }));

    const nextCard = drawNextCard(currentCard.id);
    setCurrentCard(nextCard);
    setBonusIndex(
      settings.bonusTargetEnabled ? Math.floor(Math.random() * 10) : null
    );
  };

  // Start 60s Timer!
  const handleBeginCountdown = () => {
    if (!currentCard) return;
    onMarkCardPlayed(currentCard.id);
    sound.playRoundStart();
    if (sound.getSpeechEnabled()) {
      sound.speak(currentCard.title);
    }
    setTimeLeft(settings.timerSeconds);
    setIsPaused(false);
    setPhase('active');
  };

  // Timer effect
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
          // Transition to steal or summary
          setPhase((currentPhase) => {
            if (currentPhase === 'active') {
              return settings.stealEnabled ? 'steal' : 'summary';
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
  }, [phase, isPaused, settings.stealEnabled]);

  // Toggle a target during active round (or grace toggle during steal/summary)
  const handleToggleTarget = (index: number) => {
    if (guessedIndices.includes(index)) {
      sound.playTargetUndo();
      setGuessedIndices((prev) => prev.filter((i) => i !== index));
    } else {
      // Remove from stolen if it was marked stolen
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

      // If all 10 targets are cleared during active phase!
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
    if (guessedIndices.includes(index)) return; // Already earned by active team

    if (stolenIndices.includes(index)) {
      sound.playTargetUndo();
      setStolenIndices((prev) => prev.filter((i) => i !== index));
    } else {
      if (stolenIndices.length >= settings.maxStealsPerCard) {
        return; // Max steals reached
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

  // Commit turn scores and move to next team or end match
  const handleCommitTurnAndAdvance = () => {
    if (!currentCard || !currentTeam) return;

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

    // Check if match ends! (Only check at the end of a full rotation so every team gets equal turns)
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

      // End if target or rounds reached AND there isn't a tie (if tied, play sudden death overtime round!)
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

      // Advance to next round rotation
      setRoundNumber((r) => r + 1);
      setCurrentTeamIdx(0);
    } else {
      setCurrentTeamIdx((idx) => idx + 1);
    }

    // Draw card for next turn
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

  // 1. LOBBY PHASE
  if (phase === 'lobby') {
    return (
      <div className="arena-container animate-fadein">
        {/* Hero Banner */}
        <div className="hero-card glass-panel">
          <div className="hero-badge">
            <Zap size={15} /> RAPID-FIRE 10-TARGET PARTY GAME
          </div>
          <h1 className="hero-title">Ready to Outburst?</h1>
          <p className="hero-subtitle">
            One team shouts out answers while the reader taps off the 10 targets before the 60-second buzzer sounds!
          </p>

          <div className="deck-status-pill">
            <span>
              <strong>{unplayedPool.length}</strong> fresh cards ready ({deckFilteredCards.length} total in selected decks)
            </span>
            {playedCardIds.length > 0 && (
              <button
                className="btn-link-subtle"
                onClick={onResetPlayedCards}
                title="Mark all cards as unplayed"
              >
                <RotateCcw size={13} /> Reset {playedCardIds.length} played
              </button>
            )}
          </div>
        </div>

        {/* Active Matchup Teams */}
        <div className="section-card glass-card">
          <div className="flex-row-center" style={{ marginBottom: 12 }}>
            <h3 className="section-label">
              <Users size={16} /> Active Teams ({activeTeams.length})
            </h3>
            <button className="btn-chip" onClick={onOpenTeamSelect}>
              Edit Teams
            </button>
          </div>

          <div className="lobby-teams-grid">
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
                    {team.gamesWon}W - {team.gamesPlayed - team.gamesWon}L • {team.totalPointsAllTime} pts
                  </div>
                </div>
                <span className="turn-order-badge">#{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Game Mode & Twists Configuration */}
        <div className="section-card glass-card">
          <h3 className="section-label" style={{ marginBottom: 14 }}>
            <Sparkles size={16} /> Match Rules & Twists
          </h3>

          {/* End Condition Toggle */}
          <div className="rule-row">
            <div>
              <div className="rule-title">Win Condition</div>
              <div className="rule-desc">
                {settings.endCondition === 'target_score'
                  ? `First team to reach ${settings.targetScore} points (equal turns)`
                  : `Highest score after ${settings.totalRounds} rounds per team`}
              </div>
            </div>
            <div className="segmented-control">
              <button
                className={settings.endCondition === 'target_score' ? 'active' : ''}
                onClick={() =>
                  onUpdateSettings({ ...settings, endCondition: 'target_score' })
                }
              >
                Target Score
              </button>
              <button
                className={settings.endCondition === 'fixed_rounds' ? 'active' : ''}
                onClick={() =>
                  onUpdateSettings({ ...settings, endCondition: 'fixed_rounds' })
                }
              >
                Fixed Rounds
              </button>
            </div>
          </div>

          {/* Target Score OR Fixed Rounds Options */}
          {settings.endCondition === 'target_score' ? (
            <div className="rule-options-bar">
              {[30, 50, 60, 75].map((pts) => (
                <button
                  key={pts}
                  className={`option-pill ${settings.targetScore === pts ? 'selected' : ''}`}
                  onClick={() => onUpdateSettings({ ...settings, targetScore: pts })}
                >
                  {pts} pts
                </button>
              ))}
            </div>
          ) : (
            <div className="rule-options-bar">
              {[3, 5, 7, 10].map((rnds) => (
                <button
                  key={rnds}
                  className={`option-pill ${settings.totalRounds === rnds ? 'selected' : ''}`}
                  onClick={() => onUpdateSettings({ ...settings, totalRounds: rnds })}
                >
                  {rnds} Rounds
                </button>
              ))}
            </div>
          )}

          {/* Round Timer */}
          <div className="rule-row" style={{ marginTop: 14 }}>
            <div>
              <div className="rule-title">Round Timer</div>
              <div className="rule-desc">Seconds on the clock per card</div>
            </div>
            <div className="rule-options-inline">
              {[45, 60, 75, 90].map((sec) => (
                <button
                  key={sec}
                  className={`option-pill-sm ${settings.timerSeconds === sec ? 'selected' : ''}`}
                  onClick={() => onUpdateSettings({ ...settings, timerSeconds: sec })}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Twists Toggles */}
          <div className="twists-grid">
            <button
              className={`twist-toggle-card ${settings.bonusTargetEnabled ? 'enabled' : ''}`}
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  bonusTargetEnabled: !settings.bonusTargetEnabled
                })
              }
            >
              <div className="twist-header">
                <Sparkles size={18} className="twist-icon-gold" />
                <span className="twist-badge">
                  {settings.bonusTargetEnabled ? 'ON (+2 PTS)' : 'OFF'}
                </span>
              </div>
              <div className="twist-name">Secret Bonus Target</div>
              <div className="twist-sub">
                1 random item per card is worth 3 pts total!
              </div>
            </button>

            <button
              className={`twist-toggle-card ${settings.stealEnabled ? 'enabled' : ''}`}
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  stealEnabled: !settings.stealEnabled
                })
              }
            >
              <div className="twist-header">
                <Flame size={18} className="twist-icon-cyan" />
                <span className="twist-badge">
                  {settings.stealEnabled ? 'ON (MAX 2)' : 'OFF'}
                </span>
              </div>
              <div className="twist-name">Steal Opportunity</div>
              <div className="twist-sub">
                Opponents can snipe up to 2 missed items after the buzzer!
              </div>
            </button>
          </div>
        </div>

        {/* Start Match CTA */}
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

  // Live Scoreboard Header (Shown in Ready, Active, Steal, Summary)
  const renderScoreboardStrip = () => (
    <div className="scoreboard-strip">
      <div className="scoreboard-meta">
        <span className="round-pill">
          ROUND {roundNumber}
          {settings.endCondition === 'fixed_rounds' ? ` / ${settings.totalRounds}` : ''}
        </span>
        {settings.endCondition === 'target_score' && (
          <span className="goal-pill">Goal: {settings.targetScore} pts</span>
        )}
        <button className="btn-icon-tiny" onClick={toggleSound} title="Toggle Sound">
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
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

  // 2. READY PHASE (Hand device to Reader, preview topic, optional Skip)
  if (phase === 'ready' && currentCard && currentTeam) {
    const teamPasses = passesLeft[currentTeam.id] ?? 0;

    return (
      <div className="arena-container animate-fadein">
        {renderScoreboardStrip()}

        <div
          className="ready-card glass-panel"
          style={{
            borderColor: `${currentTeam.colorHex}77`,
            boxShadow: `0 12px 40px -10px ${currentTeam.colorHex}33`
          }}
        >
          <div
            className="turn-banner-pill"
            style={{ backgroundColor: `${currentTeam.colorHex}33`, color: currentTeam.colorHex }}
          >
            UP NOW: {currentTeam.name.toUpperCase()}
          </div>

          <div className="reader-warning-box">
            <ShieldAlert size={20} style={{ color: '#F59E0B', flexShrink: 0 }} />
            <span>
              <strong>READER / HOST EYES ONLY!</strong> Hand the device to{' '}
              <strong>{nextTeam.name}</strong> (the opposing reader) so{' '}
              <strong>{currentTeam.name}</strong> can&apos;t see the 10 targets!
            </span>
          </div>

          <div className="topic-preview-box">
            <div className="topic-deck-tag">{currentCard.deck}</div>
            <div className="topic-announcement-label">YOUR CATEGORY IS:</div>
            <h2 className="topic-preview-title">&ldquo;{currentCard.title}&rdquo;</h2>
          </div>

          <p className="ready-instructions">
            Read the category title aloud to <strong>{currentTeam.name}</strong>. When they are ready to shout answers, hit <strong>Start {settings.timerSeconds}s Timer</strong>!
          </p>

          <div className="ready-actions">
            <button className="btn-start-timer" onClick={handleBeginCountdown}>
              <Play size={22} fill="currentColor" />
              START {settings.timerSeconds}s TIMER
            </button>

            {teamPasses > 0 && (
              <button className="btn-skip-card" onClick={handleSkipCard}>
                <SkipForward size={17} />
                Pass &amp; Draw New Topic ({teamPasses} left)
              </button>
            )}
          </div>
        </div>

        <button
          className="btn-abort-match"
          onClick={() => {
            if (window.confirm('Exit current match and return to lobby?')) {
              setPhase('lobby');
            }
          }}
        >
          Cancel Match
        </button>
      </div>
    );
  }

  // 3. ACTIVE 60-SECOND ROUND PHASE
  if (phase === 'active' && currentCard && currentTeam) {
    const progressPct = (timeLeft / settings.timerSeconds) * 100;
    const isUrgent = timeLeft <= 10;

    return (
      <div className="arena-container active-round-layout animate-fadein">
        {/* Top Timer & Category Bar */}
        <div className={`live-hud ${isUrgent ? 'urgent-pulse' : ''}`}>
          <div className="hud-top-row">
            <div className="hud-team-badge" style={{ color: currentTeam.colorHex }}>
              <span
                className="team-dot"
                style={{ backgroundColor: currentTeam.colorHex }}
              />
              {currentTeam.name} Guessing
            </div>

            <div className="hud-timer-controls">
              <button
                className="btn-pause-pill"
                onClick={() => setIsPaused((p) => !p)}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <div className={`digital-clock ${isUrgent ? 'clock-danger' : ''}`}>
                <Clock size={18} />
                <span>{timeLeft}s</span>
              </div>
            </div>

            <div className="hud-score-pill">
              <span className="hud-hits">{guessedIndices.length}/10</span>
              <span className="hud-pts">+{turnTotalForActiveTeam} pts</span>
            </div>
          </div>

          {/* Progress Bar */}
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

        {/* 10 Targets Grid (Reader Taps as Guessed!) */}
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
                  <div className="bonus-star-pill" title="Bonus Target (+2 extra pts)">
                    <Sparkles size={13} /> +3
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Early Finish / Time Up Control */}
        <div className="active-footer-bar">
          <span className="footer-hint">
            Tap targets as {currentTeam.name} shouts them!
          </span>
          <button
            className="btn-end-timer-early"
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              setPhase(settings.stealEnabled && guessedIndices.length < 10 ? 'steal' : 'summary');
            }}
          >
            End Timer Early <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // 4. STEAL PHASE (After Buzzer! Opposing team gets a chance to snipe up to 2 missed items, plus grace toggle for buzzer-beaters)
  if (phase === 'steal' && currentCard && currentTeam) {
    const opposingTeams = activeTeams.filter((t) => t.id !== currentTeam.id);
    const activeStealTeam =
      activeTeams.find((t) => t.id === stealingTeamId) || opposingTeams[0];

    return (
      <div className="arena-container active-round-layout animate-fadein">
        <div className="steal-banner glass-panel">
          <div className="steal-header-row">
            <div className="buzzer-pill">TIME&apos;S UP!</div>
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
            <strong>Don&apos;t read the missed items yet!</strong> Give{' '}
            <strong style={{ color: activeStealTeam?.colorHex }}>
              {activeStealTeam?.name}
            </strong>{' '}
            one quick burst to guess up to <strong>{settings.maxStealsPerCard}</strong> missed answers (+1 pt each).
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
                    <Sparkles size={12} /> +3
                  </span>
                )}

                {/* Allow grace adjustment if active team shouted it right at the buzzer */}
                {!isStolen && (
                  <button
                    className="btn-grace-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTarget(idx);
                    }}
                    title={
                      isGuessed
                        ? 'Undo credit for guessing team'
                        : 'Credit buzzer-beater to guessing team'
                    }
                  >
                    {isGuessed ? 'Guessed' : '+Grace'}
                  </button>
                )}
                {isStolen && <span className="stolen-tag">STOLEN +1</span>}
              </div>
            );
          })}
        </div>

        <div className="active-footer-bar">
          <div className="steal-summary-pills">
            <span>
              {currentTeam.name}: <strong>+{turnTotalForActiveTeam} pts</strong>
            </span>
            {stealPoints > 0 && (
              <span style={{ color: activeStealTeam?.colorHex }}>
                • {activeStealTeam?.name} Steal: <strong>+{stealPoints} pts</strong>
              </span>
            )}
          </div>
          <button
            className="btn-primary-glow btn-finish-steal"
            onClick={() => setPhase('summary')}
          >
            Reveal All &amp; Score <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  // 5. TURN SUMMARY PHASE (Shows all 10 answers openly so everyone can see what they missed, plus live standings)
  if (phase === 'summary' && currentCard && currentTeam) {
    const stealTeamObj = activeTeams.find((t) => t.id === stealingTeamId);

    return (
      <div className="arena-container animate-fadein">
        {renderScoreboardStrip()}

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

          {/* Points Breakdown Pills */}
          <div className="points-breakdown-row">
            <span className="breakdown-pill">
              <CheckCircle2 size={14} /> {basePoints} Targets Found (+{basePoints})
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
                <Flame size={14} /> {stealTeamObj.name} Stole {stealPoints} (+{stealPoints})
              </span>
            )}
          </div>

          {/* All 10 Targets Revealed (tappable if host needs a last-second score correction) */}
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
                  title="Tap to toggle if a buzzer-beater needs adjustment"
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

          <button
            className="btn-start-match"
            onClick={handleCommitTurnAndAdvance}
          >
            Save Points &amp; Next Team ({nextTeam.name}) <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // 6. GAME OVER PHASE (Winner Celebration & Match Breakdown)
  if (phase === 'gameover') {
    const sortedTeams = [...activeTeams].sort(
      (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
    );
    const winner = sortedTeams[0];

    return (
      <div className="arena-container animate-fadein">
        <div className="gameover-card glass-panel">
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
            Completed {roundNumber} rounds ({turnsLog.length} total cards played)
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
                  {idx === 0 ? <Award size={20} color="#F59E0B" /> : `#${idx + 1}`}
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
