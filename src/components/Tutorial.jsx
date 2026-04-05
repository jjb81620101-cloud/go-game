import { useState } from 'react';
import Board from './Board';
import { createBoard, BLACK, WHITE, playMove } from '../utils/goGame';
import './Tutorial.css';

const LESSONS = [
  {
    id: 1,
    title: '認識棋盤',
    content: '圍棋使用 9×9 或 19×19 的棋盤。我們使用 9×9 入門。棋子落在交叉點上，而非格子中。',
    board: null,
    highlight: null,
  },
  {
    id: 2,
    title: '放置棋子',
    content: '黑子先下，雙方輪流落子。點擊交叉點放置棋子。',
    board: null,
    highlight: null,
  },
  {
    id: 3,
    title: '棋子的氣',
    content: '棋子周圍的交叉點稱為「氣」。一顆棋子在棋盤中央有4氣，邊上3氣，角落2氣。',
    board: null,
    highlight: [[2,2]],
  },
  {
    id: 4,
    title: '吃子',
    content: '當棋子的所有氣都被對方占據時，棋子被吃掉。請點擊紅色標記的位置吃掉黑子。',
    board: null,
    highlight: null,
    checkAction: 'capture',
  },
  {
    id: 5,
    title: '活棋',
    content: '至少兩口氣的棋子是安全的。試著建立你的第一塊活棋！',
    board: null,
    highlight: null,
  },
  {
    id: 6,
    title: '禁止自殺',
    content: '你不可以將自己的棋子下成無氣狀態，除非這步可以吃掉對方的子。',
    board: null,
    highlight: null,
  },
  {
    id: 7,
    title: '劫',
    content: '劫是特殊的重複局面。雙方不能立即提回被提的子，需要在別處下一手才能提子。',
    board: null,
    highlight: null,
  },
  {
    id: 8,
    title: '數子法',
    content: '遊戲結束後，數一數你的地和棋子數量。地越多、棋子越多，贏面越大。',
    board: null,
    highlight: null,
  },
];

function generateLessonBoard(lessonId) {
  const board = createBoard();
  
  if (lessonId === 3) {
    // 展示氣的位置
    board[2][2] = BLACK;
  }
  
  if (lessonId === 4) {
    // 可以吃子的局面
    board[2][2] = BLACK;
    board[1][2] = WHITE;
    board[3][2] = WHITE;
    board[2][1] = WHITE;
    // board[2][3] 是空的，這是正確的著點
  }
  
  if (lessonId === 5) {
    // 建立活棋
    board[4][4] = WHITE;
    board[4][5] = WHITE;
    board[5][4] = WHITE;
    board[5][5] = WHITE;
  }
  
  return board;
}

export default function Tutorial({ onBack }) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [lessonBoards, setLessonBoards] = useState(() => {
    const boards = {};
    LESSONS.forEach((l, i) => {
      boards[i] = generateLessonBoard(l.id);
    });
    return boards;
  });
  const [message, setMessage] = useState('');

  const lesson = LESSONS[currentLesson];
  const board = lessonBoards[currentLesson];

  const handleBoardClick = (row, col) => {
    const lessonId = lesson.id;
    
    if (lessonId === 4) {
      // 吃子教學
      if (row === 2 && col === 3) {
        const result = playMove(board, row, col, WHITE);
        if (result) {
          const newBoards = {...lessonBoards};
          newBoards[currentLesson] = result.board;
          setLessonBoards(newBoards);
          setMessage('正確！你學會了吃子！');
          setTimeout(() => {
            if (currentLesson < LESSONS.length - 1) {
              setCurrentLesson(currentLesson + 1);
              setMessage('');
            }
          }, 1500);
        }
      } else {
        setMessage('試著找黑子被包圍的那口氣');
      }
    } else if (lessonId === 5) {
      // 建立活棋
      const result = playMove(board, row, col, WHITE);
      if (result) {
        const newBoards = {...lessonBoards};
        newBoards[currentLesson] = result.board;
        setLessonBoards(newBoards);
      }
    }
  };

  const goNext = () => {
    if (currentLesson < LESSONS.length - 1) {
      setCurrentLesson(currentLesson + 1);
      setMessage('');
    }
  };

  const goPrev = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
      setMessage('');
    }
  };

  return (
    <div className="tutorial">
      <div className="tutorial-header">
        <button className="back-btn" onClick={onBack}>← 退出教程</button>
        <span className="lesson-counter">{currentLesson + 1} / {LESSONS.length}</span>
      </div>
      
      <h2>{lesson.title}</h2>
      <p className="lesson-content">{lesson.content}</p>
      
      <div className="tutorial-board">
        <Board 
          board={board || createBoard()} 
          onClick={handleBoardClick}
          lastMove={null}
          highlightedStones={lesson.highlight}
        />
      </div>
      
      {message && <div className="tutorial-message">{message}</div>}
      
      <div className="tutorial-nav">
        <button onClick={goPrev} disabled={currentLesson === 0}>上一課</button>
        <button onClick={goNext} disabled={currentLesson === LESSONS.length - 1}>下一課</button>
      </div>
    </div>
  );
}
