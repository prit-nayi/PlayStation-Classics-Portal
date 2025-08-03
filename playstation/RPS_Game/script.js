// Game State
let gameState = {
    playerScore: 0,
    computerScore: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    currentStreak: 0,
    bestStreak: 0,
    round: 1,
    battleHistory: [],
    isAutoPlaying: false,
    autoPlayInterval: null
};

// DOM Elements
const elements = {
    playerChoice: document.getElementById('playerChoice'),
    computerChoice: document.getElementById('computerChoice'),
    playerScore: document.getElementById('playerScore'),
    computerScore: document.getElementById('computerScore'),
    wins: document.getElementById('wins'),
    losses: document.getElementById('losses'),
    ties: document.getElementById('ties'),
    streak: document.getElementById('streak'),
    roundNumber: document.getElementById('roundNumber'),
    battleStatus: document.getElementById('battleStatus'),
    resultDisplay: document.getElementById('resultDisplay'),
    resultIcon: document.getElementById('resultIcon'),
    resultText: document.getElementById('resultText'),
    historyList: document.getElementById('historyList'),
    autoPlayText: document.getElementById('autoPlayText')
};

// Sound effects using Web Audio API
const sounds = {
    rock: createTone(400, 0.3),
    paper: createTone(600, 0.3),
    scissors: createTone(800, 0.3),
    win: createTone(1000, 0.5),
    lose: createTone(200, 0.8),
    tie: createTone(500, 0.4)
};

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    setupEventListeners();
});

function setupEventListeners() {
    // Add hover effects to weapon buttons
    document.querySelectorAll('.weapon-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            const weapon = btn.dataset.weapon;
            playSound(weapon);
        });
    });
}

function createTone(frequency, duration) {
    return { frequency, duration };
}

function playSound(soundName) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const sound = sounds[soundName];
        oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (error) {
        console.log('Audio error:', error);
    }
}

function play(userChoice) {
    // Disable buttons during animation
    disableWeaponButtons();
    
    // Show player choice
    showChoice(elements.playerChoice, userChoice);
    playSound(userChoice);
    
    // Update battle status
    elements.battleStatus.textContent = 'CPU is choosing...';
    
    // Simulate computer thinking
    setTimeout(() => {
        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        
        // Show computer choice
        showChoice(elements.computerChoice, computerChoice);
        playSound(computerChoice);
        
        // Determine winner
        const result = determineWinner(userChoice, computerChoice);
        
        // Update game state
        updateGameState(result, userChoice, computerChoice);
        
        // Show result
        showResult(result, userChoice, computerChoice);
        
        // Re-enable buttons
        setTimeout(() => {
            if (!gameState.isAutoPlaying) {
                enableWeaponButtons();
                elements.battleStatus.textContent = 'Choose your weapon!';
            } else {
                elements.battleStatus.textContent = 'Auto-play mode active!';
            }
        }, 2000);
        
    }, 1000);
}

function showChoice(choiceElement, choice) {
    choiceElement.innerHTML = '';
    choiceElement.classList.add('active');
    
    const icon = document.createElement('div');
    icon.className = 'choice-icon';
    icon.textContent = getChoiceIcon(choice);
    choiceElement.appendChild(icon);
    
    setTimeout(() => {
        choiceElement.classList.remove('active');
    }, 600);
}

function getChoiceIcon(choice) {
    const icons = {
        rock: '🪨',
        paper: '📄',
        scissors: '✂️'
    };
    return icons[choice] || '❓';
}

function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return 'tie';
    }
    
    const winningCombos = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
    };
    
    return winningCombos[playerChoice] === computerChoice ? 'win' : 'lose';
}

function updateGameState(result, playerChoice, computerChoice) {
    // Update scores
    if (result === 'win') {
        gameState.playerScore += 10;
        gameState.wins++;
        gameState.currentStreak++;
        if (gameState.currentStreak > gameState.bestStreak) {
            gameState.bestStreak = gameState.currentStreak;
        }
    } else if (result === 'lose') {
        gameState.computerScore += 10;
        gameState.losses++;
        gameState.currentStreak = 0;
    } else {
        gameState.ties++;
    }
    
    // Add to battle history
    gameState.battleHistory.unshift({
        round: gameState.round,
        playerChoice,
        computerChoice,
        result
    });
    
    // Keep only last 10 battles
    if (gameState.battleHistory.length > 10) {
        gameState.battleHistory.pop();
    }
    
    gameState.round++;
    
    updateDisplay();
    updateBattleHistory();
}

