# PROJECT_PLAN.md

> **Archived v1 prototype document.** Historical reference only — it describes the Firebase / GitHub Pages build. v2 guidance lives in [../CLAUDE.md](../CLAUDE.md) and [../PLAN-V2.md](../PLAN-V2.md).

# Aim Trainer Portfolio Project Roadmap

## Overview

This document defines the implementation order for the Aim Trainer project.

**Primary Goals**

- Build incrementally.
- Maintain a working application after every milestone.
- Keep commits small and meaningful.
- Never sacrifice architecture for speed.

---

# Milestone 0 — Project Initialization

## Goal

Create a clean development environment.

### Tasks

- [ ] Initialize Vite + React project.
- [ ] Install dependencies.
- [ ] Configure ESLint.
- [ ] Configure Prettier.
- [ ] Create Git repository.
- [ ] Push initial commit.
- [ ] Create folder structure.
- [ ] Configure aliases (optional).
- [ ] Create README.
- [ ] Create CLAUDE.md.

Deliverable:

A clean React application running locally.

---

# Milestone 1 — Application Layout

## Goal

Build the application shell.

### Tasks

- [ ] Navbar
- [ ] Main layout
- [ ] Footer
- [ ] Home page
- [ ] Placeholder Play page
- [ ] Placeholder Leaderboard page
- [ ] Placeholder Profile page
- [ ] 404 page
- [ ] React Router configuration

Deliverable:

Navigation works across pages.

---

# Milestone 2 — Styling System

## Goal

Create a reusable design system.

### Tasks

- [ ] Define color palette.
- [ ] Typography scale.
- [ ] Button component.
- [ ] Card component.
- [ ] Modal component.
- [ ] Theme variables.
- [ ] Responsive spacing.
- [ ] Dark mode.

Deliverable:

Consistent UI components.

---

# Milestone 3 — Canvas Integration

## Goal

Display an interactive game canvas.

### Tasks

- [ ] Create GameCanvas component.
- [ ] Initialize Canvas context.
- [ ] Handle resizing.
- [ ] Create animation loop.
- [ ] Draw test circle.
- [ ] Display FPS counter (debug).

Deliverable:

Animated canvas rendering.

---

# Milestone 4 — Game Engine

## Goal

Separate gameplay from React.

### Tasks

- [ ] Create GameEngine class.
- [ ] Start/stop engine.
- [ ] Update loop.
- [ ] Render loop.
- [ ] Delta time calculations.
- [ ] Pause support.

Deliverable:

Reusable game engine.

---

# Milestone 5 — Target System

## Goal

Spawn clickable targets.

### Tasks

- [ ] Target class.
- [ ] Random spawn.
- [ ] Variable size.
- [ ] Spawn timer.
- [ ] Prevent overlap.
- [ ] Remove hit targets.

Deliverable:

Targets continuously appear.

---

# Milestone 6 — Input System

## Goal

Allow user interaction.

### Tasks

- [ ] Mouse position.
- [ ] Click detection.
- [ ] Collision testing.
- [ ] Hit registration.
- [ ] Miss detection.

Deliverable:

Targets can be clicked.

---

# Milestone 7 — Scoring

## Goal

Track player performance.

### Tasks

- [ ] Score counter.
- [ ] Hit counter.
- [ ] Miss counter.
- [ ] Combo counter.
- [ ] Combo multiplier.
- [ ] Accuracy calculation.

Deliverable:

Live statistics.

---

# Milestone 8 — Timer

## Goal

Timed matches.

### Tasks

- [ ] Countdown timer.
- [ ] Pause timer.
- [ ] End game.
- [ ] Restart game.

Deliverable:

30-second matches.

---

# Milestone 9 — Results Screen

## Goal

Display match statistics.

### Tasks

- [ ] Modal.
- [ ] Final score.
- [ ] Accuracy.
- [ ] Reaction time.
- [ ] Restart button.

Deliverable:

Complete gameplay loop.

---

# Milestone 10 — Particle Effects

## Goal

Improve visual polish.

### Tasks

- [ ] Particle class.
- [ ] Burst animation.
- [ ] Fade out.
- [ ] Floating score text.

Deliverable:

Responsive hit effects.

---

# Milestone 11 — Sound

## Goal

Improve feedback.

### Tasks

- [ ] Click sound.
- [ ] Hit sound.
- [ ] Countdown.
- [ ] Game over.
- [ ] Mute toggle.

Deliverable:

Responsive audio.

---

# Milestone 12 — Themes

## Goal

Personalization.

### Tasks

- [ ] Theme selector.
- [ ] Save preference.
- [ ] Restore preference.
- [ ] Multiple themes.

Deliverable:

Theme persistence.

---

# Milestone 13 — Firebase Setup

## Goal

Backend integration.

### Tasks

- [ ] Firebase project.
- [ ] Install SDK.
- [ ] Configure environment variables.
- [ ] Initialize Firebase.

