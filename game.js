// Game state
let currentArticle = null;
let revealedSections = [];
let attempts = 0;
let gameOver = false;

// DOM elements
const sectionsList = document.getElementById('sections-list');
const guessInput = document.getElementById('guess-input');
const submitButton = document.getElementById('submit-guess');
const feedback = document.getElementById('feedback');
const gameOverDiv = document.getElementById('game-over');
const resultMessage = document.getElementById('result-message');
const articleLink = document.getElementById('article-link');
const scoreDisplay = document.getElementById('score-display');
const shareButton = document.getElementById('share-button');
const attemptCount = document.getElementById('attempt-count');
const totalSections = document.getElementById('total-sections');
const countdown = document.getElementById('countdown');
const clearStateButton = document.getElementById('clear-state');
const gamesPlayedEl = document.getElementById('games-played');
const winRateEl = document.getElementById('win-rate');
const currentStreakEl = document.getElementById('current-streak');
const bestStreakEl = document.getElementById('best-streak');

// Initialize game on load
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
    updateCountdown();
    setInterval(updateCountdown, 1000);
});

function initGame() {
    const todayArticle = getTodaysArticle();

    if (!todayArticle) {
        feedback.textContent = 'No article available for today. Check back tomorrow!';
        feedback.className = 'incorrect';
        submitButton.disabled = true;
        return;
    }

    currentArticle = todayArticle;
    totalSections.textContent = currentArticle.sections.length;

    // Check localStorage for saved progress
    const savedState = loadGameState();

    if (savedState && savedState.date === getDateString()) {
        // Resume saved game
        revealedSections = savedState.revealedSections;
        attempts = savedState.attempts;
        gameOver = savedState.gameOver;

        if (gameOver) {
            showGameOver(savedState.won);
        } else {
            renderSections();
        }
    } else {
        // New game - reveal first section
        revealedSections.push(currentArticle.sections[0]);
        renderSections();
        saveGameState();
    }
}

function setupEventListeners() {
    submitButton.addEventListener('click', handleGuess);
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleGuess();
        }
    });
    shareButton.addEventListener('click', shareResult);
    clearStateButton.addEventListener('click', clearState);
}

function handleGuess() {
    if (gameOver) return;

    const guess = guessInput.value.trim();

    if (!guess) {
        feedback.textContent = 'Please enter a guess.';
        feedback.className = 'incorrect';
        return;
    }

    attempts++;
    attemptCount.textContent = attempts;

    if (checkAnswer(guess, currentArticle.answer)) {
        // Correct!
        feedback.textContent = 'Correct!';
        feedback.className = 'correct';
        gameOver = true;
        saveGameState(true);
        setTimeout(() => showGameOver(true), 500);
    } else {
        // Wrong - reveal next section
        feedback.textContent = 'Incorrect. Revealing next section...';
        feedback.className = 'incorrect';

        if (revealedSections.length < currentArticle.sections.length) {
            revealedSections.push(currentArticle.sections[revealedSections.length]);
            renderSections();
            saveGameState();
        } else {
            // Out of sections
            gameOver = true;
            saveGameState(false);
            setTimeout(() => showGameOver(false), 500);
        }
    }

    guessInput.value = '';
}

function checkAnswer(guess, answer) {
    // Normalize both strings: lowercase, remove extra spaces
    const normalizedGuess = guess.toLowerCase().replace(/\s+/g, ' ').trim();
    const normalizedAnswer = answer.toLowerCase().replace(/\s+/g, ' ').trim();

    // Require minimum 3 characters to prevent single letter matches
    if (normalizedGuess.length < 3) {
        return false;
    }

    // Remove parenthetical content from answer for main comparison
    // e.g., "Queen (band)" becomes "Queen"
    const answerWithoutParens = normalizedAnswer.replace(/\s*\([^)]*\)/g, '').trim();

    // Check for exact match
    if (normalizedGuess === normalizedAnswer || normalizedGuess === answerWithoutParens) {
        return true;
    }

    // Extract meaningful words (3+ characters) from both
    const guessWords = normalizedGuess.split(/\s+/).filter(w => w.length >= 3);
    const answerWords = answerWithoutParens.split(/\s+/).filter(w => w.length >= 3);

    // Check if all guess words are found in answer words (allows partial word matching)
    const allGuessWordsMatch = guessWords.every(guessWord =>
        answerWords.some(answerWord =>
            answerWord.includes(guessWord) || guessWord.includes(answerWord)
        )
    );

    // Also check if the main answer starts with the guess
    const startsWithGuess = answerWithoutParens.startsWith(normalizedGuess);

    return allGuessWordsMatch || startsWithGuess;
}

function renderSections() {
    sectionsList.innerHTML = '';

    // Only render revealed sections (not all sections)
    revealedSections.forEach((section, index) => {
        const li = document.createElement('li');
        li.textContent = section;
        li.className = 'revealed';

        // Check if it's a nested section (contains →)
        if (section.includes('→')) {
            li.classList.add('nested');
        }

        sectionsList.appendChild(li);
    });
}

