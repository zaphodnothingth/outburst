import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trophy,
  Trash2,
  Check,
  Download,
  Upload,
  History,
  Award,
  Flame,
  Dices,
  Edit3
} from 'lucide-react';
import { Team, MatchRecord } from '../types/game';
import { exportFullBackup, importFullBackup, PersistedData } from '../utils/storage';

interface TeamManagerProps {
  teams: Team[];
  activeTeamIds: string[];
  matchHistory: MatchRecord[];
  onAddTeam: (name: string, colorHex: string) => void;
  onRenameTeam: (teamId: string, newName: string) => void;
  onToggleActiveTeam: (teamId: string) => void;
  onDeleteTeam: (teamId: string) => void;
  onClearHistory: () => void;
  onRestoreBackup: (data: PersistedData) => void;
}

const TEAM_COLORS = [
  '#06B6D4', // Cyan
  '#F43F5E', // Rose
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#F97316'  // Orange
];

const FUN_TEAM_NAMES = [
  'Guys',
  'Girls',
  'Loudmouths',
  'Brain Freeze',
  'Buzzer Beaters',
  'Mind Readers',
  'Overthinkers',
  'Chaos Crew',
  'Rapid Fire',
  'Screaming Eagles',
  'Couch Potatoes',
  'Quizards of Oz',
  'Smarty Pints',
  'Wait What?!',
  'Wild Guesses',
  'Full Throttle',
  'No Cap Clan',
  'Old School Legends',
  'Snack Attack',
  'Hot Mic',
  'Plot Twist',
  'Panic Button',
  'High Voltage',
  'Victory Lap'
];

