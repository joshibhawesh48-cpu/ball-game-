import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameState, INITIAL_LIVES } from './constants';
import { generateLevel } from './services/levelGenerator';
import { Zap, Skull, Trophy, RotateCcw, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [levelGrid, setLevelGrid] = useState<number[][]>([]);
  const [levelTheme, setLevelTheme] = useState("Space Mines");
  const [isGenerating, setIsGenerating] = useState(false);

  const startGame = () => {
    setScore(0);
    setLives(INITIAL_LIVES);
    // If no grid generated yet, generate a default one
    if (levelGrid.length === 0) {
      handleGenerateLevel("Classic");
    } else {
      setGameState(GameState.PLAYING);
    }
  };

  const handleGenerateLevel = async (theme: string) => {
    setIsGenerating(true);
    setGameState(GameState.GENERATING_LEVEL);
    try {
      const grid = await generateLevel(theme);
      setLevelGrid(grid);
      setGameState(GameState.PLAYING);
    } catch (e) {
      console.error(e);
      // Fallback handled in service, but if explicit error:
      setGameState(GameState.MENU);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative bg-[url('https://images.unsplash.com/photo-1614726365723-49cfae927827?q=80&w=2696&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-6">
        
        {/* Header HUD */}
        <div className="w-full max-w-[800px] flex justify-between items-center bg-slate-900/90 border border-slate-700 p-4 rounded-xl shadow-lg text-slate-100 mb-2">
            <div className="flex items-center gap-2">
                <span className="text-xl font-bold arcade-font tracking-wider text-sky-400">SCORE</span>
                <span className="text-2xl font-mono">{score.toString().padStart(6, '0')}</span>
            </div>
            
            <h1 className="hidden md:block text-3xl font-black italic tracking-tighter bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
                ROCK BREAKER
            </h1>

            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1">
                    <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xl font-bold">{lives}</span>
                </div>
            </div>
        </div>

        {/* Game Area Container */}
        <div className="relative w-full flex justify-center">
            
            <GameCanvas 
              gameState={gameState} 
              setGameState={setGameState} 
              levelGrid={levelGrid}
              setScore={setScore}
              setLives={setLives}
              score={score}
              lives={lives}
            />

            {/* Overlays */}
            
            {/* Main Menu */}
            {gameState === GameState.MENU && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="glass-panel p-8 rounded-2xl shadow-2xl text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                  <h1 className="text-5xl font-black text-white mb-2 arcade-font tracking-tighter text-shadow">ROCK<br/><span className="text-sky-400">BREAKER</span></h1>
                  <p className="text-slate-400 mb-8 font-mono text-sm">AI EDITION</p>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold">Generate Level Theme</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={levelTheme}
                                onChange={(e) => setLevelTheme(e.target.value)}
                                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white w-full outline-none focus:border-sky-500"
                                placeholder="e.g. Volcanic, Ice, City"
                            />
                            <button 
                                onClick={() => handleGenerateLevel(levelTheme)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded transition-colors flex items-center justify-center"
                                title="Generate with AI"
                            >
                                <Sparkles className="w-5 h-5" />
                            </button>
                        </div>
                     </div>

                     <div className="h-4"></div>

                     <button 
                        onClick={startGame}
                        className="w-full bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold py-3 rounded text-lg transition-all transform hover:scale-105 shadow-lg shadow-sky-500/20 arcade-font"
                     >
                        START MISSION
                     </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading / Generating */}
            {gameState === GameState.GENERATING_LEVEL && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-900/90 rounded-lg">
                    <div className="text-center">
                        <Sparkles className="w-12 h-12 text-sky-400 animate-spin mb-4 mx-auto" />
                        <h2 className="text-2xl font-bold text-white mb-2">Architecting Level...</h2>
                        <p className="text-slate-400">Gemini AI is constructing {levelTheme}...</p>
                    </div>
                </div>
            )}

            {/* Game Over */}
            {gameState === GameState.GAME_OVER && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 rounded-lg">
                <div className="glass-panel p-8 rounded-2xl text-center border-red-500/30">
                  <Skull className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-4xl font-black text-white mb-2 arcade-font text-red-500">GAME OVER</h2>
                  <p className="text-slate-300 mb-6 text-xl">Final Score: <span className="text-white font-bold">{score}</span></p>
                  <button 
                    onClick={() => setGameState(GameState.MENU)}
                    className="flex items-center justify-center gap-2 w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Return to Base
                  </button>
                </div>
              </div>
            )}

             {/* Victory */}
             {gameState === GameState.VICTORY && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 rounded-lg">
                <div className="glass-panel p-8 rounded-2xl text-center border-yellow-500/30">
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-4xl font-black text-white mb-2 arcade-font text-yellow-400">SECTOR CLEARED</h2>
                  <p className="text-slate-300 mb-6 text-xl">Score: <span className="text-white font-bold">{score}</span></p>
                  <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => handleGenerateLevel(levelTheme)}
                        className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded transition-colors"
                    >
                        <Sparkles className="w-4 h-4" /> Next Random Sector
                    </button>
                    <button 
                        onClick={() => setGameState(GameState.MENU)}
                        className="text-slate-400 hover:text-white text-sm mt-2 underline"
                    >
                        Return to Menu
                    </button>
                  </div>
                </div>
              </div>
            )}

        </div>

        <div className="text-slate-500 text-sm font-mono text-center">
            CONTROLS: Mouse/Touch to Move • Click/Tap to Launch Ball<br/>
            Tip: Hit the ball with the edge of the paddle to control angle.
        </div>
      </div>
    </div>
  );
};

export default App;