// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const gameCards = document.querySelectorAll('.game-card');

// Game Navigation Function
function navigateToGame(gameType) {
    // Show loading overlay
    showLoadingOverlay();
    
    // Simulate loading time
    setTimeout(() => {
            // Navigate to the appropriate game
    if (gameType === 'simon') {
        window.location.href = 'simon game/index.html';
    } else if (gameType === 'rps') {
        window.location.href = 'RPS_Game/base.html';
    } else if (gameType === 'tictactoe') {
        window.location.href = 'tic-tac-toe/index.html';
    } else if (gameType === 'battleship') {
        window.location.href = 'battleship/index.html';
    }
    }, 1500); // 1.5 second loading animation
}

// Loading Overlay Functions
function showLoadingOverlay() {
    loadingOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function hideLoadingOverlay() {
    loadingOverlay.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Add click event listeners to game cards
gameCards.forEach(card => {
    card.addEventListener('click', function() {
        // Add click animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});

// Add hover effects for game cards
gameCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('game-card')) {
            const gameType = focusedElement.getAttribute('onclick')?.includes('simon') ? 'simon' : 'rps';
            navigateToGame(gameType);
        }
    }
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on page load
window.addEventListener('load', function() {
    // Animate game cards on page load
    gameCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 200);
    });
    
    // Animate stats cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-30px)';
            card.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateX(0)';
            }, 100);
        }, (index + 2) * 200);
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroTitle && heroSubtitle) {
        heroTitle.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroSubtitle.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Add game card hover sound effect (optional)
function playHoverSound() {
    // Create a simple hover sound effect
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
}

// Add hover sound to game cards (optional - can be disabled)
gameCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        // Uncomment the line below to enable hover sounds
        // playHoverSound();
    });
});

// Add back to hub functionality (for game pages)
function addBackToHubButton() {
    // This function can be called from game pages to add a back button
    const backButton = document.createElement('button');
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Hub';
    backButton.className = 'back-to-hub-btn';
    backButton.onclick = () => window.location.href = '../index.html';
    
    // Style the back button
    backButton.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: linear-gradient(135deg, #00d4ff, #4ecdc4);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-family: 'Orbitron', monospace;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    backButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = '0 10px 20px rgba(0, 212, 255, 0.3)';
    });
    
    backButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = 'none';
    });
    
    document.body.appendChild(backButton);
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key to hide loading overlay
    if (event.key === 'Escape') {
        hideLoadingOverlay();
    }
    
    // Number keys for quick game selection
    if (event.key === '1') {
        navigateToGame('simon');
    } else if (event.key === '2') {
        navigateToGame('rps');
    } else if (event.key === '3') {
        navigateToGame('tictactoe');
    } else if (event.key === '4') {
        navigateToGame('battleship');
    }
});

// Add game statistics tracking (local storage)
function updateGameStats(gameType) {
    const stats = JSON.parse(localStorage.getItem('playstationStats') || '{}');
    
    if (!stats[gameType]) {
        stats[gameType] = {
            plays: 0,
            lastPlayed: null
        };
    }
    
    stats[gameType].plays++;
    stats[gameType].lastPlayed = new Date().toISOString();
    
    localStorage.setItem('playstationStats', JSON.stringify(stats));
}

// Initialize page with any saved data
function initializePage() {
    // Load and display any saved statistics
    const stats = JSON.parse(localStorage.getItem('playstationStats') || '{}');
    
    // Update play counts if available
    if (stats.simon) {
        const simonCard = document.querySelector('.game-card[onclick*="simon"]');
        if (simonCard) {
            const playCount = simonCard.querySelector('.game-stats span:last-child');
            if (playCount) {
                playCount.innerHTML = `<i class="fas fa-users"></i> ${stats.simon.plays} plays`;
            }
        }
    }
    
    if (stats.rps) {
        const rpsCard = document.querySelector('.game-card[onclick*="rps"]');
        if (rpsCard) {
            const playCount = rpsCard.querySelector('.game-stats span:last-child');
            if (playCount) {
                playCount.innerHTML = `<i class="fas fa-users"></i> ${stats.rps.plays} plays`;
            }
        }
    }
}

// Call initialization when page loads
document.addEventListener('DOMContentLoaded', initializePage);

// Add smooth page transitions
function addPageTransitions() {
    // Add fade out effect when navigating
    document.addEventListener('click', function(e) {
        if (e.target.closest('.game-card')) {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.3s ease';
        }
    });
}

// Initialize page transitions
addPageTransitions(); 