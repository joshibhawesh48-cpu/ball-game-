import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PADDLE_WIDTH, 
  PADDLE_HEIGHT, 
  BALL_RADIUS, 
  BRICK_WIDTH, 
  BRICK_HEIGHT, 
  BRICK_PADDING, 
  BRICK_OFFSET_LEFT, 
  BRICK_OFFSET_TOP,
  PARTICLE_COLORS,
  ROCK_COLORS,
  RockType,
  GameState
} from '../constants';
import { Ball, Paddle, Rock, Particle } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  levelGrid: number[][];
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setLives: React.Dispatch<React.SetStateAction<number>>;
  score: number;
  lives: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  levelGrid,
  setScore,
  setLives,
  score,
  lives
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State Refs (for Loop)
  const requestRef = useRef<number>();
  const paddleRef = useRef<Paddle>({ x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2 });
  const ballRef = useRef<Ball>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 0, dy: 0, active: false });
  const rocksRef = useRef<Rock[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const screenShakeRef = useRef<number>(0);

  // Initialize Rocks from Grid
  useEffect(() => {
    if (gameState === GameState.PLAYING && levelGrid.length > 0) {
      const newRocks: Rock[] = [];
      levelGrid.forEach((row, r) => {
        row.forEach((type, c) => {
          if (type !== RockType.EMPTY) {
            newRocks.push({
              x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
              y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
              type: type,
              status: type === RockType.INDESTRUCTIBLE ? 999 : type, // 999 is effectively infinity for this game loop
              width: BRICK_WIDTH,
              height: BRICK_HEIGHT
            });
          }
        });
      });
      rocksRef.current = newRocks;
      // Reset ball
      resetBall();
    }
  }, [gameState, levelGrid]);

  const resetBall = () => {
    ballRef.current = {
      x: paddleRef.current.x + PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 2,
      dx: 0,
      dy: 0,
      active: false
    };
  };

  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x,
        y,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        life: 1.0,
        color: color,
        size: Math.random() * 3 + 1
      });
    }
  };

  const launchBall = () => {
    if (!ballRef.current.active && gameState === GameState.PLAYING) {
      ballRef.current.active = true;
      ballRef.current.dy = -6; // Initial speed
      ballRef.current.dx = 2 * ((Math.random() * 2) - 1); // Slight random horizontal
    }
  };

  // Input Handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      
      let newPaddleX = relativeX - PADDLE_WIDTH / 2;
      
      // Clamp
      if (newPaddleX < 0) newPaddleX = 0;
      if (newPaddleX + PADDLE_WIDTH > CANVAS_WIDTH) newPaddleX = CANVAS_WIDTH - PADDLE_WIDTH;
      
      paddleRef.current.x = newPaddleX;

      // If ball is inactive, move it with paddle
      if (!ballRef.current.active) {
        ballRef.current.x = newPaddleX + PADDLE_WIDTH / 2;
      }
    };

    const handleClick = () => {
      launchBall();
    };

    // Touch support
    const handleTouchMove = (e: TouchEvent) => {
        if (!canvasRef.current || e.touches.length === 0) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const relativeX = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
        
        let newPaddleX = relativeX - PADDLE_WIDTH / 2;
        if (newPaddleX < 0) newPaddleX = 0;
        if (newPaddleX + PADDLE_WIDTH > CANVAS_WIDTH) newPaddleX = CANVAS_WIDTH - PADDLE_WIDTH;
        
        paddleRef.current.x = newPaddleX;
         if (!ballRef.current.active) {
          ballRef.current.x = newPaddleX + PADDLE_WIDTH / 2;
        }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mousedown', handleClick);
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchstart', handleClick); // Simple tap to launch
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mousedown', handleClick);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchstart', handleClick);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const update = () => {
    if (gameState !== GameState.PLAYING) return;

    // --- Ball Physics ---
    const ball = ballRef.current;
    
    if (ball.active) {
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall Collisions
      if (ball.x + ball.dx > CANVAS_WIDTH - BALL_RADIUS || ball.x + ball.dx < BALL_RADIUS) {
        ball.dx = -ball.dx;
      }
      if (ball.y + ball.dy < BALL_RADIUS) {
        ball.dy = -ball.dy;
      } else if (ball.y + ball.dy > CANVAS_HEIGHT - BALL_RADIUS) {
        // Lost Life
        if (lives > 1) {
          setLives(prev => prev - 1);
          resetBall();
          screenShakeRef.current = 10;
        } else {
          setLives(0);
          setGameState(GameState.GAME_OVER);
        }
      }

      // Paddle Collision
      const paddle = paddleRef.current;
      if (
        ball.y + BALL_RADIUS >= CANVAS_HEIGHT - PADDLE_HEIGHT - 10 && // Check roughly paddle height area
        ball.y - BALL_RADIUS <= CANVAS_HEIGHT - 10 && // Not below it
        ball.x >= paddle.x &&
        ball.x <= paddle.x + PADDLE_WIDTH
      ) {
        // Ball is hitting the paddle
        // Deflect based on hit position to allow "Aiming"
        let collidePoint = ball.x - (paddle.x + PADDLE_WIDTH / 2);
        // Normalize
        collidePoint = collidePoint / (PADDLE_WIDTH / 2);
        
        let angle = collidePoint * (Math.PI / 3); // Max 60 degree deflection
        
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        // Increase speed slightly on every hit to ramp difficulty
        const newSpeed = Math.min(speed + 0.2, 12); 

        ball.dx = newSpeed * Math.sin(angle);
        ball.dy = -newSpeed * Math.cos(angle);
      }

      // Rock Collision
      const rocks = rocksRef.current;
      let activeRocksCount = 0;
      
      for (let i = 0; i < rocks.length; i++) {
        const b = rocks[i];
        if (b.status > 0) {
          if (b.type !== RockType.INDESTRUCTIBLE) activeRocksCount++;
          
          if (
            ball.x > b.x &&
            ball.x < b.x + b.width &&
            ball.y > b.y &&
            ball.y < b.y + b.height
          ) {
            ball.dy = -ball.dy;
            
            if (b.type !== RockType.INDESTRUCTIBLE) {
                b.status -= 1;
                setScore(prev => prev + 10);
                
                // Shake and particles
                screenShakeRef.current = 3;
                createParticles(ball.x, ball.y, ROCK_COLORS[b.type] || '#fff');

                if (b.status <= 0) {
                    setScore(prev => prev + 50); // Bonus for destroy
                }
            } else {
                // Metal clank effect (visual only here)
                screenShakeRef.current = 2;
                 createParticles(ball.x, ball.y, '#94a3b8');
            }
            break; // Only hit one rock per frame ideally, simple physics
          }
        }
      }

      if (activeRocksCount === 0 && rocks.length > 0) {
        setGameState(GameState.VICTORY);
      }
    }

    // --- Particles ---
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.02;
        if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
        }
    }

    // --- Screen Shake Decay ---
    if (screenShakeRef.current > 0) {
        screenShakeRef.current *= 0.9;
        if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply Shake
    const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
    const shakeY = (Math.random() - 0.5) * screenShakeRef.current;

    ctx.save();
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.translate(shakeX, shakeY);

    // Draw Rocks
    rocksRef.current.forEach(rock => {
      if (rock.status > 0) {
        ctx.beginPath();
        ctx.rect(rock.x, rock.y, rock.width, rock.height);
        
        // Color based on type and damage
        let color = ROCK_COLORS[rock.type] || '#fff';
        if (rock.type !== RockType.INDESTRUCTIBLE && rock.type > 1) {
            // Darken if damaged
             // Visual indicator of health could go here
        }
        
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Shine/Bevel effect
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(rock.x, rock.y, rock.width, rock.height/2);

        // Cracks if damaged
        if (rock.type > 1 && rock.status < rock.type) {
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.beginPath();
            ctx.moveTo(rock.x + 5, rock.y + 5);
            ctx.lineTo(rock.x + rock.width - 5, rock.y + rock.height - 5);
            ctx.stroke();
        }
      }
    });

    // Draw Paddle
    ctx.beginPath();
    ctx.roundRect(paddleRef.current.x, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT, 5);
    ctx.fillStyle = "#38bdf8"; // Sky blue
    ctx.fill();
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 15;
    ctx.closePath();
    ctx.shadowBlur = 0; // Reset shadow

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ballRef.current.x, ballRef.current.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
    
    // Aim Assist Line (when stuck)
    if (!ballRef.current.active && gameState === GameState.PLAYING) {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(ballRef.current.x, ballRef.current.y);
        ctx.lineTo(ballRef.current.x, ballRef.current.y - 100);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw Particles
    particlesRef.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.closePath();
    });

    ctx.restore();
  };

  const tick = useCallback(() => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, lives]); // Dependencies for logic inside update

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [tick]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="w-full h-full object-contain max-w-[800px] max-h-[600px] mx-auto rounded-lg shadow-2xl bg-slate-900 border border-slate-700"
    />
  );
};

export default GameCanvas;