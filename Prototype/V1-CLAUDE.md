# CLAUDE.md

> **Archived v1 prototype document.** Historical reference only — it describes the Firebase / GitHub Pages build. v2 guidance lives in [../CLAUDE.md](../CLAUDE.md) and [../PLAN-V2.md](../PLAN-V2.md).

# Aim Trainer Portfolio Project

## Purpose

This project is a browser-based aim trainer inspired by Aimlabs.

The objective is **not** to clone Aimlabs feature-for-feature, but to create a polished web application that demonstrates:

- Modern React development
- Interactive Canvas programming
- Authentication
- Cloud databases
- Performance optimization
- Clean architecture
- UI/UX polish

This project should be portfolio quality and something recruiters or admissions reviewers can open in a browser and immediately understand.

---

# Guiding Principles

Whenever implementing features:

1. Prefer readability over cleverness.
2. Favor reusable components.
3. Separate game logic from UI.
4. Keep state predictable.
5. Optimize only when necessary.
6. Build incrementally.

Every feature should feel production-ready.

---

## Git
- Do not include Co-Authored-By or any attribution lines in commit messages.
- Do not push to remote — SSH keys are not available in this environment. The user pushes manually.
- **CRITICAL: Never amend commits that have been pushed upstream.** Always check `git log origin/main..HEAD` before amending. If changes need to be added to a pushed commit, create a new commit instead.
- **CRITICAL: Never force push.**
- `gh pr edit` is broken on this repo (Projects-classic GraphQL deprecation). To edit a PR title/body, use `gh api -X PATCH /repos/{owner}/{repo}/pulls/{n}` instead.
- **Bare `git push` can land on `main` here — always push working branches with an explicit refspec.** A branch created off a remote-tracking ref (e.g. `git checkout -b <feat> test/main`) auto-tracks that ref as upstream, and this environment's `push.default=upstream` makes a bare `git push` send the branch to its upstream — i.e. straight to `main`. Push feature branches with `git push -u test <branch>:refs/heads/<branch>` (the explicit refspec overrides `push.default`, and `-u` repoints upstream to the branch itself). Verify with `git rev-parse --abbrev-ref <branch>@{upstream}` before pushing. (This bit us once: a session's commits went to `main` instead of the feature branch and had to be reverted and re-landed via PR.)


# Tech Stack

## Frontend

- React
- Vite
- JavaScript (ES2022+)
- HTML5 Canvas
- CSS Modules or Tailwind CSS

## Backend

Firebase

- Authentication
- Firestore
- Hosting (optional)

## Development

- ESLint
- Prettier
- Git
- GitHub

---

# Architecture

```
Browser

│

├── React
│
├── Canvas
│
└── Firebase
```

React owns:

- menus
- routing
- authentication
- settings
- statistics
- leaderboard

Canvas owns:

- rendering
- collision
- particles
- animations
- game loop

Firebase owns:

- users
- scores
- authentication

---

# Folder Structure

```
src/

components/

pages/

hooks/

services/

contexts/

game/

utils/

styles/

assets/

firebase/
```

Example:

```
src

components
    Navbar
    Sidebar
    Leaderboard
    Statistics
    LoginButton
    Timer
    ProfileCard

pages
    Home
    Play
    Leaderboards
    Profile
    Settings

hooks
    useGame
    useTimer
    useLeaderboard
    useFirebase

game
    GameEngine
    Target
    Particle
    Collision
    Renderer

services
    auth
    firestore

utils
    math
    random
    scoring

firebase
    config
```

---

# React Responsibilities

React should manage:

- routing
- login
- logout
- game menu
- difficulty
- timer display
- statistics
- profile
- achievements
- leaderboards
- theme

React should NOT animate targets.

---

# Canvas Responsibilities

Canvas handles:

- drawing
- targets
- explosions
- hit detection
- animations
- particle systems
- movement

Everything visual during gameplay belongs here.

---

# State

React state should include

```
score

hits

misses

accuracy

gameRunning

timeRemaining

difficulty

mode

theme

currentUser
```

Game-specific objects should stay inside GameEngine.

---

# Game Loop

Use

```
requestAnimationFrame()
```

Structure

```
update()

↓

collision()

↓

render()

↓

repeat
```

Avoid React re-rendering every frame.

---

# Game Modes

## Precision

Large circles.

Focus on accuracy.

---

## Speed

Smaller targets.

Fast spawning.

Higher score multiplier.

---

## Gridshot

