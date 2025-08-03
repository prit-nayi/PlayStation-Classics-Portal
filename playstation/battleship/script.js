// Battleship Game Class
class Battleship {
    constructor() {
        this.boardSize = 10;
        this.playerBoard = this.createEmptyBoard();
        this.aiBoard = this.createEmptyBoard();
        this.playerShips = this.createShips();
        this.aiShips = this.createShips();
        this.gamePhase = 'setup';
        this.currentPlayer = 'player';
        this.selectedShip = null;
        this.shipOrientation = 'horizontal';
        this.scores = { player: 0, ai: 0, rounds: 0 };
        this.difficulty = 'easy';
        this.gameHistory = [];
        this.aiHits = [];
        
        this.initializeGame();
        this.setupAudio();
    }

    createEmptyBoard() {
        const board = [];
        for (let i = 0; i < this.boardSize; i++) {
            board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                board[i][j] = { ship: null, hit: false, miss: false };
            }
        }
        return board;
    }

    createShips() {
        return [
            { name: 'carrier', size: 5, placed: false, sunk: false },
            { name: 'battleship', size: 4, placed: false, sunk: false },
            { name: 'cruiser', size: 3, placed: false, sunk: false },
            { name: 'submarine', size: 3, placed: false, sunk: false },
            { name: 'destroyer', size: 2, placed: false, sunk: false }
        ];
    }

    initializeGame() {
        this.createBoards();
        this.setupEventListeners();
        this.updateDisplay();
        this.loadScores();
        this.placeAIShips();
    }

    createBoards() {
        this.createBoard('playerBoard', this.playerBoard, true);
        this.createBoard('aiBoard', this.aiBoard, false);
    }

    createBoard(boardId, boardData, isPlayerBoard) {
        const boardElement = document.getElementById(boardId);
        boardElement.innerHTML = '';
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-col', j);
                
                if (isPlayerBoard) {
                    cell.addEventListener('click', () => this.handlePlayerBoardClick(i, j));
                    cell.addEventListener('mouseenter', () => this.handlePlayerBoardHover(i, j));
                    cell.addEventListener('mouseleave', () => this.handlePlayerBoardLeave());
                } else {
                    cell.addEventListener('click', () => this.handleAIBoardClick(i, j));
                }
                
                boardElement.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.ship-option').forEach(option => {
            option.addEventListener('click', () => {
                const shipName = option.getAttribute('data-ship');
                this.selectShip(shipName);
            });
        });
    }

    selectShip(shipName) {
        if (this.gamePhase !== 'setup') return;
        
        const ship = this.playerShips.find(s => s.name === shipName);
        if (ship && !ship.placed) {
            this.selectedShip = ship;
            
            document.querySelectorAll('.ship-option').forEach(option => {
                option.classList.remove('selected');
            });
            document.querySelector(`[data-ship="${shipName}"]`).classList.add('selected');
            
            document.getElementById('placementInfo').textContent = `Click on the board to place your ${shipName}`;
        }
    }

    handlePlayerBoardClick(row, col) {
        if (this.gamePhase === 'setup' && this.selectedShip) {
            this.placeShip(row, col);
        }
    }

    handlePlayerBoardHover(row, col) {
        if (this.gamePhase === 'setup' && this.selectedShip) {
            this.showPlacementPreview(row, col);
        }
    }

    handlePlayerBoardLeave() {
        if (this.gamePhase === 'setup') {
            this.clearPlacementPreview();
        }
    }

    showPlacementPreview(row, col) {
        this.clearPlacementPreview();
        
        const ship = this.selectedShip;
        const size = ship.size;
        const cells = [];
        
        if (this.shipOrientation === 'horizontal') {
            for (let i = 0; i < size; i++) {
                if (col + i < this.boardSize) {
                    cells.push({ row, col: col + i });
                }
            }
        } else {
            for (let i = 0; i < size; i++) {
                if (row + i < this.boardSize) {
                    cells.push({ row: row + i, col });
                }
            }
        }
        
        const isValid = this.isValidPlacement(cells);
        
        cells.forEach(({ row, col }) => {
            const cell = document.querySelector(`#playerBoard [data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add(isValid ? 'placement-preview' : 'placement-invalid');
            }
        });
    }

    clearPlacementPreview() {
        document.querySelectorAll('#playerBoard .placement-preview, #playerBoard .placement-invalid').forEach(cell => {
            cell.classList.remove('placement-preview', 'placement-invalid');
        });
    }

    isValidPlacement(cells) {
        for (const { row, col } of cells) {
            if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
                return false;
            }
            if (this.playerBoard[row][col].ship) {
                return false;
            }
        }
        return true;
    }

    placeShip(row, col) {
        if (!this.selectedShip) return;
        
        const ship = this.selectedShip;
        const size = ship.size;
        const cells = [];
        
        if (this.shipOrientation === 'horizontal') {
            for (let i = 0; i < size; i++) {
                if (col + i < this.boardSize) {
                    cells.push({ row, col: col + i });
                }
            }
        } else {
            for (let i = 0; i < size; i++) {
                if (row + i < this.boardSize) {
                    cells.push({ row: row + i, col });
                }
            }
        }
        
        if (this.isValidPlacement(cells)) {
            cells.forEach(({ row, col }) => {
                this.playerBoard[row][col].ship = ship.name;
            });
            
            ship.placed = true;
            this.selectedShip = null;
            
            this.updateBoardDisplay('playerBoard', this.playerBoard);
            this.updateShipSelection();
            
            if (this.playerShips.every(ship => ship.placed)) {
                this.startBattle();
            }
        }
    }

    updateShipSelection() {
        document.querySelectorAll('.ship-option').forEach(option => {
            const shipName = option.getAttribute('data-ship');
            const ship = this.playerShips.find(s => s.name === shipName);
            
            if (ship.placed) {
                option.classList.add('placed');
                option.classList.remove('selected');
            } else {
                option.classList.remove('placed');
            }
        });
    }

    placeAIShips() {
        this.aiShips.forEach(ship => {
            let placed = false;
            while (!placed) {
                const row = Math.floor(Math.random() * this.boardSize);
                const col = Math.floor(Math.random() * this.boardSize);
                const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                
                const cells = [];
                const size = ship.size;
                
                if (orientation === 'horizontal') {
                    for (let i = 0; i < size; i++) {
                        if (col + i < this.boardSize) {
                            cells.push({ row, col: col + i });
                        }
                    }
                } else {
                    for (let i = 0; i < size; i++) {
                        if (row + i < this.boardSize) {
                            cells.push({ row: row + i, col });
                        }
                    }
                }
                
                if (this.isValidAIPlacement(cells)) {
                    cells.forEach(({ row, col }) => {
                        this.aiBoard[row][col].ship = ship.name;
                    });
                    ship.placed = true;
                    placed = true;
                }
            }
        });
    }

    isValidAIPlacement(cells) {
        for (const { row, col } of cells) {
            if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
                return false;
            }
            if (this.aiBoard[row][col].ship) {
                return false;
            }
        }
        return true;
    }

    startBattle() {
        this.gamePhase = 'battle';
        document.getElementById('placementControls').style.display = 'none';
        document.getElementById('gameControls').style.display = 'flex';
        document.getElementById('statusText').textContent = 'Battle phase! Click on enemy waters to fire!';
        document.getElementById('currentPhase').innerHTML = '<i class="fas fa-crosshairs"></i><span>Battle Phase</span>';
        document.getElementById('currentPhase').classList.add('battle');
    }

    handleAIBoardClick(row, col) {
        if (this.gamePhase === 'battle' && this.currentPlayer === 'player') {
            this.fireAtAI(row, col);
        }
    }

    fireAtAI(row, col) {
        if (this.aiBoard[row][col].hit || this.aiBoard[row][col].miss) return;
        
        const cell = this.aiBoard[row][col];
        let result, message, sound;
        
        if (cell.ship) {
            cell.hit = true;
            result = 'hit';
            message = `Hit! You hit the enemy ${cell.ship}!`;
            sound = 'hit';
            this.playSound('hit');
            
            if (this.isShipSunk(cell.ship, this.aiBoard)) {
                const ship = this.aiShips.find(s => s.name === cell.ship);
                ship.sunk = true;
                result = 'sunk';
                message = `Sunk! You destroyed the enemy ${cell.ship}!`;
                sound = 'sink';
                this.playSound('sink');
            }
        } else {
            cell.miss = true;
            result = 'miss';
            message = 'Miss! Try again!';
            sound = 'miss';
            this.playSound('miss');
        }
        
        this.addToHistory(`Player ${result} at ${String.fromCharCode(65 + row)}${col + 1}`, result);
        this.updateBoardDisplay('aiBoard', this.aiBoard);
        this.updateDisplay();
        
        if (this.aiShips.every(ship => ship.sunk)) {
            this.endGame('player');
            return;
        }
        
        this.currentPlayer = 'ai';
        setTimeout(() => this.aiTurn(), 1000);
    }

    aiTurn() {
        let row, col;
        
        if (this.difficulty === 'easy' || (this.difficulty === 'medium' && Math.random() < 0.3)) {
            ({ row, col } = this.getRandomAIMove());
        } else {
            ({ row, col } = this.getSmartAIMove());
        }
        
        this.fireAtPlayer(row, col);
    }

    getRandomAIMove() {
        let row, col;
        do {
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * this.boardSize);
        } while (this.playerBoard[row][col].hit || this.playerBoard[row][col].miss);
        
        return { row, col };
    }

    getSmartAIMove() {
        if (this.aiHits.length > 0) {
            const lastHit = this.aiHits[this.aiHits.length - 1];
            const adjacent = [
                { row: lastHit.row - 1, col: lastHit.col },
                { row: lastHit.row + 1, col: lastHit.col },
                { row: lastHit.row, col: lastHit.col - 1 },
                { row: lastHit.row, col: lastHit.col + 1 }
            ];
            
            for (const { row, col } of adjacent) {
                if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
                    if (!this.playerBoard[row][col].hit && !this.playerBoard[row][col].miss) {
                        return { row, col };
                    }
                }
            }
        }
        
        return this.getRandomAIMove();
    }

    fireAtPlayer(row, col) {
        const cell = this.playerBoard[row][col];
        let result, message, sound;
        
        if (cell.ship) {
            cell.hit = true;
            result = 'hit';
            message = `AI hit your ${cell.ship}!`;
            sound = 'hit';
            this.playSound('hit');
            
            this.aiHits.push({ row, col });
            
            if (this.isShipSunk(cell.ship, this.playerBoard)) {
                const ship = this.playerShips.find(s => s.name === cell.ship);
                ship.sunk = true;
                result = 'sunk';
                message = `AI sunk your ${cell.ship}!`;
                sound = 'sink';
                this.playSound('sink');
            }
        } else {
            cell.miss = true;
            result = 'miss';
            message = 'AI missed!';
            sound = 'miss';
            this.playSound('miss');
        }
        
        this.addToHistory(`AI ${result} at ${String.fromCharCode(65 + row)}${col + 1}`, result);
        this.updateBoardDisplay('playerBoard', this.playerBoard);
        this.updateDisplay();
        
        if (this.playerShips.every(ship => ship.sunk)) {
            this.endGame('ai');
            return;
        }
        
        this.currentPlayer = 'player';
    }

    isShipSunk(shipName, board) {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (board[i][j].ship === shipName && !board[i][j].hit) {
                    return false;
                }
            }
        }
        return true;
    }

    updateBoardDisplay(boardId, boardData) {
        const cells = document.querySelectorAll(`#${boardId} .grid-cell`);
        
        cells.forEach(cell => {
            const row = parseInt(cell.getAttribute('data-row'));
            const col = parseInt(cell.getAttribute('data-col'));
            const cellData = boardData[row][col];
            
            cell.className = 'grid-cell';
            
            if (cellData.ship && boardId === 'playerBoard') {
                cell.classList.add('ship');
            }
            
            if (cellData.hit) {
                cell.classList.add('hit');
                cell.textContent = '💥';
            } else if (cellData.miss) {
                cell.classList.add('miss');
                cell.textContent = '💧';
            }
            
            if (cellData.ship && cellData.hit && this.isShipSunk(cellData.ship, boardData)) {
                cell.classList.add('sunk');
            }
        });
    }

    updateDisplay() {
        this.updateShipCounters();
        this.updateHistoryDisplay();
    }

    updateShipCounters() {
        const playerShipsRemaining = this.playerShips.filter(ship => !ship.sunk).length;
        const aiShipsRemaining = this.aiShips.filter(ship => !ship.sunk).length;
        
        document.getElementById('playerShipsRemaining').textContent = playerShipsRemaining;
        document.getElementById('aiShipsRemaining').textContent = aiShipsRemaining;
    }

    addToHistory(message, result) {
        const historyItem = {
            message: message,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.gameHistory.unshift(historyItem);
        if (this.gameHistory.length > 10) {
            this.gameHistory.pop();
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        this.gameHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${item.result}`;
            
            const result = document.createElement('div');
            result.className = `history-result ${item.result}`;
            result.textContent = item.result.toUpperCase();
            
            const message = document.createElement('div');
            message.textContent = item.message;
            
            const time = document.createElement('div');
            time.textContent = item.timestamp;
            
            historyItem.appendChild(result);
            historyItem.appendChild(message);
            historyItem.appendChild(time);
            historyList.appendChild(historyItem);
        });
    }

    endGame(winner) {
        let message, sound;
        
        if (winner === 'player') {
            message = 'Victory! You\'ve sunk all enemy ships!';
            sound = 'win';
            this.scores.player++;
        } else {
            message = 'Defeat! The AI has sunk all your ships!';
            sound = 'lose';
            this.scores.ai++;
        }
        
        this.scores.rounds++;
        this.playSound(sound);
        this.saveScores();
        this.showWinOverlay(winner, message);
    }

    showWinOverlay(winner, message) {
        const overlay = document.getElementById('winOverlay');
        const title = document.getElementById('winTitle');
        const winMessage = document.getElementById('winMessage');
        const icon = document.getElementById('winIcon');
        
        if (winner === 'player') {
            title.textContent = 'Victory!';
            icon.innerHTML = '<i class="fas fa-trophy"></i>';
        } else {
            title.textContent = 'Defeat!';
            icon.innerHTML = '<i class="fas fa-ship"></i>';
        }
        
        winMessage.textContent = message;
        
        document.getElementById('finalPlayerScore').textContent = this.scores.player;
        document.getElementById('finalAiScore').textContent = this.scores.ai;
        document.getElementById('finalRounds').textContent = this.scores.rounds;
        
        overlay.classList.add('show');
    }

    resetGame() {
        this.playerBoard = this.createEmptyBoard();
        this.aiBoard = this.createEmptyBoard();
        this.playerShips = this.createShips();
        this.aiShips = this.createShips();
        this.gamePhase = 'setup';
        this.currentPlayer = 'player';
        this.selectedShip = null;
        this.shipOrientation = 'horizontal';
        this.aiHits = [];
        this.gameHistory = [];
        
        this.initializeGame();
        document.getElementById('placementControls').style.display = 'block';
        document.getElementById('gameControls').style.display = 'none';
        document.getElementById('statusText').textContent = 'Place your ships to begin!';
        document.getElementById('currentPhase').innerHTML = '<i class="fas fa-ship"></i><span>Setup Phase</span>';
        document.getElementById('currentPhase').classList.remove('battle');
    }

    toggleDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        const currentIndex = difficulties.indexOf(this.difficulty);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        this.difficulty = difficulties[nextIndex];
        
        const difficultyText = document.getElementById('difficultyText');
        difficultyText.textContent = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
    }

    rotateShip() {
        this.shipOrientation = this.shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    }

    randomPlacement() {
        this.resetGame();
        
        this.playerShips.forEach(ship => {
            let placed = false;
            while (!placed) {
                const row = Math.floor(Math.random() * this.boardSize);
                const col = Math.floor(Math.random() * this.boardSize);
                const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                
                const cells = [];
                const size = ship.size;
                
                if (orientation === 'horizontal') {
                    for (let i = 0; i < size; i++) {
                        if (col + i < this.boardSize) {
                            cells.push({ row, col: col + i });
                        }
                    }
                } else {
                    for (let i = 0; i < size; i++) {
                        if (row + i < this.boardSize) {
                            cells.push({ row: row + i, col });
                        }
                    }
                }
                
                if (this.isValidPlacement(cells)) {
                    cells.forEach(({ row, col }) => {
                        this.playerBoard[row][col].ship = ship.name;
                    });
                    ship.placed = true;
                    placed = true;
                }
            }
        });
        
        this.updateBoardDisplay('playerBoard', this.playerBoard);
        this.updateShipSelection();
        this.startBattle();
    }

    loadScores() {
        const savedScores = localStorage.getItem('battleshipScores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
        }
        this.updateScores();
    }

    saveScores() {
        localStorage.setItem('battleshipScores', JSON.stringify(this.scores));
    }

    updateScores() {
        document.getElementById('playerScore').textContent = this.scores.player;
        document.getElementById('aiScore').textContent = this.scores.ai;
        document.getElementById('roundsPlayed').textContent = this.scores.rounds;
    }

    setupAudio() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        this.hitSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        };
        
        this.missSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        };
        
        this.sinkSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        };
        
        this.winSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        };
        
        this.loseSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.4);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        };
    }

    playSound(soundType) {
        switch (soundType) {
            case 'hit':
                this.hitSound();
                break;
            case 'miss':
                this.missSound();
                break;
            case 'sink':
                this.sinkSound();
                break;
            case 'win':
                this.winSound();
                break;
            case 'lose':
                this.loseSound();
                break;
        }
    }
}

// Global functions for HTML onclick handlers
let game;

function fireAtAI() {
    // Handled by clicking on AI board cells
}

function resetGame() {
    game.resetGame();
}

function toggleDifficulty() {
    game.toggleDifficulty();
}

function rotateShip() {
    game.rotateShip();
}

function randomPlacement() {
    game.randomPlacement();
}

function playAgain() {
    document.getElementById('winOverlay').classList.remove('show');
    game.resetGame();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    game = new Battleship();
}); 