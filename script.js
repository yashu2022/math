// ===== Game Configuration =====
const CONFIG = {
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE', // Replace with your actual API key
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    
    DIFFICULTIES: {
        easy: { min: 1, max: 10, operations: ['+', '-'] },
        medium: { min: 1, max: 50, operations: ['+', '-', '*', '/'] },
        hard: { min: 1, max: 100, operations: ['+', '-', '*', '/'], complex: true },
        ai: { min: 1, max: 50, operations: ['+', '-', '*', '/'], wordProblems: true }
    },
    
    GAME_MODES: {
        practice: { timer: false, lives: Infinity, questions: Infinity, hints: Infinity },
        timeattack: { timer: 60, lives: Infinity, questions: Infinity, hints: 3 },
        challenge: { timer: false, lives: 3, questions: 10, hints: 3 },
        daily: { timer: false, lives: 3, questions: 10, hints: 2, ai: true }
    },
    
    BADGES: [
        { id: 'first_steps', name: 'First Steps', icon: '👣', condition: (stats) => stats.gamesPlayed >= 1 },
        { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', condition: (stats) => stats.fastAnswers >= 5 },
        { id: 'perfect_10', name: 'Perfect 10', icon: '🎯', condition: (stats) => stats.longestStreak >= 10 },
        { id: 'math_wizard', name: 'Math Wizard', icon: '🧙', condition: (stats) => stats.totalScore >= 1000 },
        { id: 'hint_helper', name: 'Hint Helper', icon: '💡', condition: (stats) => stats.hintsUsedCorrect >= 1 },
        { id: 'century_club', name: 'Century Club', icon: '💯', condition: (stats) => stats.totalQuestions >= 100 },
        { id: 'accuracy_ace', name: 'Accuracy Ace', icon: '🎪', condition: (stats) => stats.accuracy >= 90 && stats.totalQuestions >= 20 }
    ],
    
    POINTS: {
        correct: 10,
        streakBonus: 5,
        speedBonus: 5,
        noHintBonus: 3
    }
};

// ===== Game State =====
const gameState = {
    player: {
        name: '',
        avatar: ''
    },
    difficulty: '',
    mode: '',
    currentProblem: null,
    currentAnswer: null,
    score: 0,
    streak: 0,
    lives: 3,
    questionsAnswered: 0,
    correctAnswers: 0,
    totalQuestions: 10,
    timeLeft: 60,
    timerInterval: null,
    hintUsed: false,
    startTime: null,
    problemStartTime: null
};

// ===== Persistent Stats (localStorage) =====
let playerStats = {
    gamesPlayed: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    totalScore: 0,
    longestStreak: 0,
    fastAnswers: 0,
    hintsUsedCorrect: 0,
    timeSpent: 0,
    unlockedBadges: [],
    highScores: []
};

// ===== DOM Elements =====
const screens = {
    start: document.getElementById('startScreen'),
    difficulty: document.getElementById('difficultyScreen'),
    gameMode: document.getElementById('gameModeScreen'),
    game: document.getElementById('gameScreen'),
    results: document.getElementById('resultsScreen'),
    stats: document.getElementById('statsScreen')
};

const elements = {
    playerName: document.getElementById('playerName'),
    avatars: document.querySelectorAll('.avatar'),
    startBtn: document.getElementById('startBtn'),
    howToPlayBtn: document.getElementById('howToPlayBtn'),
    howToPlayModal: document.getElementById('howToPlayModal'),
    modalClose: document.querySelector('.close'),
    difficultyCards: document.querySelectorAll('.difficulty-card'),
    modeCards: document.querySelectorAll('.mode-card'),
    mathProblem: document.getElementById('mathProblem'),
    wordProblem: document.getElementById('wordProblem'),
    answerInput: document.getElementById('answerInput'),
    submitBtn: document.getElementById('submitBtn'),
    hintBtn: document.getElementById('hintBtn'),
    hintDisplay: document.getElementById('hintDisplay'),
    numberPad: document.getElementById('numberPad'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    streakDisplay: document.getElementById('streakDisplay'),
    questionNumber: document.getElementById('questionNumber'),
    timerDisplay: document.getElementById('timerDisplay'),
    timeLeft: document.getElementById('timeLeft'),
    livesDisplay: document.getElementById('livesDisplay'),
    progressFill: document.getElementById('progressFill'),
    playerAvatar: document.getElementById('playerAvatar'),
    playerNameDisplay: document.getElementById('playerNameDisplay'),
    feedbackOverlay: document.getElementById('feedbackOverlay'),
    confettiCanvas: document.getElementById('confettiCanvas'),
    mascot: document.querySelector('.mascot-mouth'),
    particles: document.getElementById('particles')
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    loadPlayerStats();
    displayHighScores();
    initializeEventListeners();
    createParticles();
    playBackgroundMusic();
});

// ===== Event Listeners =====
function initializeEventListeners() {
    // Start screen
    elements.playerName.addEventListener('input', validateStartButton);
    elements.avatars.forEach(avatar => {
        avatar.addEventListener('click', () => selectAvatar(avatar));
    });
    elements.startBtn.addEventListener('click', startGame);
    elements.howToPlayBtn.addEventListener('click', () => elements.howToPlayModal.classList.add('show'));
    elements.modalClose.addEventListener('click', () => elements.howToPlayModal.classList.remove('show'));
    
    // Difficulty selection
    elements.difficultyCards.forEach(card => {
        card.addEventListener('click', () => selectDifficulty(card.dataset.difficulty));
    });
    document.getElementById('backToDifficultyBtn').addEventListener('click', () => switchScreen('start'));
    
    // Game mode selection
    elements.modeCards.forEach(card => {
        card.addEventListener('click', () => selectGameMode(card.dataset.mode));
    });
    document.getElementById('backToModeBtn').addEventListener('click', () => switchScreen('difficulty'));
    
    // Game screen
    elements.submitBtn.addEventListener('click', submitAnswer);
    elements.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitAnswer();
    });
    elements.hintBtn.addEventListener('click', getHint);
    document.getElementById('quitGameBtn').addEventListener('click', quitGame);
    
    // Number pad
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', () => handleNumberPad(btn.dataset.num));
    });
    
    // Results screen
    document.getElementById('playAgainBtn').addEventListener('click', () => switchScreen('difficulty'));
    document.getElementById('viewStatsBtn').addEventListener('click', () => switchScreen('stats'));
    document.getElementById('backToMenuBtn').addEventListener('click', () => switchScreen('start'));
    
    // Stats screen
    document.getElementById('backFromStatsBtn').addEventListener('click', () => switchScreen('results'));
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterLeaderboard(btn));
    });
    
    // Modal close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === elements.howToPlayModal) {
            elements.howToPlayModal.classList.remove('show');
        }
    });
}

