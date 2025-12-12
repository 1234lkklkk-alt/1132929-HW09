// --- 遊戲變數 ---
let board = Array(9).fill(null);
let current = 'X';
let active = true;
let scores = { player: 0, computer: 0, draw: 0 };

// 花朵庫
const FLOWER_POOL = ['🌹', '🌺', '🌻', '🌼', '🌷', '🌸', '💐', '🪷', '🏵️', '💮'];
let playerIcon = '🌸';
let computerIcon = '🌹';

window.onload = function () {
    init();
    createZoo();
    setInterval(moveAnimals, 1500);
};

// --- 隨機更換花朵 ---
function randomizeIcons() {
    let pIndex = Math.floor(Math.random() * FLOWER_POOL.length);
    playerIcon = FLOWER_POOL[pIndex];

    let cIndex;
    do {
        cIndex = Math.floor(Math.random() * FLOWER_POOL.length);
    } while (cIndex === pIndex);
    computerIcon = FLOWER_POOL[cIndex];

    document.getElementById('icon-x-display').innerText = playerIcon;
    document.getElementById('icon-o-display').innerText = computerIcon;
}

function init() {
    randomizeIcons();
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    board = Array(9).fill(null);
    active = true;
    current = 'X';
    document.getElementById('status').innerText = '早安，請下棋，平安喜樂';

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.onclick = () => playerMove(i);
        boardEl.appendChild(cell);
    }
}

function createZoo() {
    const zooLayer = document.getElementById('zoo-layer');
    const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅'];

    for (let i = 0; i < 50; i++) {
        const el = document.createElement('div');
        el.classList.add('animal');
        el.innerText = animals[Math.floor(Math.random() * animals.length)];
        el.style.left = Math.random() * 95 + '%';
        el.style.top = (50 + Math.random() * 45) + '%';
        el.onclick = function () {
            const moveX = (Math.random() - 0.5) * 500;
            const moveY = (Math.random() - 0.5) * 500;
            el.style.transform = `translate(${moveX}px, ${moveY}px) rotate(720deg) scale(0)`;
            el.style.opacity = 0;
            setTimeout(() => { el.remove(); }, 500);
        };
        zooLayer.appendChild(el);
    }
}

function moveAnimals() {
    const animals = document.getElementsByClassName('animal');
    for (let animal of animals) {
        const currentLeft = parseFloat(animal.style.left);
        const currentTop = parseFloat(animal.style.top);
        let newLeft = currentLeft + (Math.random() * 4 - 2);
        let newTop = currentTop + (Math.random() * 2 - 1);

        if (newLeft < 0) newLeft = 0;
        if (newLeft > 95) newLeft = 95;
        if (newTop < 50) newTop = 50;
        if (newTop > 95) newTop = 95;

        animal.style.left = newLeft + '%';
        animal.style.top = newTop + '%';

        if (Math.random() > 0.5) animal.style.transform = "scaleX(-1)";
        else animal.style.transform = "scaleX(1)";
    }
}

function dropApple() {
    const layer = document.getElementById('apple-layer');
    const tree = document.querySelector('.tree-container');
    const rect = tree.getBoundingClientRect();
    const count = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
        const apple = document.createElement('div');
        apple.classList.add('apple');
        apple.innerText = '🍎';
        const startX = rect.left + rect.width / 2 + (Math.random() * 100 - 50);
        const startY = rect.top + 100 + (Math.random() * 50);
        apple.style.left = startX + 'px';
        apple.style.top = startY + 'px';
        layer.appendChild(apple);
        setTimeout(() => { apple.remove(); }, 1500);
    }
}

function playerMove(i) {
    if (!active || board[i] || current !== 'X') return;
    board[i] = 'X';
    updateBoard();

    if (checkWin('X')) {
        endGame(`${playerIcon} 開了！您贏了！`, 'X');
        updateScore('player');
        return;
    } else if (isFull()) {
        endGame('和氣生財 (平手)', null);
        updateScore('draw');
        return;
    }

    current = 'O';
    document.getElementById('status').innerText = `電腦(${computerIcon}) 醞釀中...`;
    setTimeout(computerMove, 600);
}

function computerMove() {
    if (!active) return;
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    if (move !== null) {
        board[move] = 'O';
        updateBoard();
        if (checkWin('O')) {
            endGame(`${computerIcon} 綻放！電腦獲勝！`, 'O');
            updateScore('computer');
        } else if (isFull()) {
            endGame('和氣生財 (平手)', null);
            updateScore('draw');
        } else {
            current = 'X';
            document.getElementById('status').innerText = `輪到${playerIcon}(您)了`;
        }
    }
}

function minimax(currentBoard, depth, isMaximizing) {
    if (checkWinState(currentBoard, 'O')) return 10 - depth;
    if (checkWinState(currentBoard, 'X')) return depth - 10;
    if (isFullState(currentBoard)) return 0;
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === null) {
                currentBoard[i] = 'O';
                let score = minimax(currentBoard, depth + 1, false);
                currentBoard[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === null) {
                currentBoard[i] = 'X';
                let score = minimax(currentBoard, depth + 1, true);
                currentBoard[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function updateBoard() {
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < 9; i++) {
        if (board[i] === 'X') cells[i].innerText = playerIcon;
        else if (board[i] === 'O') cells[i].innerText = computerIcon;
        else cells[i].innerText = '';
        cells[i].classList.remove('win-line');
    }
}

function updateScore(winner) {
    let scoreId = winner === 'player' ? 'score-x' : (winner === 'computer' ? 'score-o' : 'score-d');
    if (winner === 'player') scores.player++;
    else if (winner === 'computer') scores.computer++;
    else scores.draw++;
    document.getElementById(scoreId).innerText = scores[winner === 'player' ? 'player' : (winner === 'computer' ? 'computer' : 'draw')];
}

function checkWin(player) { return checkWinState(board, player); }
function isFull() { return isFullState(board); }

function checkWinState(currentBoard, player) {
    const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    return wins.some(([a, b, c]) => currentBoard[a] === player && currentBoard[b] === player && currentBoard[c] === player);
}

function getWinningCombo(currentBoard, player) {
    const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    return wins.find(([a, b, c]) => currentBoard[a] === player && currentBoard[b] === player && currentBoard[c] === player);
}

function isFullState(currentBoard) {
    return currentBoard.every(cell => cell !== null);
}

function endGame(message, winnerPlayer) {
    document.getElementById('status').innerText = message;
    active = false;
    if (winnerPlayer) {
        const combo = getWinningCombo(board, winnerPlayer);
        if (combo) {
            const cells = document.getElementsByClassName('cell');
            combo.forEach(index => {
                cells[index].classList.add('win-line');
            });
        }
    }
}

function resetGame() {
    init();
}