export const TeamManager: React.FC<TeamManagerProps> = ({
  teams,
  activeTeamIds,
  matchHistory,
  onAddTeam,
  onRenameTeam,
  onToggleActiveTeam,
  onDeleteTeam,
  onClearHistory,
  onRestoreBackup
}) => {
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[2]);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editNameVal, setEditNameVal] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');

  const pickRandomTeamName = (): string => {
    const existingNames = new Set(teams.map((t) => t.name.toLowerCase()));
    const available = FUN_TEAM_NAMES.filter(
      (n) => !existingNames.has(n.toLowerCase()) && n !== newTeamName
    );
    const pool = available.length > 0 ? available : FUN_TEAM_NAMES;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleGenerateTeamName = () => {
    setNewTeamName(pickRandomTeamName());
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newTeamName.trim() || pickRandomTeamName();
    onAddTeam(finalName, selectedColor);
    setNewTeamName('');
    const nextColor =
      TEAM_COLORS[(TEAM_COLORS.indexOf(selectedColor) + 1) % TEAM_COLORS.length];
    setSelectedColor(nextColor);
  };

  const handleExport = () => {
    const json = exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outburst-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const restored = importFullBackup(String(reader.result));
      if (restored) {
        onRestoreBackup(restored);
        setImportStatus('Backup restored successfully!');
        setTimeout(() => setImportStatus(''), 3500);
      } else {
        setImportStatus('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="arena-container animate-fadein">
      {/* Create & Toggle Teams */}
      <div className="section-card glass-panel">
        <div className="flex-row-center" style={{ marginBottom: 12 }}>
          <div>
            <h2>Teams &amp; Lineup</h2>
            <p>Select 2 to 4 teams for your active match rotation.</p>
          </div>
          <span className="round-pill">{activeTeamIds.length} Active</span>
        </div>

        <form onSubmit={handleCreateTeam} className="create-team-form">
          <div className="create-team-row">
            <input
              type="text"
              className="input-premium"
              placeholder="Team Name (or click Generate)"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <button
              type="button"
              className="btn-chip"
              onClick={handleGenerateTeamName}
              title="Generate a random fun team name"
            >
              <Dices size={16} color="#F59E0B" /> Generate Name
            </button>
            <button type="submit" className="btn-primary-glow btn-chip-primary">
              <Plus size={18} /> Add
            </button>
          </div>
          <div className="color-swatches-row">
            {TEAM_COLORS.map((hex) => (
              <button
                type="button"
                key={hex}
                className={`color-swatch ${selectedColor === hex ? 'selected' : ''}`}
                style={{ backgroundColor: hex }}
                onClick={() => setSelectedColor(hex)}
              />
            ))}
          </div>
        </form>

        <div className="teams-roster-list">
          {teams.map((team) => {
            const isActive = activeTeamIds.includes(team.id);
            const winRate =
              team.gamesPlayed > 0
                ? Math.round((team.gamesWon / team.gamesPlayed) * 100)
                : 0;
            const isEditing = editingTeamId === team.id;

            return (
              <div
                key={team.id}
                className={`roster-team-card ${isActive ? 'active' : ''}`}
                style={{
                  borderColor: isActive ? team.colorHex : undefined
                }}
                onClick={() => {
                  if (!isEditing) onToggleActiveTeam(team.id);
                }}
              >
                <div
                  className="roster-check"
                  style={{
                    backgroundColor: isActive ? team.colorHex : 'transparent',
                    borderColor: team.colorHex
                  }}
                >
                  {isActive && <Check size={14} color="#fff" strokeWidth={3} />}
                </div>

                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <div
                      style={{ display: 'flex', gap: 6, alignItems: 'center' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        className="input-premium"
                        style={{ padding: '5px 10px', fontSize: 14 }}
                        value={editNameVal}
                        onChange={(e) => setEditNameVal(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn-chip"
                        onClick={() => setEditNameVal(pickRandomTeamName())}
                        title="Randomize Name"
                      >
                        <Dices size={14} color="#F59E0B" />
                      </button>
                      <button
                        type="button"
                        className="btn-chip-primary"
                        onClick={() => {
                          if (editNameVal.trim()) {
                            onRenameTeam(team.id, editNameVal.trim());
                          }
                          setEditingTeamId(null);
                        }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="roster-team-name">{team.name}</div>
                  )}
                  <div className="roster-team-stats">
                    <span>
                      <Trophy size={12} /> {team.gamesWon}W / {team.gamesPlayed}G (
                      {winRate}%)
                    </span>
                    <span>• {team.totalPointsAllTime} Lifetime Pts</span>
                    {team.totalCardsCleared > 0 && (
                      <span>
                        • <Flame size={12} /> {team.totalCardsCleared} Sweeps
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{ display: 'flex', gap: 6 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn-icon-tiny"
                    onClick={() => {
                      setEditingTeamId(team.id);
                      setEditNameVal(team.name);
                    }}
                    title="Rename Team"
                  >
                    <Edit3 size={15} />
                  </button>
                  {teams.length > 2 && (
                    <button
                      className="btn-icon-tiny danger"
                      onClick={() => onDeleteTeam(team.id)}
                      title="Delete Team"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match History Log */}
      <div className="section-card glass-card">
        <div className="flex-row-center" style={{ marginBottom: 12 }}>
          <h3 className="section-label">
            <History size={16} /> Year-Long Match History ({matchHistory.length})
          </h3>
          {matchHistory.length > 0 && (
            <button
              className="btn-link-subtle"
              onClick={() => {
                if (window.confirm('Clear match history log?')) {
                  onClearHistory();
                }
              }}
            >
              Clear Log
            </button>
          )}
        </div>

        {matchHistory.length === 0 ? (
          <p className="empty-state-text">
            No completed matches yet. Finish a game to record scores and lifetime team trophies!
          </p>
        ) : (
          <div className="history-list">
            {matchHistory.map((match) => {
              const dateStr = new Date(match.timestamp).toLocaleDateString(
                undefined,
                { month: 'short', day: 'numeric', year: 'numeric' }
              );
              const winner = match.teams.find(
                (t) => t.id === match.winnerTeamId
              );

              return (
                <div key={match.id} className="history-item">
                  <div className="history-item-top">
                    <span className="history-winner">
                      <Award size={15} color="#F59E0B" />{' '}
                      {winner?.name || 'Winner'} Won!
                    </span>
                    <span className="history-date">
                      {dateStr} • {match.roundsPlayed} Rnds
                    </span>
                  </div>
                  <div className="history-scores-row">
                    {match.teams.map((t) => (
                      <span
                        key={t.id}
                        className="history-team-pill"
                        style={{ borderColor: `${t.colorHex}66` }}
                      >
                        <span
                          className="score-chip-dot"
                          style={{ backgroundColor: t.colorHex }}
                        />
                        {t.name}: <strong>{t.finalScore}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Long-Term Backup & Restore */}
      <div className="section-card glass-card">
        <h3 className="section-label" style={{ marginBottom: 8 }}>
          <Users size={16} /> Offline Persistence &amp; Device Backup
        </h3>
        <p style={{ marginBottom: 14 }}>
          All teams, stats, played cards, and custom categories are automatically stored in both LocalStorage and IndexedDB. You can also export or restore a backup file anytime:
        </p>

        {importStatus && <div className="status-toast">{importStatus}</div>}

        <div className="grid-2">
          <button className="btn-premium" onClick={handleExport}>
            <Download size={16} /> Export Backup
          </button>
          <label className="btn-premium" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> Restore Backup
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
