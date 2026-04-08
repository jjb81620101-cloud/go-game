import { DIFFICULTIES } from '../utils/goGame';
import './DifficultyPicker.css';

export default function DifficultyPicker() {
  return (
    <div className="difficulty-picker">
      <h3>AI 難度</h3>
      <div className="difficulties">
        {DIFFICULTIES.map(d => (
          <button key={d.level} className="difficulty-btn">
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
}
