/** Seconds for timed motion. Scrubbed timelines use normalized story positions instead. */
export const MOTION = {
  micro: 0.18,
  ui: 0.36,
  text: 0.6,
  environment: 1.2,
  transformation: 1.9,
  hold: 1.8,
  reduced: 0.2,
  idle: 2,
  pulse: 9,
} as const;

/** Timing measured from the triggered hush, independent of scroll velocity. */
export const FALL = {
  birds: 0,
  wind: 0.9,
  creak: 1.8,
  secondCreak: 3.4,
  movement: 3.8,
  impact: 5.5,
  firstLine: 7.3,
  secondLine: 10.3,
  complete: 12.7,
} as const;
