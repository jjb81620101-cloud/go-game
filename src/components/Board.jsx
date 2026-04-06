import { BOARD_SIZE, BLACK, WHITE, EMPTY } from '../utils/goGame';
import { useState, useEffect } from 'react';
import './Board.css';

export default function Board({ board, onClick, lastMove, highlightedStones, boardSize = BOARD_SIZE }) {
  const [cellSize, setCellSize] = useState(40);
  
  useEffect(() => {
    const updateSize = () => {
      const maxW = Math.floor((window.innerWidth - 80) / boardSize);
      const maxH = Math.floor((window.innerHeight - 300) / boardSize);
      const size = Math.min(40, maxW, maxH, 50);
      setCellSize(Math.max(size, 20));
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [boardSize]);

  const padding = cellSize;

  const getStarPoints = () => {
    if (boardSize === 9) {
      return [[2,2], [2,6], [4,4], [6,2], [6,6]];
    } else if (boardSize === 13) {
      return [[3,3], [3,9], [6,6], [9,3], [9,9]];
    } else {
      return [[3,3], [3,9], [3,15], [9,3], [9,9], [9,15], [15,3], [15,9], [15,15]];
    }
  };

  const handleSvgClick = (e) => {
    if (!onClick) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.round((x - padding) / cellSize);
    const row = Math.round((y - padding) / cellSize);
    if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
      onClick(row, col);
    }
  };

  const svgWidth = padding * 2 + (boardSize - 1) * cellSize;
  const svgHeight = padding * 2 + (boardSize - 1) * cellSize;

  return (
    <div className="board-container">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="board-svg"
        onClick={handleSvgClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {/* 棋盤線 */}
        {[...Array(boardSize)].map((_, i) => (
          <line
            key={`v-${i}`}
            x1={padding + i * cellSize}
            y1={padding}
            x2={padding + i * cellSize}
            y2={padding + (boardSize - 1) * cellSize}
            stroke="#8B7355"
            strokeWidth="1"
          />
        ))}
        {[...Array(boardSize)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1={padding}
            y1={padding + i * cellSize}
            x2={padding + (boardSize - 1) * cellSize}
            y2={padding + i * cellSize}
            stroke="#8B7355"
            strokeWidth="1"
          />
        ))}

        {/* 星位 */}
        {getStarPoints().map(([r, c], i) => (
          <circle
            key={`star-${i}`}
            cx={padding + c * cellSize}
            cy={padding + r * cellSize}
            r={cellSize > 25 ? 4 : 3}
            fill="#8B7355"
          />
        ))}

        {/* 棋子 */}
        {[...Array(boardSize)].map((_, row) =>
          [...Array(boardSize)].map((_, col) => {
            const stone = board[row]?.[col];
            if (stone === EMPTY || stone === undefined) return null;
            const isLast = lastMove && lastMove[0] === row && lastMove[1] === col;
            const isHighlighted = highlightedStones?.some(([r,c]) => r === row && c === col);
            
            return (
              <g key={`stone-${row}-${col}`}>
                <circle
                  cx={padding + col * cellSize}
                  cy={padding + row * cellSize}
                  r={cellSize / 2 - 2}
                  fill={stone === BLACK ? "#1a1a1a" : "#f5f5f0"}
                  stroke={stone === BLACK ? "#444" : "#ccc"}
                  strokeWidth="1"
                  className="stone"
                  pointerEvents="none"
                />
                {isLast && (
                  <circle
                    cx={padding + col * cellSize}
                    cy={padding + row * cellSize}
                    r={cellSize / 2 - 8}
                    fill={stone === BLACK ? "#fff" : "#1a1a1a"}
                    pointerEvents="none"
                  />
                )}
                {isHighlighted && (
                  <circle
                    cx={padding + col * cellSize}
                    cy={padding + row * cellSize}
                    r={cellSize / 2 - 4}
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
