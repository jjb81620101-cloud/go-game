import { useState } from 'react';
import Menu from './components/Menu';
import DifficultyPicker from './components/DifficultyPicker';
import Tutorial from './components/Tutorial';
import Game from './components/Game';
import './App.css';

function App() {
  const [screen, setScreen] = useState('menu');
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  const handleStartGame = (mode, diff = null) => {
    setGameMode(mode);
    setDifficulty(diff);
    if (mode === 'ai' && !diff) {
      setScreen('difficulty');
    } else {
      setScreen('game');
    }
  };

  const handleSelectDifficulty = (diff) => {
    setDifficulty(diff);
    setScreen('game');
  };

  const handleBack = () => {
    setScreen('menu');
    setGameMode(null);
    setDifficulty(null);
  };

  return (
    <div className="app">
      {screen === 'menu' && (
        <Menu 
          onStartGame={handleStartGame}
          onStartTutorial={() => setScreen('tutorial')}
        />
      )}
      {screen === 'difficulty' && (
        <DifficultyPicker
          onSelect={handleSelectDifficulty}
          onBack={handleBack}
        />
      )}
      {screen === 'tutorial' && (
        <Tutorial onBack={handleBack} />
      )}
      {screen === 'game' && (
        <Game
          mode={gameMode}
          difficulty={difficulty}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;
