export const BOARD_SIZE = 9;
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

export const DIFFICULTIES = [
  { level: 1, name: '業餘15級', visits: 100 },
  { level: 2, name: '業餘10級', visits: 300 },
  { level: 3, name: '業餘5級', visits: 800 },
  { level: 4, name: '業餘1段', visits: 2000 },
  { level: 5, name: '業餘三段', visits: 5000 },
];

export function createBoard() {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
}

export function copyBoard(board) {
  return board.map(row => [...row]);
}

function neighborCoords(row, col) {
  const neighbors = [];
  if (row > 0) neighbors.push([row - 1, col]);
  if (row < BOARD_SIZE - 1) neighbors.push([row + 1, col]);
  if (col > 0) neighbors.push([row, col - 1]);
  if (col < BOARD_SIZE - 1) neighbors.push([row, col + 1]);
  return neighbors;
}

function getGroup(board, row, col, visited = new Set()) {
  const color = board[row][col];
  if (color === EMPTY) return null;
  const key = `${row},${col}`;
  if (visited.has(key)) return null;
  visited.add(key);
  const group = [[row, col]];
  for (const [r, c] of neighborCoords(row, col)) {
    if (board[r][c] === color) {
      const childGroup = getGroup(board, r, c, visited);
      if (childGroup) group.push(...childGroup);
    }
  }
  return group;
}

function getLiberties(board, group) {
  const liberties = new Set();
  for (const [row, col] of group) {
    for (const [r, c] of neighborCoords(row, col)) {
      if (board[r][c] === EMPTY) {
        liberties.add(`${r},${c}`);
      }
    }
  }
  return liberties.size;
}

function removeStones(board, group) {
  for (const [row, col] of group) {
    board[row][col] = EMPTY;
  }
}

function isKo(board, lastMove, capturedStones, prevBoard) {
  // Ko: exactly 1 stone captured, and the new stone creates the same situation
  if (capturedStones.length !== 1) return false;
  if (!lastMove || !prevBoard) return false;
  
  const [row, col] = lastMove;
  const [cr, cc] = capturedStones[0];
  
  // Check that the captured stone's position was the previous move's position
  if (cr !== lastMove[0] || cc !== lastMove[1]) return false;
  
  // After capturing, check if the new stone only has 1 liberty (the ko point)
  const newBoard = copyBoard(board);
  newBoard[row][col] = board[row][col]; // restore color
  const group = getGroup(newBoard, row, col);
  if (!group || getLiberties(newBoard, group) !== 1) return false;
  
  // The ko point should be the captured stone's position
  return true;
}

export function playMove(board, row, col, color, koPoint = null, prevBoard = null) {
  if (board[row][col] !== EMPTY) return null;
  if (koPoint && row === koPoint[0] && col === koPoint[1]) return null;

  const newBoard = copyBoard(board);
  newBoard[row][col] = color;
  const captured = [];
  
  const opponent = color === BLACK ? WHITE : BLACK;
  for (const [r, c] of neighborCoords(row, col)) {
    if (newBoard[r][c] === opponent) {
      const group = getGroup(newBoard, r, c);
      if (group && getLiberties(newBoard, group) === 0) {
        captured.push(...group);
        removeStones(newBoard, group);
      }
    }
  }

  const selfGroup = getGroup(newBoard, row, col);
  if (selfGroup && getLiberties(newBoard, selfGroup) === 0) {
    return null;
  }

  const ko = isKo(board, [row, col], captured, prevBoard) ? [captured[0][0], captured[0][1]] : null;

  return { board: newBoard, captured, ko };
}

export function calculateTerritory(board) {
  const visited = new Set();
  const blackTerritory = [];
  const whiteTerritory = [];
  const neutral = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === EMPTY && !visited.has(`${r},${c}`)) {
        const territory = [];
        const bordering = new Set();
        const stack = [[r, c]];
        
        while (stack.length > 0) {
          const [tr, tc] = stack.pop();
          const key = `${tr},${tc}`;
          if (visited.has(key)) continue;
          visited.add(key);
          
          if (board[tr][tc] === EMPTY) {
            territory.push([tr, tc]);
            for (const [nr, nc] of neighborCoords(tr, tc)) {
              if (board[nr][nc] === EMPTY && !visited.has(`${nr},${nc}`)) {
                stack.push([nr, nc]);
              }
              if (board[nr][nc] !== EMPTY) {
                bordering.add(board[nr][nc]);
              }
            }
          }
        }

        if (bordering.size === 1) {
          if (bordering.has(BLACK)) blackTerritory.push(...territory);
          else whiteTerritory.push(...territory);
        } else {
          neutral.push(...territory);
        }
      }
    }
  }

  return { blackTerritory, whiteTerritory, neutral };
}

