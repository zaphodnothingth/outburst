import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Copy,
  Check,
  Sparkles,
  Filter,
  Search
} from 'lucide-react';
import { CANDIDATE_TOPIC_IDEAS } from '../data/candidateIdeas';
import { DECK_CATEGORIES } from '../data/starterCards';

const LS_PICKER_KEY = 'outburst_selected_topic_ideas_v1';

export const TopicIdeaPicker: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LS_PICKER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default to all selected so user can unclick ones they don't want, or click Select None
    return CANDIDATE_TOPIC_IDEAS.map((i) => i.id);
  });

  const [activeDeckFilter, setActiveDeckFilter] = useState<string>('All');
  const [searchText, setSearchText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(LS_PICKER_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  const toggleIdea = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredIdeas = CANDIDATE_TOPIC_IDEAS.filter((idea) => {
    const matchesDeck =
      activeDeckFilter === 'All' || idea.deck === activeDeckFilter;
    const matchesSearch =
      !searchText.trim() ||
      idea.title.toLowerCase().includes(searchText.toLowerCase()) ||
      idea.sampleHint.toLowerCase().includes(searchText.toLowerCase());
    return matchesDeck && matchesSearch;
  });

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredIdeas.map((i) => i.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleUnselectAllFiltered = () => {
    const filteredSet = new Set(filteredIdeas.map((i) => i.id));
    setSelectedIds((prev) => prev.filter((id) => !filteredSet.has(id)));
  };

  const handleCopySelected = () => {
    const chosen = CANDIDATE_TOPIC_IDEAS.filter((i) =>
      selectedIds.includes(i.id)
    );
    const summary = chosen
      .map((i) => `[${i.deck}] ${i.title}`)
      .join('\n');
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const decksWithIdeas = Array.from(
    new Set(CANDIDATE_TOPIC_IDEAS.map((i) => i.deck))
  );

  return (
    <div className="arena-container animate-fadein">
      <div className="section-card glass-panel">
        <div className="flex-row-center" style={{ marginBottom: 10 }}>
          <div>
            <div className="hero-badge" style={{ marginBottom: 4 }}>
              <Sparkles size={13} /> INTERACTIVE TOPIC CURATOR
            </div>
            <h2>Click / Unclick Categories to Build</h2>
            <p>
              Tap any card below to toggle it ON or OFF. Once you&apos;ve picked your favorites, hit <strong>Copy Selected ({selectedIds.length})</strong> and paste them in chat (or just tell me you&apos;re done)!
            </p>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="picker-toolbar">
          <div className="picker-count-pill">
            <strong>{selectedIds.length}</strong> / {CANDIDATE_TOPIC_IDEAS.length} Selected
          </div>

          <div className="picker-bulk-btns">
            <button className="btn-chip" onClick={handleSelectAllFiltered}>
              <CheckSquare size={14} /> Select Visible ({filteredIdeas.length})
            </button>
            <button className="btn-chip" onClick={handleUnselectAllFiltered}>
              <Square size={14} /> Clear Visible
            </button>
            <button
              className="btn-chip-primary"
              onClick={handleCopySelected}
              disabled={selectedIds.length === 0}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied List!' : `Copy Selected (${selectedIds.length})`}
            </button>
          </div>
        </div>

        {/* Filter by Generation / Meta-Category Deck */}
        <div className="deck-toggles-label" style={{ marginTop: 12 }}>
          <Filter size={13} /> Filter by Generation or Theme:
        </div>
        <div className="deck-pills-wrap">
          <button
            className={`deck-filter-chip ${activeDeckFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveDeckFilter('All')}
          >
            All Ideas ({CANDIDATE_TOPIC_IDEAS.length})
          </button>
          {DECK_CATEGORIES.filter((d) => decksWithIdeas.includes(d)).map((deck) => {
            const totalInDeck = CANDIDATE_TOPIC_IDEAS.filter(
              (i) => i.deck === deck
            ).length;
            const selectedInDeck = CANDIDATE_TOPIC_IDEAS.filter(
              (i) => i.deck === deck && selectedIds.includes(i.id)
            ).length;

            return (
              <button
                key={deck}
                className={`deck-filter-chip ${
                  activeDeckFilter === deck ? 'active' : ''
                }`}
                onClick={() => setActiveDeckFilter(deck)}
              >
                <span>{deck}</span>
                <span className="deck-count-badge">
                  {selectedInDeck}/{totalInDeck}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="search-box" style={{ marginTop: 12 }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="input-premium search-input"
            placeholder="Filter ideas by keyword (e.g. 1980s, sports, kids, food)..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* Clickable Grid of 90 Candidate Categories */}
      <div className="ideas-picker-grid">
        {filteredIdeas.map((idea) => {
          const isSelected = selectedIds.includes(idea.id);
          return (
            <div
              key={idea.id}
              className={`idea-pick-card ${isSelected ? 'selected' : 'unselected'}`}
              onClick={() => toggleIdea(idea.id)}
            >
              <div className="idea-pick-check">
                {isSelected ? (
                  <Check size={16} strokeWidth={3} />
                ) : null}
              </div>
              <div className="idea-pick-body">
                <div className="idea-pick-deck">{idea.deck}</div>
                <div className="idea-pick-title">{idea.title}</div>
                <div className="idea-pick-hint">{idea.sampleHint}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
