import { DIFFICULTIES } from '../utils/goGame';
import './Menu.css';

export default function Menu({ onStartGame, onStartTutorial }) {
  return (
    <div className="menu">
      <div className="menu-title">
        <h1>圍棋</h1>
        <p>禪 · 策略 · 對弈</p>
      </div>
      
      <div className="menu-buttons">
        <button className="menu-btn primary" onClick={() => onStartGame('ai')}>
          <span className="icon">🤖</span>
          <span>人 vs AI</span>
        </button>
        
        <button className="menu-btn" onClick={() => onStartGame('pvp')}>
          <span className="icon">👥</span>
          <span>人 vs 人</span>
        </button>
        
        <button className="menu-btn secondary" onClick={onStartTutorial}>
          <span className="icon">📖</span>
          <span>圍棋教程</span>
        </button>
      </div>
    </div>
  );
}