export function calculateScore(board) {
  const { blackTerritory, whiteTerritory } = calculateTerritory(board);
  let blackStones = 0;
  let whiteStones = 0;
  
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === BLACK) blackStones++;
      if (board[r][c] === WHITE) whiteStones++;
    }
  }

  const komi = 3.75;
  const blackScore = blackStones + blackTerritory.length;
  const whiteScore = whiteStones + whiteTerritory.length + komi;

  return { blackScore, whiteScore, blackStones, whiteStones, blackTerritory: blackTerritory.length, whiteTerritory: whiteTerritory.length };
}

class MCTSNode {
  constructor(board, color, parent = null, move = null) {
    this.board = board;
    this.color = color;
    this.parent = parent;
    this.move = move;
    this.wins = 0;
    this.visits = 0;
    this.children = [];
    this.untriedMoves = this.getLegalMoves();
  }

  getLegalMoves() {
    const moves = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.board[r][c] === EMPTY) {
          const result = playMove(this.board, r, c, this.color);
          if (result) moves.push([r, c]);
        }
      }
    }
    return moves;
  }

  select() {
    const c = 1.414;
    let best = null;
    let bestValue = -Infinity;
    for (const child of this.children) {
      const ucb1 = (child.wins / child.visits) + c * Math.sqrt(Math.log(this.visits) / child.visits);
      if (ucb1 > bestValue) {
        bestValue = ucb1;
        best = child;
      }
    }
    return best;
  }

  expand() {
    if (this.untriedMoves.length === 0) return this.select();
    const move = this.untriedMoves.pop();
    const result = playMove(this.board, move[0], move[1], this.color);
    if (!result) return this.select();
    const child = new MCTSNode(result.board, this.color === BLACK ? WHITE : BLACK, this, move);
    this.children.push(child);
    return child;
  }

  simulate() {
    let board = copyBoard(this.board);
    let color = this.color;
    let passCount = 0;
    const maxSimMoves = BOARD_SIZE * BOARD_SIZE * 2; // allow enough moves
    
    for (let moveNum = 0; moveNum < maxSimMoves; moveNum++) {
      if (passCount >= 2) break;
      
      const moves = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (board[r][c] === EMPTY) {
            const result = playMove(board, r, c, color);
            if (result) moves.push([r, c]);
          }
        }
      }
      
      if (moves.length === 0) {
        passCount++;
      } else {
        passCount = 0;
        const [r, c] = moves[Math.floor(Math.random() * moves.length)];
        const result = playMove(board, r, c, color);
        if (result) board = result.board;
      }
      color = color === BLACK ? WHITE : BLACK;
    }

    const score = calculateScore(board);
    return score.blackScore > score.whiteScore ? BLACK : WHITE;
  }

  backpropagate(winner) {
    this.visits++;
    if (winner === this.color) this.wins++;
    if (this.parent) this.parent.backpropagate(winner);
  }
}

export function getBestMove(board, color, visits) {
  const root = new MCTSNode(board, color);
  
  for (let i = 0; i < visits; i++) {
    let node = root;
    
    while (node.children.length > 0 && node.untriedMoves.length === 0) {
      node = node.select();
    }
    
    node = node.expand();
    
    const winner = node.simulate();
    
    node.backpropagate(winner);
  }

  let best = null;
  let bestVisits = -1;
  for (const child of root.children) {
    if (child.visits > bestVisits) {
      bestVisits = child.visits;
      best = child;
    }
  }

  return best ? best.move : null;
}

export function getLegalMoves(board, color) {
  const moves = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === EMPTY) {
        const result = playMove(board, r, c, color);
        if (result) moves.push([r, c]);
      }
    }
  }
  return moves;
}
