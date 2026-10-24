import React, { useState } from 'react';
import {
  Plus,
  Search,
  Layers,
  RotateCcw,
  Trash2,
  Edit3,
  CheckCircle,
  Sparkles,
  FileJson,
  X
} from 'lucide-react';
import { CategoryCard } from '../types/game';
import { DECK_CATEGORIES } from '../data/starterCards';

interface DeckManagerProps {
  allCards: CategoryCard[];
  customCards: CategoryCard[];
  playedCardIds: string[];
  selectedDecks: string[];
  onToggleDeck: (deck: string) => void;
  onAddOrUpdateCustomCard: (card: CategoryCard) => void;
  onDeleteCustomCard: (id: string) => void;
  onResetPlayedCards: () => void;
}

export const DeckManager: React.FC<DeckManagerProps> = ({
  allCards,
  customCards,
  playedCardIds,
  selectedDecks,
  onToggleDeck,
  onAddOrUpdateCustomCard,
  onDeleteCustomCard,
  onResetPlayedCards
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDeck, setFilterDeck] = useState<string>('All');
  const [revealItemsCardId, setRevealItemsCardId] = useState<string | null>(null);

  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardTitle, setCardTitle] = useState('');
  const [cardDeck, setCardDeck] = useState<CategoryCard['deck']>('Custom');
  const [itemsText, setItemsText] = useState('');
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [editorError, setEditorError] = useState('');

  const openNewCardModal = () => {
    setEditingCardId(null);
    setCardTitle('');
    setCardDeck('Custom');
    setItemsText('');
    setEditorError('');
    setIsEditorOpen(true);
  };

  const openEditCardModal = (card: CategoryCard) => {
    setEditingCardId(card.id);
    setCardTitle(card.title);
    setCardDeck(card.deck);
    setItemsText(card.items.join('\n'));
    setEditorError('');
    setIsEditorOpen(true);
  };

  const handleSaveCard = () => {
    const cleanTitle = cardTitle.trim();
    const lines = itemsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!cleanTitle) {
      setEditorError('Please enter a category title.');
      return;
    }
    if (lines.length !== 10) {
      setEditorError(`Outburst cards require exactly 10 targets (currently ${lines.length} lines).`);
      return;
    }

    const newCard: CategoryCard = {
      id: editingCardId || `custom-${Date.now()}`,
      title: cleanTitle,
      deck: cardDeck,
      difficulty: 'Medium',
      items: lines,
      isCustom: true
    };

    onAddOrUpdateCustomCard(newCard);
    setIsEditorOpen(false);
  };

  const handleBulkImport = () => {
    try {
      const parsed = JSON.parse(bulkJsonText);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      let importedCount = 0;

      list.forEach((entry, idx) => {
        if (
          entry &&
          typeof entry.title === 'string' &&
          Array.isArray(entry.items) &&
          entry.items.length === 10
        ) {
          onAddOrUpdateCustomCard({
            id: entry.id || `custom-${Date.now()}-${idx}`,
            title: entry.title.trim(),
            deck: entry.deck || 'Custom',
            items: entry.items.map((x: unknown) => String(x).trim()),
            isCustom: true
          });
          importedCount++;
        }
      });

      if (importedCount === 0) {
        setEditorError('No valid 10-item cards found in JSON.');
        return;
      }
      setBulkJsonText('');
      setIsBulkOpen(false);
    } catch {
      setEditorError('Invalid JSON format. Make sure it is an array of { "title": "...", "items": [10 strings] }.');
    }
  };

  const filteredCards = allCards.filter((card) => {
    const matchesDeck = filterDeck === 'All' || card.deck === filterDeck;
    const matchesSearch =
      !searchQuery.trim() ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDeck && matchesSearch;
  });

  return (
    <div className="arena-container animate-fadein">
      {/* Header & Deck Stats */}
      <div className="section-card glass-panel">
        <div className="flex-row-center" style={{ marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 20 }}>Category Decks &amp; Card Creator</h2>
            <p>
              {allCards.length} total cards ({customCards.length} custom) •{' '}
              {allCards.length - playedCardIds.length} unplayed
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-chip" onClick={() => setIsBulkOpen(true)}>
              <FileJson size={15} /> Bulk Import
            </button>
            <button className="btn-primary-glow btn-chip-primary" onClick={openNewCardModal}>
              <Plus size={16} /> New Card
            </button>
          </div>
        </div>

        {/* Active Deck Selection for Match */}
        <div className="deck-toggles-label">
          <Layers size={14} /> Active Decks in Match Rotation (tap to toggle):
        </div>
        <div className="deck-pills-wrap">
          {DECK_CATEGORIES.map((deck) => {
            const count = allCards.filter((c) => c.deck === deck).length;
            const isSelected = selectedDecks.includes(deck);
            return (
              <button
                key={deck}
                className={`deck-filter-chip ${isSelected ? 'active' : ''}`}
                onClick={() => onToggleDeck(deck)}
              >
                <span>{deck}</span>
                <span className="deck-count-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {playedCardIds.length > 0 && (
          <div className="played-status-bar">
            <span>
              {playedCardIds.length} cards marked as played so they won&apos;t repeat.
            </span>
            <button className="btn-link-subtle" onClick={onResetPlayedCards}>
              <RotateCcw size={13} /> Reset Played History
            </button>
          </div>
        )}
      </div>

      {/* Browse & Search Bar */}
      <div className="search-filter-row">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="input-premium search-input"
            placeholder="Search category titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="deck-select"
          value={filterDeck}
          onChange={(e) => setFilterDeck(e.target.value)}
        >
          <option value="All">All Decks ({allCards.length})</option>
          {DECK_CATEGORIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Card List (Spoiler-Protected by Default!) */}
      <div className="cards-browser-list">
        {filteredCards.map((card) => {
          const isPlayed = playedCardIds.includes(card.id);
          const isRevealed = revealItemsCardId === card.id;

          return (
            <div key={card.id} className="browser-card-item glass-card">
              <div className="browser-card-main">
                <div>
                  <div className="browser-card-badges">
                    <span className="deck-tag-mini">{card.deck}</span>
                    {card.isCustom && (
                      <span className="custom-tag-mini">
                        <Sparkles size={11} /> Custom
                      </span>
                    )}
                    {isPlayed && (
                      <span className="played-tag-mini">
                        <CheckCircle size={11} /> Played
                      </span>
                    )}
                  </div>
                  <h3 className="browser-card-title">{card.title}</h3>
                </div>

                <div className="browser-card-actions">
                  <button
                    className="btn-chip"
                    onClick={() =>
                      setRevealItemsCardId(isRevealed ? null : card.id)
                    }
                  >
                    {isRevealed ? 'Hide 10' : 'Peek 10'}
                  </button>
                  {card.isCustom && (
                    <>
                      <button
                        className="btn-icon-tiny"
                        onClick={() => openEditCardModal(card)}
                        title="Edit Card"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        className="btn-icon-tiny danger"
                        onClick={() => onDeleteCustomCard(card.id)}
                        title="Delete Card"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isRevealed && (
                <div className="browser-card-Spoilers">
                  {card.items.map((item, i) => (
                    <span key={i} className="spoiler-item-chip">
                      <strong>{i + 1}.</strong> {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create / Edit Custom 10-Target Card Modal */}
      {isEditorOpen && (
        <div className="action-sheet-overlay" onClick={() => setIsEditorOpen(false)}>
          <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="flex-row-center">
              <h2>{editingCardId ? 'Edit Outburst Card' : 'Create New Outburst Card'}</h2>
              <button className="btn-icon-tiny" onClick={() => setIsEditorOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {editorError && <div className="form-error-banner">{editorError}</div>}

            <div>
              <label className="field-label">Category Title</label>
              <input
                type="text"
                className="input-premium"
                placeholder="e.g., Things Found in a Camping Tent"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">Deck Category</label>
              <select
                className="input-premium"
                value={cardDeck}
                onChange={(e) => setCardDeck(e.target.value as CategoryCard['deck'])}
              >
                {DECK_CATEGORIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex-row-center">
                <label className="field-label">10 Target Answers (1 per line)</label>
                <span className="line-counter-badge">
                  {
                    itemsText
                      .split('\n')
                      .map((l) => l.trim())
                      .filter(Boolean).length
                  }{' '}
                  / 10 lines
                </span>
              </div>
              <textarea
                className="input-premium textarea-targets"
                rows={10}
                placeholder={
                  'Sleeping Bag\nFlashlight / Lantern\nAir Mattress\nPillow\nBug Spray\n...'
                }
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
              />
            </div>

            <button className="btn-start-match" onClick={handleSaveCard}>
              Save 10-Target Card
            </button>
          </div>
        </div>
      )}

      {/* Bulk JSON Import Modal */}
      {isBulkOpen && (
        <div className="action-sheet-overlay" onClick={() => setIsBulkOpen(false)}>
          <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="flex-row-center">
              <h2>Bulk Import Cards (JSON)</h2>
              <button className="btn-icon-tiny" onClick={() => setIsBulkOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <p>
              Paste an array of cards with <code>title</code>, optional <code>deck</code>, and <code>items</code> (10 strings each):
            </p>
            {editorError && <div className="form-error-banner">{editorError}</div>}
            <textarea
              className="input-premium textarea-targets"
              rows={8}
              placeholder={`[\n  {\n    "title": "Famous Board Games",\n    "deck": "Classic",\n    "items": ["Monopoly", "Scrabble", "Clue", "Risk", "Catan", "Chess", "Checkers", "Trivial Pursuit", "Pictionary", "Outburst"]\n  }\n]`}
              value={bulkJsonText}
              onChange={(e) => setBulkJsonText(e.target.value)}
            />
            <button className="btn-start-match" onClick={handleBulkImport}>
              Import Cards
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