Three targets.

When one dies:

Spawn another immediately.

---

## Tracking

Moving targets.

Bounce around.

---

## Flick

Targets disappear after a short lifespan.

---

## Survival

Targets continually become harder.

Game ends after too many misses.

---

# Scoring

Track

- score
- hits
- misses
- combo
- max combo
- reaction time
- average reaction time
- best reaction time
- worst reaction time

---

# Statistics Screen

Display

Highest Score

Average Score

Games Played

Accuracy

Favorite Mode

Reaction Time

Daily Rank

Weekly Rank

---

# Firebase

Collections

```
users

scores

achievements
```

User document

```json
{
  "uid": "...",
  "displayName": "...",
  "photoURL": "...",
  "highestScore": 0,
  "gamesPlayed": 0,
  "averageAccuracy": 0,
  "favoriteMode": ""
}
```

Score document

```json
{
  "uid": "...",
  "mode": "Gridshot",
  "score": 287,
  "accuracy": 95,
  "reactionTime": 258,
  "date": "2026-07-06"
}
```

---

# Authentication

Google Sign-In only.

No custom login.

If signed in

Show

```
Profile

Play

Leaderboards

Settings
```

Otherwise

```
Continue with Google
```

---

# Leaderboards

Views

All Time

Today

This Week

Monthly

Personal Best

Future

Friends

---

# Difficulty Scaling

As time increases

Targets become

- smaller

- faster

- worth more points

- spawn farther apart

---

# UI

Keep UI minimal.

Lots of whitespace.

Rounded corners.

Soft shadows.

Smooth transitions.

Dark mode first.

---

# Themes

Dark

Cyberpunk

Terminal

Aimlabs

Light

Remember theme with localStorage.

---

# Animations

Click

↓

Shrink

↓

Particle burst

↓

Floating score

↓

Remove

Everything should feel responsive.

---

# Sound

Small click

Pop

Countdown

Game Over

New High Score

Mute toggle.

---

# Accessibility

Keyboard navigation.

Colorblind-friendly palettes.

Reduced motion option.

Scalable text.

---

# Performance

Minimize React renders.

Reuse objects.

Avoid unnecessary allocations.

Cache images.

Use requestAnimationFrame.

Keep 60 FPS.

---

# Coding Standards

Prefer

```
const

arrow functions

small components

single responsibility
```

Avoid

Huge files

Duplicate logic

Nested conditionals

Magic numbers

---

# Component Philosophy

Components should do one thing well.

Good

```
Leaderboard.jsx
```

Bad

```
GameEverything.jsx
```

---

# Hooks

Prefer custom hooks.

Examples

```
useGame()

useTimer()

useFirebase()

useTheme()

useLeaderboard()
```

---

# Utility Functions

Examples

```
calculateAccuracy()

calculateCombo()

spawnTarget()

randomPosition()

distance()

clamp()
```

---

# Testing

Future

Vitest

React Testing Library

Test

score calculations

collision detection

timer

accuracy

leaderboard sorting

---

# Roadmap

## Phase 1

Canvas

Targets

Scoring

Timer

Game Over

---

## Phase 2

React UI

Menus

Statistics

Themes

---

## Phase 3

Firebase

Authentication

Firestore

Profiles

---

## Phase 4

Leaderboards

Personal Bests

Charts

Achievements

---

## Phase 5

Animations

Particles

Sound

Settings

Optimization

---

# Stretch Features

Daily Challenge

Heatmaps

Replay Mode

Sensitivity Calibration

Progress Charts

Friend Challenges

Achievements

Season Rankings

---

# Deployment

Deploy using

Firebase Hosting

or

Vercel

Continuous deployment via GitHub.

---

# Portfolio Goals

A reviewer should immediately notice:

- polished UI
- clean code
- architecture
- performance
- authentication
- cloud integration
- enjoyable gameplay

---

# Claude Development Instructions

Whenever generating code:

1. Favor modular architecture.
2. Keep components under ~200 lines when practical.
3. Prefer composition over inheritance.
4. Explain architectural decisions.
5. Avoid premature optimization.
6. Add concise comments for complex logic.
7. Never introduce dependencies without justification.
8. Keep naming consistent.
9. Follow React best practices.
10. Ensure every feature integrates cleanly with the existing architecture.

When multiple implementations are possible:

- Prefer maintainability.
- Prefer readability.
- Prefer scalability.

Assume this project is intended to impress software engineers reviewing a portfolio.