// ===== Screen Management =====
function switchScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// ===== Start Screen Functions =====
function validateStartButton() {
    const hasName = elements.playerName.value.trim().length > 0;
    const hasAvatar = document.querySelector('.avatar.selected') !== null;
    elements.startBtn.disabled = !(hasName && hasAvatar);
}

function selectAvatar(avatarElement) {
    elements.avatars.forEach(a => a.classList.remove('selected'));
    avatarElement.classList.add('selected');
    gameState.player.avatar = avatarElement.dataset.avatar;
    validateStartButton();
}

function startGame() {
    gameState.player.name = elements.playerName.value.trim();
    switchScreen('difficulty');
}

// ===== Difficulty Selection =====
function selectDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    switchScreen('gameMode');
}

// ===== Game Mode Selection =====
function selectGameMode(mode) {
    gameState.mode = mode;
    initializeGame();
    switchScreen('game');
}

// ===== Game Initialization =====
function initializeGame() {
    const modeConfig = CONFIG.GAME_MODES[gameState.mode];
    
    // Reset game state
    gameState.score = 0;
    gameState.streak = 0;
    gameState.lives = modeConfig.lives;
    gameState.questionsAnswered = 0;
    gameState.correctAnswers = 0;
    gameState.totalQuestions = modeConfig.questions;
    gameState.timeLeft = modeConfig.timer || 0;
    gameState.hintUsed = false;
    gameState.startTime = Date.now();
    
    // Update UI
    elements.playerAvatar.textContent = gameState.player.avatar;
    elements.playerNameDisplay.textContent = gameState.player.name;
    updateGameUI();
    updateLives();
    
    // Start timer if applicable
    if (modeConfig.timer) {
        elements.timerDisplay.style.display = 'flex';
        startTimer();
    } else {
        elements.timerDisplay.style.display = 'none';
    }
    
    // Generate first problem
    generateProblem();
}

