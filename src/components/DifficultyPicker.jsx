import { DIFFICULTIES } from '../utils/goGame';
import './DifficultyPicker.css';

export default function DifficultyPicker({ onSelect, onBack }) {
  return (
    <div className="difficulty-picker">
      <h2>選擇難度</h2>
      <div className="difficulty-list">
        {DIFFICULTIES.map((diff) => (
          <button 
            key={diff.level} 
            className="difficulty-btn"
            onClick={() => onSelect(diff)}
          >
            <span className="level">Lv.{diff.level}</span>
            <span className="name">{diff.name}</span>
          </button>
        ))}
      </div>
      <button className="back-btn" onClick={onBack}>← 返回</button>
    </div>
  );
}
