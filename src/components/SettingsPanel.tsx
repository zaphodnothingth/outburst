import React, { useState } from 'react';
import {
  Sliders,
  Volume2,
  VolumeX,
  MessageSquare,
  SkipForward,
  Sparkles,
  Flame,
  Clock,
  Target
} from 'lucide-react';
import { GameSettings } from '../types/game';
import { sound } from '../utils/SoundManager';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
}

export const SettingsPanel: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.getSoundEnabled());
  const [speechEnabled, setSpeechEnabled] = useState(sound.getSpeechEnabled());

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
  };

  const handleToggleSpeech = () => {
    const next = !speechEnabled;
    setSpeechEnabled(next);
    sound.setSpeechEnabled(next);
  };

  return (
    <div className="arena-container animate-fadein">
      <div className="section-card glass-panel">
        <div className="flex-row-center" style={{ marginBottom: 14 }}>
          <div>
            <h2>Game Settings &amp; Rules</h2>
            <p>Customize skip penalties, timers, bonus targets, and audio.</p>
          </div>
          <Sliders size={20} color="#F59E0B" />
        </div>

        {/* Skip / Pass Card Rules */}
        <div className="settings-group">
          <div className="settings-group-title">
            <SkipForward size={15} /> Card Skip / Pass Rule
          </div>
          <p style={{ marginBottom: 10 }}>
            How should passing on a category before the timer starts work?
          </p>

          <div className="segmented-control" style={{ width: '100%', marginBottom: 12 }}>
            <button
              style={{ flex: 1 }}
              className={settings.skipMode === 'point_penalty' ? 'active' : ''}
              onClick={() =>
                onUpdateSettings({ ...settings, skipMode: 'point_penalty' })
              }
            >
              Costs Points (-{settings.skipPenaltyPoints} pts)
            </button>
            <button
              style={{ flex: 1 }}
              className={settings.skipMode === 'limited_free' ? 'active' : ''}
              onClick={() =>
                onUpdateSettings({ ...settings, skipMode: 'limited_free' })
              }
            >
              Free Passes ({settings.passesPerTeam}/game)
            </button>
          </div>

          {settings.skipMode === 'point_penalty' ? (
            <div className="rule-row">
              <div>
                <div className="rule-title">Points Deducted Per Skip</div>
                <div className="rule-desc">
                  Unlimited skips allowed, each costs points (default: 2)
                </div>
              </div>
              <div className="preset-plus-custom">
                {[1, 2].map((pts) => (
                  <button
                    key={pts}
                    className={`option-pill-sm ${
                      settings.skipPenaltyPoints === pts ? 'selected' : ''
                    }`}
                    onClick={() =>
                      onUpdateSettings({ ...settings, skipPenaltyPoints: pts })
                    }
                  >
                    -{pts} pt{pts > 1 ? 's' : ''}
                  </button>
                ))}
                <input
                  type="number"
                  min={0}
                  max={20}
                  className="input-custom-num"
                  value={settings.skipPenaltyPoints}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    onUpdateSettings({ ...settings, skipPenaltyPoints: val });
                  }}
                  title="Custom penalty points"
                />
              </div>
            </div>
          ) : (
            <div className="rule-row">
              <div>
                <div className="rule-title">Free Passes Per Team</div>
                <div className="rule-desc">
                  Number of free skips each team gets per match
                </div>
              </div>
              <div className="preset-plus-custom">
                {[1, 2].map((cnt) => (
                  <button
                    key={cnt}
                    className={`option-pill-sm ${
                      settings.passesPerTeam === cnt ? 'selected' : ''
                    }`}
                    onClick={() =>
                      onUpdateSettings({ ...settings, passesPerTeam: cnt })
                    }
                  >
                    {cnt} Pass{cnt > 1 ? 'es' : ''}
                  </button>
                ))}
                <input
                  type="number"
                  min={0}
                  max={20}
                  className="input-custom-num"
                  value={settings.passesPerTeam}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    onUpdateSettings({ ...settings, passesPerTeam: val });
                  }}
                  title="Custom passes per team"
                />
              </div>
            </div>
          )}
        </div>

        {/* Timer & Score Defaults */}
        <div className="settings-group">
          <div className="settings-group-title">
            <Clock size={15} /> Round Timer &amp; Win Goal
          </div>

          <div className="rule-row" style={{ marginBottom: 12 }}>
            <div>
              <div className="rule-title">Round Timer (Seconds)</div>
              <div className="rule-desc">Pick 45s, 60s, or enter custom</div>
            </div>
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
                  const val = Math.max(5, parseInt(e.target.value, 10) || 60);
                  onUpdateSettings({ ...settings, timerSeconds: val });
                }}
              />
            </div>
          </div>

          <div className="rule-row">
            <div>
              <div className="rule-title">
                <Target size={13} style={{ display: 'inline', marginRight: 4 }} />
                Target Score to Win
              </div>
              <div className="rule-desc">Pick 50, 60, or enter custom</div>
            </div>
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
                  const val = Math.max(5, parseInt(e.target.value, 10) || 50);
                  onUpdateSettings({ ...settings, targetScore: val });
                }}
              />
            </div>
          </div>
        </div>

        {/* Bonus Target & Steal Values */}
        <div className="settings-group">
          <div className="settings-group-title">
            <Sparkles size={15} /> Bonus &amp; Steal Mechanics
          </div>

          <div className="rule-row" style={{ marginBottom: 12 }}>
            <div>
              <div className="rule-title">Secret Bonus Target Extra Points</div>
              <div className="rule-desc">
                Extra points added on top of 1 base point
              </div>
            </div>
            <div className="preset-plus-custom">
              <button
                className={`option-pill-sm ${
                  !settings.bonusTargetEnabled ? 'selected' : ''
                }`}
                onClick={() =>
                  onUpdateSettings({ ...settings, bonusTargetEnabled: false })
                }
              >
                Off
              </button>
              {[2, 3].map((bonus) => (
                <button
                  key={bonus}
                  className={`option-pill-sm ${
                    settings.bonusTargetEnabled &&
                    settings.bonusPointsValue === bonus
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      bonusTargetEnabled: true,
                      bonusPointsValue: bonus
                    })
                  }
                >
                  +{bonus} ({bonus + 1} total)
                </button>
              ))}
            </div>
          </div>

          <div className="rule-row">
            <div>
              <div className="rule-title">
                <Flame size={13} style={{ display: 'inline', marginRight: 4 }} />
                Max Steals Per Card
              </div>
              <div className="rule-desc">
                Missed targets opponents can snipe after review
              </div>
            </div>
            <div className="preset-plus-custom">
              <button
                className={`option-pill-sm ${
                  !settings.stealEnabled ? 'selected' : ''
                }`}
                onClick={() =>
                  onUpdateSettings({ ...settings, stealEnabled: false })
                }
              >
                Off
              </button>
              {[1, 2, 3].map((maxS) => (
                <button
                  key={maxS}
                  className={`option-pill-sm ${
                    settings.stealEnabled && settings.maxStealsPerCard === maxS
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      stealEnabled: true,
                      maxStealsPerCard: maxS
                    })
                  }
                >
                  Max {maxS}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audio & Voice Settings */}
        <div className="settings-group" style={{ marginBottom: 0 }}>
          <div className="settings-group-title">
            <Volume2 size={15} /> Sound &amp; Voice Announcer
          </div>

          <div className="grid-2">
            <button
              className={`twist-toggle-card ${soundEnabled ? 'enabled' : ''}`}
              onClick={handleToggleSound}
            >
              <div className="twist-header">
                {soundEnabled ? (
                  <Volume2 size={18} className="twist-icon-gold" />
                ) : (
                  <VolumeX size={18} />
                )}
                <span className="twist-badge">
                  {soundEnabled ? 'ON' : 'MUTED'}
                </span>
              </div>
              <div className="twist-name">Sound Effects &amp; Buzzer</div>
              <div className="twist-sub">
                Target hit chimes, 10s countdown ticks &amp; buzzer
              </div>
            </button>

            <button
              className={`twist-toggle-card ${speechEnabled ? 'enabled' : ''}`}
              onClick={handleToggleSpeech}
            >
              <div className="twist-header">
                <MessageSquare size={18} className="twist-icon-cyan" />
                <span className="twist-badge">
                  {speechEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="twist-name">Read Category Aloud</div>
              <div className="twist-sub">
                Announces the category title when timer starts
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
