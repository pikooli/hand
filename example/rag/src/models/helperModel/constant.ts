export const LEVEL_COLORS = {
  0: '#FF0000', // Level 0 - Red
  1: '#FFA500', // Level 1 - Orange
  2: '#FFFF00', // Level 2 - Yellow
  3: '#008000', // Level 3 - Green
  4: '#0000FF', // Level 4 - Blue
} as const;

// Define the levels for each landmark index
export const LANDMARK_LEVELS = [
  0, // Wrist
  1,
  2,
  3,
  4, // Thumb
  1,
  2,
  3,
  4, // Index
  1,
  2,
  3,
  4, // Middle
  1,
  2,
  3,
  4, // Ring
  1,
  2,
  3,
  4, // Pinky
] as const;

export const COLOR_CONNECTOR = '#00FF00';
export const LINE_CONNECTOR_WIDTH = 1;
