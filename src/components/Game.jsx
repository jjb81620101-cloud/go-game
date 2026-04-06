import { useState, useEffect, useCallback } from 'react';
import Board from './Board';
import { 
  createBoard, BLACK, WHITE, playMove, calculateScore, 
  getBestMove, DIFFICULTIES 
} from '../utils/goGame';
import './Game.css';

export default function Game({ mode, difficulty, onBack }) {
  const [board, setBoard] = useState(createBoard());
  const [currentColor, setCurrentColor] = useState(BLACK);
  const [lastMove, setLastMove] = useState(null);
  const [koPoint, setKoPoint] = useState(null);
  const [history, setHistory] = useState([createBoard()]);
  const [passCount, setPassCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [status, setStatus] = useState('playing');
  const [aiThinking, setAiThinking] = useState(false);
  const [capturedBlack, setCapturedBlack] = useState(0);
  const [capturedWhite, setCapturedWhite] = useState(0);

  // AI move
  useEffect(() => {
    if (mode === 'ai' && currentColor === WHITE && !gameOver && status === 'playing') {
      setAiThinking(true);
      const timeoutId = setTimeout(() => {
        const diffConfig = DIFFICULTIES.find(d => d.level === difficulty.level) || DIFFICULTIES[0];
        const move = getBestMove(board, WHITE, diffConfig.visits);
        if (move) {
          handleMove(move[0], move[1]);
        } else {
          handlePass();
        }
        setAiThinking(false);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [currentColor, mode, board, gameOver, status, difficulty]);

  const handleMove = useCallback((row, col) => {
    if (gameOver || status !== 'playing') return;
    if (mode === 'ai' && currentColor === WHITE) return;
    
    const result = playMove(board, row, col, currentColor, koPoint);
    if (!result) return;

    setBoard(result.board);
    setLastMove([row, col]);
    setKoPoint(result.ko);
    setHistory([...history, result.board]);
    setPassCount(0);

    // 計算被吃掉棋子 (白方被吃 = 黑方吃，白方被吃 = 黑方吃)
    if (currentColor === BLACK) {
      setCapturedWhite(prev => prev + result.captured.length);
    } else {
      setCapturedBlack(prev => prev + result.captured.length);
    }

    setCurrentColor(currentColor === BLACK ? WHITE : BLACK);
  }, [board, currentColor, koPoint, history, gameOver, mode, status]);

  const handlePass = useCallback(() => {
    if (gameOver) return;
    setPassCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 2) {
        endGame();
      }
      return newCount;
    });
    setLastMove(null);
    setKoPoint(null);
    setCurrentColor(currentColor === BLACK ? WHITE : BLACK);
    if (mode === 'ai') {
      setAiThinking(true);
      setTimeout(() => {
        setAiThinking(false);
      }, 500);
    }
  }, [currentColor, gameOver, mode]);

  const endGame = () => {
    const finalScore = calculateScore(board);
    setScore(finalScore);
    setGameOver(true);
    setShowScore(true);
    setStatus('ended');
  };

  const undoMove = () => {
    if (history.length > 1 && !gameOver) {
      const newHistory = history.slice(0, -1);
      setBoard(newHistory[newHistory.length - 1]);
      setHistory(newHistory);
      setCurrentColor(currentColor === BLACK ? WHITE : BLACK);
      setLastMove(null);
    }
  };

  const restartGame = () => {
    setBoard(createBoard());
    setCurrentColor(BLACK);
    setLastMove(null);
    setKoPoint(null);
    setHistory([createBoard()]);
    setPassCount(0);
    setGameOver(false);
    setScore(null);
    setShowScore(false);
    setStatus('playing');
    setCapturedBlack(0);
    setCapturedWhite(0);
  };

  const diffName = mode === 'ai' ? (DIFFICULTIES.find(d => d.level === difficulty?.level)?.name || '業餘15級') : null;

  return (
    <div className="game">
      <div className="game-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <div className="game-info">
          {mode === 'ai' && <span className="difficulty">{diffName}</span>}
          <span className="mode">{mode === 'ai' ? '人 vs AI' : '人 vs 人'}</span>
        </div>
      </div>

      <div className="game-status">
        <div className={`current-player ${currentColor === BLACK ? 'black' : 'white'}`}>
          <span className="stone-icon">{currentColor === BLACK ? '⚫' : '⚪'}</span>
          <span>{currentColor === BLACK ? '黑方' : '白方'}{currentColor === WHITE && ' (貼3.75目)'}</span>
        </div>
        {aiThinking && <span className="ai-thinking">AI思考中...</span>}
      </div>

      <div className="board-wrapper">
        <Board 
          board={board} 
          onClick={handleMove}
          lastMove={lastMove}
        />
      </div>

      <div className="captured-info">
        <span>黑方被吃: {capturedBlack}</span>
        <span>白方被吃: {capturedWhite}</span>
      </div>

      <div className="game-controls">
        {!gameOver && (
          <>
            <button onClick={handlePass}>停一手</button>
            <button onClick={undoMove} disabled={history.length <= 1}>悔棋</button>
          </>
        )}
        <button onClick={restartGame}>重新開始</button>
      </div>

      {showScore && score && (
        <div className="score-modal">
          <h3>遊戲結束</h3>
          <div className="score-details">
            <div className="score-row">
              <span>黑方</span>
              <span>{score.blackStones}子 + {score.blackTerritory}地 = {score.blackScore.toFixed(1)}</span>
            </div>
            <div className="score-row">
              <span>白方</span>
              <span>{score.whiteStones}子 + {score.whiteTerritory}地 + 3.75貼目 = {score.whiteScore.toFixed(1)}</span>
            </div>
          </div>
          <div className="winner">
            {score.blackScore > score.whiteScore ? '黑方勝！' : '白方勝！'}
          </div>
          <button onClick={() => setShowScore(false)}>關閉</button>
        </div>
      )}
    </div>
  );
}