function showResult(result, playerChoice, computerChoice) {
    const resultConfig = {
        win: {
            icon: '🏆',
            text: 'VICTORY!',
            sound: 'win',
            animation: 'victory'
        },
        lose: {
            icon: '💀',
            text: 'DEFEAT!',
            sound: 'lose',
            animation: 'defeat'
        },
        tie: {
            icon: '🤝',
            text: 'TIE!',
            sound: 'tie',
            animation: 'tie'
        }
    };
    
    const config = resultConfig[result];
    
    // Play sound
    playSound(config.sound);
    
    // Update result display
    elements.resultIcon.textContent = config.icon;
    elements.resultText.textContent = config.text;
    
    // Add animation class
    elements.resultDisplay.classList.add(config.animation);
    
    // Remove animation class after animation completes
    setTimeout(() => {
        elements.resultDisplay.classList.remove(config.animation);
    }, 1000);
}

function updateDisplay() {
    elements.playerScore.textContent = gameState.playerScore;
    elements.computerScore.textContent = gameState.computerScore;
    elements.wins.textContent = gameState.wins;
    elements.losses.textContent = gameState.losses;
    elements.ties.textContent = gameState.ties;
    elements.streak.textContent = gameState.currentStreak;
    elements.roundNumber.textContent = gameState.round;
}

function updateBattleHistory() {
    elements.historyList.innerHTML = '';
    
    gameState.battleHistory.forEach(battle => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${battle.result}`;
        
        historyItem.innerHTML = `
            <div class="history-round">R${battle.round}</div>
            <div class="history-choices">
                <span class="history-choice">${getChoiceIcon(battle.playerChoice)}</span>
                <span>vs</span>
                <span class="history-choice">${getChoiceIcon(battle.computerChoice)}</span>
            </div>
            <div class="history-result ${battle.result}">${battle.result.toUpperCase()}</div>
        `;
        
        elements.historyList.appendChild(historyItem);
    });
}

function disableWeaponButtons() {
    document.querySelectorAll('.weapon-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
}

function enableWeaponButtons() {
    document.querySelectorAll('.weapon-btn').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
    });
}

function resetGame() {
    // Stop auto-play if active
    if (gameState.isAutoPlaying) {
        toggleAutoPlay();
    }
    
    gameState = {
        playerScore: 0,
        computerScore: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        currentStreak: 0,
        bestStreak: gameState.bestStreak, // Keep best streak
        round: 1,
        battleHistory: [],
        isAutoPlaying: false,
        autoPlayInterval: null
    };
    
    // Clear displays
    elements.playerChoice.innerHTML = '<div class="choice-placeholder"><i class="fas fa-question"></i></div>';
    elements.computerChoice.innerHTML = '<div class="choice-placeholder"><i class="fas fa-question"></i></div>';
    elements.resultIcon.textContent = '🎯';
    elements.resultText.textContent = 'Ready to battle!';
    elements.battleStatus.textContent = 'Choose your weapon!';
    
    updateDisplay();
    updateBattleHistory();
    enableWeaponButtons();
}

function toggleAutoPlay() {
    if (gameState.isAutoPlaying) {
        // Stop auto-play
        gameState.isAutoPlaying = false;
        if (gameState.autoPlayInterval) {
            clearInterval(gameState.autoPlayInterval);
            gameState.autoPlayInterval = null;
        }
        elements.autoPlayText.textContent = 'AUTO PLAY';
        document.querySelector('.auto-play-btn').classList.remove('active');
        enableWeaponButtons();
        elements.battleStatus.textContent = 'Choose your weapon!';
    } else {
        // Start auto-play
        gameState.isAutoPlaying = true;
        elements.autoPlayText.textContent = 'STOP AUTO';
        document.querySelector('.auto-play-btn').classList.add('active');
        elements.battleStatus.textContent = 'Auto-play mode active!';
        
        // Start the first auto-play immediately
        setTimeout(() => {
            if (gameState.isAutoPlaying) {
                const choices = ['rock', 'paper', 'scissors'];
                const randomChoice = choices[Math.floor(Math.random() * choices.length)];
                play(randomChoice);
            }
        }, 500);
        
        // Set up continuous auto-play
        gameState.autoPlayInterval = setInterval(() => {
            if (!gameState.isAutoPlaying) return;
            
            const choices = ['rock', 'paper', 'scissors'];
            const randomChoice = choices[Math.floor(Math.random() * choices.length)];
            play(randomChoice);
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    .result-display.victory {
        animation: victory 0.5s ease-in-out;
    }
    
    .result-display.defeat {
        animation: defeat 0.5s ease-in-out;
    }
    
    .result-display.tie {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes victory {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    @keyframes defeat {
        0% { transform: scale(1); }
        50% { transform: scale(0.9); }
        100% { transform: scale(1); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);