// ===== Problem Generation =====
async function generateProblem() {
    gameState.problemStartTime = Date.now();
    gameState.hintUsed = false;
    elements.hintDisplay.classList.remove('show');
    elements.answerInput.value = '';
    elements.answerInput.focus();
    
    const diffConfig = CONFIG.DIFFICULTIES[gameState.difficulty];
    
    if (diffConfig.wordProblems && Math.random() > 0.5) {
        await generateAIWordProblem();
    } else {
        generateMathProblem(diffConfig);
    }
}

function generateMathProblem(config) {
    elements.wordProblem.style.display = 'none';
    elements.mathProblem.style.display = 'block';
    
    const num1 = randomInt(config.min, config.max);
    const num2 = randomInt(config.min, config.max);
    const operation = config.operations[Math.floor(Math.random() * config.operations.length)];
    
    let problem, answer;
    
    switch (operation) {
        case '+':
            problem = `${num1} + ${num2} = ?`;
            answer = num1 + num2;
            break;
        case '-':
            const larger = Math.max(num1, num2);
            const smaller = Math.min(num1, num2);
            problem = `${larger} - ${smaller} = ?`;
            answer = larger - smaller;
            break;
        case '*':
            problem = `${num1} × ${num2} = ?`;
            answer = num1 * num2;
            break;
        case '/':
            const divisor = randomInt(1, 10);
            const quotient = randomInt(config.min, Math.floor(config.max / divisor));
            const dividend = divisor * quotient;
            problem = `${dividend} ÷ ${divisor} = ?`;
            answer = quotient;
            break;
    }
    
    if (config.complex && Math.random() > 0.7) {
        const num3 = randomInt(config.min, 20);
        const op2 = config.operations[Math.floor(Math.random() * 2)]; // + or -
        if (op2 === '+') {
            problem = problem.replace(' = ?', ` + ${num3} = ?`);
            answer += num3;
        } else {
            problem = problem.replace(' = ?', ` - ${num3} = ?`);
            answer -= num3;
        }
    }
    
    elements.mathProblem.textContent = problem;
    gameState.currentProblem = problem;
    gameState.currentAnswer = answer;
}

async function generateAIWordProblem() {
    elements.wordProblem.style.display = 'block';
    elements.mathProblem.style.display = 'block';
    elements.wordProblem.textContent = 'Generating AI word problem...';
    
    const diffConfig = CONFIG.DIFFICULTIES[gameState.difficulty];
    const themes = ['space', 'animals', 'sports', 'food', 'toys', 'nature'];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    
    const prompt = `Create a simple, fun math word problem for kids about ${theme}. 
    Use numbers between ${diffConfig.min} and ${diffConfig.max}. 
    Use only these operations: ${diffConfig.operations.join(', ')}.
    Make it engaging and age-appropriate.
    Format: First line is the word problem, second line is just the math equation (like "5 + 3 = ?"), third line is just the numeric answer.
    Keep it short and simple!`;
    
    try {
        const response = await callGeminiAPI(prompt);
        const lines = response.trim().split('\n').filter(line => line.trim());
        
        if (lines.length >= 3) {
            elements.wordProblem.textContent = lines[0];
            elements.mathProblem.textContent = lines[1];
            gameState.currentProblem = lines[0] + ' ' + lines[1];
            gameState.currentAnswer = parseInt(lines[2].replace(/[^0-9-]/g, ''));
        } else {
            // Fallback to regular problem
            generateMathProblem(diffConfig);
        }
    } catch (error) {
        console.error('AI word problem generation failed:', error);
        generateMathProblem(diffConfig);
    }
}

