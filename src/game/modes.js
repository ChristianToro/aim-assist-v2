/*
 * Game mode presets. A mode is pure configuration — the GameSession and
 * Spawner read these values; no mode has bespoke logic beyond what the
 * config expresses (velocity, lifespan, spawn cadence, point value).
 */
export const GAME_MODES = [
  {
    id: 'gridshot',
    label: 'Gridshot',
    description: 'Three targets up at all times.',
    duration: 30,
    // Near-zero interval: a destroyed target is replaced immediately.
    spawner: {
      spawnInterval: 0.05,
      maxTargets: 3,
      minRadius: 30,
      maxRadius: 34,
      targetLifespan: Infinity,
    },
  },
  {
    id: 'precision',
    label: 'Precision',
    description: 'Large targets. Pure accuracy.',
    duration: 30,
    spawner: {
      spawnInterval: 1.1,
      maxTargets: 3,
      minRadius: 42,
      maxRadius: 56,
      targetLifespan: 4,
      spacing: 18,
    },
  },
  {
    id: 'speed',
    label: 'Speed',
    description: 'Small targets, fast spawns, big multipliers.',
    duration: 30,
    spawner: {
      spawnInterval: 0.45,
      maxTargets: 6,
      minRadius: 16,
      maxRadius: 26,
      targetLifespan: 1.6,
      targetValue: 150,
    },
  },
  {
    id: 'tracking',
    label: 'Tracking',
    description: 'Follow targets as they bounce around.',
    duration: 30,
    spawner: {
      spawnInterval: 0.8,
      maxTargets: 2,
      minRadius: 30,
      maxRadius: 40,
      targetLifespan: 5,
      targetSpeed: [120, 220],
    },
  },
  {
    id: 'flick',
    label: 'Flick',
    description: 'Targets vanish fast — snap to them.',
    duration: 30,
    spawner: {
      spawnInterval: 0.55,
      maxTargets: 3,
      minRadius: 22,
      maxRadius: 34,
      targetLifespan: 0.9,
      targetValue: 125,
    },
  },
  {
    id: 'survival',
    label: 'Survival',
    description: 'Ever harder. Miss too much and it ends.',
    duration: Infinity,
    missLimit: 5,
    expiryCountsAsMiss: true,
    // Difficulty ramp over the first 90s: smaller/faster/shorter-lived
    // targets worth more points, spawning farther apart (see GameSession).
    scaling: {
      rampSeconds: 90,
      radiusFactor: 0.5,
      intervalFactor: 0.45,
      lifespanFactor: 0.55,
      spacingFactor: 1.6,
      valueFactor: 2,
    },
    spawner: {
      spawnInterval: 1.0,
      maxTargets: 4,
      minRadius: 28,
      maxRadius: 44,
      targetLifespan: 2.6,
    },
  },
]

export const DEFAULT_MODE_ID = 'gridshot'

export const getModeById = (id) =>
  GAME_MODES.find((mode) => mode.id === id) ?? GAME_MODES[0]
