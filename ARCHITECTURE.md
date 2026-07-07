# ARCHITECTURE.md

# Aim Trainer
## System Architecture

Version: 1.0

---

# Overview

Aim Trainer is a browser-based reaction and precision training application inspired by Aimlabs.

The architecture separates concerns into three independent systems:

```
                Browser

        ┌─────────────────────┐
        │     React UI        │
        └──────────┬──────────┘
                   │
        User Events│
                   ▼
        ┌─────────────────────┐
        │    Game Engine      │
        │ (Canvas Rendering)  │
        └──────────┬──────────┘
                   │
           Statistics / Scores
                   │
                   ▼
        ┌─────────────────────┐
        │ Firebase Backend    │
        └─────────────────────┘
```

Each layer has clearly defined responsibilities.

---

# Core Principles

The application follows these principles:

- Single Responsibility
- Separation of Concerns
- Composition over inheritance
- Pure utility functions where possible
- Stateless rendering
- Reusable components
- Predictable state flow

---

# System Layers

## Layer 1

React

Responsible for:

- Navigation
- Menus
- Routing
- Settings
- Authentication
- Statistics
- Leaderboards
- Theme
- User Profile

React **never** owns gameplay.

---

## Layer 2

Canvas Game Engine

Responsible for:

- Rendering
- Target spawning
- Particle effects
- Physics
- Collision detection
- Animation
- Game timing

The Canvas should be able to run independently from React.

---

## Layer 3

Firebase

Responsible for:

- Authentication
- User data
- High scores
- Leaderboards

No gameplay logic belongs here.

---

# Folder Structure

```
src/

assets/

components/

contexts/

firebase/

game/

hooks/

pages/

services/

styles/

utils/

App.jsx

main.jsx
```

---

# Components

```
components/

Navbar/

Button/

Card/

Modal/

Statistics/

Leaderboard/

ProfileCard/

Timer/

LoadingSpinner/
```

These components should remain mostly presentational.

Business logic belongs elsewhere.

---

# Pages

```
Home

Play

Leaderboards

Profile

Settings

NotFound
```

Pages should compose components.

Avoid placing business logic directly inside page components.

---

# Hooks

Custom hooks encapsulate reusable logic.

```
useAuth()

useTheme()

useGame()

useLeaderboard()

useTimer()

useSettings()
```

Hooks should never directly manipulate Canvas rendering.

---

# Contexts

Contexts store global state.

```
AuthContext

ThemeContext

SettingsContext
```

Avoid creating unnecessary contexts.

Game state should remain inside the Game Engine.

---

# Game Folder

```
game/

GameEngine.js

Renderer.js

Target.js

Particle.js

Spawner.js

Collision.js

Input.js

ScoreManager.js

Timer.js
```

Each file owns one responsibility.

---

# Game Engine

Responsibilities

- start()

- stop()

- reset()

- update()

- render()

GameEngine coordinates every gameplay object.

React should only tell it:

```
Start

Pause

Resume

Stop
```

Nothing more.

---

# Renderer

Owns:

Canvas Context

Drawing

Clearing

Scaling

Animation

The Renderer knows nothing about Firebase or React.

---

# Target

Properties

```
position

radius

velocity

spawnTime

lifespan

value

isAlive
```

Methods

```
draw()

update()

containsPoint()

destroy()
```

---

# Particle

Properties

```
position

velocity

size

opacity

life
```

Methods

```
update()

draw()
```

---

# Collision

Responsibilities

```
Mouse

↓

Target

↓

Hit?

↓

Score
```

Collision code should remain isolated.

---

# Spawner

Spawner creates targets.

Configuration includes

```
spawnRate

minimumDistance

difficulty

targetSize
```

Spawner should never calculate scores.

---

# Score Manager

Owns

```
score

combo

hits

misses

accuracy

reactionTime
```

Methods

```
registerHit()

registerMiss()

calculateAccuracy()

calculateFinalScore()
```

---

# Timer

Owns

```
remainingTime

duration
```

Methods

```
start()

pause()

resume()

reset()
```

---

# Services

```
services/

auth.js

leaderboard.js

users.js

scores.js
```

Services communicate with Firebase.

React components should call services rather than Firebase directly.

---

# Firebase

Collections

```
users

scores

settings

achievements
```

---

# User Document

```
users/{uid}

displayName

photoURL

highestScore

gamesPlayed

averageAccuracy

favoriteMode

createdAt
```

---

# Score Document

```
scores/{id}

uid

mode

score

accuracy

reactionTime

timestamp
```

---

# Authentication Flow

```
App Loads

↓

Check Session

↓

Logged In?

↓

YES → Home

NO → Login
```

---

# Game Flow

```
Home

↓

Play

↓

Initialize Engine

↓

Countdown

↓

Gameplay

↓

Game Over

↓

Statistics

↓

Save Score

↓

Leaderboard
```

---

# Rendering Flow

```
requestAnimationFrame()

↓

update()

↓

collision()

↓

render()

↓

repeat
```

Never use React rendering for gameplay animation.

---

# State Ownership

React owns

```
theme

auth

navigation

settings

profile
```

Game Engine owns

```
targets

particles

timers

collision

physics
```

Firebase owns

```
users

scores

leaderboards
```

---

# Data Flow

```
User Click

↓

Canvas

↓

Collision

↓

ScoreManager

↓

React UI

↓

Firebase
```

Data should move in one direction.

Avoid circular dependencies.

---

# Styling

Use

```
CSS Modules

or

Tailwind
```

Never mix inline styles with large components.

---

# Performance

Goals

60 FPS

Minimal allocations

Minimal React renders

Reuse objects

Memoize expensive calculations

Throttle expensive listeners

---

# Error Handling

Every async call should include

```
try

catch

finally
```

Display friendly error messages.

Never expose Firebase errors directly.

---

# Accessibility

Support

Keyboard

Screen readers

Reduced motion

High contrast

Responsive sizing

---

# Future Expansion

Architecture should allow

Achievements

Friend leaderboards

Daily challenges

Replay system

Heatmaps

Multiple game modes

without major refactoring.

---

# Coding Rules

Prefer

Small files

Pure functions

Reusable hooks

Composition

Clear naming

Avoid

God objects

Massive components

Duplicate logic

Hidden side effects

---

# Naming Conventions

Components

```
Leaderboard.jsx
```

Hooks

```
useLeaderboard.js
```

Classes

```
GameEngine.js
```

Utilities

```
calculateAccuracy.js
```

Constants

```
TARGET_SIZE
```

---

# AI Development Guidelines

When modifying the codebase:

- Preserve separation of concerns.
- Do not place game logic inside React components.
- Keep rendering inside the Renderer.
- Keep Firebase interactions inside Services.
- Reuse hooks whenever possible.
- Prefer adding new modules over expanding existing large files.
- Refactor before files exceed ~300 lines.
- Document non-obvious logic with concise comments.

Every new feature should fit naturally into the existing architecture rather than bypassing it.