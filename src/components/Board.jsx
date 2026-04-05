import { BOARD_SIZE, BLACK, WHITE, EMPTY } from '../utils/goGame';
import './Board.css';

export default function Board({ board, onClick, lastMove, highlightedStones, showTerritory }) {
  const cellSize = 40;
  const padding = 20;

  const getStarPoints = () => {
    if (BOARD_SIZE === 9) return [[2,2],[2,6],[4,4],[6,2],[6,6]];
    return [];
  };

  return (
    <div className="board-container">
      <svg 
        width={padding * 2 + (BOARD_SIZE - 1) * cellSize} 
        height={padding * 2 + (BOARD_SIZE - 1) * cellSize}
        className="board-svg"
      >
        {/* 棋盤線 */}
        {[...Array(BOARD_SIZE)].map((_, i) => (
          <g key={`v-${i}`}>
            <line 
              x1={padding + i * cellSize} y1={padding}
              x2={padding + i * cellSize} y2={padding + (BOARD_SIZE - 1) * cellSize}
              stroke="#8B7355" strokeWidth="1"
            />
          </g>
        ))}
        {[...Array(BOARD_SIZE)].map((_, i) => (
          <g key={`h-${i}`}>
            <line 
              x1={padding} y1={padding + i * cellSize}
              x2={padding + (BOARD_SIZE - 1) * cellSize} y2={padding + i * cellSize}
              stroke="#8B7355" strokeWidth="1"
            />
          </g>
        ))}
        
        {/* 星位 */}
        {getStarPoints().map(([r, c], i) => (
          <circle 
            key={`star-${i}`} 
            cx={padding + c * cellSize} 
            cy={padding + r * cellSize} 
            r="3" 
            fill="#8B7355" 
          />
        ))}

        {/* 棋子 */}
        {[...Array(BOARD_SIZE)].map((_, row) =>
          [...Array(BOARD_SIZE)].map((_, col) => {
            const stone = board[row][col];
            if (stone === EMPTY) return null;
            const isLast = lastMove && lastMove[0] === row && lastMove[1] === col;
            const isHighlighted = highlightedStones?.some(([r,c]) => r === row && c === col);
            return (
              <g key={`${row}-${col}`}>
                <circle
                  cx={padding + col * cellSize}
                  cy={padding + row * cellSize}
                  r={cellSize / 2 - 3}
                  fill={stone === BLACK ? "#1a1a1a" : "#f5f5f0"}
                  stroke={stone === BLACK ? "#444" : "#ccc"}
                  strokeWidth="1"
                  className="stone"
                  onClick={() => onClick && onClick(row, col)}
                  style={{ cursor: onClick ? 'pointer' : 'default' }}
                />
                {isLast && (
                  <circle
                    cx={padding + col * cellSize}
                    cy={padding + row * cellSize}
                    r={cellSize / 2 - 10}
                    fill={stone === BLACK ? "#fff" : "#1a1a1a"}
                    pointerEvents="none"
                  />
                )}
                {isHighlighted && (
                  <circle
                    cx={padding + col * cellSize}
                    cy={padding + row * cellSize}
                    r={cellSize / 2 - 6}
                    fill="none"
                    stroke="#e74c3c"
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}
