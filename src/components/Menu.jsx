import DifficultyPicker from './DifficultyPicker';
import { DIFFICULTIES } from '../utils/goGame';
import './Menu.css';

export default function Menu({ onStart }) {
  return (
    <div className="menu">
      <h1>⚫ 圍棋 ⚪</h1>
      <div className="menu-buttons">
        <button onClick={() => onStart({ mode: 'pvp' })}>
          人 vs 人
        </button>
        <button onClick={() => onStart({ mode: 'ai', difficulty: DIFFICULTIES[0] })}>
          人 vs AI
        </button>
      </div>
      <DifficultyPicker />
    </div>
  );
}
