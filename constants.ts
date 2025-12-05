export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const PADDLE_WIDTH = 100;
export const PADDLE_HEIGHT = 16;
export const BALL_RADIUS = 6;
export const BRICK_PADDING = 8;
export const BRICK_OFFSET_TOP = 60;
export const BRICK_OFFSET_LEFT = 35;
export const BRICK_ROWS_DEFAULT = 6;
export const BRICK_COLS_DEFAULT = 10;

// Calculated
export const BRICK_WIDTH = (CANVAS_WIDTH - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLS_DEFAULT - 1))) / BRICK_COLS_DEFAULT;
export const BRICK_HEIGHT = 24;

export const INITIAL_LIVES = 3;

export enum GameState {
  MENU,
  PLAYING,
  GAME_OVER,
  VICTORY,
  GENERATING_LEVEL
}

export enum RockType {
  EMPTY = 0,
  WEAK = 1,    // 1 hit
  MEDIUM = 2,  // 2 hits
  HARD = 3,    // 3 hits
  INDESTRUCTIBLE = 4 // Metal
}

export const ROCK_COLORS: Record<number, string> = {
  [RockType.WEAK]: '#94a3b8', // Slate 400
  [RockType.MEDIUM]: '#d97706', // Amber 600
  [RockType.HARD]: '#dc2626', // Red 600
  [RockType.INDESTRUCTIBLE]: '#475569', // Slate 600 (Dark Metal)
};

export const PARTICLE_COLORS = ['#fbbf24', '#f87171', '#cbd5e1', '#ffffff'];