// ===== Answer Submission =====
function submitAnswer() {
    const userAnswer = parseInt(elements.answerInput.value);
    
    if (isNaN(userAnswer)) {
        showFeedback('Please enter a number!', 'wrong');
        return;
    }
    
    const isCorrect = userAnswer === gameState.currentAnswer;
    const timeTaken = Date.now() - gameState.problemStartTime;
    const isFast = timeTaken < 5000;
    
    if (isCorrect) {
        handleCorrectAnswer(isFast);
    } else {
        handleWrongAnswer();
    }
    
    gameState.questionsAnswered++;
    updateGameUI();
    
    // Check if game should end
    setTimeout(() => {
        if (shouldEndGame()) {
            endGame();
        } else {
            generateProblem();
        }
    }, 1500);
}

function handleCorrectAnswer(isFast) {
    gameState.correctAnswers++;
    gameState.streak++;
    
    // Calculate points
    let points = CONFIG.POINTS.correct;
    if (gameState.streak > 1) points += CONFIG.POINTS.streakBonus;
    if (isFast) {
        points += CONFIG.POINTS.speedBonus;
        playerStats.fastAnswers++;
    }
    if (!gameState.hintUsed) points += CONFIG.POINTS.noHintBonus;
    
    gameState.score += points;
    
    // Update stats
    if (gameState.hintUsed) playerStats.hintsUsedCorrect++;
    if (gameState.streak > playerStats.longestStreak) {
        playerStats.longestStreak = gameState.streak;
    }
    
    // Visual feedback
    showFeedback('✓ Correct!', 'correct');
    playSound('correct');
    triggerConfetti();
    updateMascot('happy');
    animateScore();
}

function handleWrongAnswer() {
    gameState.streak = 0;
    
    if (gameState.lives !== Infinity) {
        gameState.lives--;
        updateLives();
    }
    
    showFeedback(`✗ Wrong! Answer: ${gameState.currentAnswer}`, 'wrong');
    playSound('wrong');
    updateMascot('sad');
    shakeScreen();
}

// ===== Hint System =====
async function getHint() {
    if (gameState.hintUsed) return;
    
    gameState.hintUsed = true;
    elements.hintDisplay.textContent = 'Getting hint from AI...';
    elements.hintDisplay.classList.add('show');
    
    const prompt = `You are a friendly math tutor for kids. Explain how to solve this problem step-by-step in a fun, encouraging way: ${gameState.currentProblem}
    
    Use simple language, emojis, and break it down into easy steps. Don't give the final answer directly, but guide them to find it.
    Keep it short (2-3 sentences max).`;
    
    try {
        const hint = await callGeminiAPI(prompt);
        elements.hintDisplay.textContent = '💡 ' + hint;
    } catch (error) {
        elements.hintDisplay.textContent = '💡 Try breaking the problem into smaller parts! What numbers do you see?';
    }
}

// ===== Gemini API Integration =====
async function callGeminiAPI(prompt) {
    if (CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        throw new Error('Please set your Gemini API key in the CONFIG object');
    }
    
    const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });
    
    if (!response.ok) {
        throw new Error('API request failed');
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// ===== Timer =====
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        elements.timeLeft.textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 10) {
            elements.timerDisplay.classList.add('warning');
        }
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            endGame();
        }
    }, 1000);
}

// ===== UI Updates =====
function updateGameUI() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.streakDisplay.textContent = gameState.streak;
    elements.questionNumber.textContent = `${gameState.questionsAnswered}/${gameState.totalQuestions === Infinity ? '∞' : gameState.totalQuestions}`;
    
    if (gameState.totalQuestions !== Infinity) {
        const progress = (gameState.questionsAnswered / gameState.totalQuestions) * 100;
        elements.progressFill.style.width = `${progress}%`;
    }
}

function updateLives() {
    if (gameState.lives === Infinity) {
        elements.livesDisplay.style.display = 'none';
        return;
    }
    
    elements.livesDisplay.style.display = 'flex';
    elements.livesDisplay.innerHTML = '❤️'.repeat(Math.max(0, gameState.lives));
}

function animateScore() {
    elements.scoreDisplay.style.transform = 'scale(1.3)';
    setTimeout(() => {
        elements.scoreDisplay.style.transform = 'scale(1)';
    }, 300);
}

