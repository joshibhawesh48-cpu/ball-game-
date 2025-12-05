export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  active: boolean; // false if stuck to paddle
}

export interface Paddle {
  x: number;
}

export interface Rock {
  x: number;
  y: number;
  status: number; // 0 = destroyed, > 0 = remaining health
  type: number; // Initial max health / type
  width: number;
  height: number;
}

export interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  color: string;
  size: number;
}

export interface LevelData {
  grid: number[][]; // 2D array representing the grid
  name: string;
}