function showGameOver(won) {
    gameOver = true;
    guessInput.disabled = true;
    submitButton.disabled = true;
    feedback.style.display = 'none';
    gameOverDiv.style.display = 'block';

    const puzzleNum = getPuzzleNumber();

    if (won) {
        resultMessage.textContent = `Puzzle #${puzzleNum} - You got it in ${attempts} ${attempts === 1 ? 'guess' : 'guesses'}!`;
        resultMessage.style.color = '#008000';
    } else {
        resultMessage.textContent = `Puzzle #${puzzleNum} - Better luck tomorrow!`;
        resultMessage.style.color = '#cc0000';
    }

    // Show article link
    const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(currentArticle.answer.replace(/ /g, '_'))}`;
    articleLink.innerHTML = `The answer was: <a href="${wikiUrl}" target="_blank">${currentArticle.answer}</a>`;

    // Generate score visualization
    const score = generateScoreSquares();
    scoreDisplay.textContent = score;

    // Update and display statistics
    updateStats(won);
    displayStatistics();
}

function generateScoreSquares() {
    // Group sections by parent (sections without → are their own parent)
    const sectionGroups = [];

    currentArticle.sections.forEach(section => {
        if (section.includes('→')) {
            // This is a subsection
            const parent = section.split('→')[0].trim();
            // Find or create the parent group
            let group = sectionGroups.find(g => g.parent === parent);
            if (!group) {
                group = { parent: parent, subsections: [] };
                sectionGroups.push(group);
            }
            group.subsections.push(section);
        } else {
            // This is a main section
            let group = sectionGroups.find(g => g.parent === section);
            if (!group) {
                sectionGroups.push({ parent: section, subsections: [] });
            }
        }
    });

    // Generate rows for each group
    const rows = sectionGroups.map(group => {
        let row = '';

        // Check if parent section is revealed
        const parentRevealed = revealedSections.includes(group.parent);
        row += parentRevealed ? '🟪' : '🟦';

        // Add subsections
        group.subsections.forEach(subsection => {
            const subsectionRevealed = revealedSections.includes(subsection);
            row += subsectionRevealed ? '🟪' : '🟦';
        });

        return row;
    });

    return rows.join('\n');
}

function shareResult() {
    const revealed = revealedSections.length;
    const total = currentArticle.sections.length;
    const score = generateScoreSquares();
    const puzzleNum = getPuzzleNumber();

    const text = `WikiGuess Puzzle #${puzzleNum}\n${score}`;

    copyToClipboard(text);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = shareButton.textContent;
        shareButton.textContent = '✓ Copied to clipboard!';
        setTimeout(() => {
            shareButton.textContent = originalText;
        }, 2000);
    }).catch(() => {
        alert('Unable to copy. Please copy manually:\n\n' + text);
    });
}

// Date and article selection
function getDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getPuzzleNumber() {
    // Calculate days since January 3, 2026 (Puzzle #1)
    const startDate = new Date('2026-01-03');
    const today = new Date();

    // Reset time to midnight for accurate day calculation
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1; // +1 because Jan 3 is Puzzle #1
}

function getShortDateString() {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${month}/${day}/${year}`;
}

function getTodaysArticle() {
    const today = getDateString();
    return ARTICLES.find(article => article.date === today);
}

function updateCountdown() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdown.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// LocalStorage management
function saveGameState(won = null) {
    const state = {
        date: getDateString(),
        revealedSections: revealedSections,
        attempts: attempts,
        gameOver: gameOver,
        won: won
    };
    localStorage.setItem('wikiguess-state', JSON.stringify(state));
}

function loadGameState() {
    const saved = localStorage.getItem('wikiguess-state');
    return saved ? JSON.parse(saved) : null;
}

// Clear state function
function clearState() {
    if (confirm('Clear your progress for today? This will let you replay the puzzle.')) {
        localStorage.removeItem('wikiguess-state');
        location.reload();
    }
}

// Statistics management
function loadStats() {
    const saved = localStorage.getItem('wikiguess-stats');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastPlayedDate: null,
        lastWonDate: null
    };
}

function saveStats(stats) {
    localStorage.setItem('wikiguess-stats', JSON.stringify(stats));
}

function updateStats(won) {
    const stats = loadStats();
    const today = getDateString();

    // Only update if we haven't already recorded today's game
    if (stats.lastPlayedDate === today) {
        return; // Already updated today
    }

    stats.gamesPlayed++;

    if (won) {
        stats.gamesWon++;

        // Calculate streak
        const yesterday = getYesterdayString();
        if (stats.lastWonDate === yesterday) {
            // Continuing streak
            stats.currentStreak++;
        } else {
            // New streak
            stats.currentStreak = 1;
        }

        // Update best streak
        if (stats.currentStreak > stats.bestStreak) {
            stats.bestStreak = stats.currentStreak;
        }

        stats.lastWonDate = today;
    } else {
        // Lost - reset streak
        stats.currentStreak = 0;
    }

    stats.lastPlayedDate = today;
    saveStats(stats);
}

function displayStatistics() {
    const stats = loadStats();

    gamesPlayedEl.textContent = stats.gamesPlayed;

    const winRate = stats.gamesPlayed > 0
        ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
        : 0;
    winRateEl.textContent = winRate;

    currentStreakEl.textContent = stats.currentStreak;
    bestStreakEl.textContent = stats.bestStreak;
}

function getYesterdayString() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