// ===== Number Pad =====
function handleNumberPad(num) {
    if (num === 'clear') {
        elements.answerInput.value = '';
    } else {
        elements.answerInput.value += num;
    }
    elements.answerInput.focus();
}

// ===== Visual Effects =====
function showFeedback(message, type) {
    elements.feedbackOverlay.textContent = message;
    elements.feedbackOverlay.className = `feedback-overlay show ${type}`;
    
    setTimeout(() => {
        elements.feedbackOverlay.classList.remove('show');
    }, 1500);
}

function updateMascot(mood) {
    elements.mascot.className = `mascot-mouth ${mood}`;
}

function shakeScreen() {
    document.body.style.animation = 'shake 0.5s';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);
}

function triggerConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const colors = ['#a855f7', '#ec4899', '#f59e0b', '#3b82f6', '#10b981'];
    
    for (let i = 0; i < 50; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1
        });
    }
    
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((piece, index) => {
            ctx.fillStyle = piece.color;
            ctx.fillRect(piece.x, piece.y, piece.size, piece.size);
            
            piece.y += piece.speedY;
            piece.x += piece.speedX;
            
            if (piece.y > canvas.height) {
                confetti.splice(index, 1);
            }
        });
        
        if (confetti.length > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animateConfetti();
}

function createParticles() {
    const particlesContainer = elements.particles;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.opacity = Math.random() * 0.5 + 0.2;
        particle.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        particlesContainer.appendChild(particle);
    }
}

// ===== Game End =====
function shouldEndGame() {
    if (gameState.lives <= 0) return true;
    if (gameState.totalQuestions !== Infinity && gameState.questionsAnswered >= gameState.totalQuestions) return true;
    return false;
}

function quitGame() {
    if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
        if (gameState.timerInterval) clearInterval(gameState.timerInterval);
        switchScreen('start');
    }
}

function endGame() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    
    // Update stats
    const timeSpent = Math.floor((Date.now() - gameState.startTime) / 1000 / 60);
    playerStats.gamesPlayed++;
    playerStats.totalQuestions += gameState.questionsAnswered;
    playerStats.correctAnswers += gameState.correctAnswers;
    playerStats.totalScore += gameState.score;
    playerStats.timeSpent += timeSpent;
    
    // Check for new badges
    const newBadges = checkBadges();
    
    // Add to high scores
    addHighScore();
    
    // Save stats
    savePlayerStats();
    
    // Display results
    displayResults(newBadges);
    switchScreen('results');
}

function displayResults(newBadges) {
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('questionsAnswered').textContent = gameState.questionsAnswered;
    document.getElementById('correctAnswers').textContent = gameState.correctAnswers;
    
    const accuracy = gameState.questionsAnswered > 0 
        ? Math.round((gameState.correctAnswers / gameState.questionsAnswered) * 100) 
        : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
    document.getElementById('bestStreak').textContent = gameState.streak;
    
    // Display new badges
    const newBadgesContainer = document.getElementById('newBadges');
    newBadgesContainer.innerHTML = '';
    
    if (newBadges.length > 0) {
        const title = document.createElement('h3');
        title.textContent = '🎉 New Badges Unlocked!';
        newBadgesContainer.appendChild(title);
        
        newBadges.forEach(badge => {
            const badgeEl = document.createElement('div');
            badgeEl.className = 'badge';
            badgeEl.innerHTML = `<span>${badge.icon}</span><span>${badge.name}</span>`;
            newBadgesContainer.appendChild(badgeEl);
        });
        
        playSound('achievement');
    }
}

// ===== Badges System =====
function checkBadges() {
    const newBadges = [];
    const stats = {
        gamesPlayed: playerStats.gamesPlayed,
        fastAnswers: playerStats.fastAnswers,
        longestStreak: playerStats.longestStreak,
        totalScore: playerStats.totalScore,
        hintsUsedCorrect: playerStats.hintsUsedCorrect,
        totalQuestions: playerStats.totalQuestions,
        accuracy: playerStats.totalQuestions > 0 
            ? (playerStats.correctAnswers / playerStats.totalQuestions) * 100 
            : 0
    };
    
    CONFIG.BADGES.forEach(badge => {
        if (!playerStats.unlockedBadges.includes(badge.id) && badge.condition(stats)) {
            playerStats.unlockedBadges.push(badge.id);
            newBadges.push(badge);
        }
    });
    
    return newBadges;
}

