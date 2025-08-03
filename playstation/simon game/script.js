class SimonGame {
    constructor() {
        this.gameState = {
            isPlaying: false,
            isShowingSequence: false,
            level: 0,
            score: 0,
            sequence: [],
            playerSequence: [],
            currentIndex: 0
        };
        
        this.elements = {
            startBtn: document.getElementById('startBtn'),
            restartBtn: document.getElementById('restartBtn'),
            levelNumber: document.getElementById('levelNumber'),
            scoreNumber: document.getElementById('scoreNumber'),
            gameStatus: document.getElementById('gameStatus'),
            gameContainer: document.querySelector('.game-container'),
            buttons: document.querySelectorAll('.simon-button'),
            gameOverlay: document.getElementById('gameOverlay'),
            overlayTitle: document.getElementById('overlayTitle'),
            overlayMessage: document.getElementById('overlayMessage'),
            finalLevel: document.getElementById('finalLevel'),
            finalScore: document.getElementById('finalScore')
        };
        
        this.sounds = {
            red: document.getElementById('redSound'),
            yellow: document.getElementById('yellowSound'),
            blue: document.getElementById('blueSound'),
            green: document.getElementById('greenSound'),
            error: document.getElementById('errorSound'),
            success: document.getElementById('successSound'),
            levelUp: document.getElementById('levelUpSound'),
            gameOver: document.getElementById('gameOverSound'),
            victory: document.getElementById('victorySound')
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.showRestartButton();
        this.preloadSounds();
    }
    
    preloadSounds() {
        // Create different frequency sounds for each button
        this.createTone(this.sounds.red, 400); // Red - lower frequency
        this.createTone(this.sounds.yellow, 600); // Yellow - medium frequency
        this.createTone(this.sounds.blue, 800); // Blue - higher frequency
        this.createTone(this.sounds.green, 1000); // Green - highest frequency
        
        // Create special sounds
        this.createTone(this.sounds.success, 800, 0.5); // Success - higher pitch
        this.createTone(this.sounds.error, 200, 1.0); // Error - low pitch
        this.createTone(this.sounds.levelUp, 1200, 0.3); // Level up - very high pitch
        this.createTone(this.sounds.gameOver, 150, 1.5); // Game over - very low pitch
        this.createTone(this.sounds.victory, 1000, 0.8); // Victory - high pitch
        
        // Set volume for all sounds
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.volume = 0.2;
            }
        });
    }
    
    createTone(audioElement, frequency, duration = 0.3) {
        if (!audioElement) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        // Store the audio context and oscillator for later use
        audioElement.audioContext = audioContext;
        audioElement.oscillator = oscillator;
        audioElement.gainNode = gainNode;
        audioElement.duration = duration;
    }
    
    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        
        this.elements.buttons.forEach((button, index) => {
            button.addEventListener('click', () => this.handleButtonClick(index + 1));
        });
    }
    
    startGame() {
        if (this.gameState.isPlaying) return;
        
        this.resetGame();
        this.gameState.isPlaying = true;
        this.elements.startBtn.style.display = 'none';
        this.elements.restartBtn.style.display = 'inline-block';
        this.elements.gameStatus.textContent = 'Watch the sequence!';
        
        this.nextLevel();
    }
    
    restartGame() {
        this.resetGame();
        this.elements.startBtn.style.display = 'inline-block';
        this.elements.restartBtn.style.display = 'none';
        this.elements.gameStatus.textContent = 'Press START to begin!';
        this.elements.gameContainer.classList.remove('win', 'lose', 'game-over', 'victory');
        this.hideGameOverOverlay();
        
        // Reset overlay colors to default (red theme for game over)
        this.elements.gameOverlay.style.background = 'rgba(231, 76, 60, 0.9)';
        this.elements.overlayTitle.style.color = '#e74c3c';
        this.elements.finalLevel.style.color = '#e74c3c';
        this.elements.finalScore.style.color = '#e74c3c';
    }
    
    resetGame() {
        this.gameState = {
            isPlaying: false,
            isShowingSequence: false,
            level: 0,
            score: 0,
            sequence: [],
            playerSequence: [],
            currentIndex: 0
        };
        this.updateDisplay();
    }
    
    nextLevel() {
        this.gameState.level++;
        this.gameState.sequence.push(Math.floor(Math.random() * 4) + 1);
        this.gameState.playerSequence = [];
        this.gameState.currentIndex = 0;
        
        this.updateDisplay();
        this.elements.gameStatus.textContent = `Level ${this.gameState.level} - Watch carefully!`;
        
        setTimeout(() => {
            this.showSequence();
        }, 1000);
    }
    
    showSequence() {
        this.gameState.isShowingSequence = true;
        this.elements.gameStatus.textContent = 'Remember the pattern!';
        
        let i = 0;
        const showNext = () => {
            if (i < this.gameState.sequence.length) {
                const buttonIndex = this.gameState.sequence[i] - 1;
                this.activateButton(buttonIndex);
                i++;
                setTimeout(showNext, 800);
            } else {
                this.gameState.isShowingSequence = false;
                this.elements.gameStatus.textContent = 'Your turn! Repeat the sequence!';
            }
        };
        
        showNext();
    }
    
    activateButton(index) {
        const button = this.elements.buttons[index];
        const color = button.dataset.color;
        
        // Visual feedback - much brighter and more visible
        button.classList.add('active');
        
        // Sound feedback with better error handling
        this.playSound(color);
        
        setTimeout(() => {
            button.classList.remove('active');
        }, 600); // Longer duration for better visibility
    }
    
    playSound(soundName) {
        const sound = this.sounds[soundName];
        if (!sound) return;
        
        try {
            // Use Web Audio API for better sound generation
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Set frequency based on sound type
            let frequency = 400;
            let duration = 0.3;
            
            switch(soundName) {
                case 'red': frequency = 400; break;
                case 'yellow': frequency = 600; break;
                case 'blue': frequency = 800; break;
                case 'green': frequency = 1000; break;
                case 'success': frequency = 800; duration = 0.5; break;
                case 'error': frequency = 200; duration = 1.0; break;
                case 'levelUp': frequency = 1200; duration = 0.3; break;
                case 'gameOver': frequency = 150; duration = 1.5; break;
                case 'victory': frequency = 1000; duration = 0.8; break;
            }
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
            
        } catch (error) {
            console.log('Audio error:', error);
        }
    }
    
    handleButtonClick(buttonNumber) {
        if (!this.gameState.isPlaying || this.gameState.isShowingSequence) return;
        
        // Visual feedback
        const buttonIndex = buttonNumber - 1;
        const button = this.elements.buttons[buttonIndex];
        button.classList.add('clicked');
        
        // Sound feedback
        const color = button.dataset.color;
        this.playSound(color);
        
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 300);
        
        // Game logic
        this.gameState.playerSequence.push(buttonNumber);
        
        if (this.gameState.playerSequence[this.gameState.currentIndex] !== this.gameState.sequence[this.gameState.currentIndex]) {
            this.gameOver();
            return;
        }
        
        this.gameState.currentIndex++;
        
        if (this.gameState.playerSequence.length === this.gameState.sequence.length) {
            this.levelComplete();
        }
    }
    
    levelComplete() {
        this.gameState.score += this.gameState.level * 10;
        this.updateDisplay();
        
        // Success sound
        this.playSound('success');
        
        // Level up animation
        this.elements.levelNumber.classList.add('level-up');
        setTimeout(() => {
            this.elements.levelNumber.classList.remove('level-up');
        }, 500);
        
        if (this.gameState.level >= 20) {
            this.victory();
        } else {
            this.elements.gameStatus.textContent = 'Great! Next level...';
            setTimeout(() => {
                this.nextLevel();
            }, 1500);
        }
    }
    
    gameOver() {
        this.gameState.isPlaying = false;
        
        // Error sound
        this.playSound('gameOver');
        
        // Visual feedback
        this.elements.gameContainer.classList.add('lose', 'game-over');
        this.elements.gameStatus.textContent = `Game Over! You reached level ${this.gameState.level}`;
        
        // Show game over overlay
        this.showGameOverOverlay();
        
        setTimeout(() => {
            this.elements.gameContainer.classList.remove('lose');
        }, 2000);
    }
    
    showGameOverOverlay() {
        this.elements.finalLevel.textContent = this.gameState.level;
        this.elements.finalScore.textContent = this.gameState.score;
        this.elements.overlayTitle.textContent = 'Game Over!';
        this.elements.overlayMessage.textContent = 'Better luck next time!';
        this.elements.gameOverlay.classList.add('show');
    }
    
    hideGameOverOverlay() {
        this.elements.gameOverlay.classList.remove('show');
    }
    
    victory() {
        this.gameState.isPlaying = false;
        
        // Victory sound
        this.playSound('victory');
        
        // Visual feedback - use victory colors (green)
        this.elements.gameContainer.classList.add('win', 'victory');
        this.elements.gameStatus.textContent = '🎉 VICTORY! You completed all levels! 🎉';
        
        // Show victory overlay with green theme
        this.elements.finalLevel.textContent = this.gameState.level;
        this.elements.finalScore.textContent = this.gameState.score;
        this.elements.overlayTitle.textContent = '🎉 VICTORY! 🎉';
        this.elements.overlayMessage.textContent = 'Congratulations! You completed all 20 levels!';
        
        // Change overlay to victory theme
        this.elements.gameOverlay.style.background = 'rgba(39, 174, 96, 0.9)'; // Green background
        this.elements.overlayTitle.style.color = '#27ae60'; // Green text
        this.elements.finalLevel.style.color = '#27ae60';
        this.elements.finalScore.style.color = '#27ae60';
        
        this.elements.gameOverlay.classList.add('show');
        
        setTimeout(() => {
            this.elements.gameContainer.classList.remove('win');
        }, 3000);
    }
    
    updateDisplay() {
        this.elements.levelNumber.textContent = this.gameState.level;
        this.elements.scoreNumber.textContent = this.gameState.score;
    }
    
    showRestartButton() {
        this.elements.restartBtn.style.display = 'inline-block';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SimonGame();
});

