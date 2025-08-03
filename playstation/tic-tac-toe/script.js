// Tic Tac Toe Game Class
class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = {
            player: 0,
            ai: 0,
            ties: 0
        };
        this.difficulty = 'easy'; // easy, medium, hard
        this.autoPlay = false;
        this.gameHistory = [];
        
        this.initializeGame();
        this.setupAudio();
    }

    initializeGame() {
        this.createBoard();
        this.updateDisplay();
        this.loadScores();
    }

    createBoard() {
        const boardGrid = document.getElementById('boardGrid');
        boardGrid.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', () => this.handleCellClick(i));
            boardGrid.appendChild(cell);
        }
    }

    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '') return;
        
        this.makeMove(index, this.currentPlayer);
        this.playSound('click');
        
        if (this.checkWinner()) {
            this.endGame();
        } else if (this.isBoardFull()) {
            this.endGame('tie');
        } else {
            this.switchPlayer();
            if (this.currentPlayer === 'O' && !this.autoPlay) {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }
    }

    makeMove(index, player) {
        this.board[index] = player;
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        
        this.updateDisplay();
    }

    makeAIMove() {
        if (!this.gameActive) return;
        
        let move;
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = Math.random() < 0.5 ? this.getBestMove() : this.getRandomMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
            default:
                move = this.getRandomMove();
        }
        
        if (move !== -1) {
            setTimeout(() => {
                this.makeMove(move, 'O');
                this.playSound('aiMove');
                
                if (this.checkWinner()) {
                    this.endGame();
                } else if (this.isBoardFull()) {
                    this.endGame('tie');
                } else {
                    this.switchPlayer();
                }
            }, 300);
        }
    }

    getRandomMove() {
        const emptyCells = this.board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
        return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : -1;
    }

    getBestMove() {
        let bestScore = -Infinity;
        let bestMove = -1;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        if (this.checkWinnerForMinimax()) {
            return isMaximizing ? -1 : 1;
        }
        
        if (this.isBoardFull()) {
            return 0;
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWinner() {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.highlightWinningCells(condition);
                return this.board[a];
            }
        }
        return null;
    }

    checkWinnerForMinimax() {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return true;
            }
        }
        return false;
    }

    highlightWinningCells(winningCells) {
        winningCells.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            cell.classList.add('winning');
        });
    }

    isBoardFull() {
        return this.board.every(cell => cell !== '');
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateCurrentPlayerDisplay();
    }

    updateCurrentPlayerDisplay() {
        const currentPlayerElement = document.getElementById('currentPlayer');
        const icon = currentPlayerElement.querySelector('i');
        const text = currentPlayerElement.querySelector('span');
        
        if (this.currentPlayer === 'X') {
            icon.className = 'fas fa-times';
            text.textContent = "Player's Turn";
            currentPlayerElement.classList.remove('ai');
        } else {
            icon.className = 'fas fa-circle';
            text.textContent = "AI's Turn";
            currentPlayerElement.classList.add('ai');
        }
    }

    endGame(result = null) {
        this.gameActive = false;
        
        if (!result) {
            result = this.checkWinner();
        }
        
        let winner, message, sound;
        
        if (result === 'X') {
            winner = 'Player';
            message = 'Congratulations! You won!';
            sound = 'win';
            this.scores.player++;
        } else if (result === 'O') {
            winner = 'AI';
            message = 'AI wins! Better luck next time!';
            sound = 'win';
            this.scores.ai++;
        } else {
            winner = 'Tie';
            message = "It's a tie!";
            sound = 'tie';
            this.scores.ties++;
        }
        
        this.playSound(sound);
        this.addToHistory(winner);
        this.updateScores();
        this.saveScores();
        this.showWinOverlay(winner, message);
    }

    addToHistory(winner) {
        const historyItem = {
            winner: winner,
            timestamp: new Date().toLocaleTimeString(),
            board: [...this.board]
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
            historyItem.className = `history-item ${item.winner.toLowerCase()}`;
            
            const result = document.createElement('div');
            result.className = `history-result ${item.winner.toLowerCase()}`;
            result.textContent = item.winner.toUpperCase();
            
            const time = document.createElement('div');
            time.textContent = item.timestamp;
            
            historyItem.appendChild(result);
            historyItem.appendChild(time);
            historyList.appendChild(historyItem);
        });
    }

    showWinOverlay(winner, message) {
        const overlay = document.getElementById('winOverlay');
        const title = document.getElementById('winTitle');
        const winMessage = document.getElementById('winMessage');
        const icon = document.getElementById('winIcon');
        
        title.textContent = `${winner} Wins!`;
        winMessage.textContent = message;
        
        if (winner === 'Tie') {
            icon.innerHTML = '<i class="fas fa-handshake"></i>';
            title.textContent = "It's a Tie!";
        } else if (winner === 'Player') {
            icon.innerHTML = '<i class="fas fa-trophy"></i>';
        } else {
            icon.innerHTML = '<i class="fas fa-robot"></i>';
        }
        
        // Update final scores
        document.getElementById('finalPlayerScore').textContent = this.scores.player;
        document.getElementById('finalAiScore').textContent = this.scores.ai;
        document.getElementById('finalTiesScore').textContent = this.scores.ties;
        
        overlay.classList.add('show');
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Clear board display
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'grid-cell';
        });
        
        this.updateDisplay();
        document.getElementById('statusText').textContent = 'Your turn! Choose a square';
    }

    toggleDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        const currentIndex = difficulties.indexOf(this.difficulty);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        this.difficulty = difficulties[nextIndex];
        
        const difficultyText = document.getElementById('difficultyText');
        difficultyText.textContent = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
    }

    toggleAutoPlay() {
        this.autoPlay = !this.autoPlay;
        const autoPlayBtn = document.getElementById('autoPlayBtn');
        
        if (this.autoPlay) {
            autoPlayBtn.classList.add('active');
            autoPlayBtn.innerHTML = '<i class="fas fa-pause"></i> Stop Auto';
            this.startAutoPlay();
        } else {
            autoPlayBtn.classList.remove('active');
            autoPlayBtn.innerHTML = '<i class="fas fa-play"></i> Auto Play';
        }
    }

    startAutoPlay() {
        if (!this.autoPlay || !this.gameActive) return;
        
        if (this.currentPlayer === 'X') {
            // Player's turn - make random move
            const emptyCells = this.board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
            if (emptyCells.length > 0) {
                const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                setTimeout(() => {
                    this.makeMove(randomMove, 'X');
                    this.playSound('click');
                    
                    if (this.checkWinner()) {
                        this.endGame();
                    } else if (this.isBoardFull()) {
                        this.endGame('tie');
                    } else {
                        this.switchPlayer();
                    }
                }, 500);
            }
        } else if (this.currentPlayer === 'O') {
            // AI's turn - make AI move
            setTimeout(() => {
                this.makeAIMove();
            }, 500);
        }
        
        setTimeout(() => this.startAutoPlay(), 1000);
    }

    updateDisplay() {
        this.updateCurrentPlayerDisplay();
        this.updateScores();
    }

    updateScores() {
        document.getElementById('playerScore').textContent = this.scores.player;
        document.getElementById('aiScore').textContent = this.scores.ai;
        document.getElementById('tiesScore').textContent = this.scores.ties;
    }

    loadScores() {
        const savedScores = localStorage.getItem('tictactoeScores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
        }
        this.updateScores();
    }

    saveScores() {
        localStorage.setItem('tictactoeScores', JSON.stringify(this.scores));
    }

    setupAudio() {
        // Create audio contexts for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Click sound
        this.clickSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        };
        
        // Win sound
        this.winSound = () => {
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
        
        // Tie sound
        this.tieSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        };
        
        // AI move sound
        this.aiMoveSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        };
    }

    playSound(soundType) {
        switch (soundType) {
            case 'click':
                this.clickSound();
                break;
            case 'win':
                this.winSound();
                break;
            case 'tie':
                this.tieSound();
                break;
            case 'aiMove':
                this.aiMoveSound();
                break;
        }
    }
}

// Global functions for HTML onclick handlers
let game;

function resetGame() {
    game.resetGame();
}

function toggleDifficulty() {
    game.toggleDifficulty();
}

function toggleAutoPlay() {
    game.toggleAutoPlay();
}

function playAgain() {
    document.getElementById('winOverlay').classList.remove('show');
    game.resetGame();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    game = new TicTacToe();
}); 