// ===== High Scores =====
function addHighScore() {
    const score = {
        name: gameState.player.name,
        avatar: gameState.player.avatar,
        score: gameState.score,
        difficulty: gameState.difficulty,
        mode: gameState.mode,
        date: new Date().toLocaleDateString()
    };
    
    playerStats.highScores.push(score);
    playerStats.highScores.sort((a, b) => b.score - a.score);
    playerStats.highScores = playerStats.highScores.slice(0, 50); // Keep top 50
}

function displayHighScores() {
    const container = document.getElementById('highScoresList');
    container.innerHTML = '';
    
    const topScores = playerStats.highScores.slice(0, 5);
    
    if (topScores.length === 0) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.7;">No scores yet!</p>';
        return;
    }
    
    topScores.forEach((score, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        scoreItem.innerHTML = `
            <span>${index + 1}. ${score.avatar} ${score.name}</span>
            <span>${score.score} pts</span>
        `;
        container.appendChild(scoreItem);
    });
}

// ===== Statistics Screen =====
function filterLeaderboard(btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filter = btn.dataset.filter;
    displayLeaderboard(filter);
}

function displayLeaderboard(filter = 'all') {
    const container = document.getElementById('leaderboardDisplay');
    container.innerHTML = '';
    
    let scores = playerStats.highScores;
    if (filter !== 'all') {
        scores = scores.filter(s => s.difficulty === filter);
    }
    
    scores.slice(0, 10).forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <span class="leaderboard-rank">#${index + 1}</span>
            <div>
                <div>${score.avatar} ${score.name}</div>
                <div style="font-size: 0.8rem; opacity: 0.7;">${score.difficulty} - ${score.mode} - ${score.date}</div>
            </div>
            <span style="font-family: var(--font-primary); font-size: 1.5rem; color: var(--primary-yellow);">${score.score}</span>
        `;
        container.appendChild(item);
    });
    
    if (scores.length === 0) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.7;">No scores for this difficulty yet!</p>';
    }
}

// Update stats display
function updateStatsDisplay() {
    document.getElementById('totalQuestions').textContent = playerStats.totalQuestions;
    
    const accuracy = playerStats.totalQuestions > 0 
        ? Math.round((playerStats.correctAnswers / playerStats.totalQuestions) * 100) 
        : 0;
    document.getElementById('totalAccuracy').textContent = accuracy + '%';
    document.getElementById('longestStreak').textContent = playerStats.longestStreak;
    document.getElementById('timeSpent').textContent = playerStats.timeSpent;
    
    // Display badges
    const badgesContainer = document.getElementById('badgesDisplay');
    badgesContainer.innerHTML = '';
    
    CONFIG.BADGES.forEach(badge => {
        const badgeItem = document.createElement('div');
        badgeItem.className = 'badge-item';
        if (playerStats.unlockedBadges.includes(badge.id)) {
            badgeItem.classList.add('unlocked');
        }
        badgeItem.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${badge.icon}</div>
            <div style="font-size: 0.9rem;">${badge.name}</div>
        `;
        badgesContainer.appendChild(badgeItem);
    });
    
    displayLeaderboard('all');
}

// ===== LocalStorage =====
function savePlayerStats() {
    localStorage.setItem('mathMasterStats', JSON.stringify(playerStats));
}

function loadPlayerStats() {
    const saved = localStorage.getItem('mathMasterStats');
    if (saved) {
        playerStats = JSON.parse(saved);
    }
}

// ===== Audio =====
function playBackgroundMusic() {
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.3;
    // Auto-play is often blocked, so we'll start on first user interaction
    document.addEventListener('click', () => {
        bgMusic.play().catch(() => {});
    }, { once: true });
}

function playSound(type) {
    const sound = document.getElementById(type + 'Sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

// ===== Utility Functions =====
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Update stats when viewing stats screen
document.getElementById('viewStatsBtn').addEventListener('click', () => {
    updateStatsDisplay();
});
