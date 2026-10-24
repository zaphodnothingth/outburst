# Outburst! (Party Edition)

A fast-paced, offline-first Progressive Web App (PWA) built with React + TypeScript + Vite, designed to modernize **Outburst** for phones and tablets (Android & iOS) and deploy seamlessly to GitHub Pages.

## Key Features

1. **Reader / Host Gameplay Flow**:
   - **Lobby**: Configure teams, win conditions (**Target Score** or **Fixed Rounds**), timer duration (45s / 60s / 75s / 90s), and optional gameplay twists.
   - **Ready / Handoff Screen**: Protects the 10 answers until the device is handed to the opposing team's reader. Includes a **Pass / Swap Card** option before starting the clock.
   - **Live 60-Second Round**: All 10 targets fit cleanly on-screen for rapid single-tap checking, with synthesized rising pitch audio feedback, a secret **Bonus Target (+3 pts total)**, and a perfect 10/10 Outburst celebration.
   - **Steal Phase**: When the buzzer sounds, the opposing team gets a quick chance to snipe up to 2 missed targets (+1 pt each), while also offering a `+Grace` button for buzzer-beater answers.
   - **Turn Summary & Reveal**: Shows all 10 targets (Found, Stolen, or Missed) and updates the match standings.

2. **Year-Long Local Persistence**:
   - Dual-layer storage (**LocalStorage + IndexedDB** mirror + `navigator.storage.persist()`) ensures teams, lifetime stats, match history, played card tracking (no accidental repeats), and custom cards survive across months and years.
   - Includes 1-tap **JSON Backup Export & Restore** in the Teams & History tab.

3. **Decks & Custom Card Creator**:
   - Ships with 28 starter cards across 5 decks (*Everyday*, *Food & Drink*, *Classic*, *Pop Culture*, *Geography & Nature*) with spoiler-protected browsing, custom 10-target card creation, and bulk JSON import.