Deliverable:

Connected backend.

---

# Milestone 14 — Authentication

## Goal

Google login.

### Tasks

- [ ] Google provider.
- [ ] Login.
- [ ] Logout.
- [ ] Auth context.
- [ ] Protected routes.

Deliverable:

Authenticated users.

---

# Milestone 15 — Firestore

## Goal

Persistent storage.

### Tasks

- [ ] Users collection.
- [ ] Scores collection.
- [ ] Save score.
- [ ] Update profile.
- [ ] Read data.

Deliverable:

Cloud persistence.

---

# Milestone 16 — Leaderboards

## Goal

Global rankings.

### Tasks

- [ ] Query scores.
- [ ] Sort descending.
- [ ] Top 100.
- [ ] Personal best.
- [ ] Weekly leaderboard.
- [ ] Daily leaderboard.

Deliverable:

Live rankings.

---

# Milestone 17 — Profile

## Goal

Player dashboard.

### Tasks

- [ ] Avatar.
- [ ] Username.
- [ ] Highest score.
- [ ] Games played.
- [ ] Accuracy.
- [ ] Favorite mode.

Deliverable:

Persistent profile.

---

# Milestone 18 — Game Modes

## Precision

- [ ] Large targets.

## Speed

- [ ] Fast spawning.

## Gridshot

- [ ] Three simultaneous targets.

## Tracking

- [ ] Moving targets.

## Flick

- [ ] Expiring targets.

Deliverable:

Multiple playable modes.

---

# Milestone 19 — Difficulty Scaling

### Tasks

- [ ] Smaller targets.
- [ ] Faster targets.
- [ ] Higher scoring.
- [ ] Spawn frequency scaling.

Deliverable:

Increasing challenge.

---

# Milestone 20 — Statistics

### Tasks

- [ ] Average reaction time.
- [ ] Best reaction time.
- [ ] Worst reaction time.
- [ ] Longest combo.
- [ ] Session history.

Deliverable:

Detailed analytics.

---

# Milestone 21 — Polish

### Tasks

- [ ] Loading screen.
- [ ] Better transitions.
- [ ] Improved animations.
- [ ] Responsive layout.
- [ ] Mobile improvements.

Deliverable:

Professional UI.

---

# Milestone 22 — Accessibility

### Tasks

- [ ] Keyboard support.
- [ ] Focus states.
- [ ] Reduced motion.
- [ ] High contrast mode.
- [ ] Screen reader labels.

Deliverable:

Accessible experience.

---

# Milestone 23 — Optimization

### Tasks

- [ ] Profile renders.
- [ ] Memoize components.
- [ ] Optimize Canvas drawing.
- [ ] Reduce allocations.
- [ ] Improve loading speed.

Deliverable:

Smooth 60 FPS gameplay.

---

# Milestone 24 — Testing

### Tasks

- [ ] Score calculations.
- [ ] Collision detection.
- [ ] Accuracy calculations.
- [ ] Firebase services.
- [ ] React components.

Deliverable:

Reliable application.

---

# Milestone 25 — Deployment

### Tasks

- [ ] Production build.
- [ ] Deploy to Github Pages.
- [ ] Configure environment variables.
- [ ] Verify authentication.
- [ ] Verify Firestore.

Deliverable:

Publicly accessible application.

---

# Stretch Goals

## Analytics

- [ ] Score history charts.
- [ ] Accuracy charts.
- [ ] Improvement graphs.

---

## Achievements

- [ ] 100 Games Played.
- [ ] 95% Accuracy.
- [ ] 100 Combo.
- [ ] New Personal Best.

---

## Daily Challenge

- [ ] Seeded challenge.
- [ ] Daily leaderboard.
- [ ] Crown indicator.

---

## Heatmaps

- [ ] Store click positions.
- [ ] Visualize misses.
- [ ] Visualize hits.

---

## Replay System

- [ ] Save match.
- [ ] Replay inputs.
- [ ] Export replay.

---

## Future Multiplayer

- [ ] Friend leaderboard.
- [ ] Invite links.
- [ ] Live competitions.

---

# Definition of Done

A feature is considered complete when:

- It functions correctly.
- It is responsive.
- It follows project architecture.
- It includes appropriate error handling.
- It is visually polished.
- It has been manually tested.
- It does not introduce regressions.

---

# Final Portfolio Checklist

- [ ] Google Authentication
- [ ] Firestore Integration
- [ ] Responsive Design
- [ ] Canvas Game Engine
- [ ] Multiple Game Modes
- [ ] Persistent Profiles
- [ ] Leaderboards
- [ ] Theme Support
- [ ] Particle Effects
- [ ] Sound Effects
- [ ] Accessibility Features
- [ ] Performance Optimizations
- [ ] Clean Codebase
- [ ] Production Deployment
- [ ] Comprehensive README
- [ ] Live Demo